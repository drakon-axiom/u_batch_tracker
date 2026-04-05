import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { authenticate, ok, err } from "@/lib/api-helpers";

const schema = z.object({
  name: z.string().min(1).max(255),
  familyCodeId: z.number().int().positive(),
});

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if ("status" in auth) return auth;
  const products = await db.product.findMany({
    include: { familyCode: { select: { id: true, code: true, name: true } } },
    orderBy: { name: "asc" },
  });
  return ok(products);
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req, "admin");
  if ("status" in auth) return auth;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return err("VALIDATION_ERROR", parsed.error.issues[0].message, 400);
  try {
    const product = await db.product.create({
      data: { name: parsed.data.name.trim(), familyCodeId: parsed.data.familyCodeId },
      include: { familyCode: { select: { id: true, code: true, name: true } } },
    });
    return ok(product, 201);
  } catch {
    return err("CONFLICT", "A product with that name already exists", 409);
  }
}
