import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { authenticate, ok, err } from "@/lib/api-helpers";
import { generateLotNumber, parseDateLocal } from "@/lib/lot-number";

const batchInclude = {
  customer: { select: { id: true, name: true } },
  product: {
    select: {
      id: true,
      name: true,
      familyCode: { select: { id: true, code: true, name: true } },
    },
  },
  createdBy: { select: { id: true, username: true } },
  labName: { select: { id: true, name: true } },
};

const createSchema = z.object({
  customerId: z.number().int().positive(),
  productId: z.number().int().positive(),
  productionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  notes: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if ("status" in auth) return auth;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const stage = searchParams.get("stage");
  const customerId = searchParams.get("customerId");

  const batches = await db.batch.findMany({
    where: {
      ...(search && {
        OR: [
          { lotNumber: { contains: search, mode: "insensitive" } },
          { customer: { name: { contains: search, mode: "insensitive" } } },
          { product: { name: { contains: search, mode: "insensitive" } } },
        ],
      }),
      ...(stage && { stage: Number(stage) }),
      ...(customerId && { customerId: Number(customerId) }),
    },
    include: batchInclude,
    orderBy: { createdAt: "desc" },
  });

  return ok(batches);
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if ("status" in auth) return auth;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return err("VALIDATION_ERROR", parsed.error.issues[0].message, 400);
  }

  const { customerId, productId, productionDate: dateStr, notes } = parsed.data;

  // Verify customer and product exist
  const [customer, product] = await Promise.all([
    db.customer.findUnique({ where: { id: customerId } }),
    db.product.findUnique({
      where: { id: productId },
      include: { familyCode: true },
    }),
  ]);

  if (!customer) return err("NOT_FOUND", "Customer not found", 404);
  if (!product) return err("NOT_FOUND", "Product not found", 404);

  const productionDate = parseDateLocal(dateStr);

  let lotNumber: string;
  try {
    lotNumber = await generateLotNumber(product.familyCode.code, productionDate);
  } catch (e) {
    return err("SEQUENCE_EXHAUSTED", (e as Error).message, 409);
  }

  const batch = await db.batch.create({
    data: {
      lotNumber,
      customerId,
      productId,
      productionDate,
      createdByUserId: auth.payload.userId,
      stage: 1,
      notes: notes ?? null,
    },
    include: batchInclude,
  });

  return ok(batch, 201);
}
