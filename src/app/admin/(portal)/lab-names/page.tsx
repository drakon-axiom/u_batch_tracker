"use client";
import LookupManager from "@/components/admin/LookupManager";

export default function LabNamesPage() {
  return (
    <LookupManager
      title="Lab Names"
      description="Manage the list of approved 3rd party testing laboratories"
      apiPath="/api/lab-names"
      columns={[
        { key: "name", label: "Lab Name" },
        { key: "createdAt", label: "Added", render: (row) => new Date(row.createdAt as string).toLocaleDateString() },
      ]}
      fields={[
        { key: "name", label: "Lab Name", placeholder: "e.g. Accugenix", maxLength: 255 },
      ]}
    />
  );
}
