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
    const parentId = searchParams.get("parent_id");
    const includeProducts = searchParams.get("include_products") === "true";

    let query = supabase
      .from("categories")
      .select(includeProducts ? "*, products(*)" : "*");

    if (parentId) {
      query = query.eq("parent_id", parentId);
    }

    const { data: categories, error } = await query.order("name");

    if (error) {
      return errorResponse(error);
    }

    return successResponse(categories);
  });
}

export async function POST(request: NextRequest) {
  return handleApiRoute(
    request,
    async () => {
      const category = await request.json();

      // Generate id from name if not provided
      const id =
        category.id || category.name.toLowerCase().replace(/\s+/g, "-");

      const { data, error } = await supabase
        .from("categories")
        .insert([
          {
            name: category.name,
            id,
            description: category.description,
            image_url: category.image_url,
            parent_id: category.parent_id,
          },
        ])
        .select()
        .single();

      if (error) {
        return errorResponse(error);
      }

      return successResponse(data);
    },
    { requireAdmin: true }
  );
}
