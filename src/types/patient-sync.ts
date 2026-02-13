// ============================================================
// CEREBRUM PATIENT SYNC TYPES
// ============================================================

export type PatientSyncStatus = "synced" | "new" | "not-in-cerebrum" | "info-update";

export interface CerebrumPatient {
  id: string;
  cerebrumId: string; // External ID in Cerebrum EMR

  // Demographics
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";

  // Contact
  phone?: string;
  email?: string;
  address?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };

  // Health Card
  healthCardNumber?: string; // OHIP in Ontario
  healthCardVersion?: string;
  healthCardExpiry?: string;

  // Sync metadata
  syncStatus: PatientSyncStatus;
  lastSyncedAt: string;
  createdInBlairAt?: string;

  // Stats
  totalFaxes: number;
  totalReferrals: number;
  lastFaxDate?: string;
  lastReferralDate?: string;
}

export interface PatientInfoUpdate {
  field: "phone" | "email" | "address" | "healthCard";
  oldValue: string;
  newValue: string;
  sourceDocumentId: string;
  sourceDocumentType: string;
  detectedAt: string;
  applied: boolean;
}

export interface PatientWithUpdates extends CerebrumPatient {
  pendingUpdates?: PatientInfoUpdate[];
}

export interface PatientFeedStats {
  totalPatients: number;
  syncedPatients: number;
  newPatientsToday: number;
  patientsWithUpdates: number;
  lastSyncTime: string;
}
