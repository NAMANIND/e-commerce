import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  handleApiRoute,
  successResponse,
  errorResponse,
} from "@/lib/middleware";
import { authenticateUser } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(
    request,
    async () => {
      const user = await authenticateUser(request);
      const { quantity } = await request.json();

      if (quantity < 1) {
        return errorResponse("Quantity must be at least 1", 400);
      }

      // Get cart item and check ownership
      const { data: cartItem, error: cartError } = await supabase
        .from("cart_items")
        .select("*, products(stock_quantity)")
        .eq("id", params.id)
        .single();

      if (cartError || !cartItem) {
        return errorResponse("Cart item not found", 404);
      }

      if (cartItem.user_id !== user.id) {
        return errorResponse("Unauthorized", 403);
      }

      // Check stock availability
      if (quantity > cartItem.products.stock_quantity) {
        return errorResponse("Insufficient stock", 400);
      }

      // Update quantity
      const { data: updatedItem, error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", params.id)
        .select("*, products(*)")
        .single();

      if (error) {
        return errorResponse(error);
      }

      return successResponse(updatedItem);
    },
    { requireAuth: true }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(
    request,
    async () => {
      const user = await authenticateUser(request);

      // Check ownership before deletion
      const { data: cartItem, error: cartError } = await supabase
        .from("cart_items")
        .select("user_id")
        .eq("id", params.id)
        .single();

      if (cartError || !cartItem) {
        return errorResponse("Cart item not found", 404);
      }

      if (cartItem.user_id !== user.id) {
        return errorResponse("Unauthorized", 403);
      }

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", params.id);

      if (error) {
        return errorResponse(error);
      }

      return successResponse({ message: "Cart item removed successfully" });
    },
    { requireAuth: true }
  );
}
