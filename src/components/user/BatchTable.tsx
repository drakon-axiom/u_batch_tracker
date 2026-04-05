"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, FlaskConical, ArrowRight } from "lucide-react";
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
  createdBy: { id: number; username: string };
};

type SortField = "lotNumber" | "customer" | "product" | "productionDate" | "stage";
type SortDir = "asc" | "desc";

export default function BatchTable({ currentUserId, isAdmin }: { currentUserId?: number; isAdmin?: boolean }) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("lotNumber");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/batches?${params}`);
      if (res.ok) setBatches((await res.json()).data);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchBatches, 300);
    return () => clearTimeout(t);
  }, [fetchBatches]);

  function handleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-teal-400" /> : <ChevronDown className="w-3 h-3 text-teal-400" />;
  }

  const sorted = [...batches].sort((a, b) => {
    const vals: Record<SortField, string | number> = {
      lotNumber: a.lotNumber, customer: a.customer.name, product: a.product.name,
      productionDate: a.productionDate, stage: a.stage,
    };
    const bVals: Record<SortField, string | number> = {
      lotNumber: b.lotNumber, customer: b.customer.name, product: b.product.name,
      productionDate: b.productionDate, stage: b.stage,
    };
    const av = vals[sortField], bv = bVals[sortField];
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const cols: { label: string; field: SortField }[] = [
    { label: "Lot Number", field: "lotNumber" },
    { label: "Customer", field: "customer" },
    { label: "Product", field: "product" },
    { label: "Date", field: "productionDate" },
    { label: "Stage", field: "stage" },
  ];

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        <Input
          placeholder="Search lot number, customer, or product…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {cols.map(({ label, field }) => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    className="text-left px-4 py-3 font-medium text-zinc-500 cursor-pointer hover:text-zinc-300 select-none transition-colors text-xs uppercase tracking-wider"
                  >
                    <span className="flex items-center gap-1.5">
                      {label}
                      <SortIcon field={field} />
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-xs uppercase tracking-wider text-zinc-500 text-left">Lab</th>
                <th className="px-4 py-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-16 text-center text-zinc-600">Loading batches…</td></tr>
              ) : sorted.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-16 text-center text-zinc-600">
                  {search ? "No batches match your search." : "No batches yet — create the first one!"}
                </td></tr>
              ) : sorted.map((batch) => {
                const canEdit = isAdmin || batch.createdBy.id === currentUserId;
                return (
                  <tr key={batch.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-teal-400 tracking-wide text-sm">{batch.lotNumber}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{batch.customer.name}</td>
                    <td className="px-4 py-3 text-zinc-300">{batch.product.name}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(batch.productionDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant={batch.stage === 2 ? "success" : "secondary"}>
                        {batch.stage === 2 ? "Complete" : "Stage 1"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {batch.labTested
                        ? <span className="flex items-center gap-1 text-xs text-amber-400"><FlaskConical className="w-3 h-3" />Tested</span>
                        : <span className="text-zinc-700 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/user/batches/${batch.id}`}>
                        <Button size="sm" variant={canEdit ? "outline" : "ghost"} className="h-7 px-2.5 text-xs opacity-60 group-hover:opacity-100 transition-opacity">
                          {canEdit ? "Edit" : "View"}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-2">
        {loading ? (
          <div className="text-center text-zinc-600 py-12">Loading batches…</div>
        ) : sorted.length === 0 ? (
          <div className="text-center text-zinc-600 py-12">
            {search ? "No batches match your search." : "No batches yet."}
          </div>
        ) : sorted.map((batch) => {
          const canEdit = isAdmin || batch.createdBy.id === currentUserId;
          return (
            <Link key={batch.id} href={`/user/batches/${batch.id}`} className="block">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors active:bg-zinc-800">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-mono font-semibold text-teal-400 text-lg tracking-wide">{batch.lotNumber}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant={batch.stage === 2 ? "success" : "secondary"}>
                      {batch.stage === 2 ? "Complete" : "Stage 1"}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-zinc-600" />
                  </div>
                </div>
                <div className="mt-2 space-y-0.5">
                  <p className="text-sm text-zinc-300">{batch.product.name}</p>
                  <p className="text-xs text-zinc-500">{batch.customer.name} · {new Date(batch.productionDate).toLocaleDateString()}</p>
                </div>
                {batch.labTested && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-amber-400">
                    <FlaskConical className="w-3 h-3" />Lab tested
                  </div>
                )}
                {canEdit && !isAdmin && (
                  <p className="text-xs text-zinc-600 mt-2">Your batch</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <p className="text-xs text-zinc-600 text-right">
        {sorted.length} batch{sorted.length !== 1 ? "es" : ""}
      </p>
    </div>
  );
}
