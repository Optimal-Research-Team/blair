export type FaxStatus = "auto-filed" | "pending-review" | "in-progress" | "flagged" | "completed";
export type Priority = "stat" | "urgent" | "routine";
export type PatientMatchStatus = "matched" | "not-found" | "multiple-matches" | "pending";

export interface FaxPage {
  id: string;
  pageNumber: number;
  detectedDocType?: string;
  detectedPatient?: string;
  contentDescription?: string;
}

export interface Fax {
  id: string;
  receivedAt: string;
  pageCount: number;
  pages: FaxPage[];
  priority: Priority;
  senderName: string;
  senderFaxNumber: string;
  faxLineId: string;
  documentType: string;
  documentTypeConfidence: number;
  patientId?: string;
  patientName?: string;
  patientMatchStatus: PatientMatchStatus;
  patientMatchConfidence?: number;
  status: FaxStatus;
  slaDeadline: string;
  assignedTo?: string;
  lockedBy?: string;
  lockedAt?: string;
  description?: string;
  notes?: string;
  completedAt?: string;
  isReferral?: boolean;
  referralId?: string;
}
