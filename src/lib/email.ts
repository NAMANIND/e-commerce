import { Resend } from "resend";
import { Order, User } from "@/types";
import { supabase } from "@/lib/supabase";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@yourdomain.com";

// Initialize Resend only if API key is available
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

async function getUserEmail(userId: string): Promise<string> {
  const { data: user } = await supabase
    .from("users")
    .select("email")
    .eq("id", userId)
    .single();

  if (!user?.email) {
    throw new Error("User email not found");
  }

  return user.email;
}

export async function sendOrderConfirmationEmail(order: Order) {
  if (!resend) {
    console.warn(
      "Email service not configured - skipping order confirmation email"
    );
    return null;
  }

  try {
    const userEmail = await getUserEmail(order.user_id);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: `Order Confirmation #${order.id}`,
      html: `
        <h1>Thank you for your order!</h1>
        <p>Your order #${
          order.id
        } has been confirmed and is being processed.</p>
        
        <h2>Order Details</h2>
        <p>Order Total: $${order.total.toFixed(2)}</p>
        <p>Payment Status: ${order.payment_status}</p>
        
        <h3>Shipping Address</h3>
        <p>
          ${order.shipping_address?.name}<br>
          ${order.shipping_address?.address_line1}<br>
          ${
            order.shipping_address?.address_line2
              ? order.shipping_address.address_line2 + "<br>"
              : ""
          }
          ${order.shipping_address?.city}, ${order.shipping_address?.state} ${
        order.shipping_address?.postal_code
      }<br>
          ${order.shipping_address?.country}
        </p>
        
        <h3>Order Items</h3>
        <ul>
          ${order.items
            ?.map(
              (item) => `
            <li>
              ${item.product?.name} x ${item.quantity} - $${item.total.toFixed(
                2
              )}
            </li>
          `
            )
            .join("")}
        </ul>
        
        <p>We'll send you another email when your order ships.</p>
      `,
    });

    if (error) {
      console.error("Failed to send order confirmation email:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return null;
  }
}

export async function sendOrderStatusUpdateEmail(order: Order) {
  if (!resend) {
    console.warn(
      "Email service not configured - skipping order status update email"
    );
    return null;
  }

  try {
    const userEmail = await getUserEmail(order.user_id);

    const statusMessages = {
      processing: "Your order is being processed",
      shipped: "Your order has been shipped",
      delivered: "Your order has been delivered",
      cancelled: "Your order has been cancelled",
    };

    const message =
      statusMessages[order.status as keyof typeof statusMessages] ||
      "Your order status has been updated";

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: `Order Status Update #${order.id}`,
      html: `
        <h1>Order Status Update</h1>
        <p>${message}</p>
        
        <h2>Order Details</h2>
        <p>Order #${order.id}</p>
        <p>New Status: ${order.status}</p>
        ${
          order.tracking_number
            ? `
          <p>Tracking Number: ${order.tracking_number}</p>
          ${
            order.tracking_url
              ? `<p><a href="${order.tracking_url}">Track your package</a></p>`
              : ""
          }
        `
            : ""
        }
      `,
    });

    if (error) {
      console.error("Failed to send order status update email:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error sending order status update email:", error);
    return null;
  }
}

export async function sendWelcomeEmail(user: User) {
  if (!resend) {
    console.warn("Email service not configured - skipping welcome email");
    return null;
  }

  try {
    if (!user.email) {
      console.warn("User email is required for welcome email");
      return null;
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: "Welcome to Our Store!",
      html: `
        <h1>Welcome to Our Store!</h1>
        <p>Hi ${user.name || "there"},</p>
        
        <p>Thank you for creating an account with us. We're excited to have you as a customer!</p>
        
        <h2>What's Next?</h2>
        <ul>
          <li>Browse our latest products</li>
          <li>Complete your profile</li>
          <li>Add your shipping addresses</li>
        </ul>
        
        <p>If you have any questions, feel free to contact our support team.</p>
      `,
    });

    if (error) {
      console.error("Failed to send welcome email:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return null;
  }
}

export async function sendPasswordResetEmail(user: User, resetToken: string) {
  if (!resend) {
    console.warn(
      "Email service not configured - skipping password reset email"
    );
    return null;
  }

  try {
    if (!user.email) {
      console.warn("User email is required for password reset");
      return null;
    }

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h1>Password Reset Request</h1>
        <p>Hi ${user.name || "there"},</p>
        
        <p>We received a request to reset your password. Click the link below to create a new password:</p>
        
        <p><a href="${resetUrl}">Reset Your Password</a></p>
        
        <p>If you didn't request this, you can safely ignore this email.</p>
        
        <p>This link will expire in 1 hour for security reasons.</p>
      `,
    });

    if (error) {
      console.error("Failed to send password reset email:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return null;
  }
}
