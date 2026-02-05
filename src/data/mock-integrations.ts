import { Integration } from "@/types";

export const mockIntegrations: Integration[] = [
  { id: "int-1", name: "SRFax", description: "Inbound and outbound fax processing via SRFax cloud service", status: "connected", lastSync: "2026-02-04T10:30:00", icon: "Phone", category: "fax" },
  { id: "int-2", name: "Accuro EMR", description: "Patient chart filing, provider inbox routing, wait list management", status: "connected", lastSync: "2026-02-04T10:28:00", icon: "Database", category: "emr" },
  { id: "int-3", name: "Cerebrum", description: "Patient matching, document filing, and referral management", status: "connected", lastSync: "2026-02-04T10:25:00", icon: "Brain", category: "emr" },
  { id: "int-4", name: "Salesforce", description: "Referral tracking, patient journey analytics, CRM pipeline", status: "pending", icon: "Cloud", category: "crm" },
  { id: "int-5", name: "Zendesk", description: "Ticket creation for incomplete referrals, missing items tracking", status: "disconnected", icon: "LifeBuoy", category: "crm" },
  { id: "int-6", name: "Slack", description: "SLA alerts, urgent fax notifications, daily digest summaries", status: "connected", lastSync: "2026-02-04T10:30:00", icon: "MessageSquare", category: "messaging" },
];
