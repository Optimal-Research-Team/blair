import { Priority } from "./fax";

export type SlaStatus = "green" | "yellow" | "red" | "breached";

// Item categories (what the item actually is)
export type WorklistItemCategory = "unclassified" | "referral";

// View filters (includes "all" for unified view)
export type WorklistView = "all" | "unclassified" | "referral";

export interface WorklistItem {
  id: string;
  faxId: string;
  category: WorklistItemCategory;
  isUrgent: boolean; // Urgency is now a flag, not a category
  queuePosition: number;
  priorityScore: number;
  priority: Priority;
  slaDeadline: string;
  slaStatus: SlaStatus;
  assignedTo?: string;
  lockedBy?: string;
  lockedAt?: string;
  claimable: boolean;
  // For triage items
  suggestedDocType?: string;
  suggestedDocTypeConfidence?: number;
  // For referral items
  referralId?: string;
  completenessScore?: number;
  pendingCommunications?: number;
  // Claimed/assigned
  claimedBy?: string;
  // Display info
  patientName?: string;
  referringPhysician?: string;
  clinicName?: string;
  documentType?: string;
  pageCount: number;
  receivedAt: string;
  description: string;
}

export interface QueueStats {
  totalItems: number;
  unclassifiedCount: number;
  referralCount: number;
  urgentCount: number; // Count of items with isUrgent=true
  averageWaitMinutes: number;
  slaBreachCount: number;
  itemsProcessedToday: number;
  itemsProcessedThisHour: number;
}
