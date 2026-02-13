import { DocumentTypeConfig } from "@/types";

export const mockDocumentTypes: DocumentTypeConfig[] = [
  { id: "dt-1", name: "Cardiology Referral", category: "Referral", autoFileEnabled: false, autoFileThreshold: 95, priorityWeight: 10, slaMinutes: { urgent: 120, routine: 480 }, isActive: true },
  { id: "dt-2", name: "ECG / EKG Report", category: "Imaging", autoFileEnabled: true, autoFileThreshold: 90, priorityWeight: 7, slaMinutes: { urgent: 120, routine: 480 }, isActive: true },
  { id: "dt-3", name: "Echocardiogram Report", category: "Imaging", autoFileEnabled: true, autoFileThreshold: 90, priorityWeight: 7, slaMinutes: { urgent: 120, routine: 480 }, isActive: true },
  { id: "dt-4", name: "Holter Monitor Report", category: "Imaging", autoFileEnabled: true, autoFileThreshold: 90, priorityWeight: 6, slaMinutes: { urgent: 240, routine: 1440 }, isActive: true },
  { id: "dt-5", name: "Stress Test Results", category: "Imaging", autoFileEnabled: true, autoFileThreshold: 88, priorityWeight: 8, slaMinutes: { urgent: 120, routine: 480 }, isActive: true },
  { id: "dt-6", name: "Lab Results", category: "Lab", autoFileEnabled: true, autoFileThreshold: 92, priorityWeight: 6, slaMinutes: { urgent: 240, routine: 1440 }, isActive: true },
  { id: "dt-7", name: "Bloodwork - Troponin", category: "Lab", autoFileEnabled: true, autoFileThreshold: 90, priorityWeight: 9, slaMinutes: { urgent: 60, routine: 240 }, isActive: true },
  { id: "dt-8", name: "Bloodwork - BNP", category: "Lab", autoFileEnabled: true, autoFileThreshold: 90, priorityWeight: 8, slaMinutes: { urgent: 60, routine: 240 }, isActive: true },
  { id: "dt-9", name: "Discharge Summary", category: "Correspondence", autoFileEnabled: true, autoFileThreshold: 85, priorityWeight: 5, slaMinutes: { urgent: 240, routine: 1440 }, isActive: true },
  { id: "dt-10", name: "Consultation Report", category: "Correspondence", autoFileEnabled: true, autoFileThreshold: 88, priorityWeight: 5, slaMinutes: { urgent: 240, routine: 1440 }, isActive: true },
  { id: "dt-11", name: "CT Scan Report", category: "Imaging", autoFileEnabled: true, autoFileThreshold: 90, priorityWeight: 7, slaMinutes: { urgent: 120, routine: 480 }, isActive: true },
  { id: "dt-12", name: "MRI Report", category: "Imaging", autoFileEnabled: true, autoFileThreshold: 90, priorityWeight: 7, slaMinutes: { urgent: 120, routine: 480 }, isActive: true },
  { id: "dt-13", name: "Medication List", category: "Admin", autoFileEnabled: true, autoFileThreshold: 85, priorityWeight: 3, slaMinutes: { urgent: 480, routine: 1440 }, isActive: true },
  { id: "dt-14", name: "Admin Note", category: "Admin", autoFileEnabled: true, autoFileThreshold: 80, priorityWeight: 2, slaMinutes: { urgent: 480, routine: 1440 }, isActive: true },
  { id: "dt-15", name: "Insurance Form", category: "Admin", autoFileEnabled: false, autoFileThreshold: 85, priorityWeight: 2, slaMinutes: { urgent: 480, routine: 1440 }, isActive: true },
  { id: "dt-16", name: "Nuclear Imaging", category: "Imaging", autoFileEnabled: true, autoFileThreshold: 88, priorityWeight: 8, slaMinutes: { urgent: 120, routine: 480 }, isActive: true },
  { id: "dt-17", name: "Angiography Report", category: "Imaging", autoFileEnabled: true, autoFileThreshold: 88, priorityWeight: 9, slaMinutes: { urgent: 60, routine: 240 }, isActive: true },
];
