import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { loginId, password } = await request.json();

    // Check against environment variables
    const adminLoginId = process.env.ADMIN_LOGIN_ID;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminLoginId || !adminPassword) {
      return NextResponse.json(
        { message: "Admin credentials not configured" },
        { status: 500 }
      );
    }

    if (loginId === adminLoginId && password === adminPassword) {
      return NextResponse.json(
        { message: "Authentication successful" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
