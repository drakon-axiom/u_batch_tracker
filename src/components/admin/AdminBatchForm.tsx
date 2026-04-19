"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { todayLocal } from "@/lib/date-utils";

type Customer = { id: number; name: string };
type Product = { id: number; name: string; familyCode: { code: string } };

export default function AdminBatchForm() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [productionDate, setProductionDate] = useState(todayLocal);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then((d) => setCustomers(d.data ?? []));
    fetch("/api/products").then((r) => r.json()).then((d) => setProducts(d.data ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId || !productId) { setError("All fields are required."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/batches", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: Number(customerId), productId: Number(productId), productionDate, notes: notes.trim() || null }),
      });
      const data = await res.json();
      if (res.ok) router.push(`/admin/batches/${data.data.id}`);
      else setError(data.error?.message ?? "Failed to create batch");
    } catch { setError("Network error."); } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="customer">Customer</Label>
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger id="customer"><SelectValue placeholder="Select a customer" /></SelectTrigger>
            <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product">Product</Label>
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger id="product"><SelectValue placeholder="Select a product" /></SelectTrigger>
            <SelectContent>{products.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name} <span className="text-zinc-500 text-xs">({p.familyCode.code})</span></SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="prod-date">Production Date</Label>
          <Input id="prod-date" type="date" value={productionDate} onChange={(e) => setProductionDate(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes about this batch…" rows={4} />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      <div className="flex gap-3">
        <Link href="/admin/dashboard">
          <Button type="button" variant="outline" className="gap-1.5"><ArrowLeft className="w-4 h-4" />Back</Button>
        </Link>
        <Button type="submit" variant="admin" disabled={loading} className="flex-1">
          {loading ? "Creating…" : "Create Batch"}
        </Button>
      </div>
    </form>
  );
}
