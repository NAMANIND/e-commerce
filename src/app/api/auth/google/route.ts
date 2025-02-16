import { NextRequest, NextResponse } from "next/server";
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
      return NextResponse.json({ error: signInError.message }, { status: 401 });
    }

    if (!supabaseUser) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
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
        return NextResponse.json(
          { error: createError.message },
          { status: 500 }
        );
      }

      // Send welcome email - don't wait for it and don't fail if it fails
      sendWelcomeEmail({
        ...supabaseUser,
        ...newUser,
      } as User).catch((emailError) => {
        console.error("Failed to send welcome email:", emailError);
      });
    }

    // Get session for client
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      return NextResponse.json(
        { error: sessionError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
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
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
