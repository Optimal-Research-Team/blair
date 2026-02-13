import { SalesforceProvider, SalesforceOverviewStats, ProviderQualityTier } from "@/types/integration-feeds";

function calculateQualityTier(score: number): ProviderQualityTier {
  if (score >= 90) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "needs-improvement";
  return "poor";
}

export const mockSalesforceProviders: SalesforceProvider[] = [
  {
    id: "provider-1",
    salesforceId: "SF-001",
    name: "Dr. Sarah Patel",
    clinicName: "City Medical Centre",
    phone: "(416) 555-0123",
    fax: "(416) 555-0124",
    email: "dr.patel@citymedical.ca",
    totalReferrals: 127,
    referralsThisMonth: 18,
    referralsLastMonth: 16,
    referralTrend: 12.5,
    qualityScore: 92,
    qualityTier: "excellent",
    missingInfoRate: 11,
    missingInfoRateTrend: -3,
    avgCompletionDays: 3.1,
    avgCompletionDaysTrend: -0.4,
    commonMissingItems: [
      { item: "Echo Report", percentage: 8 },
      { item: "Recent Labs", percentage: 6 },
    ],
    communicationStats: {
      totalRequestsSent: 14,
      avgResponseTimeDays: 1.2,
      responseRate: 96,
    },
    referralHistory: [
      { id: "rh-1", referralId: "ref-1", patientName: "John Smith", status: "routed", completenessScore: 100, daysToComplete: 2.1, date: "2026-02-05" },
      { id: "rh-2", referralId: "ref-old-1", patientName: "Alice Wong", status: "booked", completenessScore: 100, daysToComplete: 3.5, date: "2026-02-01" },
      { id: "rh-3", referralId: "ref-old-2", patientName: "Robert Kim", status: "accepted", completenessScore: 100, daysToComplete: 2.8, date: "2026-01-28" },
      { id: "rh-4", referralId: "ref-old-3", patientName: "Susan Lee", status: "booked", completenessScore: 100, daysToComplete: 4.1, date: "2026-01-25" },
    ],
    needsOutreach: false,
    salesforceUrl: "https://heartland-cardiology.my.salesforce.com/001SF001",
    lastSyncedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "provider-2",
    salesforceId: "SF-002",
    name: "Dr. Michael Chen",
    clinicName: "North York Clinic",
    phone: "(416) 555-0234",
    fax: "(416) 555-0235",
    email: "mchen@northyorkclinic.ca",
    totalReferrals: 98,
    referralsThisMonth: 15,
    referralsLastMonth: 12,
    referralTrend: 25,
    qualityScore: 58,
    qualityTier: "needs-improvement",
    missingInfoRate: 33,
    missingInfoRateTrend: 5,
    avgCompletionDays: 5.2,
    avgCompletionDaysTrend: 0.8,
    commonMissingItems: [
      { item: "ECG", percentage: 40 },
      { item: "BNP Labs", percentage: 25 },
      { item: "Medication List", percentage: 20 },
    ],
    communicationStats: {
      totalRequestsSent: 28,
      avgResponseTimeDays: 2.8,
      responseRate: 72,
    },
    referralHistory: [
      { id: "rh-5", referralId: "ref-4", patientName: "Maria Garcia", status: "pending-response", completenessScore: 75, date: "2026-02-04" },
      { id: "rh-6", referralId: "ref-old-4", patientName: "James Wilson", status: "complete", completenessScore: 100, daysToComplete: 6.2, date: "2026-01-30" },
      { id: "rh-7", referralId: "ref-old-5", patientName: "Linda Brown", status: "accepted", completenessScore: 100, daysToComplete: 4.5, date: "2026-01-26" },
    ],
    needsOutreach: true,
    salesforceUrl: "https://heartland-cardiology.my.salesforce.com/001SF002",
    lastSyncedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "provider-3",
    salesforceId: "SF-003",
    name: "Dr. Jennifer Williams",
    clinicName: "Scarborough Family Practice",
    phone: "(416) 555-0345",
    fax: "(416) 555-0346",
    email: "jwilliams@scarboroughfp.ca",
    totalReferrals: 84,
    referralsThisMonth: 12,
    referralsLastMonth: 14,
    referralTrend: -14.3,
    qualityScore: 78,
    qualityTier: "good",
    missingInfoRate: 18,
    missingInfoRateTrend: -2,
    avgCompletionDays: 3.8,
    avgCompletionDaysTrend: -0.2,
    commonMissingItems: [
      { item: "Recent Echo", percentage: 15 },
      { item: "Stress Test", percentage: 12 },
    ],
    communicationStats: {
      totalRequestsSent: 18,
      avgResponseTimeDays: 1.8,
      responseRate: 88,
    },
    referralHistory: [
      { id: "rh-8", referralId: "ref-3", patientName: "Jane Doe", status: "incomplete", completenessScore: 60, date: "2026-02-03" },
      { id: "rh-9", referralId: "ref-old-6", patientName: "Michael Davis", status: "booked", completenessScore: 100, daysToComplete: 3.2, date: "2026-01-29" },
    ],
    needsOutreach: false,
    salesforceUrl: "https://heartland-cardiology.my.salesforce.com/001SF003",
    lastSyncedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "provider-4",
    salesforceId: "SF-004",
    name: "Dr. David Thompson",
    clinicName: "Etobicoke Medical Group",
    phone: "(416) 555-0456",
    fax: "(416) 555-0457",
    email: "dthompson@etobicokemedical.ca",
    totalReferrals: 72,
    referralsThisMonth: 10,
    referralsLastMonth: 11,
    referralTrend: -9.1,
    qualityScore: 85,
    qualityTier: "good",
    missingInfoRate: 14,
    missingInfoRateTrend: 0,
    avgCompletionDays: 3.4,
    avgCompletionDaysTrend: 0.1,
    commonMissingItems: [
      { item: "BNP Labs", percentage: 12 },
      { item: "ECG", percentage: 10 },
    ],
    communicationStats: {
      totalRequestsSent: 12,
      avgResponseTimeDays: 1.5,
      responseRate: 92,
    },
    referralHistory: [
      { id: "rh-10", referralId: "ref-5", patientName: "Margaret Thompson", status: "pending-response", completenessScore: 80, date: "2026-02-02" },
      { id: "rh-11", referralId: "ref-old-7", patientName: "William Johnson", status: "accepted", completenessScore: 100, daysToComplete: 2.9, date: "2026-01-28" },
    ],
    needsOutreach: false,
    salesforceUrl: "https://heartland-cardiology.my.salesforce.com/001SF004",
    lastSyncedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "provider-5",
    salesforceId: "SF-005",
    name: "Dr. Amanda Foster",
    clinicName: "Downtown Toronto Health",
    phone: "(416) 555-0567",
    fax: "(416) 555-0568",
    email: "afoster@downtownhealth.ca",
    totalReferrals: 56,
    referralsThisMonth: 8,
    referralsLastMonth: 6,
    referralTrend: 33.3,
    qualityScore: 44,
    qualityTier: "poor",
    missingInfoRate: 45,
    missingInfoRateTrend: 8,
    avgCompletionDays: 6.8,
    avgCompletionDaysTrend: 1.2,
    commonMissingItems: [
      { item: "ECG", percentage: 50 },
      { item: "Medication List", percentage: 35 },
      { item: "BNP Labs", percentage: 30 },
      { item: "Clinical History", percentage: 25 },
    ],
    communicationStats: {
      totalRequestsSent: 32,
      avgResponseTimeDays: 4.2,
      responseRate: 58,
    },
    referralHistory: [
      { id: "rh-12", referralId: "ref-2", patientName: "Bob Wilson", status: "incomplete", completenessScore: 60, date: "2026-02-04" },
      { id: "rh-13", referralId: "ref-old-8", patientName: "Nancy White", status: "pending-response", completenessScore: 55, date: "2026-01-31" },
      { id: "rh-14", referralId: "ref-old-9", patientName: "Richard Black", status: "declined", completenessScore: 40, daysToComplete: 8.5, date: "2026-01-25" },
    ],
    needsOutreach: true,
    salesforceUrl: "https://heartland-cardiology.my.salesforce.com/001SF005",
    lastSyncedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "provider-6",
    salesforceId: "SF-006",
    name: "Dr. Robert Martinez",
    clinicName: "Mississauga Heart Clinic",
    phone: "(905) 555-0678",
    fax: "(905) 555-0679",
    email: "rmartinez@mississaugaheart.ca",
    totalReferrals: 45,
    referralsThisMonth: 7,
    referralsLastMonth: 8,
    referralTrend: -12.5,
    qualityScore: 95,
    qualityTier: "excellent",
    missingInfoRate: 5,
    missingInfoRateTrend: -2,
    avgCompletionDays: 2.1,
    avgCompletionDaysTrend: -0.3,
    commonMissingItems: [
      { item: "Recent Labs", percentage: 5 },
    ],
    communicationStats: {
      totalRequestsSent: 4,
      avgResponseTimeDays: 0.8,
      responseRate: 100,
    },
    referralHistory: [
      { id: "rh-15", referralId: "ref-6", patientName: "David Chen", status: "complete", completenessScore: 100, daysToComplete: 1.8, date: "2026-02-03" },
      { id: "rh-16", referralId: "ref-old-10", patientName: "Emily Park", status: "booked", completenessScore: 100, daysToComplete: 2.2, date: "2026-01-30" },
    ],
    needsOutreach: false,
    salesforceUrl: "https://heartland-cardiology.my.salesforce.com/001SF006",
    lastSyncedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
];

export const mockSalesforceOverview: SalesforceOverviewStats = {
  totalReferrals: 127,
  totalReferralsTrend: 12,
  missingInfoRate: 23,
  missingInfoRateTrend: -5,
  avgCompletionDays: 4.2,
  avgCompletionDaysTrend: -0.8,
  topReferrer: {
    name: "Dr. Patel",
    count: 18,
  },
  totalProviders: mockSalesforceProviders.length,
  providersNeedingOutreach: mockSalesforceProviders.filter((p) => p.needsOutreach).length,
};

// Helpers
export function getProvidersByClinic() {
  const clinics = new Map<string, SalesforceProvider[]>();
  mockSalesforceProviders.forEach((provider) => {
    const existing = clinics.get(provider.clinicName) || [];
    clinics.set(provider.clinicName, [...existing, provider]);
  });
  return clinics;
}

export function getProvidersByQuality() {
  return {
    excellent: mockSalesforceProviders.filter((p) => p.qualityTier === "excellent"),
    good: mockSalesforceProviders.filter((p) => p.qualityTier === "good"),
    needsImprovement: mockSalesforceProviders.filter((p) => p.qualityTier === "needs-improvement"),
    poor: mockSalesforceProviders.filter((p) => p.qualityTier === "poor"),
  };
}

export function getTopReferrers(limit = 5) {
  return [...mockSalesforceProviders]
    .sort((a, b) => b.referralsThisMonth - a.referralsThisMonth)
    .slice(0, limit);
}

export function getProvidersNeedingOutreach() {
  return mockSalesforceProviders.filter((p) => p.needsOutreach);
}
