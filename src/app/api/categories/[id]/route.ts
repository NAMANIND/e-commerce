import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { authenticateUser } from "@/lib/auth";
import { z } from "zod";

type NextRequestContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: NextRequestContext) {
  try {
    const params = await context.params;
    const includeProducts =
      request.nextUrl.searchParams.get("include_products") === "true";

    const { data: category, error } = await supabase
      .from("categories")
      .select(includeProducts ? "*, products(*)" : "*")
      .eq("id", params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    const serialized =
      error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ error: serialized }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: NextRequestContext) {
  try {
    const user = await authenticateUser(request);
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const params = await context.params;
    const body = await request.json();

    const payload = await z
      .object({
        name: z.string().min(1),
        description: z.string().optional(),
        image_url: z.string().url().optional(),
        parent_id: z.string().optional(),
      })
      .parseAsync(body);

    // Generate id from name if name is being updated
    const id = payload.name.toLowerCase().replace(/\s+/g, "-");

    const { data: category, error } = await supabase
      .from("categories")
      .update({
        ...payload,
        id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    const serialized =
      error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ error: serialized }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: NextRequestContext
) {
  try {
    const user = await authenticateUser(request);
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const params = await context.params;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    const serialized =
      error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ error: serialized }, { status: 500 });
  }
}
