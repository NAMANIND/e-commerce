import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  handleApiRoute,
  successResponse,
  errorResponse,
} from "@/lib/middleware";
import { authenticateUser } from "@/lib/auth";
import Razorpay from "razorpay";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(
    request,
    async () => {
      const user = await authenticateUser(request);

      // Get order details
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", params.id)
        .single();

      if (orderError || !order) {
        return errorResponse("Order not found", 404);
      }

      // Verify order belongs to user
      if (order.user_id !== user.id) {
        return errorResponse("Unauthorized", 403);
      }

      // Check if order is already paid
      if (order.payment_status === "paid") {
        return errorResponse("Order is already paid", 400);
      }

      try {
        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
          amount: Math.round(order.total * 100), // Amount in smallest currency unit (paise)
          currency: "INR",
          receipt: order.id,
          notes: {
            order_id: order.id,
            user_id: user.id,
          },
        });

        // Update order with Razorpay order ID
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            payment_id: razorpayOrder.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        if (updateError) {
          throw updateError;
        }

        return successResponse({
          order_id: razorpayOrder.id,
          currency: razorpayOrder.currency,
          amount: razorpayOrder.amount,
          key: process.env.RAZORPAY_KEY_ID,
        });
      } catch (error: any) {
        console.error("Razorpay error:", error);
        return errorResponse("Payment initialization failed", 500);
      }
    },
    { requireAuth: true }
  );
}

// Webhook to handle Razorpay payment callbacks
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await request.json();
    const signature = request.headers.get("x-razorpay-signature");

    // Verify webhook signature
    if (!signature || !verifyWebhookSignature(payload, signature)) {
      return errorResponse("Invalid signature", 400);
    }

    const { order_id, payment_id, status } = payload;

    // Update order payment status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: status === "paid" ? "paid" : "failed",
        payment_id: payment_id,
        status: status === "paid" ? "processing" : "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id);

    if (updateError) {
      throw updateError;
    }

    if (status === "paid") {
      // TODO: Send payment confirmation email
      // await sendPaymentConfirmationEmail(order_id);
    }

    return successResponse({ status: "ok" });
  } catch (error) {
    console.error("Payment webhook error:", error);
    return errorResponse("Payment processing failed", 500);
  }
}

function verifyWebhookSignature(payload: any, signature: string): boolean {
  const crypto = require("crypto");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(JSON.stringify(payload));
  const generatedSignature = hmac.digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(generatedSignature),
    Buffer.from(signature)
  );
}
