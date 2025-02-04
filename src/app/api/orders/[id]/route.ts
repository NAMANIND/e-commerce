import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  handleApiRoute,
  successResponse,
  errorResponse,
} from "@/lib/middleware";
import { authenticateUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(
    request,
    async () => {
      const user = await authenticateUser(request);

      const { data: order, error } = await supabase
        .from("orders")
        .select(
          "*, shipping_address(*), items:order_items(*, product:products(*))"
        )
        .eq("id", params.id)
        .single();

      if (error) {
        return errorResponse(error);
      }
      if (!order) {
        return errorResponse("Order not found", 404);
      }

      // Users can only view their own orders, admins can view all
      if (user.role !== "admin" && order.user_id !== user.id) {
        return errorResponse("Unauthorized", 403);
      }

      return successResponse(order);
    },
    { requireAuth: true }
  );
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(
    request,
    async () => {
      const updates = await request.json();

      // Only allow updating specific fields
      const allowedUpdates = {
        status: updates.status,
        tracking_number: updates.tracking_number,
        tracking_url: updates.tracking_url,
        notes: updates.notes,
        updated_at: new Date().toISOString(),
      };

      const { data: order, error } = await supabase
        .from("orders")
        .update(allowedUpdates)
        .eq("id", params.id)
        .select(
          "*, shipping_address(*), items:order_items(*, product:products(*))"
        )
        .single();

      if (error) {
        return errorResponse(error);
      }
      if (!order) {
        return errorResponse("Order not found", 404);
      }

      // TODO: Send order status update email
      // await sendOrderStatusUpdateEmail(order);

      return successResponse(order);
    },
    { requireAdmin: true }
  );
}

// No DELETE endpoint - orders should never be deleted, only cancelled
