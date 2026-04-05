import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { err } from "@/lib/api-helpers";
import { z } from "zod";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return err("VALIDATION_ERROR", "Username and password are required", 400);
  }

  const { username, password } = parsed.data;
  const user = await db.user.findUnique({ where: { username } });

  if (!user || user.role !== "user") {
    return err("INVALID_CREDENTIALS", "Invalid username or password", 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return err("INVALID_CREDENTIALS", "Invalid username or password", 401);
  }

  const token = await signToken({ userId: user.id, username: user.username, role: "user" });

  const res = NextResponse.json({ data: { username: user.username, role: "user" } });
  res.cookies.set("user_token", token, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
  return res;
}
