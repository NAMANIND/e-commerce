import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { authenticateUser } from "@/lib/auth";
import { z } from "zod";

type NextRequestContext = { params: Promise<{ id: string }> };

const addressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  address_line1: z.string().min(1, "Address line 1 is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  is_default: z.boolean().optional(),
});

export async function GET(request: NextRequest, context: NextRequestContext) {
  try {
    const user = await authenticateUser(request);
    const params = await context.params;

    const { data: address, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // Users can only view their own addresses
    if (address.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(address, { status: 200 });
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

    // Validate request body
    const payload = await addressSchema.parseAsync(body);

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from("addresses")
      .select("user_id")
      .eq("id", params.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }
    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If setting as default, unset other defaults
    if (payload.is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id)
        .eq("is_default", true);
    }

    const { data: address, error } = await supabase
      .from("addresses")
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(address, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
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

    // Verify ownership
    const { data: address, error: fetchError } = await supabase
      .from("addresses")
      .select("user_id, is_default")
      .eq("id", params.id)
      .single();

    if (fetchError || !address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }
    if (address.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If this is the default address, set another address as default
    if (address.is_default) {
      const { data: otherAddress } = await supabase
        .from("addresses")
        .select("id")
        .eq("user_id", user.id)
        .neq("id", params.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (otherAddress) {
        await supabase
          .from("addresses")
          .update({ is_default: true })
          .eq("id", otherAddress.id);
      }
    }

    const { error } = await supabase
      .from("addresses")
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
