import { FaxLineConfig } from "@/types";

export const mockFaxLines: FaxLineConfig[] = [
  { id: "line-1", name: "Main Clinic Fax", number: "+1 (416) 555-0100", isActive: true, assignedDepartment: "General", dailyVolume: 85 },
  { id: "line-2", name: "Referral Intake Line", number: "+1 (416) 555-0101", isActive: true, assignedDepartment: "Referrals", dailyVolume: 120 },
  { id: "line-3", name: "Dr. Patel Direct Line", number: "+1 (416) 555-0102", isActive: true, assignedDepartment: "Dr. Patel", dailyVolume: 25 },
  { id: "line-4", name: "Imaging Results Line", number: "+1 (416) 555-0103", isActive: true, assignedDepartment: "Imaging", dailyVolume: 45 },
  { id: "line-5", name: "Lab Results Line", number: "+1 (416) 555-0104", isActive: false, assignedDepartment: "Lab", dailyVolume: 0 },
];
