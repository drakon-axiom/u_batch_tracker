import AdminBatchTable from "@/components/admin/AdminBatchTable";

export default function AdminDashboard() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">All Batches</h1>
          <p className="text-sm text-zinc-500 mt-0.5">View, edit, and manage all production batches</p>
        </div>
        <a
          href="/admin/batches/new"
          className="inline-flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          + New Batch
        </a>
      </div>
      <AdminBatchTable />
    </div>
  );
}
