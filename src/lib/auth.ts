import { NextRequest } from "next/server";
import { supabase } from "./supabase";
import { User } from "@/types";

export async function authenticateUser(request: NextRequest): Promise<User> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized: No bearer token");
  }

  const token = authHeader.split(" ")[1];

  try {
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError) {
      console.error("Auth error:", authError);
      throw new Error("Unauthorized: Invalid token");
    }

    if (!authUser) {
      console.error("No user found for token");
      throw new Error("Unauthorized: User not found");
    }

    // Get additional user data from our users table
    let { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    // If user data doesn't exist, create it
    if (userError || !userData) {
      console.log("User data not found, creating new user record");

      const newUser = {
        id: authUser.id,
        email: authUser.email,
        full_name:
          authUser.user_metadata?.full_name ||
          authUser.email?.split("@")[0] ||
          "User",
        phone: null,
        role: "customer", // Set default role
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: createdUser, error: createError } = await supabase
        .from("users")
        .insert([newUser])
        .select()
        .single();

      if (createError) {
        console.error("Failed to create user record:", createError);
        throw new Error("Failed to create user record");
      }

      userData = createdUser;
    }

    // At this point userData should never be null because we either found it or created it
    if (!userData) {
      throw new Error("User data not available");
    }

    return {
      ...authUser,
      role: userData.role || "customer", // Use role from database
      name: userData.full_name || authUser.email?.split("@")[0] || "User",
      avatar_url: authUser.user_metadata?.avatar_url || null,
      phone: userData.phone || null,
    };
  } catch (error: any) {
    console.error("Authentication error:", error);
    throw new Error(error.message || "Unauthorized");
  }
}

export async function authenticateAdmin(request: NextRequest): Promise<User> {
  const user = await authenticateUser(request);

  if (user.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }

  return user;
}
