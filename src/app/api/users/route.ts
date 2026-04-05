import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authenticate, ok, err } from "@/lib/api-helpers";

const createSchema = z.object({
  username: z.string().min(2).max(64).regex(/^\S+$/, "Username cannot contain spaces"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "admin"]),
});

export async function GET(req: NextRequest) {
  const auth = await authenticate(req, "admin");
  if ("status" in auth) return auth;

  const users = await db.user.findMany({
    select: { id: true, username: true, role: true, createdAt: true },
    orderBy: { username: "asc" },
  });
  return ok(users);
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req, "admin");
  if ("status" in auth) return auth;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return err("VALIDATION_ERROR", parsed.error.issues[0].message, 400);

  const { username, password, role } = parsed.data;

  const existing = await db.user.findUnique({ where: { username } });
  if (existing) return err("CONFLICT", "A user with that username already exists", 409);

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.user.create({
    data: { username, passwordHash, role },
    select: { id: true, username: true, role: true, createdAt: true },
  });
  return ok(user, 201);
}
