import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { authenticate, ok, err } from "@/lib/api-helpers";

const schema = z.object({
  name: z.string().min(1).max(128).optional(),
});
type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await authenticate(req, "admin");
  if ("status" in auth) return auth;
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return err("VALIDATION_ERROR", parsed.error.issues[0].message, 400);
  try {
    const code = await db.familyCode.update({
      where: { id: Number(id) },
      data: { ...(parsed.data.name && { name: parsed.data.name.trim() }) },
    });
    return ok(code);
  } catch {
    return err("NOT_FOUND", "Family code not found", 404);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await authenticate(req, "admin");
  if ("status" in auth) return auth;
  const { id } = await params;
  try {
    await db.familyCode.delete({ where: { id: Number(id) } });
    return ok({ deleted: true });
  } catch {
    return err("CONFLICT", "Cannot delete: family code is referenced by products", 409);
  }
}
