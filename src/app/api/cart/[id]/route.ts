import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { errorResponse } from "@/lib/middleware";
import { authenticateUser } from "@/lib/auth";
import { z } from "zod";

type NextRequestContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: NextRequestContext) {
  try {
    const user = await authenticateUser(request);
    const params = await context.params;
    const body = await request.json();

    const payload = await z
      .object({
        quantity: z.number().min(1, "Quantity must be at least 1"),
      })
      .parseAsync(body);

    // Get cart item and check ownership
    const { data: cartItem, error: cartError } = await supabase
      .from("cart_items")
      .select("*, products(stock_quantity)")
      .eq("id", params.id)
      .single();

    if (cartError || !cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    if (cartItem.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check stock availability
    if (payload.quantity > cartItem.products.stock_quantity) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 }
      );
    }

    // Update quantity
    const { data: updatedItem, error } = await supabase
      .from("cart_items")
      .update({ quantity: payload.quantity })
      .eq("id", params.id)
      .select("*, products(*)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    const serialized =
      error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ error: serialized }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: NextRequestContext
) {
  try {
    const user = await authenticateUser(request);
    const params = await context.params;

    // Check ownership before deletion
    const { data: cartItem, error: cartError } = await supabase
      .from("cart_items")
      .select("user_id")
      .eq("id", params.id)
      .single();

    if (cartError || !cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    if (cartItem.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    const serialized =
      error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ error: serialized }, { status: 500 });
  }
}
