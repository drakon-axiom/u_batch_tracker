import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import BatchTable from "@/components/user/BatchTable";

export default async function UserDashboard() {
  const cookieStore = await cookies();
  const userToken = cookieStore.get("user_token")?.value;
  const adminToken = cookieStore.get("admin_token")?.value;

  let userId: number | undefined;
  let isAdmin = false;

  if (userToken) {
    const p = await verifyToken(userToken, "user");
    if (p) userId = p.userId;
  }
  if (!userId && adminToken) {
    const p = await verifyToken(adminToken, "admin");
    if (p) { userId = p.userId; isAdmin = true; }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">All Batches</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Track and manage production batches</p>
        </div>
      </div>
      <BatchTable currentUserId={userId} isAdmin={isAdmin} />
    </div>
  );
}
