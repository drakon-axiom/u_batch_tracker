"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Trash2, Save } from "lucide-react";

type LabName = { id: number; name: string };
type Batch = {
  id: number;
  lotNumber: string;
  productionDate: string;
  stage: number;
  labTested: boolean;
  labResults: string | null;
  customer: { id: number; name: string };
  product: { id: number; name: string; familyCode: { code: string; name: string } };
  createdBy: { username: string };
  labName: LabName | null;
};

export default function AdminBatchDetail({ batch }: { batch: Batch }) {
  const router = useRouter();
  const [labTested, setLabTested] = useState(batch.labTested);
  const [labNameId, setLabNameId] = useState(batch.labName ? String(batch.labName.id) : "");
  const [labResults, setLabResults] = useState(batch.labResults ?? "");
  const [labNames, setLabNames] = useState<LabName[]>([]);
  const [customers, setCustomers] = useState<{ id: number; name: string }[]>([]);
  const [products, setProducts] = useState<{ id: number; name: string; familyCode: { code: string } }[]>([]);
  const [customerId, setCustomerId] = useState(String(batch.customer.id));
  const [productId, setProductId] = useState(String(batch.product.id));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/lab-names").then((r) => r.json()).then((d) => setLabNames(d.data ?? []));
    fetch("/api/customers").then((r) => r.json()).then((d) => setCustomers(d.data ?? []));
    fetch("/api/products").then((r) => r.json()).then((d) => setProducts(d.data ?? []));
  }, []);

  async function handleSave() {
    if (labTested && !labNameId) {
      setError("Please select a lab name.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/batches/${batch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: Number(customerId),
          productId: Number(productId),
          stage: 2,
          labTested,
          labNameId: labTested ? Number(labNameId) : null,
          labResults: labTested ? labResults || null : null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Saved successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error?.message ?? "Failed to save");
      }
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete batch ${batch.lotNumber}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/batches/${batch.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error?.message ?? "Delete failed");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <Badge variant={batch.stage === 2 ? "success" : "secondary"}>Stage {batch.stage}</Badge>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
          className="gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          {deleting ? "Deleting…" : "Delete Batch"}
        </Button>
      </div>

      {/* Lot number hero */}
      <div className="bg-slate-900 text-white rounded-xl p-6">
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Lot Number</p>
        <p className="font-mono text-4xl font-bold tracking-wide">{batch.lotNumber}</p>
        <p className="text-slate-400 text-sm mt-2">Created by {batch.createdBy.username}</p>
      </div>

      {/* Stage 1 fields (admin can edit even after stage 2) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-semibold text-slate-900">Batch Details</h2>

        <div className="space-y-1.5">
          <Label>Customer</Label>
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Product</Label>
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name} <span className="text-slate-400 text-xs">({p.familyCode.code})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Production Date</p>
          <p className="text-sm font-medium">
            {new Date(batch.productionDate).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Production date cannot be changed (affects lot number)</p>
        </div>
      </div>

      {/* Lab results */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Lab Results</h2>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="lab-tested"
            checked={labTested}
            onChange={(e) => setLabTested(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
          />
          <Label htmlFor="lab-tested" className="cursor-pointer">3rd party lab tested</Label>
        </div>

        {labTested && (
          <>
            <div className="space-y-1.5">
              <Label>Lab Name</Label>
              <Select value={labNameId} onValueChange={setLabNameId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a lab" />
                </SelectTrigger>
                <SelectContent>
                  {labNames.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Test Results</Label>
              <Textarea
                value={labResults}
                onChange={(e) => setLabResults(e.target.value)}
                placeholder="Paste or type lab test results here…"
                rows={5}
              />
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">
          {success}
        </div>
      )}

      <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
        <Save className="w-4 h-4" />
        {saving ? "Saving…" : "Save Changes"}
      </Button>
    </div>
  );
}
