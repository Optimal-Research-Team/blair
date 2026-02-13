import { SlackActivity, SlackChannelConfig } from "@/types/integration-feeds";

export const mockSlackActivities: SlackActivity[] = [
  // TODAY - Recent
  {
    id: "slack-1",
    type: "sla-warning",
    channel: "#clinical-ops",
    message: "3 referrals approaching SLA deadline in next 30 minutes",
    status: "sent",
    linkedItems: [
      { type: "referral", id: "ref-1", label: "John Smith", timeRemaining: "15 min" },
      { type: "referral", id: "ref-3", label: "Jane Doe", timeRemaining: "22 min" },
      { type: "referral", id: "ref-4", label: "Maria Garcia", timeRemaining: "28 min" },
    ],
    hasQuickActions: true,
    handled: false,
    postedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 min ago
    slackUrl: "https://heartland-cardiology.slack.com/archives/C01CLINICAL/p1707145200",
  },
  {
    id: "slack-2",
    type: "urgent-alert",
    channel: "#urgent-faxes",
    message: "New urgent fax from Dr. Patel for patient John Smith",
    status: "sent",
    linkedItems: [
      { type: "referral", id: "ref-1", label: "John Smith - Cardiology Referral" },
    ],
    hasQuickActions: true,
    handled: false,
    postedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 min ago
    slackUrl: "https://heartland-cardiology.slack.com/archives/C01URGENT/p1707144300",
  },
  {
    id: "slack-3",
    type: "daily-digest",
    channel: "#fax-summary",
    message: "Feb 6 Summary: 156 faxes processed, 94% SLA compliance, 87% auto-file rate",
    status: "sent",
    postedAt: new Date().setHours(8, 0, 0, 0) > Date.now()
      ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Yesterday 8am if today's hasn't happened
      : new Date(new Date().setHours(8, 0, 0, 0)).toISOString(), // Today 8am
    slackUrl: "https://heartland-cardiology.slack.com/archives/C01SUMMARY/p1707141600",
  },
  {
    id: "slack-4",
    type: "sla-breach",
    channel: "#clinical-ops",
    message: "SLA BREACHED: Urgent referral for Jane Doe exceeded deadline by 2 hours",
    status: "sent",
    linkedItems: [
      { type: "referral", id: "ref-3", label: "Jane Doe - Urgent Referral" },
    ],
    hasQuickActions: true,
    handled: true,
    handledBy: "Sarah",
    handledAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    slackUrl: "https://heartland-cardiology.slack.com/archives/C01CLINICAL/p1707138000",
  },
  {
    id: "slack-5",
    type: "urgent-alert",
    channel: "#urgent-faxes",
    message: "New urgent fax from City Hospital ED - Acute chest pain patient",
    status: "sent",
    linkedItems: [
      { type: "fax", id: "fax-15", label: "City Hospital ED - Urgent" },
    ],
    hasQuickActions: true,
    handled: true,
    handledBy: "Mike",
    handledAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    postedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    slackUrl: "https://heartland-cardiology.slack.com/archives/C01URGENT/p1707130800",
  },

  // YESTERDAY
  {
    id: "slack-6",
    type: "daily-digest",
    channel: "#fax-summary",
    message: "Feb 5 Summary: 142 faxes processed, 91% SLA compliance, 85% auto-file rate",
    status: "sent",
    postedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 - 8 * 60 * 60 * 1000).toISOString(), // Yesterday 8am
    slackUrl: "https://heartland-cardiology.slack.com/archives/C01SUMMARY/p1707055200",
  },
  {
    id: "slack-7",
    type: "sla-warning",
    channel: "#clinical-ops",
    message: "5 referrals approaching SLA deadline in next 30 minutes",
    status: "sent",
    linkedItems: [
      { type: "referral", id: "ref-old-1", label: "Patient A", timeRemaining: "10 min" },
      { type: "referral", id: "ref-old-2", label: "Patient B", timeRemaining: "15 min" },
      { type: "referral", id: "ref-old-3", label: "Patient C", timeRemaining: "20 min" },
      { type: "referral", id: "ref-old-4", label: "Patient D", timeRemaining: "25 min" },
      { type: "referral", id: "ref-old-5", label: "Patient E", timeRemaining: "30 min" },
    ],
    hasQuickActions: false, // Past, so no actions
    handled: true,
    postedAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(), // Yesterday afternoon
    slackUrl: "https://heartland-cardiology.slack.com/archives/C01CLINICAL/p1707040800",
  },
  {
    id: "slack-8",
    type: "urgent-alert",
    channel: "#urgent-faxes",
    message: "New urgent fax from St. Michael's Hospital for emergency cardiac consult",
    status: "sent",
    linkedItems: [
      { type: "referral", id: "ref-7", label: "Anya Kowalski - Emergency" },
    ],
    hasQuickActions: false,
    handled: true,
    handledBy: "Lisa",
    postedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), // Yesterday
    slackUrl: "https://heartland-cardiology.slack.com/archives/C01URGENT/p1707033600",
  },

  // EARLIER THIS WEEK
  {
    id: "slack-9",
    type: "weekly-report",
    channel: "#fax-summary",
    message: "Weekly Report (Jan 29 - Feb 4): 847 faxes processed, 92.3% avg SLA compliance, Top referrer: Dr. Patel (34 referrals)",
    status: "sent",
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago (Monday)
    slackUrl: "https://heartland-cardiology.slack.com/archives/C01SUMMARY/p1706968800",
  },
  {
    id: "slack-10",
    type: "ticket-posted",
    channel: "#clinical-ops",
    message: "Zendesk ticket created: Incomplete referral for Bob Wilson (Missing ECG, BNP Labs)",
    status: "sent",
    linkedItems: [
      { type: "referral", id: "ref-2", label: "Bob Wilson" },
    ],
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    slackUrl: "https://heartland-cardiology.slack.com/archives/C01CLINICAL/p1706882400",
  },

  // FAILED POST (for demo)
  {
    id: "slack-11",
    type: "sla-warning",
    channel: "#clinical-ops",
    message: "2 referrals approaching SLA deadline",
    status: "failed",
    linkedItems: [
      { type: "referral", id: "ref-x", label: "Patient X" },
      { type: "referral", id: "ref-y", label: "Patient Y" },
    ],
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
];

