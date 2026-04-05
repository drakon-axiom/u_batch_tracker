"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Plus, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UserNav({
  username,
  isAdmin,
}: {
  username: string;
  isAdmin: boolean;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/user/logout", { method: "POST" });
    router.push("/user/login");
    router.refresh();
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/user/dashboard" className="flex items-center gap-2 font-semibold text-slate-900">
            <Package className="w-5 h-5" />
            <span>Batch Tracker</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/user/dashboard"
              className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
            >
              All Batches
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/user/batches/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              New Batch
            </Button>
          </Link>
          {isAdmin && (
            <Link href="/admin/dashboard">
              <Button size="sm" variant="outline" className="gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Admin
              </Button>
            </Link>
          )}
          <span className="text-sm text-slate-500 hidden md:block">{username}</span>
          <Button size="sm" variant="ghost" onClick={handleLogout} className="gap-1.5">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
