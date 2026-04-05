import LookupManager from "@/components/admin/LookupManager";

export default function CustomersPage() {
  return (
    <LookupManager
      title="Customers"
      description="Manage the customer list available for batch creation"
      apiPath="/api/customers"
      columns={[
        { key: "name", label: "Name" },
        { key: "createdAt", label: "Added", render: (row) => new Date(row.createdAt as string).toLocaleDateString() },
      ]}
      fields={[
        { key: "name", label: "Customer Name", placeholder: "e.g. Acme Corp", maxLength: 255 },
      ]}
    />
  );
}
