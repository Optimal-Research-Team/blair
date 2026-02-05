export type SlaStatus = "green" | "yellow" | "red" | "breached";

export interface WorklistItem {
  id: string;
  faxId: string;
  queuePosition: number;
  priorityScore: number;
  slaDeadline: string;
  slaStatus: SlaStatus;
  assignedTo?: string;
  lockedBy?: string;
  lockedAt?: string;
  claimable: boolean;
}

export interface QueueStats {
  totalItems: number;
  urgentCount: number;
  averageWaitMinutes: number;
  slaBreachCount: number;
  itemsProcessedToday: number;
  itemsProcessedThisHour: number;
}
