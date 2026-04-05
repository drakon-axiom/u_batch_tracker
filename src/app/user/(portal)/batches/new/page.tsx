import BatchForm from "@/components/user/BatchForm";

export default function NewBatchPage() {
  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">New Batch</h1>
        <p className="text-sm text-slate-500 mt-1">Log a new production batch</p>
      </div>
      <BatchForm />
    </div>
  );
}
