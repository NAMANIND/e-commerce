import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { authenticateUser } from "@/lib/auth";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Admin can see all orders, users can only see their own
    let query = supabase
      .from("orders")
      .select(
        "*, shipping_address(*), items:order_items(*, product:products(*))",
        {
          count: "exact",
        }
      );

    if (user.role !== "admin") {
      query = query.eq("user_id", user.id);
    }

    const {
      data: orders,
      error,
      count,
    } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        orders,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const serialized =
      error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ error: serialized }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    const body = await request.json();

    const orderSchema = z.object({
      shipping_address: z.object({
        full_name: z.string(),
        address_line1: z.string(),
        address_line2: z.string().optional(),
        city: z.string(),
        state: z.string(),
        postal_code: z.string(),
        country: z.string(),
        phone: z.string(),
      }),
      items: z.array(
        z.object({
          product_id: z.string(),
          quantity: z.number().min(1),
          price: z.number().min(0),
        })
      ),
      payment_method: z.string(),
      notes: z.string().optional(),
    });

    const payload = await orderSchema.parseAsync(body);

    // Start a transaction
    const { data: order, error } = await supabase.rpc("create_order", {
      p_user_id: user.id,
      p_shipping_address: payload.shipping_address,
      p_items: payload.items,
      p_payment_method: payload.payment_method,
      p_notes: payload.notes,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const serialized =
      error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ error: serialized }, { status: 500 });
  }
}
