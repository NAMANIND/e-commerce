import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  handleApiRoute,
  successResponse,
  errorResponse,
} from "@/lib/middleware";
import { authenticateUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  return handleApiRoute(
    request,
    async () => {
      const user = await authenticateUser(request);

      const { data: cartItems, error } = await supabase
        .from("cart_items")
        .select("*, products(*)")
        .eq("user_id", user.id);

      if (error) {
        return errorResponse(error);
      }

      // Calculate totals
      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.quantity * item.products.price,
        0
      );

      return successResponse({
        items: cartItems,
        summary: {
          subtotal,
          itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        },
      });
    },
    { requireAuth: true }
  );
}

export async function POST(request: NextRequest) {
  return handleApiRoute(
    request,
    async () => {
      const user = await authenticateUser(request);
      const { product_id, quantity = 1 } = await request.json();

      // Validate product exists and has sufficient stock
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("stock_quantity, status")
        .eq("id", product_id)
        .single();

      if (productError || !product) {
        return errorResponse("Product not found", 404);
      }

      if (product.status !== "published") {
        return errorResponse("Product is not available", 400);
      }

      if (product.stock_quantity < quantity) {
        return errorResponse("Insufficient stock", 400);
      }

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", product_id)
        .single();

      if (existingItem) {
        // Update existing cart item
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock_quantity) {
          return errorResponse("Insufficient stock", 400);
        }

        const { data: updatedItem, error } = await supabase
          .from("cart_items")
          .update({ quantity: newQuantity })
          .eq("id", existingItem.id)
          .select("*, products(*)")
          .single();

        if (error) {
          return errorResponse(error);
        }

        return successResponse(updatedItem);
      }

      // Add new cart item
      const { data: newItem, error } = await supabase
        .from("cart_items")
        .insert([
          {
            user_id: user.id,
            product_id,
            quantity,
          },
        ])
        .select("*, products(*)")
        .single();

      if (error) {
        return errorResponse(error);
      }

      return successResponse(newItem);
    },
    { requireAuth: true }
  );
}

export async function DELETE(request: NextRequest) {
  return handleApiRoute(
    request,
    async () => {
      const user = await authenticateUser(request);

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        return errorResponse(error);
      }

      return successResponse({ message: "Cart cleared successfully" });
    },
    { requireAuth: true }
  );
}
