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
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (
    !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    !process.env.RAZORPAY_KEY_SECRET
  ) {
    console.error("Razorpay credentials not configured");
    return errorResponse("Payment gateway not configured", 500);
  }

  const orderId = params.id; // Store params.id early to avoid Next.js warning

  try {
    // Get the auth token from the Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("No Bearer token found in Authorization header");
      return errorResponse("No authentication token provided", 401);
    }

    const token = authHeader.split(" ")[1];

    // Verify the token and get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth error:", authError);
      return errorResponse("Invalid authentication token", 401);
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError) {
      console.error("Order fetch error:", orderError);
      return errorResponse(`Order fetch failed: ${orderError.message}`, 404);
    }

    if (!order) {
      console.error("Order not found:", orderId);
      return errorResponse("Order not found", 404);
    }

    // Verify order belongs to user
    if (order.user_id !== user.id) {
      console.error(
        "Unauthorized access attempt for order:",
        orderId,
        "by user:",
        user.id
      );
      return errorResponse("Unauthorized access to order", 403);
    }

    // Check if order is already paid
    if (order.payment_status === "paid") {
      console.error("Attempted payment for already paid order:", orderId);
      return errorResponse("Order is already paid", 400);
    }

    try {
      console.log("Order total amount:", order.total_amount);
      // Convert amount to paise (multiply by 100) and ensure it's an integer
      const amountInPaise = Math.round(Number(order.total_amount) * 100);
      console.log("Amount in paise:", amountInPaise);

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: orderId,
        notes: {
          order_id: orderId,
          user_id: user.id,
          original_amount: order.total_amount,
        },
      });

      console.log("Razorpay order created:", {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        amount_in_rupees: Number(razorpayOrder.amount) / 100,
        currency: razorpayOrder.currency,
      });

      // Update order with Razorpay order ID
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_id: razorpayOrder.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (updateError) {
        console.error("Order update error:", updateError);
        throw new Error(`Failed to update order: ${updateError.message}`);
      }

      return successResponse({
        order_id: razorpayOrder.id,
        currency: razorpayOrder.currency,
        amount: razorpayOrder.amount,
        amount_in_rupees: Number(razorpayOrder.amount) / 100,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      });
    } catch (razorpayError: any) {
      console.error("Razorpay order creation error:", {
        error: razorpayError,
        amount: order.total_amount,
        amount_in_paise: Number(order.total_amount) * 100,
        orderId,
        userId: user.id,
      });
      return errorResponse(
        `Razorpay order creation failed: ${razorpayError.message}`,
        500
      );
    }
  } catch (error: any) {
    console.error("Payment initialization error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    return errorResponse(error.message || "Payment initialization failed", 500);
  }
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
      console.error("Invalid webhook signature for order:", params.id);
      console.error("Payload:", payload);
      console.error("Signature:", signature);
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
      console.error("Order status update error:", updateError);
      throw updateError;
    }

    if (status === "paid") {
      // TODO: Send payment confirmation email
      // await sendPaymentConfirmationEmail(order_id);
    }

    return successResponse({ status: "ok" });
  } catch (error) {
    console.error("Payment webhook error:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
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
