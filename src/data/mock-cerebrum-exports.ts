import {
  CerebrumExportRecord,
  CerebrumProviderInbox,
  CerebrumExportStats,
  CerebrumDocumentCategory,
} from "@/types/cerebrum";
import { subHours, subMinutes, subDays } from "date-fns";

const now = new Date();

function ago(hours: number, minutes: number = 0): string {
  return subMinutes(subHours(now, hours), minutes).toISOString();
}

function daysAgo(days: number, hours: number = 0): string {
  return subHours(subDays(now, days), hours).toISOString();
}

/**
 * Provider inboxes in Cerebrum EMR
 */
export const mockCerebrumInboxes: CerebrumProviderInbox[] = [
  { id: "inbox-1", providerName: "Dr. Anika Patel", providerType: "cardiologist", specialty: "Interventional Cardiology", isDefault: true },
  { id: "inbox-2", providerName: "Dr. Michael Chen", providerType: "cardiologist", specialty: "Electrophysiology" },
  { id: "inbox-3", providerName: "Dr. Sarah Williams", providerType: "cardiologist", specialty: "Heart Failure" },
  { id: "inbox-4", providerName: "Dr. James Thompson", providerType: "cardiologist", specialty: "General Cardiology" },
  { id: "inbox-5", providerName: "Lisa Rodriguez, RN", providerType: "nurse", specialty: "Cardiac Nursing" },
  { id: "inbox-6", providerName: "Admin Inbox", providerType: "admin" },
  { id: "inbox-7", providerName: "Echo Lab", providerType: "tech", specialty: "Echocardiography" },
  { id: "inbox-8", providerName: "Cath Lab", providerType: "tech", specialty: "Interventional" },
];

/**
 * Mock Cerebrum export records - at the DOCUMENT level
 * These represent individual documents that have been routed to Cerebrum
 */