export const mockSlackChannelConfig: SlackChannelConfig[] = [
  { channel: "#urgent-faxes", events: ["urgent-alert"], enabled: true },
  { channel: "#clinical-ops", events: ["sla-warning", "sla-breach", "ticket-posted"], enabled: true },
  { channel: "#fax-summary", events: ["daily-digest", "weekly-report"], enabled: true },
];

// Helper to group activities by date
export function getSlackActivitiesByDate() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay()); // Start of week (Sunday)

  return {
    today: mockSlackActivities.filter((a) => new Date(a.postedAt) >= today),
    yesterday: mockSlackActivities.filter((a) => {
      const date = new Date(a.postedAt);
      return date >= yesterday && date < today;
    }),
    thisWeek: mockSlackActivities.filter((a) => {
      const date = new Date(a.postedAt);
      return date >= thisWeekStart && date < yesterday;
    }),
    older: mockSlackActivities.filter((a) => new Date(a.postedAt) < thisWeekStart),
  };
}

// Helper to get stats
export function getSlackStats() {
  const activities = mockSlackActivities;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);

  const alertTypes = ["urgent-alert", "sla-warning", "sla-breach"] as const;
  const digestTypes = ["daily-digest", "weekly-report"] as const;

  return {
    totalToday: activities.filter((a) => new Date(a.postedAt) >= today).length,
    alerts: activities.filter((a) => alertTypes.includes(a.type as typeof alertTypes[number])).length,
    alertsToday: activities.filter((a) => alertTypes.includes(a.type as typeof alertTypes[number]) && new Date(a.postedAt) >= today).length,
    digests: activities.filter((a) => digestTypes.includes(a.type as typeof digestTypes[number])).length,
    digestsThisWeek: activities.filter((a) => digestTypes.includes(a.type as typeof digestTypes[number]) && new Date(a.postedAt) >= thisWeekStart).length,
    unhandled: activities.filter((a) => a.hasQuickActions && !a.handled).length,
    handled: activities.filter((a) => a.hasQuickActions && a.handled).length,
    failed: activities.filter((a) => a.status === "failed").length,
    total: activities.length,
  };
}
