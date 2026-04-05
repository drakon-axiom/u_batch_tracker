import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { authenticate, ok, err } from "@/lib/api-helpers";

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

const updateSchema = z.object({
  customerId: z.number().int().positive().optional(),
  productId: z.number().int().positive().optional(),
  stage: z.literal(2).optional(),
  labTested: z.boolean().optional(),
  labNameId: z.number().int().positive().nullable().optional(),
  labResults: z.string().nullable().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await authenticate(req);
  if ("status" in auth) return auth;

  const { id } = await params;
  const batch = await db.batch.findUnique({
    where: { id: Number(id) },
    include: batchInclude,
  });

  if (!batch) return err("NOT_FOUND", "Batch not found", 404);
  return ok(batch);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await authenticate(req);
  if ("status" in auth) return auth;

  const { id } = await params;
  const batch = await db.batch.findUnique({ where: { id: Number(id) } });
  if (!batch) return err("NOT_FOUND", "Batch not found", 404);

  // Users can only edit their own batches
  const isAdmin = auth.payload.role === "admin";
  if (!isAdmin && batch.createdByUserId !== auth.payload.userId) {
    return err("FORBIDDEN", "You can only edit your own batches", 403);
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return err("VALIDATION_ERROR", parsed.error.issues[0].message, 400);
  }

  const data = parsed.data;

  // If promoting to stage 2, validate lab data
  if (data.labTested && !data.labNameId) {
    return err("VALIDATION_ERROR", "Lab name is required when lab tested is true", 400);
  }

  // Stage 1 fields can only be edited if still in stage 1 (unless admin)
  if (batch.stage === 2 && !isAdmin && (data.customerId || data.productId)) {
    return err("FORBIDDEN", "Stage 1 fields are locked after stage 2 is set", 403);
  }

  const updated = await db.batch.update({
    where: { id: Number(id) },
    data: {
      ...(data.customerId !== undefined && { customerId: data.customerId }),
      ...(data.productId !== undefined && { productId: data.productId }),
      ...(data.stage !== undefined && { stage: data.stage }),
      ...(data.labTested !== undefined && { labTested: data.labTested }),
      ...(data.labNameId !== undefined && { labNameId: data.labNameId }),
      ...(data.labResults !== undefined && { labResults: data.labResults }),
    },
    include: batchInclude,
  });

  return ok(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await authenticate(req, "admin");
  if ("status" in auth) return auth;

  const { id } = await params;
  const batch = await db.batch.findUnique({ where: { id: Number(id) } });
  if (!batch) return err("NOT_FOUND", "Batch not found", 404);

  await db.batch.delete({ where: { id: Number(id) } });
  return ok({ deleted: true });
}
