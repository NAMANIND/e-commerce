import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "misc";

    // Get the auth header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Create a new Supabase client with the auth token
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${folder}/${timestamp}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExtension}`;

    // Determine which bucket to use based on the folder
    const bucket = folder.startsWith("category")
      ? "category-images"
      : "product-images";

    // Upload file to Supabase Storage
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;

    // Get public URL
    const { data: publicUrl } = supabaseClient.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      data: {
        path: fileName,
        url: publicUrl.publicUrl,
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");
    const folder = path?.split("/")[0];

    // Get the auth header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Create a new Supabase client with the auth token
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    if (!path) {
      return NextResponse.json(
        { success: false, error: "File path is required" },
        { status: 400 }
      );
    }

    // Determine which bucket to use based on the folder
    const bucket = folder?.startsWith("category")
      ? "category-images"
      : "product-images";

    const { error } = await supabaseClient.storage.from(bucket).remove([path]);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
