"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Trash2, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Batch = {
  id: number; lotNumber: string; productionDate: string;
  stage: number; labTested: boolean;
  customer: { name: string }; product: { name: string }; createdBy: { username: string };
};

export default function AdminBatchTable() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/batches?${params}`);
      if (res.ok) setBatches((await res.json()).data);
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchBatches, 300);
    return () => clearTimeout(t);
  }, [fetchBatches]);

  async function handleDelete(id: number, lot: string) {
    if (!confirm(`Delete batch ${lot}? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/batches/${id}`, { method: "DELETE" });
      if (res.ok) setBatches((p) => p.filter((b) => b.id !== id));
      else alert((await res.json()).error?.message ?? "Delete failed");
    } finally { setDeletingId(null); }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        <Input placeholder="Search lot number, customer, or product…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {["Lot Number","Customer","Product","Date","Stage","Lab","By"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">{h}</th>
                ))}
                <th className="px-4 py-3 w-28" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-16 text-center text-zinc-600">Loading…</td></tr>
              ) : batches.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-16 text-center text-zinc-600">{search ? "No matches." : "No batches yet."}</td></tr>
              ) : batches.map((b) => (
                <tr key={b.id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-4 py-3 font-mono font-semibold text-teal-400 tracking-wide">{b.lotNumber}</td>
                  <td className="px-4 py-3 text-zinc-300">{b.customer.name}</td>
                  <td className="px-4 py-3 text-zinc-300">{b.product.name}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(b.productionDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><Badge variant={b.stage === 2 ? "success" : "secondary"}>{b.stage === 2 ? "Complete" : "Stage 1"}</Badge></td>
                  <td className="px-4 py-3">
                    {b.labTested ? <span className="flex items-center gap-1.5 text-xs text-amber-400"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />Lab</span> : <span className="text-zinc-700 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 text-xs">{b.createdBy.username}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 justify-end">
                      <Link href={`/admin/batches/${b.id}`}>
                        <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs opacity-60 group-hover:opacity-100 transition-opacity">Edit</Button>
                      </Link>
                      <Button size="sm" variant="destructive" className="h-7 w-7 p-0" onClick={() => handleDelete(b.id, b.lotNumber)} disabled={deletingId === b.id}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-2">
        {loading ? <div className="text-center text-zinc-600 py-12">Loading…</div>
          : batches.length === 0 ? <div className="text-center text-zinc-600 py-12">{search ? "No matches." : "No batches yet."}</div>
          : batches.map((b) => (
            <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono font-semibold text-teal-400 text-lg">{b.lotNumber}</span>
                <Badge variant={b.stage === 2 ? "success" : "secondary"}>{b.stage === 2 ? "Complete" : "Stage 1"}</Badge>
              </div>
              <p className="text-sm text-zinc-300 mt-1.5">{b.product.name}</p>
              <p className="text-xs text-zinc-500">{b.customer.name} · {new Date(b.productionDate).toLocaleDateString()} · by {b.createdBy.username}</p>
              <div className="flex gap-2 mt-3">
                <Link href={`/admin/batches/${b.id}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full gap-1.5"><ChevronRight className="w-3.5 h-3.5" />Edit</Button>
                </Link>
                <Button size="sm" variant="destructive" className="h-8 w-8 p-0" onClick={() => handleDelete(b.id, b.lotNumber)} disabled={deletingId === b.id}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
      </div>

      <p className="text-xs text-zinc-600 text-right">{batches.length} batch{batches.length !== 1 ? "es" : ""}</p>
    </div>
  );
}
