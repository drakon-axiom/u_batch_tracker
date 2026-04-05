"use client";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react";

export type FieldDef = {
  key: string; label: string; type?: "text" | "select";
  options?: { value: string; label: string }[];
  maxLength?: number; placeholder?: string;
};

type Row = Record<string, unknown> & { id: number };

export default function LookupManager({
  title, description, apiPath, columns, fields,
}: {
  title: string; description?: string; apiPath: string;
  columns: { key: string; label: string; render?: (row: Row) => React.ReactNode }[];
  fields: FieldDef[];
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState<Row | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiPath);
      if (res.ok) setRows((await res.json()).data);
    } finally { setLoading(false); }
  }, [apiPath]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  function openAdd() {
    setEditRow(null);
    const init: Record<string, string> = {};
    fields.forEach((f) => (init[f.key] = ""));
    setFormValues(init); setError(""); setDialogOpen(true);
  }

  function openEdit(row: Row) {
    setEditRow(row);
    const init: Record<string, string> = {};
    fields.forEach((f) => (init[f.key] = String(row[f.key] ?? "")));
    setFormValues(init); setError(""); setDialogOpen(true);
  }

  async function handleSave() {
    setError(""); setSaving(true);
    try {
      const body: Record<string, string | number> = {};
      fields.forEach((f) => {
        const val = formValues[f.key];
        body[f.key] = f.type === "select" && val ? Number(val) : val;
      });
      const res = editRow
        ? await fetch(`${apiPath}/${editRow.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch(apiPath, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok) { setDialogOpen(false); fetchRows(); }
      else setError(data.error?.message ?? "Save failed");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: number, label: string) {
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${apiPath}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) setRows((prev) => prev.filter((r) => r.id !== id));
      else alert(data.error?.message ?? "Delete failed");
    } finally { setDeletingId(null); }
  }

  const singular = title.replace(/s$/, "");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">{title}</h1>
          {description && <p className="text-sm text-zinc-500 mt-0.5">{description}</p>}
        </div>
        <Button onClick={openAdd} className="gap-1.5">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add {singular}</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {columns.map((col) => (
                <th key={col.key} className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">{col.label}</th>
              ))}
              <th className="px-4 py-3 w-28" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {loading ? (
              <tr><td colSpan={columns.length + 1} className="px-4 py-16 text-center text-zinc-600">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={columns.length + 1} className="px-4 py-16 text-center text-zinc-600">No {title.toLowerCase()} yet. Add the first one!</td></tr>
            ) : rows.map((row) => (
              <tr key={row.id} className="hover:bg-zinc-800/30 transition-colors group">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-zinc-300">
                    {col.render ? col.render(row) : String(row[col.key] ?? "")}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 justify-end">
                    <Button size="sm" variant="outline" onClick={() => openEdit(row)} className="h-7 px-2.5 text-xs gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Pencil className="w-3 h-3" />Edit
                    </Button>
                    <Button size="sm" variant="destructive" className="h-7 w-7 p-0"
                      onClick={() => handleDelete(row.id, String(row[columns[0].key] ?? row.id))}
                      disabled={deletingId === row.id}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editRow ? `Edit ${singular}` : `Add ${singular}`}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={`f-${field.key}`}>{field.label}</Label>
                {field.type === "select" ? (
                  <Select value={formValues[field.key]} onValueChange={(v) => setFormValues((p) => ({ ...p, [field.key]: v }))}>
                    <SelectTrigger id={`f-${field.key}`}><SelectValue placeholder={`Select ${field.label.toLowerCase()}`} /></SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={`f-${field.key}`}
                    value={formValues[field.key] ?? ""}
                    onChange={(e) => setFormValues((p) => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}`}
                    maxLength={field.maxLength}
                  />
                )}
              </div>
            ))}

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave} disabled={saving} variant="admin">
              {saving ? "Saving…" : editRow ? "Save Changes" : `Add ${singular}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
