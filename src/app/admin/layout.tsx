import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) redirect("/admin/login");

  const payload = await verifyToken(token, "admin");
  if (!payload) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <AdminSidebar username={payload.username} />
      <main className="flex-1 bg-slate-50 min-h-screen overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
