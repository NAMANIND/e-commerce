import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { authenticateUser } from "@/lib/auth";
import { z } from "zod";

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

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request);

    const { data: addresses, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Addresses fetch error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch addresses" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: addresses });
  } catch (error: any) {
    console.error("Addresses endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch addresses",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    const body = await request.json();

    // Validate request body
    const payload = await addressSchema.parseAsync(body);

    // If this is the first address, make it default
    const { count } = await supabase
      .from("addresses")
      .select("*", { count: "exact" })
      .eq("user_id", user.id);

    const isDefault = count === 0 ? true : payload.is_default || false;

    // If setting as default, unset other defaults
    if (isDefault) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id)
        .eq("is_default", true);
    }

    const { data, error } = await supabase
      .from("addresses")
      .insert([
        {
          user_id: user.id,
          ...payload,
          is_default: isDefault,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Address creation error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create address" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Address creation error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create address",
      },
      { status: 500 }
    );
  }
}
