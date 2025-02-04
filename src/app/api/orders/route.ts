import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  handleApiRoute,
  successResponse,
  errorResponse,
} from "@/lib/middleware";
import { Order, CartItem } from "@/types";
import { authenticateUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  return handleApiRoute(
    request,
    async () => {
      const user = await authenticateUser(request);
      const searchParams = request.nextUrl.searchParams;
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");
      const offset = (page - 1) * limit;

      // Admin can see all orders, users can only see their own
      let query = supabase
        .from("orders")
        .select(
          "*, shipping_address(*), items:order_items(*, product:products(*))",
          { count: "exact" }
        );

      if (user.role !== "admin") {
        query = query.eq("user_id", user.id);
      }

      const {
        data: orders,
        error,
        count,
      } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return errorResponse(error);
      }

      return successResponse({
        orders,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
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
      const orderData = await request.json();

      // Start a transaction
      const { data: order, error: orderError } = await supabase.rpc(
        "create_order",
        {
          p_user_id: user.id,
          p_shipping_address_id: orderData.shipping_address_id,
          p_payment_method: orderData.payment_method || "razorpay",
          p_notes: orderData.notes,
        }
      );

      if (orderError) {
        return errorResponse(orderError);
      }

      // Get cart items to create order items
      const { data: cartItems, error: cartError } = await supabase
        .from("cart_items")
        .select("*, products(*)")
        .eq("user_id", user.id);

      if (cartError) {
        return errorResponse(cartError);
      }

      if (!cartItems?.length) {
        return errorResponse("Cart is empty", 400);
      }

      // Create order items
      const orderItems = cartItems.map((item: CartItem) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product!.price,
        total: item.quantity * item.product!.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        return errorResponse(itemsError);
      }

      // Clear the cart
      await supabase.from("cart_items").delete().eq("user_id", user.id);

      // Get the complete order with items
      const { data: completeOrder, error: fetchError } = await supabase
        .from("orders")
        .select(
          "*, shipping_address(*), items:order_items(*, product:products(*))"
        )
        .eq("id", order.id)
        .single();

      if (fetchError) {
        return errorResponse(fetchError);
      }

      // TODO: Trigger order confirmation email
      // await sendOrderConfirmationEmail(completeOrder);

      return successResponse(completeOrder);
    },
    { requireAuth: true }
  );
}
