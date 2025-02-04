import { NextRequest } from "next/server";
import { supabase } from "./supabase";
import { User } from "@/types";

export async function authenticateUser(request: NextRequest): Promise<User> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authHeader.split(" ")[1];
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  // Get additional user data from our users table
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role, name, avatar_url, phone")
    .eq("id", user.id)
    .single();

  if (userError) {
    throw new Error("Unauthorized");
  }

  return {
    ...user,
    role: userData.role || "customer",
    name: userData.name,
    avatar_url: userData.avatar_url,
    phone: userData.phone,
  };
}

export async function authenticateAdmin(request: NextRequest): Promise<User> {
  const user = await authenticateUser(request);

  if (user.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }

  return user;
}