export const mockCerebrumExports: CerebrumExportRecord[] = [
  // Recent exports (today) - various types
  {
    id: "exp-1",
    sourceFaxId: "fax-linked-1",
    sourcePages: [1],
    patientId: "pat-3",
    patientName: "Jean-Luc Tremblay",
    patientOhip: "3456-789-012-EF",
    patientDob: "1967-11-03",
    documentType: "Bloodwork - BNP",
    cerebrumCategory: "lab-results",
    hrmCategory: "MR",
    originProvider: "Hamilton Health Sciences Lab",
    originFaxNumber: "9055554001",
    destinationInbox: "Dr. Sarah Williams",
    destinationInboxId: "inbox-3",
    routingMethod: "auto",
    routingConfidence: 94.5,
    receivedAt: ago(0, 15),
    routedAt: ago(0, 12),
    exportedAt: ago(0, 10),
    status: "exported",
    linkedReferralId: "ref-2",
  },
  {
    id: "exp-2",
    sourceFaxId: "fax-linked-2",
    sourcePages: [1, 2, 3],
    patientId: "pat-3",
    patientName: "Jean-Luc Tremblay",
    patientOhip: "3456-789-012-EF",
    patientDob: "1967-11-03",
    documentType: "Echocardiogram Report",
    cerebrumCategory: "echo-reports",
    hrmCategory: "DI",
    originProvider: "Hamilton Health Sciences - CV Imaging",
    originFaxNumber: "9055554050",
    destinationInbox: "Echo Lab",
    destinationInboxId: "inbox-7",
    routingMethod: "auto",
    routingConfidence: 98.2,
    receivedAt: ago(0, 8),
    routedAt: ago(0, 5),
    exportedAt: ago(0, 3),
    status: "exported",
    linkedReferralId: "ref-2",
  },
  {
    id: "exp-3",
    sourceFaxId: "fax-linked-3",
    sourcePages: [1, 2, 3, 4],
    patientId: "pat-30",
    patientName: "Victor Kozlov",
    patientOhip: "0000-112-233-GH",
    patientDob: "1946-09-18",
    documentType: "CT Aorta Report",
    cerebrumCategory: "ct-imaging",
    hrmCategory: "DI",
    originProvider: "St. Michael's Hospital - Diagnostic Imaging",
    originFaxNumber: "4165551820",
    destinationInbox: "Dr. Anika Patel",
    destinationInboxId: "inbox-1",
    routingMethod: "auto",
    routingConfidence: 97.5,
    receivedAt: ago(0, 45),
    routedAt: ago(0, 40),
    exportedAt: ago(0, 38),
    status: "exported",
    linkedReferralId: "ref-3",
  },
  {
    id: "exp-4",
    sourceFaxId: "fax-1",
    sourcePages: [1, 2],
    patientId: "pat-10",
    patientName: "Giuseppe Romano",
    patientOhip: "4829-571-038-KL",
    patientDob: "1958-03-15",
    documentType: "Bloodwork - Troponin",
    cerebrumCategory: "lab-results",
    hrmCategory: "MR",
    originProvider: "St. Michael's Hospital ED",
    originFaxNumber: "4165551802",
    destinationInbox: "Dr. Anika Patel",
    destinationInboxId: "inbox-1",
    routingMethod: "auto",
    routingConfidence: 97.2,
    receivedAt: ago(0, 25),
    routedAt: ago(0, 22),
    exportedAt: ago(0, 20),
    status: "exported",
  },
  {
    id: "exp-5",
    sourceFaxId: "fax-2",
    sourcePages: [1, 2, 3, 4],
    patientId: "pat-24",
    patientName: "Michael Singh",
    patientOhip: "4400-556-677-UV",
    patientDob: "1953-04-08",
    documentType: "Cardiology Referral",
    cerebrumCategory: "referrals",
    hrmCategory: "MR",
    originProvider: "Toronto General Hospital ED",
    originFaxNumber: "4165555002",
    destinationInbox: "Dr. Anika Patel",
    destinationInboxId: "inbox-1",
    routingMethod: "auto",
    routingConfidence: 96.8,
    receivedAt: ago(1, 10),
    routedAt: ago(1, 5),
    exportedAt: ago(1, 2),
    status: "exported",
  },

  // Yesterday's exports
  {
    id: "exp-6",
    sourceFaxId: "fax-prev-1",
    sourcePages: [1, 2],
    patientId: "pat-15",
    patientName: "Elena Kowalski",
    patientOhip: "5566-778-899-AB",
    patientDob: "1972-06-22",
    documentType: "Holter Monitor Report",
    cerebrumCategory: "holter",
    hrmCategory: "DI",
    originProvider: "North York Cardiology",
    originFaxNumber: "4165559001",
    destinationInbox: "Dr. Michael Chen",
    destinationInboxId: "inbox-2",
    routingMethod: "auto",
    routingConfidence: 95.3,
    receivedAt: daysAgo(1, 2),
    routedAt: daysAgo(1, 1.5),
    exportedAt: daysAgo(1, 1),
    status: "exported",
  },
  {
    id: "exp-7",
    sourceFaxId: "fax-prev-2",
    sourcePages: [1],
    patientId: "pat-18",
    patientName: "Robert Chen",
    patientOhip: "6677-889-900-CD",
    patientDob: "1965-09-14",
    documentType: "ECG Report",
    cerebrumCategory: "ecg",
    hrmCategory: "DI",
    originProvider: "Scarborough General Hospital",
    originFaxNumber: "4165557001",
    destinationInbox: "Dr. James Thompson",
    destinationInboxId: "inbox-4",
    routingMethod: "manual",
    routedBy: "user-2",
    routedByName: "Sarah Johnson",
    receivedAt: daysAgo(1, 4),
    routedAt: daysAgo(1, 3),
    exportedAt: daysAgo(1, 2.5),
    status: "exported",
  },
  {
    id: "exp-8",
    sourceFaxId: "fax-prev-3",
    sourcePages: [1, 2, 3],
    patientId: "pat-22",
    patientName: "Margaret Thompson",
    patientOhip: "7788-990-011-EF",
    patientDob: "1958-12-03",
    documentType: "Stress Test",
    cerebrumCategory: "stress-tests",
    hrmCategory: "DI",
    originProvider: "Sunnybrook Stress Lab",
    originFaxNumber: "4165550102",
    destinationInbox: "Dr. Sarah Williams",
    destinationInboxId: "inbox-3",
    routingMethod: "auto",
    routingConfidence: 92.1,
    receivedAt: daysAgo(1, 6),
    routedAt: daysAgo(1, 5.5),
    exportedAt: daysAgo(1, 5),
    status: "exported",
  },
  {
    id: "exp-9",
    sourceFaxId: "fax-prev-4",
    sourcePages: [1, 2],
    patientId: "pat-25",
    patientName: "David Kim",
    patientOhip: "8899-001-122-GH",
    patientDob: "1970-03-28",
    documentType: "Discharge Summary",
    cerebrumCategory: "hospital-reports",
    hrmCategory: "MR",
    originProvider: "Toronto Western Hospital",
    originFaxNumber: "4165553001",
    destinationInbox: "Dr. Sarah Williams",
    destinationInboxId: "inbox-3",
    routingMethod: "auto",
    routingConfidence: 89.7,
    receivedAt: daysAgo(1, 8),
    routedAt: daysAgo(1, 7),
    exportedAt: daysAgo(1, 6.5),
    status: "exported",
  },
  {
    id: "exp-10",
    sourceFaxId: "fax-prev-5",
    sourcePages: [1, 2, 3, 4],
    patientId: "pat-28",
    patientName: "Susan Anderson",
    patientOhip: "9900-112-233-IJ",
    patientDob: "1962-07-15",
    documentType: "Cardiac Catheterization",
    cerebrumCategory: "cath-lab",
    hrmCategory: "DI",
    originProvider: "St. Michael's Cath Lab",
    originFaxNumber: "4165551850",
    destinationInbox: "Cath Lab",
    destinationInboxId: "inbox-8",
    routingMethod: "auto",
    routingConfidence: 98.5,
    receivedAt: daysAgo(1, 10),
    routedAt: daysAgo(1, 9.5),
    exportedAt: daysAgo(1, 9),
    status: "exported",
  },

  // Earlier this week
  {
    id: "exp-11",
    sourceFaxId: "fax-week-1",
    sourcePages: [1, 2],
    patientId: "pat-12",
    patientName: "Frank Martinez",
    patientOhip: "1122-334-455-KL",
    patientDob: "1955-11-20",
    documentType: "Pacemaker Check",
    cerebrumCategory: "device-reports",
    hrmCategory: "DI",
    originProvider: "Medtronic Device Clinic",
    originFaxNumber: "4165558001",
    destinationInbox: "Dr. Michael Chen",
    destinationInboxId: "inbox-2",
    routingMethod: "auto",
    routingConfidence: 96.8,
    receivedAt: daysAgo(2, 3),
    routedAt: daysAgo(2, 2.5),
    exportedAt: daysAgo(2, 2),
    status: "exported",
  },
  {
    id: "exp-12",
    sourceFaxId: "fax-week-2",
    sourcePages: [1],
    patientId: "pat-19",
    patientName: "Patricia Wong",
    patientOhip: "2233-445-566-MN",
    patientDob: "1978-04-09",
    documentType: "Lab Results",
    cerebrumCategory: "lab-results",
    hrmCategory: "MR",
    originProvider: "LifeLabs",
    originFaxNumber: "4165556001",
    destinationInbox: "Dr. James Thompson",
    destinationInboxId: "inbox-4",
    routingMethod: "auto",
    routingConfidence: 88.2,
    receivedAt: daysAgo(2, 5),
    routedAt: daysAgo(2, 4.5),
    exportedAt: daysAgo(2, 4),
    status: "exported",
  },
  {
    id: "exp-13",
    sourceFaxId: "fax-week-3",
    sourcePages: [1, 2, 3],
    patientId: "pat-31",
    patientName: "James Wilson",
    patientOhip: "3344-556-677-OP",
    patientDob: "1949-08-12",
    documentType: "Nuclear Stress Test",
    cerebrumCategory: "nuclear",
    hrmCategory: "DI",
    originProvider: "Nuclear Medicine Associates",
    originFaxNumber: "9055559001",
    destinationInbox: "Dr. Anika Patel",
    destinationInboxId: "inbox-1",
    routingMethod: "manual",
    routedBy: "user-3",
    routedByName: "Mike Thompson",
    receivedAt: daysAgo(3, 2),
    routedAt: daysAgo(3, 1),
    exportedAt: daysAgo(3, 0.5),
    status: "exported",
  },
  {
    id: "exp-14",
    sourceFaxId: "fax-week-4",
    sourcePages: [1, 2],
    patientId: "pat-14",
    patientName: "Linda Garcia",
    patientOhip: "4455-667-788-QR",
    patientDob: "1968-01-25",
    documentType: "Consultation Note",
    cerebrumCategory: "consult-notes",
    hrmCategory: "MR",
    originProvider: "Dr. Emily Brown - Internal Medicine",
    originFaxNumber: "4165554001",
    destinationInbox: "Dr. Sarah Williams",
    destinationInboxId: "inbox-3",
    routingMethod: "auto",
    routingConfidence: 91.4,
    receivedAt: daysAgo(3, 6),
    routedAt: daysAgo(3, 5.5),
    exportedAt: daysAgo(3, 5),
    status: "exported",
  },
  {
    id: "exp-15",
    sourceFaxId: "fax-week-5",
    sourcePages: [1],
    patientId: "pat-20",
    patientName: "Thomas Brown",
    patientOhip: "5566-778-899-ST",
    patientDob: "1975-10-18",
    documentType: "Correspondence",
    cerebrumCategory: "correspondence",
    hrmCategory: "MR",
    originProvider: "Insurance Company",
    originFaxNumber: "8005551234",
    destinationInbox: "Admin Inbox",
    destinationInboxId: "inbox-6",
    routingMethod: "manual",
    routedBy: "user-4",
    routedByName: "Admin Staff",
    receivedAt: daysAgo(4, 2),
    routedAt: daysAgo(4, 1),
    exportedAt: daysAgo(4, 0.5),
    status: "exported",
  },

  // Pending exports
  {
    id: "exp-16",
    sourceFaxId: "fax-pending-1",
    sourcePages: [1, 2],
    patientId: "pat-33",
    patientName: "Barbara Lee",
    patientOhip: "6677-889-900-UV",
    patientDob: "1960-05-30",
    documentType: "Echocardiogram Report",
    cerebrumCategory: "echo-reports",
    hrmCategory: "DI",
    originProvider: "Toronto Echo Centre",
    originFaxNumber: "4165559500",
    destinationInbox: "Echo Lab",
    destinationInboxId: "inbox-7",
    routingMethod: "auto",
    routingConfidence: 95.8,
    receivedAt: ago(0, 5),
    routedAt: ago(0, 3),
    status: "pending",
  },
  {
    id: "exp-17",
    sourceFaxId: "fax-pending-2",
    sourcePages: [1],
    patientId: "pat-35",
    patientName: "Richard Taylor",
    patientOhip: "7788-990-011-WX",
    patientDob: "1952-12-08",
    documentType: "ECG Report",
    cerebrumCategory: "ecg",
    hrmCategory: "DI",
    originProvider: "Family Practice Clinic",
    originFaxNumber: "4165552001",
    destinationInbox: "Dr. James Thompson",
    destinationInboxId: "inbox-4",
    routingMethod: "auto",
    routingConfidence: 93.2,
    receivedAt: ago(0, 3),
    routedAt: ago(0, 2),
    status: "pending",
  },

  // Failed export
  {
    id: "exp-18",
    sourceFaxId: "fax-failed-1",
    sourcePages: [1, 2, 3],
    patientId: "pat-unknown",
    patientName: "Unknown Patient",
    documentType: "External Records",
    cerebrumCategory: "external-records",
    hrmCategory: "MR",
    originProvider: "Out of Province Hospital",
    originFaxNumber: "6045551234",
    destinationInbox: "Admin Inbox",
    destinationInboxId: "inbox-6",
    routingMethod: "manual",
    routedBy: "user-2",
    routedByName: "Sarah Johnson",
    receivedAt: daysAgo(1, 1),
    routedAt: daysAgo(1, 0.5),
    status: "failed",
    errorMessage: "Patient not found in Cerebrum EMR. Manual patient creation required.",
  },
];

