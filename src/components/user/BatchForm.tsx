"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type Customer = { id: number; name: string };
type Product = { id: number; name: string; familyCode: { code: string } };

export default function BatchForm() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [productionDate, setProductionDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then((d) => setCustomers(d.data ?? []));
    fetch("/api/products").then((r) => r.json()).then((d) => setProducts(d.data ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId || !productId || !productionDate) {
      setError("All fields are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: Number(customerId),
          productId: Number(productId),
          productionDate,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/user/batches/${data.data.id}`);
      } else {
        setError(data.error?.message ?? "Failed to create batch");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="customer">Customer</Label>
          {customers.length === 0 ? (
            <p className="text-sm text-slate-400 py-2">
              No customers yet.{" "}
              <a href="/admin/customers" className="underline">
                Add one in admin
              </a>
              .
            </p>
          ) : (
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger id="customer">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="product">Product</Label>
          {products.length === 0 ? (
            <p className="text-sm text-slate-400 py-2">
              No products yet.{" "}
              <a href="/admin/products" className="underline">
                Add one in admin
              </a>
              .
            </p>
          ) : (
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger id="product">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}{" "}
                    <span className="text-slate-400 text-xs ml-1">({p.familyCode.code})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="production-date">Production Date</Label>
          <Input
            id="production-date"
            type="date"
            value={productionDate}
            onChange={(e) => setProductionDate(e.target.value)}
            required
          />
          <p className="text-xs text-slate-400">
            The lot number sequence is based on this date.
          </p>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
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
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Creating batch…" : "Create Batch"}
        </Button>
      </div>
    </form>
  );
}
