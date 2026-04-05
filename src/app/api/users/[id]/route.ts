import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authenticate, ok, err } from "@/lib/api-helpers";

const updateSchema = z.object({
  username: z.string().min(2).max(64).regex(/^\S+$/, "Username cannot contain spaces").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.enum(["user", "admin"]).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await authenticate(req, "admin");
  if ("status" in auth) return auth;

  const { id } = await params;
  const targetId = Number(id);

  const target = await db.user.findUnique({ where: { id: targetId } });
  if (!target) return err("NOT_FOUND", "User not found", 404);

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return err("VALIDATION_ERROR", parsed.error.issues[0].message, 400);

  const { username, password, role } = parsed.data;

  // Prevent an admin from demoting themselves
  if (role && role !== "admin" && targetId === auth.payload.userId) {
    return err("FORBIDDEN", "You cannot change your own role", 403);
  }

  const updateData: Record<string, string> = {};
  if (username) updateData.username = username;
  if (role) updateData.role = role;
  if (password) updateData.passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await db.user.update({
      where: { id: targetId },
      data: updateData,
      select: { id: true, username: true, role: true, createdAt: true },
    });
    return ok(user);
  } catch {
    return err("CONFLICT", "Username already taken", 409);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await authenticate(req, "admin");
  if ("status" in auth) return auth;

  const { id } = await params;
  const targetId = Number(id);

  if (targetId === auth.payload.userId) {
    return err("FORBIDDEN", "You cannot delete your own account", 403);
  }

  const target = await db.user.findUnique({ where: { id: targetId } });
  if (!target) return err("NOT_FOUND", "User not found", 404);

  try {
    await db.user.delete({ where: { id: targetId } });
    return ok({ deleted: true });
  } catch {
    return err("CONFLICT", "Cannot delete: user has created batches. Reassign or delete those batches first.", 409);
  }
}
