import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { authenticateUser } from "@/lib/auth";
import { z } from "zod";

type NextRequestContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: NextRequestContext) {
  try {
    const params = await context.params;
    const includeCategory =
      request.nextUrl.searchParams.get("include_category") === "true";

    const { data: product, error } = await supabase
      .from("products")
      .select(includeCategory ? "*, categories(*)" : "*")
      .eq("id", params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    const serialized =
      error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ error: serialized }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: NextRequestContext) {
  try {
    const user = await authenticateUser(request);
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const params = await context.params;
    const body = await request.json();

    const productSchema = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      price: z.number().min(0),
      stock_quantity: z.number().min(0),
      category_id: z.string(),
      image_url: z.string().url().optional(),
      sku: z.string().optional(),
      is_featured: z.boolean().optional(),
    });

    const payload = await productSchema.parseAsync(body);

    const { data: product, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
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

    // Check if product exists
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("id")
      .eq("id", params.id)
      .single();

    if (fetchError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("products")
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
