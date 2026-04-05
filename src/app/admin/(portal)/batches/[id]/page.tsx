import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import AdminBatchDetail from "@/components/admin/AdminBatchDetail";

type Params = { params: Promise<{ id: string }> };

export default async function AdminBatchDetailPage({ params }: Params) {
  const { id } = await params;

  const batch = await db.batch.findUnique({
    where: { id: Number(id) },
    include: {
      customer: true,
      product: { include: { familyCode: true } },
      createdBy: true,
      labName: true,
    },
  });

  if (!batch) notFound();

  return <AdminBatchDetail batch={JSON.parse(JSON.stringify(batch))} />;
}
