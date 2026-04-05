"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldCheck, LayoutDashboard, Users, UserCog,
  Package, Tag, FlaskConical, LogOut, ExternalLink, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/admin/users",        label: "Users",        icon: UserCog },
  { href: "/admin/customers",    label: "Customers",    icon: Users },
  { href: "/admin/products",     label: "Products",     icon: Package },
  { href: "/admin/family-codes", label: "Family Codes", icon: Tag },
  { href: "/admin/lab-names",    label: "Lab Names",    icon: FlaskConical },
];

function NavContent({ username, onNav, onLogout }: { username: string; onNav?: () => void; onLogout: () => void }) {
  const pathname = usePathname();
  return (
    <>
      <div className="p-4 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-100">Admin</p>
            <p className="text-xs text-zinc-500 truncate">{username}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNav}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-indigo-500/15 text-indigo-300 font-medium"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", active ? "text-indigo-400" : "")} />
              {label}
            </Link>
          );
        })}

        <div className="pt-2 mt-1 border-t border-zinc-800/60">
          <Link
            href="/user/dashboard"
            onClick={onNav}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            User Portal
          </Link>
        </div>
      </nav>

      <div className="p-3 border-t border-zinc-800 shrink-0">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </>
  );
}

export default function AdminSidebar({ username }: { username: string }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-zinc-900 border-r border-zinc-800 flex-col shrink-0 sticky top-0 h-screen">
        <NavContent username={username} onLogout={handleLogout} />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="font-semibold text-zinc-100 text-sm">Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute top-14 left-0 bottom-0 w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <NavContent
              username={username}
              onNav={() => setMobileOpen(false)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}
    </>
  );
}
