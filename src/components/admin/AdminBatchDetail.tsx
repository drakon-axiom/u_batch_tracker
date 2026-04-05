"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Trash2, Save, Check, AlertCircle, CircleCheck } from "lucide-react";
import { formatProdDate } from "@/lib/date-utils";

type LabName = { id: number; name: string };
type Batch = {
  id: number; lotNumber: string; productionDate: string; stage: number;
  labTested: boolean; labResults: string | null;
  customer: { id: number; name: string }; product: { id: number; name: string; familyCode: { code: string; name: string } };
  createdBy: { username: string }; labName: LabName | null;
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
    if (labTested && !labNameId) { setError("Please select a lab name."); return; }
    setError(""); setSaving(true);
    try {
      const res = await fetch(`/api/batches/${batch.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: Number(customerId), productId: Number(productId), stage: 2, labTested, labNameId: labTested ? Number(labNameId) : null, labResults: labTested ? labResults || null : null }),
      });
      const data = await res.json();
      if (res.ok) { setSuccess("Saved!"); setTimeout(() => setSuccess(""), 3000); }
      else setError(data.error?.message ?? "Failed to save");
    } catch { setError("Network error."); } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm(`Delete batch ${batch.lotNumber}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/batches/${batch.id}`, { method: "DELETE" });
      if (res.ok) { router.push("/admin/dashboard"); router.refresh(); }
      else setError((await res.json()).error?.message ?? "Delete failed");
    } finally { setDeleting(false); }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-1">
              <ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">Back</span>
            </Button>
          </Link>
          <Badge variant={batch.stage === 2 ? "success" : "secondary"}>
            {batch.stage === 2 ? "Complete" : "Stage 1"}
          </Badge>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting} className="gap-1.5">
          <Trash2 className="w-3.5 h-3.5" />
          {deleting ? "Deleting…" : <span className="hidden sm:inline">Delete</span>}
        </Button>
      </div>

      {/* Lot number hero */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950/20 border border-zinc-800 rounded-2xl p-6 sm:p-8">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2 font-medium">Lot Number</p>
        <p className="font-mono text-4xl sm:text-5xl font-bold text-teal-400 tracking-widest">{batch.lotNumber}</p>
        <p className="text-xs text-zinc-600 mt-3">Created by {batch.createdBy.username}</p>
      </div>

      {/* Stage 1 fields */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Batch Details</h2>
        <div className="space-y-1.5">
          <Label>Customer</Label>
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Product</Label>
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{products.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name} <span className="text-zinc-500 text-xs">({p.familyCode.code})</span></SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <p className="text-xs text-zinc-600 uppercase tracking-wider mb-1">Production Date</p>
          <p className="text-sm text-zinc-300">{formatProdDate(batch.productionDate)}</p>
          <p className="text-xs text-zinc-600 mt-0.5">Cannot change — would alter the lot number</p>
        </div>
      </div>

      {/* Lab results */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Lab Results</h2>
        </div>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input type="checkbox" checked={labTested} onChange={(e) => setLabTested(e.target.checked)} className="sr-only peer" />
            <div className="w-5 h-5 rounded border border-zinc-700 bg-zinc-800 peer-checked:bg-teal-500 peer-checked:border-teal-500 transition-colors flex items-center justify-center">
              {labTested && <Check className="w-3 h-3 text-zinc-950" />}
            </div>
          </div>
          <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">3rd party lab tested</span>
        </label>
        {labTested && (
          <>
            <div className="space-y-1.5">
              <Label>Lab Name</Label>
              <Select value={labNameId} onValueChange={setLabNameId}>
                <SelectTrigger><SelectValue placeholder="Select lab" /></SelectTrigger>
                <SelectContent>{labNames.map((l) => <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Test Results</Label>
              <Textarea value={labResults} onChange={(e) => setLabResults(e.target.value)} placeholder="Paste or type lab results…" rows={5} />
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
          <CircleCheck className="w-4 h-4 shrink-0" />{success}
        </div>
      )}

      <Button onClick={handleSave} disabled={saving} variant="admin" className="w-full h-10 gap-2">
        <Save className="w-4 h-4" />
        {saving ? "Saving…" : "Save Changes"}
      </Button>
    </div>
  );
}
