import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types";
import { authenticateUser, authenticateAdmin } from "./auth";

export { authenticateUser, authenticateAdmin };

export function successResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data });
}

export function errorResponse(
  error: string | Error,
  status = 400
): NextResponse<ApiResponse> {
  const message = error instanceof Error ? error.message : error;
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function handleApiRoute(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  options: { requireAuth?: boolean; requireAdmin?: boolean } = {}
) {
  try {
    if (options.requireAdmin) {
      await authenticateAdmin(request);
    } else if (options.requireAuth) {
      await authenticateUser(request);
    }
    return await handler();
  } catch (error: any) {
    const status =
      error.message === "Unauthorized"
        ? 401
        : error.message.startsWith("Forbidden")
        ? 403
        : 400;
    return errorResponse(error, status);
  }
}
