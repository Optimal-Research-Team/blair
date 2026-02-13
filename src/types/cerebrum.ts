/**
 * Cerebrum EMR Integration Types
 *
 * These types support document categorization, multi-patient fax splitting,
 * and export tracking for Cerebrum EMR integration.
 */

// ============================================================
// CEREBRUM DOCUMENT CATEGORIES
// ============================================================

/**
 * Cerebrum EMR folder/category for document filing.
 * Maps to Cerebrum's custom folder structure and HRM categories.
 */
export type CerebrumDocumentCategory =
  | "referrals"           // Referral / Consult Request
  | "consult-notes"       // Consultation Note / Letter
  | "hospital-reports"    // Discharge Summary, Hospital Reports
  | "ecg"                 // ECG / 12-Lead
  | "echo-reports"        // Echocardiogram Report
  | "stress-tests"        // Stress Test (Exercise/Pharmacologic)
  | "holter"              // Holter Monitor Report
  | "nuclear"             // Nuclear Imaging / MIBI
  | "ct-imaging"          // CT Angiogram / CT Aorta
  | "cath-lab"            // Cardiac Catheterization
  | "lab-results"         // Bloodwork / Labs
  | "surgery"             // Operative Report
  | "device-reports"      // Pacemaker/ICD Check
  | "correspondence"      // General Correspondence
  | "external-records";   // Prior Records from other facilities

/**
 * HRM (Health Report Manager) category for Ontario EMR integration
 */
export type HRMCategory = "MR" | "DI"; // Medical Report or Diagnostic Imaging

/**
 * Cerebrum category metadata with display information
 */
export interface CerebrumCategoryInfo {
  id: CerebrumDocumentCategory;
  label: string;
  hrmCategory: HRMCategory;
  description: string;
  icon: string; // Lucide icon name
}

/**
 * Full category definitions with metadata
 */
export const CEREBRUM_CATEGORIES: CerebrumCategoryInfo[] = [
  { id: "referrals", label: "Referrals", hrmCategory: "MR", description: "Referral and consultation requests", icon: "FileInput" },
  { id: "consult-notes", label: "Consult Notes", hrmCategory: "MR", description: "Consultation notes and letters", icon: "FileText" },
  { id: "hospital-reports", label: "Hospital Reports", hrmCategory: "MR", description: "Discharge summaries and hospital reports", icon: "Building2" },
  { id: "ecg", label: "ECG", hrmCategory: "DI", description: "12-lead ECG and rhythm strips", icon: "Activity" },
  { id: "echo-reports", label: "Echo Reports", hrmCategory: "DI", description: "Echocardiogram reports", icon: "Heart" },
  { id: "stress-tests", label: "Stress Tests", hrmCategory: "DI", description: "Exercise and pharmacologic stress tests", icon: "TrendingUp" },
  { id: "holter", label: "Holter", hrmCategory: "DI", description: "Holter monitor reports", icon: "Clock" },
  { id: "nuclear", label: "Nuclear", hrmCategory: "DI", description: "Nuclear imaging and MIBI studies", icon: "Atom" },
  { id: "ct-imaging", label: "CT Imaging", hrmCategory: "DI", description: "CT angiogram and CT aorta", icon: "Scan" },
  { id: "cath-lab", label: "Cath Lab", hrmCategory: "DI", description: "Cardiac catheterization reports", icon: "Syringe" },
  { id: "lab-results", label: "Lab Results", hrmCategory: "MR", description: "Bloodwork and laboratory results", icon: "TestTube" },
  { id: "surgery", label: "Surgery", hrmCategory: "MR", description: "Operative reports", icon: "Scissors" },
  { id: "device-reports", label: "Device Reports", hrmCategory: "DI", description: "Pacemaker and ICD checks", icon: "Cpu" },
  { id: "correspondence", label: "Correspondence", hrmCategory: "MR", description: "General correspondence", icon: "Mail" },
  { id: "external-records", label: "External Records", hrmCategory: "MR", description: "Prior records from other facilities", icon: "FolderOpen" },
];

// ============================================================
// DOCUMENT TYPE TO CATEGORY MAPPING
// ============================================================

/**
 * Maps Blair document types to Cerebrum categories
 */
