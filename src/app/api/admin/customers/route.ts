import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let query = supabase
      .from("users")
      .select(
        `
        *,
        orders:orders(count),
        total_spent:orders(sum(total_amount))
      `
      )
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    const formattedCustomers =
      data?.map((customer) => ({
        ...customer,
        orders_count: customer.orders[0].count || 0,
        total_spent: customer.total_spent[0].sum || 0,
      })) || [];

    return NextResponse.json(formattedCustomers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
