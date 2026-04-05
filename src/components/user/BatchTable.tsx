"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
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

export default function BatchTable({
  currentUserId,
  isAdmin,
}: {
  currentUserId?: number;
  isAdmin?: boolean;
}) {
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
      if (res.ok) {
        const json = await res.json();
        setBatches(json.data);
      }
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(fetchBatches, 300);
    return () => clearTimeout(timeout);
  }, [fetchBatches]);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5" />
    );
  }

  const sorted = [...batches].sort((a, b) => {
    let av: string | number = "";
    let bv: string | number = "";
    if (sortField === "lotNumber") { av = a.lotNumber; bv = b.lotNumber; }
    else if (sortField === "customer") { av = a.customer.name; bv = b.customer.name; }
    else if (sortField === "product") { av = a.product.name; bv = b.product.name; }
    else if (sortField === "productionDate") { av = a.productionDate; bv = b.productionDate; }
    else if (sortField === "stage") { av = a.stage; bv = b.stage; }
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

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
                {(
                  [
                    { label: "Lot Number", field: "lotNumber" },
                    { label: "Customer", field: "customer" },
                    { label: "Product", field: "product" },
                    { label: "Production Date", field: "productionDate" },
                    { label: "Stage", field: "stage" },
                  ] as { label: string; field: SortField }[]
                ).map(({ label, field }) => (
                  <th
                    key={field}
                    className="text-left px-4 py-3 font-medium text-slate-500 cursor-pointer hover:text-slate-900 select-none"
                    onClick={() => handleSort(field)}
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      <SortIcon field={field} />
                    </span>
                  </th>
                ))}
                <th className="text-left px-4 py-3 font-medium text-slate-500">Lab</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    Loading…
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    {search ? "No batches match your search." : "No batches yet. Create the first one!"}
                  </td>
                </tr>
              ) : (
                sorted.map((batch) => {
                  const isOwn = batch.createdBy.id === currentUserId;
                  const canEdit = isAdmin || isOwn;
                  return (
                    <tr
                      key={batch.id}
                      className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-medium text-slate-900">
                        {batch.lotNumber}
                      </td>
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
                      <td className="px-4 py-3 text-right">
                        <Link href={`/user/batches/${batch.id}`}>
                          <Button size="sm" variant={canEdit ? "outline" : "ghost"}>
                            {canEdit ? "Edit" : "View"}
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-slate-400 text-right">
        {sorted.length} batch{sorted.length !== 1 ? "es" : ""}
      </p>
    </div>
  );
}
