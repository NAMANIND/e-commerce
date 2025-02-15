import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const order = searchParams.get("order") || "desc";

    let query = supabase.from("products").select(
      `
        *,
        categories (
          id,
          name
        )
      `,
      { count: "exact" }
    );

    // Apply filters
    if (category) {
      query = query.eq("category_id", category);
    }

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: order === "asc" });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: products, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        products,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      stock,
      category_id,
      image_url,
      is_featured,
      sku,
      weight,
      dimensions,
      discount_percentage,
    } = body;

    if (!name || !price || !category_id) {
      return NextResponse.json(
        { success: false, error: "Name, price, and category are required" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const { data: product, error } = await supabase
      .from("products")
      .insert([
        {
          name,
          description,
          price,
          stock,
          category_id,
          image_url,
          is_featured,
          sku,
          weight,
          dimensions,
          slug,
          discount_percentage,
          discounted_price: price - (price * discount_percentage) / 100, // Calculate discounted price
        },
      ])
      .select(
        `
        *,
        categories (
          id,
          name
        )
      `
      )
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      description,
      price,
      stock,
      category_id,
      image_url,
      is_featured,
      sku,
      weight,
      dimensions,
      discount_percentage,
    } = body;

    if (!id || !name || !price || !category_id) {
      return NextResponse.json(
        { success: false, error: "ID, name, price, and category are required" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const { data: product, error } = await supabase
      .from("products")
      .update({
        name,
        description,
        price,
        stock,
        category_id,
        image_url,
        is_featured,
        sku,
        weight,
        dimensions,
        slug,
        discount_percentage,
        discounted_price: price - (price * discount_percentage) / 100, // Calculate discounted price
      })
      .eq("id", id)
      .select(
        `
        *,
        categories (
          id,
          name
        )
      `
      )
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
