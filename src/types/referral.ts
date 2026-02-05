import { Priority } from "./fax";

export type ReferralStatus = "received" | "incomplete" | "complete" | "accepted" | "declined" | "booked";

export interface CompletenessItem {
  id: string;
  label: string;
  required: boolean;
  present: boolean;
  documentId?: string;
}

export interface Referral {
  id: string;
  faxId: string;
  patientId: string;
  patientName: string;
  referringPhysicianId: string;
  referringPhysicianName: string;
  receivedDate: string;
  status: ReferralStatus;
  priority: Priority;
  reasonForReferral: string;
  clinicalHistory: string;
  conditions: string[];
  medications: string[];
  completenessItems: CompletenessItem[];
  completenessScore: number;
  assignedCardiologist?: string;
  assignedCardiologistName?: string;
  appointmentDate?: string;
  declineReason?: string;
  notes: string[];
  currentStep: number;
  waitListType?: string;
  waitListPosition?: number;
  locationId?: string;
}
