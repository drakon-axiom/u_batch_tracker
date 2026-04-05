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
import { ArrowLeft, CheckCircle, FlaskConical } from "lucide-react";

type LabName = { id: number; name: string };

type Batch = {
  id: number;
  lotNumber: string;
  productionDate: string;
  stage: number;
  labTested: boolean;
  labResults: string | null;
  customer: { name: string };
  product: { name: string; familyCode: { code: string; name: string } };
  createdBy: { username: string };
  labName: LabName | null;
};

export default function BatchDetail({
  batch,
  canEdit,
  isAdmin,
}: {
  batch: Batch;
  canEdit: boolean;
  isAdmin: boolean;
}) {
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
    fetch("/api/lab-names")
      .then((r) => r.json())
      .then((d) => setLabNames(d.data ?? []));
  }, []);

  async function handleSaveLabResults() {
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
          stage: 2,
          labTested,
          labNameId: labTested ? Number(labNameId) : null,
          labResults: labTested ? labResults || null : null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/user/dashboard");
          router.refresh();
        }, 1000);
      } else {
        setError(data.error?.message ?? "Failed to save");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const prodDate = new Date(batch.productionDate);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/user/dashboard">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <Badge variant={batch.stage === 2 ? "success" : "secondary"}>Stage {batch.stage}</Badge>
      </div>

      {/* Lot number hero */}
      <div className="bg-slate-900 text-white rounded-xl p-6">
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Lot Number</p>
        <p className="font-mono text-4xl font-bold tracking-wide">{batch.lotNumber}</p>
      </div>

      {/* Batch details */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Batch Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Customer</p>
            <p className="text-sm font-medium text-slate-900">{batch.customer.name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Product</p>
            <p className="text-sm font-medium text-slate-900">{batch.product.name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Family Code</p>
            <p className="text-sm font-medium text-slate-900">
              {batch.product.familyCode.code} — {batch.product.familyCode.name}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Production Date</p>
            <p className="text-sm font-medium text-slate-900">
              {prodDate.toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Created By</p>
            <p className="text-sm font-medium text-slate-900">{batch.createdBy.username}</p>
          </div>
        </div>
      </div>

      {/* Lab results section */}
      {canEdit && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FlaskConical className="w-4 h-4 text-slate-600" />
            <h2 className="font-semibold text-slate-900">Lab Results</h2>
            {batch.stage === 2 && !isAdmin && (
              <Badge variant="success" className="ml-auto">
                Completed
              </Badge>
            )}
          </div>

          {stage1Locked ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">3rd Party Lab Tested</p>
                <p className="text-sm font-medium">{batch.labTested ? "Yes" : "No"}</p>
              </div>
              {batch.labTested && batch.labName && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Lab Name</p>
                  <p className="text-sm font-medium">{batch.labName.name}</p>
                </div>
              )}
              {batch.labResults && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Results</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{batch.labResults}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="lab-tested"
                  checked={labTested}
                  onChange={(e) => setLabTested(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <Label htmlFor="lab-tested" className="cursor-pointer">
                  3rd party lab tested
                </Label>
              </div>

              {labTested && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="lab-name">Lab Name</Label>
                    {labNames.length === 0 ? (
                      <p className="text-sm text-slate-400">
                        No lab names yet.{" "}
                        <a href="/admin/lab-names" className="underline">
                          Add one in admin
                        </a>
                        .
                      </p>
                    ) : (
                      <Select value={labNameId} onValueChange={setLabNameId}>
                        <SelectTrigger id="lab-name">
                          <SelectValue placeholder="Select a lab" />
                        </SelectTrigger>
                        <SelectContent>
                          {labNames.map((l) => (
                            <SelectItem key={l.id} value={String(l.id)}>
                              {l.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="lab-results">Test Results</Label>
                    <Textarea
                      id="lab-results"
                      value={labResults}
                      onChange={(e) => setLabResults(e.target.value)}
                      placeholder="Paste or type lab test results here…"
                      rows={5}
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">
                  <CheckCircle className="w-4 h-4" />
                  Saved successfully! Returning to dashboard…
                </div>
              )}

              <Button onClick={handleSaveLabResults} disabled={saving} className="w-full">
                {saving ? "Saving…" : "Save Lab Results & Complete Batch"}
              </Button>
            </div>
          )}
        </div>
      )}

      {!canEdit && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Lab Results</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">3rd Party Lab Tested</p>
              <p className="text-sm font-medium">{batch.labTested ? "Yes" : "No"}</p>
            </div>
            {batch.labTested && batch.labName && (
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Lab</p>
                <p className="text-sm font-medium">{batch.labName.name}</p>
              </div>
            )}
            {batch.labResults && (
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Results</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{batch.labResults}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
