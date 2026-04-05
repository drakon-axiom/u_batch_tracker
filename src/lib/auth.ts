import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret-change-in-production"
);

export type TokenPayload = {
  userId: number;
  username: string;
  role: "user" | "admin";
};

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRY ?? "8h")
    .sign(secret);
}

export async function verifyToken(
  token: string,
  expectedRole: "user" | "admin"
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== expectedRole) return null;
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export const USER_COOKIE = "user_token";
export const ADMIN_COOKIE = "admin_token";

export async function getTokenFromCookies(
  role: "user" | "admin"
): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const cookieName = role === "user" ? USER_COOKIE : ADMIN_COOKIE;
  const token = cookieStore.get(cookieName)?.value;
  if (!token) return null;
  return verifyToken(token, role);
}

export function getTokenFromRequest(
  req: NextRequest,
  role: "user" | "admin"
): string | null {
  const cookieName = role === "user" ? USER_COOKIE : ADMIN_COOKIE;
  return req.cookies.get(cookieName)?.value ?? null;
}
