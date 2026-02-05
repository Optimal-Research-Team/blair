import { DashboardMetrics, ThroughputDataPoint, DocTypeBreakdown, StaffProductivity, ReferralFunnelStage } from "@/types";

export const mockDashboardMetrics: DashboardMetrics = {
  queueDepth: 23,
  autoFileRate: 94.2,
  slaComplianceRate: 97.1,
  avgProcessingTimeMinutes: 3.2,
  faxesProcessedToday: 187,
  faxesProcessedThisWeek: 843,
  referralsReceivedToday: 12,
  referralsCompletedToday: 8,
};

export const mockThroughputData: ThroughputDataPoint[] = [
  { time: "7:00 AM", faxesProcessed: 5, date: "Today" },
  { time: "8:00 AM", faxesProcessed: 18, date: "Today" },
  { time: "9:00 AM", faxesProcessed: 32, date: "Today" },
  { time: "10:00 AM", faxesProcessed: 28, date: "Today" },
  { time: "11:00 AM", faxesProcessed: 25, date: "Today" },
  { time: "12:00 PM", faxesProcessed: 15, date: "Today" },
  { time: "1:00 PM", faxesProcessed: 20, date: "Today" },
  { time: "2:00 PM", faxesProcessed: 27, date: "Today" },
  { time: "3:00 PM", faxesProcessed: 22, date: "Today" },
  { time: "4:00 PM", faxesProcessed: 12, date: "Today" },
  { time: "5:00 PM", faxesProcessed: 3, date: "Today" },
  { time: "7:00 AM", faxesProcessed: 4, date: "Yesterday" },
  { time: "8:00 AM", faxesProcessed: 15, date: "Yesterday" },
  { time: "9:00 AM", faxesProcessed: 35, date: "Yesterday" },
  { time: "10:00 AM", faxesProcessed: 30, date: "Yesterday" },
  { time: "11:00 AM", faxesProcessed: 22, date: "Yesterday" },
  { time: "12:00 PM", faxesProcessed: 12, date: "Yesterday" },
  { time: "1:00 PM", faxesProcessed: 18, date: "Yesterday" },
  { time: "2:00 PM", faxesProcessed: 29, date: "Yesterday" },
  { time: "3:00 PM", faxesProcessed: 24, date: "Yesterday" },
  { time: "4:00 PM", faxesProcessed: 14, date: "Yesterday" },
  { time: "5:00 PM", faxesProcessed: 5, date: "Yesterday" },
];

export const mockDocTypeBreakdown: DocTypeBreakdown[] = [
  { type: "Cardiology Referral", count: 245, percentage: 29.1, color: "#2563EB" },
  { type: "ECG / EKG", count: 178, percentage: 21.2, color: "#7C3AED" },
  { type: "Lab Results", count: 152, percentage: 18.1, color: "#059669" },
  { type: "Echocardiogram", count: 89, percentage: 10.6, color: "#D97706" },
  { type: "Consultation Report", count: 67, percentage: 8.0, color: "#DC2626" },
  { type: "Discharge Summary", count: 45, percentage: 5.4, color: "#0891B2" },
  { type: "Other", count: 65, percentage: 7.7, color: "#6B7280" },
];

export const mockStaffProductivity: StaffProductivity[] = [
  { staffId: "user-3", staffName: "Sarah Mitchell", role: "Clerk", faxesProcessed: 342, avgTimePerFaxMinutes: 2.8, slaComplianceRate: 98.2 },
  { staffId: "user-4", staffName: "Jennifer Okafor", role: "Clerk", faxesProcessed: 298, avgTimePerFaxMinutes: 3.1, slaComplianceRate: 96.8 },
  { staffId: "user-5", staffName: "Priya Dhaliwal", role: "Nurse", faxesProcessed: 156, avgTimePerFaxMinutes: 4.2, slaComplianceRate: 97.5 },
  { staffId: "user-6", staffName: "Lisa Park", role: "Admin", faxesProcessed: 47, avgTimePerFaxMinutes: 5.1, slaComplianceRate: 95.3 },
];

export const mockReferralFunnel: ReferralFunnelStage[] = [
  { stage: "Received", count: 245, percentage: 100, color: "#3B82F6" },
  { stage: "Complete", count: 198, percentage: 80.8, color: "#8B5CF6" },
  { stage: "Accepted", count: 176, percentage: 71.8, color: "#10B981" },
  { stage: "Booked", count: 142, percentage: 58.0, color: "#F59E0B" },
];
