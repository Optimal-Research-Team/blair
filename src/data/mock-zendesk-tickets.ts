import { ZendeskTicket, ZendeskAutoCreateSettings } from "@/types/integration-feeds";

export const mockZendeskTickets: ZendeskTicket[] = [
  // URGENT - Urgent fax
  {
    id: "zd-1",
    ticketNumber: "ZD-4521",
    subject: "Urgent fax requires immediate attention",
    description: "An urgent priority fax has been received from Dr. Sarah Patel for patient John Smith. This requires immediate triage and processing.",
    priority: "urgent",
    status: "open",
    source: "auto-created",
    autoCreateRule: "urgent-fax",
    linkedEntityType: "referral",
    linkedEntityId: "ref-1",
    linkedEntityLabel: "Referral for John Smith",
    autoCloseCondition: "Fax processed",
    firstResponseNeeded: true,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    zendeskUrl: "https://heartland-cardiology.zendesk.com/agent/tickets/4521",
  },
  {
    id: "zd-2",
    ticketNumber: "ZD-4522",
    subject: "Urgent fax: Cardiac consult needed",
    description: "Urgent priority referral from City Hospital Emergency Department for patient with acute chest pain.",
    priority: "urgent",
    status: "open",
    source: "auto-created",
    autoCreateRule: "urgent-fax",
    linkedEntityType: "fax",
    linkedEntityId: "fax-15",
    linkedEntityLabel: "Urgent Fax from City Hospital ED",
    autoCloseCondition: "Fax processed",
    firstResponseNeeded: true,
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // 12 min ago
    updatedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    zendeskUrl: "https://heartland-cardiology.zendesk.com/agent/tickets/4522",
  },

  // HIGH - SLA overdue
  {
    id: "zd-3",
    ticketNumber: "ZD-4520",
    subject: "SLA overdue: Referral pending >4 hours",
    description: "Referral for Jane Doe has exceeded SLA deadline. Original deadline was 2 hours ago. Requires immediate attention.",
    priority: "high",
    status: "open",
    source: "auto-created",
    autoCreateRule: "sla-overdue",
    linkedEntityType: "referral",
    linkedEntityId: "ref-3",
    linkedEntityLabel: "Referral for Jane Doe",
    autoCloseCondition: "Referral completed",
    firstResponseNeeded: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    zendeskUrl: "https://heartland-cardiology.zendesk.com/agent/tickets/4520",
  },
  {
    id: "zd-4",
    ticketNumber: "ZD-4518",
    subject: "SLA warning: Approaching deadline",
    description: "Urgent fax from Family Health Centre approaching SLA deadline in 15 minutes.",
    priority: "high",
    status: "open",
    source: "auto-created",
    autoCreateRule: "sla-overdue",
    linkedEntityType: "fax",
    linkedEntityId: "fax-8",
    linkedEntityLabel: "Urgent Fax - Family Health Centre",
    autoCloseCondition: "Fax processed",
    firstResponseNeeded: false,
    firstRespondedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // Responded 20 min ago
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 min ago
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    zendeskUrl: "https://heartland-cardiology.zendesk.com/agent/tickets/4518",
  },

  // NORMAL - Incomplete referrals
  {
    id: "zd-5",
    ticketNumber: "ZD-4519",
    subject: "Incomplete referral: Missing ECG, BNP Labs",
    description: "Referral for Bob Wilson is missing required documents: ECG and BNP Labs. Request has been sent to referring physician.",
    priority: "normal",
    status: "pending",
    source: "auto-created",
    autoCreateRule: "incomplete-referral",
    linkedEntityType: "referral",
    linkedEntityId: "ref-2",
    linkedEntityLabel: "Referral for Bob Wilson",
    autoCloseCondition: "Completeness = 100%",
    firstResponseNeeded: false,
    firstRespondedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Responded 2 hours ago
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    zendeskUrl: "https://heartland-cardiology.zendesk.com/agent/tickets/4519",
  },
  {
    id: "zd-6",
    ticketNumber: "ZD-4515",
    subject: "Incomplete referral: Missing Echo report",
    description: "Referral for Margaret Thompson missing required Echo report. Follow-up request pending.",
    priority: "normal",
    status: "pending",
    source: "auto-created",
    autoCreateRule: "incomplete-referral",
    linkedEntityType: "referral",
    linkedEntityId: "ref-5",
    linkedEntityLabel: "Referral for Margaret Thompson",
    autoCloseCondition: "Completeness = 100%",
    firstResponseNeeded: false,
    firstRespondedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    zendeskUrl: "https://heartland-cardiology.zendesk.com/agent/tickets/4515",
  },

  // NORMAL - Referral pending review
  {
    id: "zd-7",
    ticketNumber: "ZD-4517",
    subject: "Referral pending review: Maria Garcia",
    description: "New referral from North York Clinic for Maria Garcia requires clinical review.",
    priority: "normal",
    status: "open",
    source: "auto-created",
    autoCreateRule: "referral-pending",
    linkedEntityType: "referral",
    linkedEntityId: "ref-4",
    linkedEntityLabel: "Referral for Maria Garcia",
    autoCloseCondition: "Referral reviewed",
    firstResponseNeeded: true,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    zendeskUrl: "https://heartland-cardiology.zendesk.com/agent/tickets/4517",
  },

  // MANUAL - External ticket
  {
    id: "zd-8",
    ticketNumber: "ZD-4510",
    subject: "Patient inquiry: Appointment rescheduling",
    description: "Patient called requesting to reschedule their upcoming cardiology appointment due to work conflict.",
    priority: "normal",
    status: "open",
    source: "manual",
    firstResponseNeeded: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    zendeskUrl: "https://heartland-cardiology.zendesk.com/agent/tickets/4510",
  },

  // RESOLVED
  {
    id: "zd-9",
    ticketNumber: "ZD-4512",
    subject: "Incomplete referral: Missing medication list",
    description: "Referral for David Chen was missing medication list. Document received and referral is now complete.",
    priority: "normal",
    status: "resolved",
    source: "auto-created",
    autoCreateRule: "incomplete-referral",
    linkedEntityType: "referral",
    linkedEntityId: "ref-6",
    linkedEntityLabel: "Referral for David Chen",
    autoCloseCondition: "Completeness = 100%",
    firstResponseNeeded: false,
    firstRespondedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    autoClosedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    zendeskUrl: "https://heartland-cardiology.zendesk.com/agent/tickets/4512",
  },
  {
    id: "zd-10",
    ticketNumber: "ZD-4508",
    subject: "Urgent fax processed: Emergency cardiac referral",
    description: "Urgent fax from St. Michael's Hospital has been processed and routed to Dr. Williams.",
    priority: "urgent",
    status: "resolved",
    source: "auto-created",
    autoCreateRule: "urgent-fax",
    linkedEntityType: "referral",
    linkedEntityId: "ref-7",
    linkedEntityLabel: "Referral for Anya Kowalski",
    autoCloseCondition: "Fax processed",
    firstResponseNeeded: false,
    firstRespondedAt: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString(),
    autoClosedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    zendeskUrl: "https://heartland-cardiology.zendesk.com/agent/tickets/4508",
  },
];

