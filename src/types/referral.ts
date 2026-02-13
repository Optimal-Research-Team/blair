import { Priority } from "./fax";
import { CompletenessItemStatus, Communication } from "./communication";
import { BoundingBox, ExtractedField } from "./highlight";

export type ReferralStatus =
  | "triage"           // Needs urgency triage (urgency unknown or unconfirmed)
  | "incomplete"       // Missing required items
  | "pending-review"   // Awaiting human review
  | "routed"           // Routed to MD waitlist
  | "declined";        // Declined

// Urgency rating for referrals
export type UrgencyRating = "unknown" | "urgent" | "not-urgent";

// Timeline event for tracking all activity on a referral
export type TimelineEventType =
  | "referral-received"
  | "ai-classified"
  | "status-changed"
  | "communication-sent"
  | "communication-received"
  | "document-added"
  | "item-marked-found"
  | "item-marked-missing"
  | "assigned"
  | "note-added";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: string;
  title: string;
  description?: string;
  actor: "ai" | "human";
  actorName?: string;
  metadata?: Record<string, string | number | boolean>;
}

// Grouped fax document attached to a referral
export interface ReferralDocument {
  id: string;
  faxId: string;
  type: "original-referral" | "response" | "additional";
  label: string;           // e.g., "Original Referral", "ECG from Dr. Wong"
  receivedAt: string;
  pageCount: number;
  pages: ReferralDocumentPage[];
  communicationId?: string; // Link to the communication that requested this
}

export interface ReferralDocumentPage {
  id: string;
  pageNumber: number;
  thumbnailUrl?: string;   // Mock placeholder
  detectedContent?: string; // AI description of what's on the page
  /** Extracted fields with bounding box coordinates for source highlighting */
  extractedFields?: ExtractedField[];
}

export interface CompletenessItem {
  id: string;
  label: string;
  required: boolean;
  status: CompletenessItemStatus;
  confidence: number;        // AI confidence (0-100)
  pageNumber?: number;       // Where it was found (within the document)
  documentId?: string;       // Which document contains it
  requestedAt?: string;      // When we requested it
  receivedAt?: string;       // When we got it
  /** Bounding box for the source region on the document */
  sourceRegion?: BoundingBox;
}

export interface Referral {
  id: string;
  faxId: string;
  patientId: string;
  patientName: string;
  patientDob?: string;
  patientPhone?: string;
  patientOhip?: string;
  referringPhysicianId: string;
  referringPhysicianName: string;
  referringPhysicianPhone?: string;
  referringPhysicianFax?: string;
  referringPhysicianEmail?: string;
  // Clinic info (for grouping communications)
  clinicName?: string;
  clinicCity?: string;
  receivedDate: string;
  status: ReferralStatus;
  priority: Priority;
  isUrgent: boolean;
  urgencyRating: UrgencyRating;
  urgencyConfirmedBy?: "ai" | "human";
  urgencyConfidence?: number; // AI confidence in urgency rating (0-100)
  reasonForReferral: string;
  clinicalHistory: string;
  conditions: string[];
  medications: string[];

  // Completeness
  completenessItems: CompletenessItem[];
  completenessScore: number;
  aiConfidence: number;          // Overall AI confidence in assessment

  // Grouped Documents (all faxes related to this referral)
  documents: ReferralDocument[];

  // Routing
  assignedCardiologist?: string;
  assignedCardiologistName?: string;
  routedAt?: string;

  // Outcome
  appointmentDate?: string;
  declineReason?: string;

  // Communications
  communications: Communication[];
  pendingCommunicationsCount: number;

  // Timeline (all events)
  timeline: TimelineEvent[];

  // Tracking
  notes: string[];
  waitListType?: string;
  waitListPosition?: number;
  locationId?: string;
  createdAt: string;
  updatedAt: string;
}