/**
 * Calculate export statistics
 */
export function getCerebrumExportStats(): CerebrumExportStats {
  const exports = mockCerebrumExports;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const autoRouted = exports.filter(e => e.routingMethod === "auto");
  const manuallyRouted = exports.filter(e => e.routingMethod === "manual");
  const pending = exports.filter(e => e.status === "pending");
  const exportedToday = exports.filter(e => {
    if (!e.exportedAt) return false;
    return new Date(e.exportedAt) >= today;
  });

  const avgConfidence = autoRouted.length > 0
    ? autoRouted.reduce((sum, e) => sum + (e.routingConfidence || 0), 0) / autoRouted.length
    : 0;

  const byCategory = exports.reduce((acc, e) => {
    acc[e.cerebrumCategory] = (acc[e.cerebrumCategory] || 0) + 1;
    return acc;
  }, {} as Record<CerebrumDocumentCategory, number>);

  return {
    totalDocuments: exports.length,
    autoRouted: autoRouted.length,
    manuallyRouted: manuallyRouted.length,
    pendingExport: pending.length,
    exportedToday: exportedToday.length,
    avgRoutingConfidence: Math.round(avgConfidence * 10) / 10,
    byCategory,
  };
}

/**
 * Get exports grouped by date
 */
export function getCerebrumExportsByDate() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());

  return {
    today: mockCerebrumExports.filter(e => new Date(e.routedAt) >= today),
    yesterday: mockCerebrumExports.filter(e => {
      const date = new Date(e.routedAt);
      return date >= yesterday && date < today;
    }),
    thisWeek: mockCerebrumExports.filter(e => {
      const date = new Date(e.routedAt);
      return date >= thisWeekStart && date < yesterday;
    }),
    older: mockCerebrumExports.filter(e => new Date(e.routedAt) < thisWeekStart),
  };
}

