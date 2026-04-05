"use client";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Pencil, Trash2, ShieldCheck, User } from "lucide-react";

type UserRow = {
  id: number;
  username: string;
  role: "user" | "admin";
  createdAt: string;
};

type DialogMode = "add" | "edit" | null;

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [editTarget, setEditTarget] = useState<UserRow | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function openAdd() {
    setEditTarget(null);
    setUsername("");
    setPassword("");
    setRole("user");
    setError("");
    setDialogMode("add");
  }

  function openEdit(user: UserRow) {
    setEditTarget(user);
    setUsername(user.username);
    setPassword("");
    setRole(user.role);
    setError("");
    setDialogMode("edit");
  }

  async function handleSave() {
    setError("");
    setSaving(true);
    try {
      const isEdit = dialogMode === "edit" && editTarget;
      const body: Record<string, string> = { role };
      if (username) body.username = username;
      if (password) body.password = password;
      if (!isEdit) {
        // password required for new users
        if (!password) { setError("Password is required for new users."); setSaving(false); return; }
        if (!username) { setError("Username is required."); setSaving(false); return; }
      }

      const res = isEdit
        ? await fetch(`/api/users/${editTarget.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

      const data = await res.json();
      if (res.ok) {
        setDialogMode(null);
        fetchUsers();
      } else {
        setError(data.error?.message ?? "Save failed");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user: UserRow) {
    if (!confirm(`Delete user "${user.username}"? This cannot be undone.`)) return;
    setDeletingId(user.id);
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
      } else {
        alert(data.error?.message ?? "Delete failed");
      }
    } finally {
      setDeletingId(null);
    }
  }

  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">Users</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage user accounts and permissions</p>
        </div>
        <Button onClick={openAdd} className="gap-1.5">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Username</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-16 text-center text-zinc-600">Loading…</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-16 text-center text-zinc-600">No users found.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-100 flex items-center gap-2">
                    {user.role === "admin"
                      ? <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                      : <User className="w-4 h-4 text-slate-400 shrink-0" />
                    }
                    {user.username}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === "admin" ? "indigo" : "secondary"}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => openEdit(user)} className="gap-1">
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(user)}
                        disabled={deletingId === user.id || (user.role === "admin" && adminCount <= 1)}
                        title={user.role === "admin" && adminCount <= 1 ? "Cannot delete the last admin" : ""}
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

      <p className="text-xs text-zinc-600 text-right">
        {users.length} user{users.length !== 1 ? "s" : ""} · {adminCount} admin{adminCount !== 1 ? "s" : ""}
      </p>

      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "edit" ? "Edit User" : "Add User"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="u-username">Username</Label>
              <Input
                id="u-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. jsmith"
                autoComplete="off"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="u-password">
                Password
                {dialogMode === "edit" && (
                  <span className="text-slate-400 font-normal ml-1">(leave blank to keep current)</span>
                )}
              </Label>
              <Input
                id="u-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={dialogMode === "edit" ? "New password (optional)" : "Min. 6 characters"}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="u-role">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "user" | "admin")}>
                <SelectTrigger id="u-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User — can create and edit own batches</SelectItem>
                  <SelectItem value="admin">Admin — full access + manage lookups</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
              {saving ? "Saving…" : dialogMode === "edit" ? "Save Changes" : "Add User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
