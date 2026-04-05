"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error?.message ?? "Invalid credentials");
      }
    } catch { setError("Network error — please try again."); } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.07),transparent)] pointer-events-none" />

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
            <Lock className="w-4 h-4 text-indigo-400" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Admin Portal</h1>
          <p className="text-sm text-zinc-500 mt-1">Sign in to manage the system</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Admin username"
                autoComplete="username"
                autoFocus
                required
                className="focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/60"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                autoComplete="current-password"
                required
                className="focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/60"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-sm font-semibold rounded-lg transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-xs text-center text-zinc-600 mt-6">
          Not an admin?{" "}
          <a href="/user/login" className="text-zinc-400 hover:text-zinc-200 transition-colors underline underline-offset-2">
            User portal →
          </a>
        </p>
      </div>
    </div>
  );
}
