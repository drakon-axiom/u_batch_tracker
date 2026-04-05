import { NextRequest, NextResponse } from "next/server";
import { verifyToken, TokenPayload } from "./auth";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function err(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

/**
 * Authenticate an API request. Accepts either user_token or admin_token.
 * Pass requiredRole to enforce a specific role.
 */
export async function authenticate(
  req: NextRequest,
  requiredRole?: "user" | "admin"
): Promise<{ payload: TokenPayload } | NextResponse> {
  const userToken = req.cookies.get("user_token")?.value;
  const adminToken = req.cookies.get("admin_token")?.value;

  let payload: TokenPayload | null = null;

  if (requiredRole === "admin") {
    payload = adminToken ? await verifyToken(adminToken, "admin") : null;
  } else if (requiredRole === "user") {
    // user role: accept user token; also accept admin token
    payload = userToken ? await verifyToken(userToken, "user") : null;
    if (!payload && adminToken) {
      payload = await verifyToken(adminToken, "admin");
    }
  } else {
    // No specific role required — accept any valid token
    payload = userToken ? await verifyToken(userToken, "user") : null;
    if (!payload && adminToken) {
      payload = await verifyToken(adminToken, "admin");
    }
  }

  if (!payload) {
    return err("UNAUTHORIZED", "Authentication required", 401);
  }

  return { payload };
}
