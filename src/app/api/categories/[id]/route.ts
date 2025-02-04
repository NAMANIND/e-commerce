import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  handleApiRoute,
  successResponse,
  errorResponse,
} from "@/lib/middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(request, async () => {
    const includeProducts =
      request.nextUrl.searchParams.get("include_products") === "true";

    const { data: category, error } = await supabase
      .from("categories")
      .select(includeProducts ? "*, products(*)" : "*")
      .eq("id", params.id)
      .single();

    if (error) {
      return errorResponse(error);
    }
    if (!category) {
      return errorResponse("Category not found", 404);
    }

    return successResponse(category);
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(
    request,
    async () => {
      const updates = await request.json();

      // Generate id from name if name is being updated
      const id = updates.name
        ? updates.name.toLowerCase().replace(/\s+/g, "-")
        : updates.id;

      const { data: category, error } = await supabase
        .from("categories")
        .update({
          name: updates.name,
          id,
          description: updates.description,
          image_url: updates.image_url,
          parent_id: updates.parent_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)
        .select()
        .single();

      if (error) {
        return errorResponse(error);
      }
      if (!category) {
        return errorResponse("Category not found", 404);
      }

      return successResponse(category);
    },
    { requireAdmin: true }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(
    request,
    async () => {
      // Check if category has products
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact" })
        .eq("category_id", params.id);

      if (count && count > 0) {
        return errorResponse(
          "Cannot delete category with existing products",
          400
        );
      }

      // Check if category has subcategories
      const { count: subCount } = await supabase
        .from("categories")
        .select("*", { count: "exact" })
        .eq("parent_id", params.id);

      if (subCount && subCount > 0) {
        return errorResponse(
          "Cannot delete category with existing subcategories",
          400
        );
      }

      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", params.id);

      if (error) {
        return errorResponse(error);
      }

      return successResponse({ message: "Category deleted successfully" });
    },
    { requireAdmin: true }
  );
}
