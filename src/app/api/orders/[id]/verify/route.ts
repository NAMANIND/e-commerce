import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  handleApiRoute,
  successResponse,
  errorResponse,
} from "@/lib/middleware";
import { authenticateUser } from "@/lib/auth";
import crypto from "crypto";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    console.error("Razorpay secret key not configured");
    return errorResponse("Payment verification not configured", 500);
  }

  return handleApiRoute(
    request,
    async () => {
      try {
        // Log request details
        console.log("Verify endpoint called:", {
          method: request.method,
          url: request.url,
          headers: {
            authorization: request.headers
              .get("Authorization")
              ?.startsWith("Bearer ")
              ? "Bearer token present"
              : "No bearer token",
            contentType: request.headers.get("Content-Type"),
          },
        });

        // Log the auth header for debugging
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) {
          console.error("No Authorization header present");
          return errorResponse("No authorization header", 401);
        }

        // Extract token for logging
        const token = authHeader.split(" ")[1];
        console.log("Token present:", !!token);

        // Authenticate user
        let authenticatedUser;
        try {
          authenticatedUser = await authenticateUser(request);
          console.log("Authentication successful:", {
            userId: authenticatedUser.id,
            role: authenticatedUser.role,
          });
        } catch (authError: any) {
          console.error("Authentication failed:", {
            error: authError.message,
            stack: authError.stack,
            token: token ? "Token present" : "No token",
          });
          return errorResponse(
            authError.message || "Authentication failed",
            401
          );
        }

        const body = await request.json();
        console.log("Request body:", {
          hasPaymentId: !!body.razorpay_payment_id,
          hasOrderId: !!body.razorpay_order_id,
          hasSignature: !!body.razorpay_signature,
        });

        const {
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
          original_order_id,
        } = body;

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
          console.error("Missing required payment verification parameters");
          return errorResponse("Invalid payment verification data", 400);
        }

        console.log("Verifying payment:", {
          orderId: params.id,
          original_order_id,
          razorpay_order_id,
          razorpay_payment_id,
          order_ids_match: params.id === original_order_id,
        });

        // Verify order IDs match
        if (params.id !== original_order_id) {
          console.error("Order ID mismatch:", {
            params_id: params.id,
            original_order_id,
            razorpay_order_id,
          });
          return errorResponse("Order ID mismatch", 400);
        }

        // Get order details
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", params.id)
          .single();

        if (orderError) {
          console.error("Order fetch error:", orderError);
          return errorResponse("Order not found", 404);
        }

        if (!order) {
          console.error("Order not found:", params.id);
          return errorResponse("Order not found", 404);
        }

        // Log order details for debugging
        console.log("Found order:", {
          order_id: order.id,
          user_id: order.user_id,
          payment_status: order.payment_status,
          payment_id: order.payment_id,
          total_amount: order.total_amount,
        });

        // Verify order belongs to user
        if (order.user_id !== authenticatedUser.id) {
          console.error("Order user mismatch:", {
            orderId: params.id,
            orderUserId: order.user_id,
            requestUserId: authenticatedUser.id,
          });
          return errorResponse("Unauthorized", 403);
        }

        // Check if order is already paid
        if (order.payment_status === "paid") {
          console.error("Order is already paid:", params.id);
          return errorResponse("Order is already paid", 400);
        }

        // Verify payment signature
        const bodyForSignature = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
          .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
          .update(bodyForSignature)
          .digest("hex");

        if (expectedSignature !== razorpay_signature) {
          console.error("Invalid payment signature:", {
            orderId: params.id,
            expected: expectedSignature,
            received: razorpay_signature,
          });
          return errorResponse("Invalid payment signature", 400);
        }

        try {
          // Update order payment status
          const { error: updateError } = await supabase
            .from("orders")
            .update({
              payment_status: "paid",
              payment_id: razorpay_payment_id,
              status: "processing",
              updated_at: new Date().toISOString(),
            })
            .eq("id", order.id)
            .eq("payment_status", "pending"); // Only update if still pending

          if (updateError) {
            console.error("Order update error:", updateError);
            throw updateError;
          }

          console.log("Payment verified successfully:", {
            orderId: params.id,
            paymentId: razorpay_payment_id,
          });

          // TODO: Send payment confirmation email
          // await sendPaymentConfirmationEmail(order.id);

          return successResponse({
            status: "success",
            message: "Payment verified successfully",
            order_id: order.id,
            payment_id: razorpay_payment_id,
          });
        } catch (error: any) {
          console.error("Payment verification error:", error);
          return errorResponse("Payment verification failed", 500);
        }
      } catch (error: any) {
        console.error("Verification endpoint error:", error);
        return errorResponse(
          error.message || "Payment verification failed",
          error.message === "Unauthorized" ? 401 : 500
        );
      }
    },
    { requireAuth: true }
  );
}
