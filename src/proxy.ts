import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret-change-in-production"
);

async function isValidToken(token: string, expectedRole: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.role === expectedRole;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // User portal protection
  if (pathname.startsWith("/user") && !pathname.startsWith("/user/login")) {
    const token = req.cookies.get("user_token")?.value;
    if (!token || !(await isValidToken(token, "user"))) {
      // Also accept admin token on user routes (admins can view user portal)
      const adminToken = req.cookies.get("admin_token")?.value;
      if (!adminToken || !(await isValidToken(adminToken, "admin"))) {
        const loginUrl = new URL("/user/login", req.url);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // Admin portal protection
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = req.cookies.get("admin_token")?.value;
    if (!token || !(await isValidToken(token, "admin"))) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/admin/:path*"],
};
