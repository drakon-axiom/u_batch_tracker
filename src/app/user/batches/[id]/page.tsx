import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import BatchDetail from "@/components/user/BatchDetail";

type Params = { params: Promise<{ id: string }> };

export default async function BatchDetailPage({ params }: Params) {
  const { id } = await params;
  const cookieStore = await cookies();

  let userId: number | undefined;
  let isAdmin = false;

  const userToken = cookieStore.get("user_token")?.value;
  const adminToken = cookieStore.get("admin_token")?.value;

  if (userToken) {
    const p = await verifyToken(userToken, "user");
    if (p) userId = p.userId;
  }
  if (!userId && adminToken) {
    const p = await verifyToken(adminToken, "admin");
    if (p) { userId = p.userId; isAdmin = true; }
  }

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

  const isOwn = batch.createdByUserId === userId;
  const canEdit = isAdmin || isOwn;

  return (
    <BatchDetail
      batch={JSON.parse(JSON.stringify(batch))}
      canEdit={canEdit}
      isAdmin={isAdmin}
    />
  );
}
