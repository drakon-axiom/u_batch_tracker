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
    <div className="min-h-screen bg-zinc-950 md:flex">
      <AdminSidebar username={payload.username} />
      <main className="flex-1 min-h-screen overflow-auto pt-14 md:pt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</div>
      </main>
    </div>
  );
}
