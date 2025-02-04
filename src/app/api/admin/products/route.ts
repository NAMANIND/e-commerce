import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category_id = searchParams.get("category_id");

    let query = supabase
      .from("products")
      .select(
        `
        *,
        category:categories(name)
      `
      )
      .order("created_at", { ascending: false });

    if (category_id) {
      query = query.eq("category_id", category_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, stock, category_id, image_url } = body;

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name,
          description,
          price,
          stock,
          category_id,
          image_url,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
