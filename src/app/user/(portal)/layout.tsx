import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import UserNav from "@/components/user/UserNav";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  // Check auth server-side for non-login pages
  const cookieStore = await cookies();
  const userToken = cookieStore.get("user_token")?.value;
  const adminToken = cookieStore.get("admin_token")?.value;

  let username = "";
  let isAdmin = false;

  if (userToken) {
    const payload = await verifyToken(userToken, "user");
    if (payload) username = payload.username;
  }
  if (!username && adminToken) {
    const payload = await verifyToken(adminToken, "admin");
    if (payload) {
      username = payload.username;
      isAdmin = true;
    }
  }

  if (!username) redirect("/user/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <UserNav username={username} isAdmin={isAdmin} />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
