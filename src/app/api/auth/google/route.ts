import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  handleApiRoute,
  successResponse,
  errorResponse,
} from "@/lib/middleware";
import { sendWelcomeEmail } from "@/lib/email";
import { User } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json();

    // Exchange Google credential for Supabase session
    const {
      data: { user: supabaseUser },
      error: signInError,
    } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: credential,
    });

    if (signInError) {
      return errorResponse(signInError);
    }

    if (!supabaseUser) {
      return errorResponse("Authentication failed");
    }

    // Check if user exists in our users table
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("id", supabaseUser.id)
      .single();

    if (!existingUser) {
      // Create new user record
      const newUser: Partial<User> = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata.full_name,
        avatar_url: supabaseUser.user_metadata.avatar_url,
        role: "customer",
      };

      const { error: createError } = await supabase
        .from("users")
        .insert([newUser]);

      if (createError) {
        return errorResponse(createError);
      }

      // Send welcome email
      try {
        await sendWelcomeEmail({
          ...supabaseUser,
          ...newUser,
        } as User);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Don't fail the signup if email fails
      }
    }

    // Get session for client
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      return errorResponse(sessionError);
    }

    return successResponse({
      session,
      user: {
        ...supabaseUser,
        role: existingUser?.role || "customer",
        name: existingUser?.name || supabaseUser.user_metadata.full_name,
        avatar_url:
          existingUser?.avatar_url || supabaseUser.user_metadata.avatar_url,
        phone: existingUser?.phone || null,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return errorResponse("Authentication failed");
  }
}
