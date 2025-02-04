import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface ProductCount {
  category_id: string;
  count: number;
}

// Get all categories
export async function GET() {
  try {
    // First, get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (categoriesError) throw categoriesError;

    // Get product counts for each category
    const promises =
      categories?.map(async (category) => {
        const { count, error } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("category_id", category.id);

        return {
          ...category,
          product_count: error ? 0 : count || 0,
        };
      }) || [];

    const formattedCategories = await Promise.all(promises);
    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// Create a new category
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    const { data, error } = await supabase
      .from("categories")
      .insert([{ name, description }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ...data, product_count: 0 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

// Update a category
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description } = body;

    const { data, error } = await supabase
      .from("categories")
      .update({ name, description })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Get product count
    const { data: productCount, error: countError } = await supabase
      .from("products")
      .select("id", { count: "exact" })
      .eq("category_id", id);

    return NextResponse.json({
      ...data,
      product_count: countError ? 0 : productCount?.length || 0,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// Delete a category
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
