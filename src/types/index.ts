export type UserRole = "user" | "admin";

export type BatchWithRelations = {
  id: number;
  lotNumber: string;
  productionDate: Date;
  stage: number;
  labTested: boolean;
  labResults: string | null;
  createdAt: Date;
  updatedAt: Date;
  customer: { id: number; name: string };
  product: { id: number; name: string; familyCode: { code: string; name: string } };
  createdBy: { id: number; username: string };
  labName: { id: number; name: string } | null;
};

export type ApiError = {
  error: { code: string; message: string };
};
