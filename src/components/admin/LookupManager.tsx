"use client";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "select";
  options?: { value: string; label: string }[];
  maxLength?: number;
  placeholder?: string;
};

type Row = Record<string, unknown> & { id: number };

export default function LookupManager({
  title,
  description,
  apiPath,
  columns,
  fields,
}: {
  title: string;
  description?: string;
  apiPath: string;
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
      if (res.ok) {
        const json = await res.json();
        setRows(json.data);
      }
    } finally {
      setLoading(false);
    }
  }, [apiPath]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  function openAdd() {
    setEditRow(null);
    const initial: Record<string, string> = {};
    fields.forEach((f) => (initial[f.key] = ""));
    setFormValues(initial);
    setError("");
    setDialogOpen(true);
  }

  function openEdit(row: Row) {
    setEditRow(row);
    const initial: Record<string, string> = {};
    fields.forEach((f) => (initial[f.key] = String(row[f.key] ?? "")));
    setFormValues(initial);
    setError("");
    setDialogOpen(true);
  }

  async function handleSave() {
    setError("");
    setSaving(true);
    try {
      const body: Record<string, string | number> = {};
      fields.forEach((f) => {
        const val = formValues[f.key];
        // Convert numeric IDs
        if (f.type === "select" && val) {
          body[f.key] = Number(val);
        } else {
          body[f.key] = val;
        }
      });

      const res = editRow
        ? await fetch(`${apiPath}/${editRow.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch(apiPath, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

      const data = await res.json();
      if (res.ok) {
        setDialogOpen(false);
        fetchRows();
      } else {
        setError(data.error?.message ?? "Save failed");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number, label: string) {
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${apiPath}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setRows((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert(data.error?.message ?? "Delete failed");
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
        </div>
        <Button onClick={openAdd} className="gap-1.5">
          <Plus className="w-4 h-4" />
          Add {title.replace(/s$/, "")}
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {columns.map((col) => (
                <th key={col.key} className="text-left px-4 py-3 font-medium text-slate-500">
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-12 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-12 text-center text-slate-400">
                  No {title.toLowerCase()} yet. Add the first one!
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-slate-700">
                      {col.render ? col.render(row) : String(row[col.key] ?? "")}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => openEdit(row)} className="gap-1">
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(row.id, String(row[columns[0].key] ?? row.id))}
                        disabled={deletingId === row.id}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editRow ? `Edit ${title.replace(/s$/, "")}` : `Add ${title.replace(/s$/, "")}`}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={`field-${field.key}`}>{field.label}</Label>
                {field.type === "select" ? (
                  <Select
                    value={formValues[field.key]}
                    onValueChange={(v) =>
                      setFormValues((prev) => ({ ...prev, [field.key]: v }))
                    }
                  >
                    <SelectTrigger id={`field-${field.key}`}>
                      <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={`field-${field.key}`}
                    value={formValues[field.key] ?? ""}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}`}
                    maxLength={field.maxLength}
                  />
                )}
              </div>
            ))}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : editRow ? "Save Changes" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
