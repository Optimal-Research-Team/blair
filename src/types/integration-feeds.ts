// ============================================================
// ZENDESK TYPES
// ============================================================

export type ZendeskTicketPriority = "urgent" | "high" | "normal" | "low";
export type ZendeskTicketStatus = "open" | "pending" | "resolved" | "closed";
export type ZendeskTicketSource = "auto-created" | "manual";

export type ZendeskAutoCreateRule =
  | "urgent-fax"
  | "sla-overdue"
  | "referral-pending"
  | "incomplete-referral"
  | "unclassified-fax";

export interface ZendeskTicket {
  id: string;
  ticketNumber: string; // e.g., "ZD-4521"
  subject: string;
  description: string;
  priority: ZendeskTicketPriority;
  status: ZendeskTicketStatus;
  source: ZendeskTicketSource;
  autoCreateRule?: ZendeskAutoCreateRule;

  // Linked Blair entity
  linkedEntityType?: "referral" | "fax";
  linkedEntityId?: string;
  linkedEntityLabel?: string; // e.g., "Referral for John Smith"

  // Auto-close tracking
  autoCloseCondition?: string;
  autoClosedAt?: string;

  // Response tracking
  firstResponseNeeded?: boolean; // True if ticket has no responses yet
  firstRespondedAt?: string; // When first response was sent

  // Timestamps
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;

  // External
  zendeskUrl: string;
}

export interface ZendeskAutoCreateSettings {
  enabled: boolean;
  rules: {
    rule: ZendeskAutoCreateRule;
    enabled: boolean;
    priority: ZendeskTicketPriority;
    label: string;
  }[];
  autoCloseOnResolve: boolean;
}

// ============================================================
// SLACK TYPES
// ============================================================

export type SlackActivityType =
  | "urgent-alert"
  | "sla-warning"
  | "sla-breach"
  | "daily-digest"
  | "weekly-report"
  | "ticket-posted";

export type SlackPostStatus = "sent" | "failed" | "pending";

export interface SlackLinkedItem {
  type: "referral" | "fax";
  id: string;
  label: string;
  timeRemaining?: string; // For SLA warnings
}

export interface SlackActivity {
  id: string;
  type: SlackActivityType;
  channel: string; // e.g., "#clinical-ops", "#urgent-faxes"
  message: string;
  status: SlackPostStatus;

  // Linked items (for SLA alerts that reference multiple items)
  linkedItems?: SlackLinkedItem[];

  // Quick actions
  hasQuickActions?: boolean;
  handled?: boolean;
  handledBy?: string;
  handledAt?: string;

  // Timestamps
  postedAt: string;

  // External
  slackUrl?: string;
}

export interface SlackChannelConfig {
  channel: string;
  events: SlackActivityType[];
  enabled: boolean;
}

// ============================================================
// SALESFORCE TYPES
// ============================================================

export type ProviderQualityTier = "excellent" | "good" | "needs-improvement" | "poor";

export interface ProviderReferralHistoryItem {
  id: string;
  referralId: string;
  patientName: string;
  status: "triage" | "incomplete" | "pending-response" | "complete" | "routed" | "accepted" | "declined" | "booked";
  completenessScore: number;
  daysToComplete?: number;
  date: string;
}

export interface ProviderMissingItemStats {
  item: string;
  percentage: number; // e.g., 40 means 40% of referrals missing this
}

export interface ProviderCommunicationStats {
  totalRequestsSent: number;
  avgResponseTimeDays: number;
  responseRate: number; // 0-100
}

export interface SalesforceProvider {
  id: string;
  salesforceId: string;

  // Provider info
  name: string;
  clinicName: string;
  phone?: string;
  fax?: string;
  email?: string;

  // Referral stats
  totalReferrals: number;
  referralsThisMonth: number;
  referralsLastMonth: number;
  referralTrend: number; // percentage change

  // Quality metrics
  qualityScore: number; // 0-100
  qualityTier: ProviderQualityTier;
  missingInfoRate: number; // percentage of referrals with missing info
  missingInfoRateTrend: number; // percentage change
  avgCompletionDays: number;
  avgCompletionDaysTrend: number;

  // Breakdown
  commonMissingItems: ProviderMissingItemStats[];
  communicationStats: ProviderCommunicationStats;
  referralHistory: ProviderReferralHistoryItem[];

  // Flag for attention
  needsOutreach: boolean;

  // External
  salesforceUrl: string;

  // Timestamps
  lastSyncedAt: string;
}

export interface SalesforceOverviewStats {
  totalReferrals: number;
  totalReferralsTrend: number;
  missingInfoRate: number;
  missingInfoRateTrend: number;
  avgCompletionDays: number;
  avgCompletionDaysTrend: number;
  topReferrer: {
    name: string;
    count: number;
  };
  totalProviders: number;
  providersNeedingOutreach: number;
}

// ============================================================
// UNIFIED FEED TYPES (for combined views if needed)
// ============================================================

export type IntegrationSource = "zendesk" | "slack" | "salesforce";

export interface IntegrationFeedEvent {
  id: string;
  source: IntegrationSource;
  title: string;
  description?: string;
  timestamp: string;
  priority?: "high" | "medium" | "low";
  actionUrl?: string;
  linkedEntityType?: "referral" | "fax" | "provider";
  linkedEntityId?: string;
}
