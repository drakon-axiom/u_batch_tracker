"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Batch = {
  id: number;
  lotNumber: string;
  productionDate: string;
  stage: number;
  labTested: boolean;
  customer: { name: string };
  product: { name: string };
  createdBy: { username: string };
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
      if (res.ok) {
        const json = await res.json();
        setBatches(json.data);
      }
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchBatches, 300);
    return () => clearTimeout(t);
  }, [fetchBatches]);

  async function handleDelete(id: number, lotNumber: string) {
    if (!confirm(`Delete batch ${lotNumber}? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/batches/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBatches((prev) => prev.filter((b) => b.id !== id));
      } else {
        const data = await res.json();
        alert(data.error?.message ?? "Delete failed");
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search lot number, customer, or product…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-slate-500">Lot Number</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Product</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Prod. Date</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Stage</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Lab</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Created By</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">Loading…</td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    {search ? "No batches match your search." : "No batches yet."}
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-slate-900">{batch.lotNumber}</td>
                    <td className="px-4 py-3 text-slate-700">{batch.customer.name}</td>
                    <td className="px-4 py-3 text-slate-700">{batch.product.name}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(batch.productionDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={batch.stage === 2 ? "success" : "secondary"}>
                        Stage {batch.stage}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {batch.labTested ? (
                        <Badge variant="warning">Lab Tested</Badge>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{batch.createdBy.username}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link href={`/admin/batches/${batch.id}`}>
                          <Button size="sm" variant="outline">Edit</Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(batch.id, batch.lotNumber)}
                          disabled={deletingId === batch.id}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-slate-400 text-right">
        {batches.length} batch{batches.length !== 1 ? "es" : ""}
      </p>
    </div>
  );
}