/**
 * Get exports filtered by various criteria
 */
export function filterCerebrumExports(options: {
  category?: CerebrumDocumentCategory;
  routingMethod?: "auto" | "manual";
  status?: "pending" | "exported" | "failed";
  inboxId?: string;
  searchQuery?: string;
}): CerebrumExportRecord[] {
  let filtered = [...mockCerebrumExports];

  if (options.category) {
    filtered = filtered.filter(e => e.cerebrumCategory === options.category);
  }

  if (options.routingMethod) {
    filtered = filtered.filter(e => e.routingMethod === options.routingMethod);
  }

  if (options.status) {
    filtered = filtered.filter(e => e.status === options.status);
  }

  if (options.inboxId) {
    filtered = filtered.filter(e => e.destinationInboxId === options.inboxId);
  }

  if (options.searchQuery) {
    const query = options.searchQuery.toLowerCase();
    filtered = filtered.filter(e =>
      e.patientName.toLowerCase().includes(query) ||
      e.documentType.toLowerCase().includes(query) ||
      e.originProvider.toLowerCase().includes(query) ||
      e.destinationInbox.toLowerCase().includes(query) ||
      (e.patientOhip && e.patientOhip.toLowerCase().includes(query))
    );
  }

  // Sort by routedAt descending
  filtered.sort((a, b) => new Date(b.routedAt).getTime() - new Date(a.routedAt).getTime());

  return filtered;
}