export const mockZendeskSettings: ZendeskAutoCreateSettings = {
  enabled: true,
  rules: [
    { rule: "urgent-fax", enabled: true, priority: "urgent", label: "Urgent fax received" },
    { rule: "sla-overdue", enabled: true, priority: "high", label: "SLA overdue" },
    { rule: "referral-pending", enabled: true, priority: "normal", label: "Referral pending review" },
    { rule: "incomplete-referral", enabled: true, priority: "normal", label: "Incomplete referral" },
    { rule: "unclassified-fax", enabled: false, priority: "low", label: "Unclassified fax" },
  ],
  autoCloseOnResolve: true,
};

// Helper to get counts by status
export function getZendeskStats() {
  const tickets = mockZendeskTickets;
  const activeTickets = tickets.filter((t) => t.status !== "resolved" && t.status !== "closed");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate avg response time for responded tickets (in minutes)
  const respondedTickets = tickets.filter((t) => t.firstRespondedAt);
  const avgResponseTimeMinutes = respondedTickets.length > 0
    ? Math.round(
        respondedTickets.reduce((sum, t) => {
          const created = new Date(t.createdAt).getTime();
          const responded = new Date(t.firstRespondedAt!).getTime();
          return sum + (responded - created) / (1000 * 60);
        }, 0) / respondedTickets.length
      )
    : 0;

  return {
    urgent: tickets.filter((t) => t.priority === "urgent" && t.status !== "resolved" && t.status !== "closed").length,
    high: tickets.filter((t) => t.priority === "high" && t.status !== "resolved" && t.status !== "closed").length,
    open: tickets.filter((t) => t.status === "open").length,
    pending: tickets.filter((t) => t.status === "pending").length,
    resolved: tickets.filter((t) => t.status === "resolved" || t.status === "closed").length,
    autoCreated: tickets.filter((t) => t.source === "auto-created").length,
    manual: tickets.filter((t) => t.source === "manual").length,
    total: tickets.length,
    // New stats for cards
    needsFirstResponse: activeTickets.filter((t) => t.firstResponseNeeded).length,
    autoClosedToday: tickets.filter((t) => t.autoClosedAt && new Date(t.autoClosedAt) >= today).length,
    avgResponseTimeMinutes,
  };
}
