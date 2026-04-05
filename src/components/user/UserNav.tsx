"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Package2, Plus, LogOut, ShieldCheck, Menu, X, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function UserNav({ username, isAdmin }: { username: string; isAdmin: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/user/logout", { method: "POST" });
    router.push("/user/login");
    router.refresh();
  }

  const navLinks = [
    { href: "/user/dashboard", label: "All Batches", icon: LayoutGrid },
  ];

  return (
    <>
      <header className="bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/user/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <Package2 className="w-4 h-4 text-teal-400" />
            </div>
            <span className="font-semibold text-zinc-100 text-sm hidden sm:block">Batch Tracker</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
                  pathname === href || pathname.startsWith(href.replace("/dashboard", ""))
                    ? "text-zinc-100 bg-zinc-800"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href="/user/batches/new">
              <Button size="sm" className="gap-1.5 hidden sm:inline-flex">
                <Plus className="w-3.5 h-3.5" />
                New Batch
              </Button>
              <Button size="icon" className="sm:hidden w-8 h-8">
                <Plus className="w-4 h-4" />
              </Button>
            </Link>
            {isAdmin && (
              <Link href="/admin/dashboard" className="hidden sm:block">
                <Button size="sm" variant="outline" className="gap-1.5 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin
                </Button>
              </Link>
            )}
            <span className="text-xs text-zinc-500 hidden lg:block">{username}</span>
            <Button size="icon" variant="ghost" onClick={handleLogout} className="w-8 h-8 hidden sm:flex text-zinc-400">
              <LogOut className="w-4 h-4" />
            </Button>
            {/* Mobile menu toggle */}
            <button
              className="sm:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute top-14 left-0 right-0 bg-zinc-900 border-b border-zinc-800 p-4 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-indigo-400 hover:bg-indigo-500/10 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Switch to Admin
              </Link>
            )}
            <div className="border-t border-zinc-800 pt-2 mt-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out ({username})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
