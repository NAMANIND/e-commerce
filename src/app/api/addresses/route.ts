import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  handleApiRoute,
  successResponse,
  errorResponse,
} from "@/lib/middleware";
import { authenticateUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  return handleApiRoute(
    request,
    async () => {
      const user = await authenticateUser(request);

      const { data: addresses, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        return errorResponse(error);
      }

      return successResponse(addresses);
    },
    { requireAuth: true }
  );
}

export async function POST(request: NextRequest) {
  return handleApiRoute(
    request,
    async () => {
      const user = await authenticateUser(request);
      const address = await request.json();

      // If this is the first address, make it default
      const { count } = await supabase
        .from("addresses")
        .select("*", { count: "exact" })
        .eq("user_id", user.id);

      const isDefault = count === 0 ? true : address.is_default || false;

      // If setting as default, unset other defaults
      if (isDefault) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", user.id)
          .eq("is_default", true);
      }

      const { data, error } = await supabase
        .from("addresses")
        .insert([
          {
            user_id: user.id,
            name: address.name,
            phone: address.phone,
            address_line1: address.address_line1,
            address_line2: address.address_line2,
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            country: address.country,
            is_default: isDefault,
          },
        ])
        .select()
        .single();

      if (error) {
        return errorResponse(error);
      }

      return successResponse(data);
    },
    { requireAuth: true }
  );
}
