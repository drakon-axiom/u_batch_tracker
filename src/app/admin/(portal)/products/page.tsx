"use client";
import { useEffect, useState } from "react";
import LookupManager from "@/components/admin/LookupManager";

type FamilyCode = { id: number; code: string; name: string };
type Row = Record<string, unknown> & { id: number };

export default function ProductsPage() {
  const [familyCodes, setFamilyCodes] = useState<FamilyCode[]>([]);

  useEffect(() => {
    fetch("/api/family-codes")
      .then((r) => r.json())
      .then((d) => setFamilyCodes(d.data ?? []));
  }, []);

  const familyCodeOptions = familyCodes.map((fc) => ({
    value: String(fc.id),
    label: `${fc.code} — ${fc.name}`,
  }));

  return (
    <LookupManager
      title="Products"
      description="Manage products and their associated family codes (used to generate lot numbers)"
      apiPath="/api/products"
      columns={[
        { key: "name", label: "Product Name" },
        {
          key: "familyCode",
          label: "Family Code",
          render: (row) => {
            const fc = row.familyCode as { code: string; name: string } | undefined;
            return fc ? `${fc.code} — ${fc.name}` : "—";
          },
        },
        {
          key: "createdAt",
          label: "Added",
          render: (row: Row) => new Date(row.createdAt as string).toLocaleDateString(),
        },
      ]}
      fields={[
        { key: "name", label: "Product Name", placeholder: "e.g. Bacteriostatic Water", maxLength: 255 },
        {
          key: "familyCodeId",
          label: "Family Code",
          type: "select",
          options: familyCodeOptions,
        },
      ]}
    />
  );
}
