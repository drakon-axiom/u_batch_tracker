import LookupManager from "@/components/admin/LookupManager";

export default function FamilyCodesPage() {
  return (
    <LookupManager
      title="Family Codes"
      description="2-letter codes that prefix lot numbers (e.g. XX = Misc/Private Label)"
      apiPath="/api/family-codes"
      columns={[
        { key: "code", label: "Code" },
        { key: "name", label: "Product Family Name" },
        { key: "createdAt", label: "Added", render: (row) => new Date(row.createdAt as string).toLocaleDateString() },
      ]}
      fields={[
        {
          key: "code",
          label: "2-Letter Code",
          placeholder: "e.g. AB",
          maxLength: 2,
        },
        {
          key: "name",
          label: "Family Name",
          placeholder: "e.g. Bac Water",
          maxLength: 128,
        },
      ]}
    />
  );
}
