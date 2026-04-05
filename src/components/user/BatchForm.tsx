"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { todayLocal } from "@/lib/date-utils";

type Customer = { id: number; name: string };
type Product = { id: number; name: string; familyCode: { code: string } };

export default function BatchForm() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [productionDate, setProductionDate] = useState(todayLocal);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then((d) => setCustomers(d.data ?? []));
    fetch("/api/products").then((r) => r.json()).then((d) => setProducts(d.data ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId || !productId || !productionDate) { setError("All fields are required."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: Number(customerId), productId: Number(productId), productionDate }),
      });
      const data = await res.json();
      if (res.ok) router.push(`/user/batches/${data.data.id}`);
      else setError(data.error?.message ?? "Failed to create batch");
    } catch { setError("Network error."); } finally { setLoading(false); }
  }

  const noData = customers.length === 0 || products.length === 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        {noData && (
          <div className="flex items-start gap-2.5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-400">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Add <a href="/admin/customers" className="underline">customers</a> and{" "}
              <a href="/admin/products" className="underline">products</a> in the admin panel before creating batches.
            </span>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="customer">Customer</Label>
          <Select value={customerId} onValueChange={setCustomerId} disabled={customers.length === 0}>
            <SelectTrigger id="customer">
              <SelectValue placeholder={customers.length === 0 ? "No customers yet" : "Select a customer"} />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="product">Product</Label>
          <Select value={productId} onValueChange={setProductId} disabled={products.length === 0}>
            <SelectTrigger id="product">
              <SelectValue placeholder={products.length === 0 ? "No products yet" : "Select a product"} />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  <span>{p.name}</span>
                  <span className="ml-2 text-zinc-500 text-xs">({p.familyCode.code})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="prod-date">Production Date</Label>
          <Input
            id="prod-date"
            type="date"
            value={productionDate}
            onChange={(e) => setProductionDate(e.target.value)}
            required
          />
          <p className="text-xs text-zinc-600">The lot number sequence letter is based on this date.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Link href="/user/dashboard">
          <Button type="button" variant="outline" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <Button type="submit" disabled={loading || noData} className="flex-1">
          {loading ? "Creating…" : "Create Batch"}
        </Button>
      </div>
    </form>
  );
}
