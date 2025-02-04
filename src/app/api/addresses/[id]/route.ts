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

      const { data: address, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        return errorResponse(error);
      }
      if (!address) {
        return errorResponse("Address not found", 404);
      }

      // Users can only view their own addresses
      if (address.user_id !== user.id) {
        return errorResponse("Unauthorized", 403);
      }

      return successResponse(address);
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
      const user = await authenticateUser(request);
      const updates = await request.json();

      // Verify ownership
      const { data: existing, error: fetchError } = await supabase
        .from("addresses")
        .select("user_id")
        .eq("id", params.id)
        .single();

      if (fetchError || !existing) {
        return errorResponse("Address not found", 404);
      }
      if (existing.user_id !== user.id) {
        return errorResponse("Unauthorized", 403);
      }

      // If setting as default, unset other defaults
      if (updates.is_default) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", user.id)
          .eq("is_default", true);
      }

      const { data: address, error } = await supabase
        .from("addresses")
        .update({
          name: updates.name,
          phone: updates.phone,
          address_line1: updates.address_line1,
          address_line2: updates.address_line2,
          city: updates.city,
          state: updates.state,
          postal_code: updates.postal_code,
          country: updates.country,
          is_default: updates.is_default,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)
        .select()
        .single();

      if (error) {
        return errorResponse(error);
      }

      return successResponse(address);
    },
    { requireAuth: true }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRoute(
    request,
    async () => {
      const user = await authenticateUser(request);

      // Verify ownership
      const { data: address, error: fetchError } = await supabase
        .from("addresses")
        .select("user_id, is_default")
        .eq("id", params.id)
        .single();

      if (fetchError || !address) {
        return errorResponse("Address not found", 404);
      }
      if (address.user_id !== user.id) {
        return errorResponse("Unauthorized", 403);
      }

      // If this is the default address, set another address as default
      if (address.is_default) {
        const { data: otherAddress } = await supabase
          .from("addresses")
          .select("id")
          .eq("user_id", user.id)
          .neq("id", params.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (otherAddress) {
          await supabase
            .from("addresses")
            .update({ is_default: true })
            .eq("id", otherAddress.id);
        }
      }

      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", params.id);

      if (error) {
        return errorResponse(error);
      }

      return successResponse({ message: "Address deleted successfully" });
    },
    { requireAuth: true }
  );
}
