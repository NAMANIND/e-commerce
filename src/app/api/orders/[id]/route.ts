import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { authenticateUser } from "@/lib/auth";
type NextRequestContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: NextRequestContext) {
  try {
    const user = await authenticateUser(request);
    const params = await context.params;

    const { data: order, error } = await supabase
      .from("orders")
      .select(
        "*, shipping_address(*), items:order_items(*, product:products(*))"
      )
      .eq("id", params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Users can only view their own orders, admins can view all
    if (user.role !== "admin" && order.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    const serialized =
      error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ error: serialized }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: NextRequestContext) {
  try {
    const user = await authenticateUser(request);
    const params = await context.params;
    const body = await request.json();

    // First check if order exists and user has permission
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("user_id, status")
      .eq("id", params.id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only admin or order owner can update
    if (user.role !== "admin" && order.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data: updatedOrder, error } = await supabase
      .from("orders")
      .update(body)
      .eq("id", params.id)
      .select(
        "*, shipping_address(*), items:order_items(*, product:products(*))"
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updatedOrder, { status: 200 });
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
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const params = await context.params;

    const { error } = await supabase
      .from("orders")
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
