import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { authenticate, ok, err } from "@/lib/api-helpers";

const schema = z.object({
  code: z.string().length(2).toUpperCase(),
  name: z.string().min(1).max(128),
});

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if ("status" in auth) return auth;
  const codes = await db.familyCode.findMany({ orderBy: { code: "asc" } });
  return ok(codes);
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req, "admin");
  if ("status" in auth) return auth;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return err("VALIDATION_ERROR", parsed.error.issues[0].message, 400);
  try {
    const code = await db.familyCode.create({
      data: { code: parsed.data.code, name: parsed.data.name.trim() },
    });
    return ok(code, 201);
  } catch {
    return err("CONFLICT", "A family code with that code already exists", 409);
  }
}
