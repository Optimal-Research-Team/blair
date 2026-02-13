import { create } from "zustand";
import { ZendeskTicket } from "@/types/integration-feeds";
import { SlackActivity } from "@/types/integration-feeds";

interface IntegrationStore {
  // Dynamic tickets/activities added during session
  addedZendeskTickets: ZendeskTicket[];
  addedSlackActivities: SlackActivity[];

  // Actions
  addZendeskTicket: (ticket: ZendeskTicket) => void;
  addSlackActivity: (activity: SlackActivity) => void;

  // Get counts for sidebar badges
  getNewZendeskCount: () => number;
  getNewSlackCount: () => number;
}

export const useIntegrationStore = create<IntegrationStore>((set, get) => ({
  addedZendeskTickets: [],
  addedSlackActivities: [],

  addZendeskTicket: (ticket) => {
    set((state) => ({
      addedZendeskTickets: [ticket, ...state.addedZendeskTickets],
    }));
  },

  addSlackActivity: (activity) => {
    set((state) => ({
      addedSlackActivities: [activity, ...state.addedSlackActivities],
    }));
  },

  getNewZendeskCount: () => {
    const tickets = get().addedZendeskTickets;
    return tickets.filter(t => t.status === "open" || t.status === "pending").length;
  },

  getNewSlackCount: () => {
    const activities = get().addedSlackActivities;
    return activities.filter(a => a.hasQuickActions && !a.handled).length;
  },
}));

// Helper to generate a unique Zendesk ticket for urgent referral
export function createUrgentReferralTicket(
  referralId: string,
  patientName: string
): ZendeskTicket {
  const ticketNumber = `ZD-${4500 + Math.floor(Math.random() * 100)}`;

  return {
    id: `zd-new-${Date.now()}`,
    ticketNumber,
    subject: `Urgent referral requires immediate attention: ${patientName}`,
    description: `An urgent priority referral has been triaged for patient ${patientName}. This requires immediate processing and routing.`,
    priority: "urgent",
    status: "open",
    source: "auto-created",
    autoCreateRule: "urgent-fax",
    linkedEntityType: "referral",
    linkedEntityId: referralId,
    linkedEntityLabel: `Urgent Referral for ${patientName}`,
    autoCloseCondition: "Referral routed",
    firstResponseNeeded: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    zendeskUrl: `https://heartland-cardiology.zendesk.com/agent/tickets/${ticketNumber.replace("ZD-", "")}`,
  };
}

// Helper to generate a Slack activity for urgent referral
export function createUrgentReferralSlackActivity(
  referralId: string,
  patientName: string
): SlackActivity {
  return {
    id: `slack-new-${Date.now()}`,
    type: "urgent-alert",
    channel: "#urgent-faxes",
    message: `🚨 Urgent referral triaged: ${patientName} requires immediate attention`,
    status: "sent",
    linkedItems: [
      { type: "referral", id: referralId, label: `${patientName} - Urgent Referral` },
    ],
    hasQuickActions: true,
    handled: false,
    postedAt: new Date().toISOString(),
    slackUrl: `https://heartland-cardiology.slack.com/archives/C01URGENT/p${Date.now()}`,
  };
}
