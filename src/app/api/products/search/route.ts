import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  handleApiRoute,
  successResponse,
  errorResponse,
} from "@/lib/middleware";

export async function GET(request: NextRequest) {
  return handleApiRoute(request, async () => {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const categories = searchParams.getAll("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "relevance";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let supabaseQuery = supabase
      .from("products")
      .select("*, categories(name)", { count: "exact" })
      .eq("status", "published");

    // Full-text search on name and description
    if (query) {
      supabaseQuery = supabaseQuery.or(
        `name.ilike.%${query}%,description.ilike.%${query}%,sku.ilike.%${query}%`
      );
    }

    // Category filter
    if (categories.length > 0) {
      supabaseQuery = supabaseQuery.in("category_id", categories);
    }

    // Price range filter
    if (minPrice) {
      supabaseQuery = supabaseQuery.gte("price", parseFloat(minPrice));
    }
    if (maxPrice) {
      supabaseQuery = supabaseQuery.lte("price", parseFloat(maxPrice));
    }

    // Sorting
    switch (sort) {
      case "price_asc":
        supabaseQuery = supabaseQuery.order("price", { ascending: true });
        break;
      case "price_desc":
        supabaseQuery = supabaseQuery.order("price", { ascending: false });
        break;
      case "newest":
        supabaseQuery = supabaseQuery.order("created_at", { ascending: false });
        break;
      case "relevance":
      default:
        if (query) {
          // For relevance sorting with a search query, we might want to
          // implement more sophisticated ranking in the future
          supabaseQuery = supabaseQuery.order("created_at", {
            ascending: false,
          });
        } else {
          supabaseQuery = supabaseQuery.order("created_at", {
            ascending: false,
          });
        }
        break;
    }

    // Apply pagination
    const {
      data: products,
      error,
      count,
    } = await supabaseQuery.range(offset, offset + limit - 1);

    if (error) {
      return errorResponse(error);
    }

    // Get facets for filtering
    const facets = await getFacets(query);

    return successResponse({
      products,
      facets,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  });
}

async function getFacets(query: string) {
  // Get category facets
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, (count: products(count))");

  // Get price ranges
  const { data: priceStats } = await supabase
    .from("products")
    .select("min_price:price(min), max_price:price(max)")
    .eq("status", "published")
    .single();

  return {
    categories: categories || [],
    priceRange: priceStats
      ? {
          min: priceStats.min_price,
          max: priceStats.max_price,
        }
      : { min: 0, max: 0 },
  };
}
