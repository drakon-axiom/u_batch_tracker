import AdminBatchTable from "@/components/admin/AdminBatchTable";

export default function AdminDashboard() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">All Batches</h1>
          <p className="text-sm text-slate-500 mt-1">View, edit, and manage all production batches</p>
        </div>
        <a
          href="/admin/batches/new"
          className="inline-flex items-center gap-2 h-9 px-4 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
        >
          + New Batch
        </a>
      </div>
      <AdminBatchTable />
    </div>
  );
}