export const DOCUMENT_TYPE_TO_CATEGORY: Record<string, CerebrumDocumentCategory> = {
  // Referrals
  "Referral": "referrals",
  "Referral Form": "referrals",
  "Cardiology Referral": "referrals",
  "Consultation Request": "referrals",

  // Consult Notes
  "Consultation Note": "consult-notes",
  "Consult Letter": "consult-notes",
  "Follow-up Note": "consult-notes",

  // Hospital Reports
  "Discharge Summary": "hospital-reports",
  "Hospital Report": "hospital-reports",
  "ER Report": "hospital-reports",
  "Admission Note": "hospital-reports",

  // ECG
  "ECG Report": "ecg",
  "ECG": "ecg",
  "12-Lead ECG": "ecg",
  "Rhythm Strip": "ecg",

  // Echo Reports
  "Echocardiogram Report": "echo-reports",
  "Echo Report": "echo-reports",
  "TTE Report": "echo-reports",
  "TEE Report": "echo-reports",
  "Transesophageal Echo": "echo-reports",

  // Stress Tests
  "Stress Test": "stress-tests",
  "Exercise Stress Test": "stress-tests",
  "Stress Echo": "stress-tests",
  "Pharmacologic Stress Test": "stress-tests",
  "Dobutamine Stress Echo": "stress-tests",

  // Holter
  "Holter Monitor Report": "holter",
  "Holter Report": "holter",
  "Event Monitor": "holter",
  "Loop Recorder": "holter",

  // Nuclear
  "Nuclear Stress Test": "nuclear",
  "MIBI": "nuclear",
  "Nuclear Imaging": "nuclear",
  "Myocardial Perfusion": "nuclear",
  "PET Scan": "nuclear",

  // CT Imaging
  "CT Angiogram": "ct-imaging",
  "CT Aorta": "ct-imaging",
  "CT Aorta Report": "ct-imaging",
  "Coronary CTA": "ct-imaging",
  "Calcium Score": "ct-imaging",

  // Cath Lab
  "Cardiac Catheterization": "cath-lab",
  "Cath Report": "cath-lab",
  "Angiogram": "cath-lab",
  "PCI Report": "cath-lab",

  // Lab Results
  "Bloodwork": "lab-results",
  "Lab Results": "lab-results",
  "Bloodwork - Troponin": "lab-results",
  "Bloodwork - BNP": "lab-results",
  "Bloodwork - Lipids": "lab-results",
  "Bloodwork - CBC": "lab-results",
  "INR Result": "lab-results",

  // Surgery
  "Operative Report": "surgery",
  "Surgery Report": "surgery",
  "CABG Report": "surgery",
  "Valve Surgery": "surgery",

  // Device Reports
  "Pacemaker Check": "device-reports",
  "ICD Check": "device-reports",
  "Device Interrogation": "device-reports",
  "CRT Check": "device-reports",

  // Correspondence
  "Correspondence": "correspondence",
  "Letter": "correspondence",
  "Fax Cover": "correspondence",

  // External Records
  "External Records": "external-records",
  "Prior Records": "external-records",
  "Medical Records Request": "external-records",
};

/**
 * Get the Cerebrum category for a given document type
 */
export function getCerebrumCategory(documentType: string): CerebrumDocumentCategory {
  return DOCUMENT_TYPE_TO_CATEGORY[documentType] || "correspondence";
}

/**
 * Get the category info for a given category ID
 */
export function getCerebrumCategoryInfo(categoryId: CerebrumDocumentCategory): CerebrumCategoryInfo | undefined {
  return CEREBRUM_CATEGORIES.find(c => c.id === categoryId);
}

// ============================================================
// MULTI-PATIENT FAX SPLITTING
// ============================================================

/**
 * Represents a detected segment within a multi-patient fax
 */
export interface FaxSegment {
  id: string;
  startPage: number;
  endPage: number;
  patientId?: string;
  patientName?: string;
  patientDob?: string;
  patientOhip?: string;
  documentType?: string;
  cerebrumCategory?: CerebrumDocumentCategory;
  confidence: number; // 0-100 confidence in segment detection
}

/**
 * Result of multi-patient fax analysis
 */
export interface FaxSplitAnalysis {
  faxId: string;
  isMultiPatient: boolean;
  isMultiDocument: boolean;
  segments: FaxSegment[];
  analysisConfidence: number;
  suggestedAction: "no-split" | "split-by-patient" | "split-by-document" | "manual-review";
}

// ============================================================
// CEREBRUM EXPORT TRACKING
// ============================================================

/**
 * Routing method for document export
 */
export type CerebrumRoutingMethod = "auto" | "manual";

/**
 * Export status for a document
 */
export type CerebrumExportStatus = "pending" | "exported" | "failed" | "cancelled";

/**
 * Represents a single document exported to Cerebrum EMR
 * Note: This is at the DOCUMENT level, not the FAX level
 */
export interface CerebrumExportRecord {
  id: string;

  // Source information
  sourceFaxId: string;
  sourcePages: number[]; // Which pages from the original fax

  // Patient information
  patientId: string;
  patientName: string;
  patientOhip?: string;
  patientDob?: string;

  // Document classification
  documentType: string;
  cerebrumCategory: CerebrumDocumentCategory;
  hrmCategory: HRMCategory;

  // Provider information
  originProvider: string; // Who sent the fax
  originFaxNumber: string;
  destinationInbox: string; // Which provider's inbox in Cerebrum
  destinationInboxId: string;

  // Routing information
  routingMethod: CerebrumRoutingMethod;
  routingConfidence?: number; // Only for auto-routed
  routedBy?: string; // User ID if manual
  routedByName?: string;

  // Timestamps
  receivedAt: string;
  routedAt: string;
  exportedAt?: string;

  // Status
  status: CerebrumExportStatus;
  errorMessage?: string;

  // Linked referral (if applicable)
  linkedReferralId?: string;
}

/**
 * Provider inbox in Cerebrum EMR
 */
export interface CerebrumProviderInbox {
  id: string;
  providerName: string;
  providerType: "cardiologist" | "nurse" | "admin" | "tech";
  specialty?: string;
  isDefault?: boolean;
}

/**
 * Statistics for Cerebrum export feed
 */
export interface CerebrumExportStats {
  totalDocuments: number;
  autoRouted: number;
  manuallyRouted: number;
  pendingExport: number;
  exportedToday: number;
  avgRoutingConfidence: number;
  byCategory: Record<CerebrumDocumentCategory, number>;
}
