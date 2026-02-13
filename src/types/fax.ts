import { ExtractedField } from "./highlight";
import { CerebrumDocumentCategory, FaxSegment } from "./cerebrum";

export type FaxStatus = "auto-filed" | "pending-review" | "in-progress" | "flagged" | "completed";
export type Priority = "urgent" | "routine";
export type PatientMatchStatus = "matched" | "not-found" | "multiple-matches" | "pending";

export interface FaxPage {
  id: string;
  pageNumber: number;
  detectedDocType?: string;
  detectedPatient?: string;
  contentDescription?: string;
  /** Extracted fields with bounding box coordinates for source highlighting */
  extractedFields?: ExtractedField[];
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

  /**
   * If this fax is linked to an existing referral (e.g., incoming lab result for a pending referral),
   * this contains the referral ID. Different from referralId which indicates this fax WAS the referral.
   */
  linkedReferralId?: string;
  /** Human-readable reason for the linkage (e.g., "Lab results for pending referral") */
  linkedReferralReason?: string;

  // ============================================================
  // CEREBRUM EMR INTEGRATION
  // ============================================================

  /** Cerebrum EMR folder category for this document */
  cerebrumCategory?: CerebrumDocumentCategory;

  /** Whether this fax has been exported to Cerebrum */
  cerebrumExported?: boolean;

  /** Timestamp when exported to Cerebrum */
  cerebrumExportedAt?: string;

  /**
   * Detected segments for multi-patient or multi-document faxes.
   * If present, indicates this fax contains multiple logical documents.
   */
  detectedSegments?: FaxSegment[];

  /** Whether this fax has been analyzed for splitting */
  splitAnalysisComplete?: boolean;

  /** Parent fax ID if this fax was created from splitting another fax */
  parentFaxId?: string;
}
