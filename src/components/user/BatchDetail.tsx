"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Check, Lock, AlertCircle, CircleCheck } from "lucide-react";

type LabName = { id: number; name: string };
type Batch = {
  id: number; lotNumber: string; productionDate: string;
  stage: number; labTested: boolean; labResults: string | null;
  customer: { name: string }; product: { name: string; familyCode: { code: string; name: string } };
  createdBy: { username: string }; labName: LabName | null;
};

export default function BatchDetail({ batch, canEdit, isAdmin }: { batch: Batch; canEdit: boolean; isAdmin: boolean }) {
  const router = useRouter();
  const [labTested, setLabTested] = useState(batch.labTested);
  const [labNameId, setLabNameId] = useState(batch.labName ? String(batch.labName.id) : "");
  const [labResults, setLabResults] = useState(batch.labResults ?? "");
  const [labNames, setLabNames] = useState<LabName[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const stage1Locked = batch.stage === 2 && !isAdmin;

  useEffect(() => {
    fetch("/api/lab-names").then((r) => r.json()).then((d) => setLabNames(d.data ?? []));
  }, []);

  async function handleSave() {
    if (labTested && !labNameId) { setError("Please select a lab."); return; }
    setError(""); setSaving(true);
    try {
      const res = await fetch(`/api/batches/${batch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: 2, labTested, labNameId: labTested ? Number(labNameId) : null, labResults: labTested ? labResults || null : null }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => { router.push("/user/dashboard"); router.refresh(); }, 1200);
      } else { setError(data.error?.message ?? "Failed to save"); }
    } catch { setError("Network error."); } finally { setSaving(false); }
  }

  const prodDate = new Date(batch.productionDate);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Back + status */}
      <div className="flex items-center gap-3">
        <Link href="/user/dashboard">
          <Button variant="ghost" size="sm" className="gap-1.5 -ml-1">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </Link>
        <Badge variant={batch.stage === 2 ? "success" : "teal"}>
          {batch.stage === 2 ? "Complete" : "Stage 1 — Pending lab results"}
        </Badge>
      </div>

      {/* Lot number hero */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-teal-950/30 border border-zinc-800 rounded-2xl p-6 sm:p-8">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2 font-medium">Lot Number</p>
        <p className="font-mono text-4xl sm:text-5xl font-bold text-teal-400 tracking-widest">{batch.lotNumber}</p>
        <p className="text-xs text-zinc-600 mt-3">Created by {batch.createdBy.username}</p>
      </div>

      {/* Batch info grid */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">Batch Details</h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {[
            { label: "Customer", value: batch.customer.name },
            { label: "Product", value: batch.product.name },
            { label: "Family Code", value: `${batch.product.familyCode.code} — ${batch.product.familyCode.name}` },
            { label: "Production Date", value: prodDate.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-zinc-600 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-sm text-zinc-200 font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Lab results section */}
      {canEdit && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Lab Results</h2>
            {stage1Locked && <Lock className="w-3.5 h-3.5 text-zinc-600 ml-auto" />}
          </div>

          {stage1Locked ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-zinc-600 uppercase tracking-wider mb-1">3rd Party Tested</p>
                <p className="text-sm text-zinc-300">{batch.labTested ? "Yes" : "No"}</p>
              </div>
              {batch.labTested && batch.labName && (
                <div>
                  <p className="text-xs text-zinc-600 uppercase tracking-wider mb-1">Lab</p>
                  <p className="text-sm text-zinc-300">{batch.labName.name}</p>
                </div>
              )}
              {batch.labResults && (
                <div>
                  <p className="text-xs text-zinc-600 uppercase tracking-wider mb-1">Results</p>
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap bg-zinc-800/50 rounded-lg p-3">{batch.labResults}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={labTested}
                    onChange={(e) => setLabTested(e.target.checked)}
                    className="sr-only peer"
                  />
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
                    {labNames.length === 0 ? (
                      <p className="text-sm text-zinc-500">No labs added yet. <a href="/admin/lab-names" className="text-teal-400 hover:underline">Add one →</a></p>
                    ) : (
                      <Select value={labNameId} onValueChange={setLabNameId}>
                        <SelectTrigger><SelectValue placeholder="Select lab" /></SelectTrigger>
                        <SelectContent>
                          {labNames.map((l) => <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Test Results</Label>
                    <Textarea
                      value={labResults}
                      onChange={(e) => setLabResults(e.target.value)}
                      placeholder="Paste or type lab test results…"
                      rows={5}
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                  <CircleCheck className="w-4 h-4 shrink-0" />
                  Saved! Returning to dashboard…
                </div>
              )}

              <Button onClick={handleSave} disabled={saving} className="w-full h-10">
                {saving ? "Saving…" : "Save Lab Results & Complete Batch"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Read-only lab section for non-editors */}
      {!canEdit && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Lab Results</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-zinc-600 uppercase tracking-wider mb-1">3rd Party Tested</p>
              <p className="text-sm text-zinc-300">{batch.labTested ? "Yes" : "No"}</p>
            </div>
            {batch.labTested && batch.labName && <div><p className="text-xs text-zinc-600 uppercase tracking-wider mb-1">Lab</p><p className="text-sm text-zinc-300">{batch.labName.name}</p></div>}
            {batch.labResults && <div><p className="text-xs text-zinc-600 uppercase tracking-wider mb-1">Results</p><p className="text-sm text-zinc-300 whitespace-pre-wrap bg-zinc-800/50 rounded-lg p-3">{batch.labResults}</p></div>}
          </div>
        </div>
      )}
    </div>
  );
}
