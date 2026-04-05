import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { authenticate, ok, err } from "@/lib/api-helpers";

const schema = z.object({ name: z.string().min(1).max(255) });

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if ("status" in auth) return auth;
  const customers = await db.customer.findMany({ orderBy: { name: "asc" } });
  return ok(customers);
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req, "admin");
  if ("status" in auth) return auth;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return err("VALIDATION_ERROR", parsed.error.issues[0].message, 400);
  try {
    const customer = await db.customer.create({ data: { name: parsed.data.name.trim() } });
    return ok(customer, 201);
  } catch {
    return err("CONFLICT", "A customer with that name already exists", 409);
  }
}
