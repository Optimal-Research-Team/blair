import { Fax, ExtractedField, FaxSegment, getCerebrumCategory } from "@/types";
import { addMinutes, subHours, subMinutes, subDays } from "date-fns";

const now = new Date();

function sla(receivedAt: Date, minutes: number): string {
  return addMinutes(receivedAt, minutes).toISOString();
}

function ago(hours: number, minutes: number = 0): Date {
  return subMinutes(subHours(now, hours), minutes);
}

function daysAgo(days: number, hours: number = 0): Date {
  return subHours(subDays(now, days), hours);
}

/**
 * Helper function to generate extracted fields for a fax page.
 * Creates realistic bounding boxes based on typical medical document layouts.
 */
function createExtractedFields(
  faxId: string,
  pageNum: number,
  patientName?: string,
  docType?: string
): ExtractedField[] {
  const fields: ExtractedField[] = [];
  const baseId = `ef-${faxId}-p${pageNum}`;

  // Only add patient fields if patient name is provided (page 1 typically has demographics)
  if (patientName && pageNum === 1) {
    fields.push({
      id: `${baseId}-name`,
      fieldType: "patient-name",
      label: "Patient Name",
      value: patientName,
      boundingBox: { x: 100, y: 140, width: 180, height: 24 },
      pageNumber: pageNum,
      confidence: 97.5 + Math.random() * 2,
    });
    fields.push({
      id: `${baseId}-dob`,
      fieldType: "patient-dob",
      label: "Date of Birth",
      value: "1955-03-15", // Mock DOB
      boundingBox: { x: 300, y: 140, width: 120, height: 24 },
      pageNumber: pageNum,
      confidence: 96.0 + Math.random() * 3,
    });
    fields.push({
      id: `${baseId}-phn`,
      fieldType: "patient-phn",
      label: "OHIP Number",
      value: "1234-567-890-AB",
      boundingBox: { x: 440, y: 140, width: 150, height: 24 },
      pageNumber: pageNum,
      confidence: 95.0 + Math.random() * 4,
    });
  }

  // Add document type field on page 1
  if (docType && pageNum === 1) {
    fields.push({
      id: `${baseId}-doctype`,
      fieldType: "document-type",
      label: "Document Type",
      value: docType,
      boundingBox: { x: 50, y: 80, width: 250, height: 30 },
      pageNumber: pageNum,
      confidence: 94.0 + Math.random() * 5,
    });
  }

  return fields;
}

export const mockFaxes: Fax[] = [
  // --- URGENT items (critical) ---
  {
    id: "fax-1", receivedAt: ago(0, 25).toISOString(), pageCount: 2, priority: "urgent",
    pages: [
      {
        id: "p1-1", pageNumber: 1, detectedDocType: "Bloodwork - Troponin", detectedPatient: "Giuseppe Romano",
        extractedFields: createExtractedFields("fax-1", 1, "Giuseppe Romano", "Bloodwork - Troponin"),
        contentDescription: `CRITICAL LAB RESULTS - IMMEDIATE ATTENTION REQUIRED

St. Michael's Hospital - Emergency Department Laboratory
2 Queen St E, Toronto, ON M5C 3G7  |  Tel: (416) 555-1802

Patient: Giuseppe Romano                    DOB: March 15, 1958
MRN: SMH-2847591                           OHIP: 4829-571-038-KL
Ordering Physician: Dr. A. Patel (ED)       Collection: Feb 12, 2026 08:45

══════════════════════════════════════════════════════════════════

                    CARDIAC BIOMARKERS - STAT

Test                    Result          Reference Range    Flag
──────────────────────────────────────────────────────────────────
Troponin I (hs)        2.4 ng/mL       < 0.04 ng/mL       ▲▲ CRIT
Troponin I (prev)      0.8 ng/mL       (6 hrs prior)      ▲▲ CRIT
CK-MB                  48 U/L          0-25 U/L           ▲ HIGH
CK Total               412 U/L         30-200 U/L         ▲ HIGH
Myoglobin              198 ng/mL       28-72 ng/mL        ▲ HIGH

──────────────────────────────────────────────────────────────────
** CRITICAL VALUE NOTIFICATION **
Troponin rising pattern consistent with acute myocardial injury.
Cardiology notified at 09:12. Serial troponins q6h ordered.
──────────────────────────────────────────────────────────────────`
      },
      {
        id: "p1-2", pageNumber: 2, detectedDocType: "Bloodwork - Troponin", extractedFields: [],
        contentDescription: `ADDITIONAL LABORATORY RESULTS

Patient: Giuseppe Romano                    MRN: SMH-2847591

COMPLETE BLOOD COUNT
──────────────────────────────────────────────────────────────────
WBC                    11.2 x10^9/L    4.5-11.0           ▲ HIGH
RBC                    4.8 x10^12/L    4.5-5.5
Hemoglobin             148 g/L         135-175
Hematocrit             0.44            0.40-0.50
Platelets              245 x10^9/L     150-400

BASIC METABOLIC PANEL
──────────────────────────────────────────────────────────────────
Sodium                 139 mmol/L      136-145
Potassium              4.2 mmol/L      3.5-5.0
Chloride               102 mmol/L      98-106
CO2                    24 mmol/L       22-29
BUN                    8.2 mmol/L      2.9-8.2
Creatinine             98 μmol/L       62-115
eGFR                   72 mL/min       >60
Glucose                7.8 mmol/L      3.9-5.5 (fasting)  ▲ HIGH

Verified by: J. Wong, MLT                   Feb 12, 2026 09:05`
      }
    ],
    senderName: "St. Michael's Hospital ED", senderFaxNumber: "4165551802", faxLineId: "line-4",
    documentType: "Bloodwork - Troponin", documentTypeConfidence: 97.2,
    patientId: "pat-10", patientName: "Giuseppe Romano", patientMatchStatus: "matched", patientMatchConfidence: 99.1,
    status: "pending-review", slaDeadline: sla(ago(0, 25), 30),
    description: "Critical Troponin I result: 2.4 ng/mL (elevated). Serial troponins pending. Patient presenting with acute chest pain.", isReferral: false,
  },
  {
    id: "fax-2", receivedAt: ago(1, 10).toISOString(), pageCount: 4, priority: "urgent",
    pages: [
      {
        id: "p2-1", pageNumber: 1,
        extractedFields: createExtractedFields("fax-2", 1, "Michael Singh", "Cardiology Referral"),
        contentDescription: `URGENT CARDIOLOGY CONSULTATION REQUEST

Toronto General Hospital - Emergency Department
200 Elizabeth St, Toronto, ON M5G 2C4
Fax: (416) 555-5002  |  Tel: (416) 555-5001

To: Sunnybrook Schulich Heart Centre         Date: Feb 12, 2026
Attn: Cardiology On-Call                     Priority: URGENT
From: Dr. Lisa Wong, FRCPC (Emergency Medicine)

══════════════════════════════════════════════════════════════════

PATIENT INFORMATION
──────────────────────────────────────────────────────────────────
Name: Michael Singh                  DOB: July 22, 1962 (Age: 63)
OHIP: 7291-483-028-MS               Phone: (416) 555-8834
Address: 142 Dundas St W, Toronto, ON M5G 1C3

REASON FOR REFERRAL: UNSTABLE ANGINA - URGENT REVASCULARIZATION

CLINICAL SUMMARY:
Mr. Singh presents with recurrent chest pain at rest over the past
48 hours. Pain is substernal, radiating to left arm, associated with
diaphoresis. Symptoms not fully relieved by NTG sublingual x3.

CARDIAC RISK FACTORS:
✓ Type 2 Diabetes (on Metformin + Gliclazide)
✓ Hypertension (on Ramipril 10mg, Amlodipine 10mg)
✓ Dyslipidemia (on Rosuvastatin 40mg)
✓ Family Hx: Father - MI age 58
✗ Current smoker (quit 5 years ago, 30 pack-year history)`
      },
      {
        id: "p2-2", pageNumber: 2, extractedFields: [],
        contentDescription: `INVESTIGATIONS - Michael Singh (cont'd)

RECENT CT CORONARY ANGIOGRAPHY (Feb 10, 2026):
══════════════════════════════════════════════════════════════════
Findings:
• LEFT MAIN: Mild calcification, no significant stenosis
• LAD: Severe (80-90%) stenosis proximal segment, moderate
       calcification, positive remodeling
• LCx: Moderate (60-70%) stenosis mid-vessel
• RCA: Severe (85%) stenosis mid-segment, heavily calcified

Agatston Calcium Score: 842 (>90th percentile for age)
LV Function: Preserved, EF estimated 50-55%

IMPRESSION: Triple vessel coronary artery disease with high-risk
features. Recommend urgent invasive angiography ± revascularization.
──────────────────────────────────────────────────────────────────

ECG FINDINGS (Today, 06:45):
• Sinus rhythm, rate 78 bpm
• Dynamic ST depression V3-V6 (1-2mm) during chest pain
• T-wave inversions in leads I, aVL (new compared to baseline)
• QTc 448ms

Serial ECGs show resolution of ST changes with pain relief but
recurrence with subsequent episodes.`
      },
      {
        id: "p2-3", pageNumber: 3, extractedFields: [],
        contentDescription: `LABORATORY RESULTS - Michael Singh (cont'd)

Collected: Feb 12, 2026 06:30

CARDIAC BIOMARKERS:
──────────────────────────────────────────────────────────────────
Troponin I (hs)      0.08 ng/mL    (< 0.04)      ▲ ELEVATED
Troponin I (repeat)  0.12 ng/mL    (4 hrs later)  ▲ RISING
BNP                  342 pg/mL     (< 100)        ▲ ELEVATED
CK-MB                18 U/L        (0-25)         Normal

CHEMISTRY:
──────────────────────────────────────────────────────────────────
Creatinine           92 μmol/L     eGFR 78 mL/min
HbA1c                7.8%          (Target < 7.0%)
LDL Cholesterol      2.4 mmol/L    (on Rosuvastatin 40mg)
Total Cholesterol    4.1 mmol/L

COAGULATION:
──────────────────────────────────────────────────────────────────
INR                  1.0
PTT                  32 sec

CURRENT MANAGEMENT IN ED:
• ASA 325mg given, now on ASA 81mg daily
• Heparin infusion initiated (target PTT 60-90)
• Metoprolol 25mg PO BID
• NTG IV prn for chest pain
• Morphine 2mg IV prn`
      },
      {
        id: "p2-4", pageNumber: 4, extractedFields: [],
        contentDescription: `CLINICAL COURSE & REQUEST - Michael Singh (cont'd)

CLINICAL COURSE:
──────────────────────────────────────────────────────────────────
Patient has had 4 episodes of chest pain in ED despite medical
management. Each episode lasts 10-15 minutes and is associated
with dynamic ECG changes. Currently chest pain-free on heparin
and NTG infusion.

Hemodynamically stable throughout:
• BP 138/82 mmHg
• HR 72 bpm regular
• O2 sat 97% on room air
• No signs of heart failure

REQUEST:
══════════════════════════════════════════════════════════════════
Given high-risk features (dynamic ECG changes, rising troponin,
triple vessel disease on CTA), we are requesting URGENT transfer
to Sunnybrook for:

1. Invasive coronary angiography
2. Consideration for percutaneous coronary intervention or
   surgical revascularization consultation

Patient and family have been counselled. They understand the
urgency and consent to transfer.

Please contact ED at (416) 555-5001 to arrange transfer.

──────────────────────────────────────────────────────────────────
Dr. Lisa Wong, MD, FRCPC
Emergency Physician, Toronto General Hospital
Pager: 416-555-8291
Signature: [Electronically signed]
Date/Time: Feb 12, 2026 08:45`
      }
    ],
    senderName: "Dr. Lisa Wong - Toronto General ED", senderFaxNumber: "4165555002", faxLineId: "line-2",
    documentType: "Cardiology Referral", documentTypeConfidence: 96.8,
    patientId: "pat-24", patientName: "Michael Singh", patientMatchStatus: "matched", patientMatchConfidence: 98.5,
    status: "in-progress", slaDeadline: sla(ago(1, 10), 30), assignedTo: "user-1", lockedBy: "user-1", lockedAt: ago(0, 15).toISOString(),
    description: "Urgent cardiology consult: Unstable angina with dynamic ECG changes. Triple vessel disease on recent CT angiogram.", isReferral: true, referralId: "ref-1",
  },

  // --- URGENT items ---
  {
    id: "fax-3", receivedAt: ago(2, 30).toISOString(), pageCount: 3, priority: "urgent",
    pages: [
      {
        id: "p3-1", pageNumber: 1, detectedDocType: "Cardiology Referral",
        extractedFields: createExtractedFields("fax-3", 1, "Jean-Luc Tremblay", "Cardiology Referral"),
        contentDescription: `CARDIOLOGY CONSULTATION REQUEST

Hamilton Family Health Team
25 Main St W, Hamilton, ON L8P 1H1
Tel: (905) 555-4001  |  Fax: (905) 555-4002

Date: February 12, 2026
To: Sunnybrook Schulich Heart Centre - Heart Failure Clinic
From: Dr. Karim Ramji, MD, CCFP

══════════════════════════════════════════════════════════════════

PATIENT DEMOGRAPHICS
──────────────────────────────────────────────────────────────────
Name: Jean-Luc Tremblay              DOB: September 3, 1952 (Age: 73)
OHIP: 5847-291-038-JL               Phone: (905) 555-7823
Address: 88 King St E, Hamilton, ON L8N 1A4

REASON FOR REFERRAL: DECOMPENSATED HEART FAILURE

URGENCY: Semi-urgent (within 1-2 weeks please)

BACKGROUND:
Mr. Tremblay is a 73-year-old gentleman with known HFrEF (EF 30%,
echo Aug 2025), ischemic cardiomyopathy s/p MI 2019, with recent
decompensation despite medication optimization.

CARDIAC HISTORY:
• Anterior STEMI (2019) - managed medically
• HFrEF diagnosed 2020, EF 30-35%
• Paroxysmal atrial fibrillation (rate controlled)
• ICD implanted 2021 for primary prevention`
      },
      {
        id: "p3-2", pageNumber: 2, extractedFields: [],
        contentDescription: `CURRENT PRESENTATION - Jean-Luc Tremblay (cont'd)

PRESENTING COMPLAINTS (past 2-3 weeks):
──────────────────────────────────────────────────────────────────
• Progressive dyspnea - now NYHA Class III (was II)
• Orthopnea - requires 3 pillows, was 1-2
• Weight gain: 5 kg in past 2 weeks
• Bilateral lower extremity edema (new)
• Reduced exercise tolerance - unable to walk one block
• No chest pain or palpitations

PHYSICAL EXAMINATION (Feb 11, 2026):
──────────────────────────────────────────────────────────────────
Vitals: BP 102/68  HR 82 (irreg irreg)  RR 22  O2 94% RA
General: Alert, mild respiratory distress at rest
JVP: Elevated to angle of jaw
CVS: S3 gallop, no murmurs
Resp: Bibasilar crackles to mid-lung fields
Abd: Soft, tender hepatomegaly (3cm below RCM)
Ext: 2+ pitting edema to knees bilaterally

CURRENT MEDICATIONS:
──────────────────────────────────────────────────────────────────
• Sacubitril/Valsartan (Entresto) 97/103mg BID
• Bisoprolol 5mg daily
• Spironolactone 25mg daily
• Furosemide 80mg BID (increased from 40mg BID last week)
• Empagliflozin 10mg daily
• Apixaban 5mg BID
• Atorvastatin 40mg daily
• ASA 81mg daily`
      },
      {
        id: "p3-3", pageNumber: 3, extractedFields: [],
        contentDescription: `INVESTIGATIONS & REQUEST - Jean-Luc Tremblay (cont'd)

RECENT INVESTIGATIONS:
══════════════════════════════════════════════════════════════════

BNP (Feb 11, 2026):     1840 pg/mL  (previous: 650 pg/mL Jan 2026)
Creatinine:             142 μmol/L  (baseline 110)  eGFR 42
Potassium:              5.1 mmol/L
Sodium:                 132 mmol/L  (mild hyponatremia)

Chest X-Ray (Feb 11): Cardiomegaly, pulmonary vascular congestion,
small bilateral pleural effusions (new)

ECG: Atrial fibrillation, rate 78, LBBB (unchanged), QRS 148ms

──────────────────────────────────────────────────────────────────

CLINICAL ASSESSMENT:
Decompensated HFrEF likely precipitated by dietary indiscretion
(patient admits to increased salt intake over holidays) and
possible medication non-compliance. No obvious new ischemia.

REQUEST:
──────────────────────────────────────────────────────────────────
1. Review by Heart Failure Clinic for optimization
2. Consider IV diuretic therapy if not improving
3. Assessment for cardiac resynchronization (CRT upgrade?)
4. Reassessment of ICD function

I will continue outpatient diuresis in the interim. Please contact
my office at (905) 555-4001 if urgent bed is available.

Thank you for your assistance with this complex patient.

Dr. Karim Ramji, MD, CCFP
Hamilton Family Health Team`
      }
    ],
    senderName: "Dr. Karim Ramji - Hamilton Family Health Team", senderFaxNumber: "9055554002", faxLineId: "line-2",
    documentType: "Cardiology Referral", documentTypeConfidence: 94.5,
    patientId: "pat-3", patientName: "Jean-Luc Tremblay", patientMatchStatus: "matched", patientMatchConfidence: 97.8,
    status: "pending-review", slaDeadline: sla(ago(2, 30), 120),
    description: "Referral for decompensated heart failure. Increasing dyspnea, weight gain 5kg in 2 weeks despite diuretic adjustment.", isReferral: true, referralId: "ref-2",
  },
  {
    id: "fax-4", receivedAt: ago(3, 0).toISOString(), pageCount: 2, priority: "urgent",
    pages: [
      {
        id: "p4-1", pageNumber: 1, detectedDocType: "ECG / EKG Report",
        extractedFields: createExtractedFields("fax-4", 1, "David Whitehorse", "ECG / EKG Report"),
        contentDescription: `12-LEAD ELECTROCARDIOGRAM REPORT

Sunnybrook Health Sciences Centre
2075 Bayview Avenue, Toronto, ON M4N 3M5
Emergency Department - Cardiac Monitoring

══════════════════════════════════════════════════════════════════

Patient: David Whitehorse            DOB: May 18, 1965 (Age: 60)
MRN: SB-3847291                      OHIP: 6291-483-571-DW
Date/Time: Feb 12, 2026 05:32        Ordering: Dr. O. Hassan (ED)

TECHNICAL DATA:
──────────────────────────────────────────────────────────────────
Ventricular Rate:      165 bpm          ▲▲ TACHYCARDIA
PR Interval:           N/A (no P waves)
QRS Duration:          156 ms           ▲ WIDE
QT/QTc:               320/530 ms        ▲ PROLONGED
P-R-T Axes:           N/A, -45°, 120°

RHYTHM ANALYSIS:
──────────────────────────────────────────────────────────────────
▪ Wide complex tachycardia
▪ Regular R-R intervals
▪ No discernible P waves
▪ QRS morphology consistent with LBBB pattern
▪ Northwest axis deviation
▪ AV dissociation suspected (capture beats noted)

INTERPRETATION:
══════════════════════════════════════════════════════════════════
** VENTRICULAR TACHYCARDIA - MONOMORPHIC **

Rate: 165 bpm, regular
QRS: Wide (156 ms), LBBB morphology with right superior axis
Findings highly suspicious for VT in patient with known
ischemic cardiomyopathy.

COMPARISON: Prior ECG (Jan 2026) showed sinus rhythm with LBBB,
rate 68 bpm. Current QRS morphology appears different from
baseline LBBB - favors VT over SVT with aberrancy.`
      },
      {
        id: "p4-2", pageNumber: 2, extractedFields: [],
        contentDescription: `ECG CLINICAL NOTES - David Whitehorse (cont'd)

CLINICAL CONTEXT:
══════════════════════════════════════════════════════════════════
60-year-old male with known:
• Ischemic cardiomyopathy (EF 25%, 2024)
• Prior anterior MI (2022)
• ICD implanted 2023 - device interrogation pending
• History of VT with prior ICD shocks (x2 in 2024)

PRESENTATION:
Patient called EMS for palpitations and lightheadedness starting
approximately 45 minutes prior to arrival. Denies chest pain,
syncope, or shortness of breath.

ED VITALS ON ARRIVAL:
──────────────────────────────────────────────────────────────────
BP: 98/62 mmHg (low)     HR: 165 bpm
RR: 22/min               O2 Sat: 96% RA
Temp: 36.8°C             GCS: 15

IMMEDIATE ACTIONS TAKEN:
──────────────────────────────────────────────────────────────────
□ IV access established x2
□ Amiodarone 150mg IV bolus given at 05:45
□ Amiodarone infusion initiated (1mg/min x 6h)
□ Device company notified for remote interrogation
□ Electrophysiology on-call paged

SUBSEQUENT ECG (06:15): Rate slowed to 88 bpm, appears to be
sinus rhythm with baseline LBBB following amiodarone.

** Requesting EP consult for device interrogation and VT management **

Electronically signed: Dr. Omar Hassan, MD, FRCPC
Emergency Medicine, Sunnybrook Health Sciences Centre
Feb 12, 2026 06:30`
      }
    ],
    senderName: "Dr. Omar Hassan - Sunnybrook ED", senderFaxNumber: "4165550002", faxLineId: "line-4",
    documentType: "ECG / EKG Report", documentTypeConfidence: 98.1,
    patientId: "pat-6", patientName: "David Whitehorse", patientMatchStatus: "matched", patientMatchConfidence: 96.3,
    status: "pending-review", slaDeadline: sla(ago(3, 0), 120),
    description: "ECG showing wide complex tachycardia. Rate 165 bpm. Patient with known cardiomyopathy and VT history.",
  },
  {
    id: "fax-5", receivedAt: ago(1, 45).toISOString(), pageCount: 5, priority: "urgent",
    pages: [
      { id: "p5-1", pageNumber: 1, extractedFields: createExtractedFields("fax-5", 1, "Victor Kozlov", "Cardiology Referral") },
      { id: "p5-2", pageNumber: 2, extractedFields: [] },
      { id: "p5-3", pageNumber: 3, extractedFields: [] },
      { id: "p5-4", pageNumber: 4, extractedFields: [] },
      { id: "p5-5", pageNumber: 5, extractedFields: [] }
    ],
    senderName: "Dr. Patrick Murphy - St. Michael's ED", senderFaxNumber: "4165551802", faxLineId: "line-2",
    documentType: "Cardiology Referral", documentTypeConfidence: 92.3,
    patientId: "pat-30", patientName: "Victor Kozlov", patientMatchStatus: "matched", patientMatchConfidence: 95.1,
    status: "flagged", slaDeadline: sla(ago(1, 45), 120),
    description: "Urgent referral: Severe aortic stenosis with syncope. AVA 0.7 cm2. Referred for TAVI assessment.", isReferral: true, referralId: "ref-3",
    notes: "Flagged: Critical valve area. Needs expedited review.",
  },
  {
    id: "fax-6", receivedAt: ago(4, 15).toISOString(), pageCount: 1, priority: "urgent",
    pages: [
      { id: "p6-1", pageNumber: 1, detectedDocType: "Bloodwork - BNP", extractedFields: createExtractedFields("fax-6", 1, "Rajesh Patel", "Bloodwork - BNP") }
    ],
    senderName: "Dynacare Laboratories", senderFaxNumber: "9055559999", faxLineId: "line-4",
    documentType: "Bloodwork - BNP", documentTypeConfidence: 95.7,
    patientId: "pat-20", patientName: "Rajesh Patel", patientMatchStatus: "matched", patientMatchConfidence: 99.2,
    status: "auto-filed", slaDeadline: sla(ago(4, 15), 60), completedAt: ago(4, 10).toISOString(),
    description: "BNP result: 1840 pg/mL (critically elevated). Previous: 650 pg/mL (Jan 2026).",
  },

  // --- ROUTINE items (majority) ---
  {
    id: "fax-7", receivedAt: ago(0, 45).toISOString(), pageCount: 3, priority: "routine",
    pages: [
      {
        id: "p7-1", pageNumber: 1,
        extractedFields: createExtractedFields("fax-7", 1, "Marie Gagnon", "Cardiology Referral"),
        contentDescription: `CARDIOLOGY REFERRAL

Pacific Family Practice
1250 Pacific Blvd, Toronto, ON M5V 1E5
Tel: (416) 555-1001  |  Fax: (416) 555-1002

Date: February 12, 2026
To: Sunnybrook Schulich Heart Centre
From: Dr. Sarah Chen, MD, CCFP

══════════════════════════════════════════════════════════════════

PATIENT INFORMATION
──────────────────────────────────────────────────────────────────
Name: Marie Gagnon                   DOB: August 22, 1967 (Age: 58)
OHIP: 8472-391-028-MG               Phone: (416) 555-2938
Address: 45 Queen St W, Unit 1204, Toronto, ON M5H 2M5

REASON FOR REFERRAL: Exertional Chest Discomfort

URGENCY: Routine (within 4-6 weeks)

══════════════════════════════════════════════════════════════════

PRESENTING COMPLAINT:
Ms. Gagnon is a 58-year-old woman presenting with a 6-week history
of chest discomfort with exertion. She describes a "pressure"
sensation in her central chest that occurs when climbing stairs
or walking uphill. Symptoms resolve within 2-3 minutes of rest.
No radiation to arm or jaw. No associated dyspnea, diaphoresis,
or nausea.

No symptoms at rest. No orthopnea or PND. No peripheral edema.
No palpitations or syncope.

FUNCTIONAL STATUS:
Can walk 2-3 blocks on flat ground without symptoms. Limited by
chest discomfort when climbing 2 flights of stairs.`
      },
      {
        id: "p7-2", pageNumber: 2, extractedFields: [],
        contentDescription: `CARDIOLOGY REFERRAL - Marie Gagnon (cont'd)

CARDIAC RISK FACTORS:
──────────────────────────────────────────────────────────────────
✓ Hypertension (diagnosed 2018, well-controlled)
✓ Dyslipidemia (on Atorvastatin)
✓ Postmenopausal (age 52, no HRT)
✓ Family history: Mother - MI age 65
✗ Diabetes (FBS 5.2, HbA1c 5.6%)
✗ Current smoker (never smoked)
✗ Obesity (BMI 26.2)

PAST MEDICAL HISTORY:
──────────────────────────────────────────────────────────────────
• Hypertension (2018)
• Osteoarthritis bilateral knees
• GERD (well-controlled on PPI)
• No prior cardiac history
• No prior cardiac testing

SURGICAL HISTORY:
• Laparoscopic cholecystectomy (2015)
• Arthroscopic knee surgery (2020)

CURRENT MEDICATIONS:
──────────────────────────────────────────────────────────────────
• Amlodipine 5mg daily
• Atorvastatin 20mg daily
• Pantoprazole 40mg daily
• Calcium + Vitamin D supplement

ALLERGIES: NKDA

SOCIAL HISTORY:
Non-smoker, occasional alcohol (1-2 glasses wine/week)
Retired teacher, lives with husband
Moderate activity level prior to symptom onset`
      },
      {
        id: "p7-3", pageNumber: 3, extractedFields: [],
        contentDescription: `CARDIOLOGY REFERRAL - Marie Gagnon (cont'd)

PHYSICAL EXAMINATION (Feb 10, 2026):
══════════════════════════════════════════════════════════════════
Vitals: BP 128/78 (controlled)  HR 72 regular  BMI 26.2
General: Well-appearing, no distress
CVS: S1 S2 normal, no murmurs, rubs, or gallops
     JVP not elevated
     Peripheral pulses 2+ and symmetric
Resp: Clear to auscultation bilaterally
Abd: Soft, non-tender
Ext: No peripheral edema, no cyanosis

INVESTIGATIONS:
──────────────────────────────────────────────────────────────────
ECG (Feb 10, 2026):
• Normal sinus rhythm, rate 68 bpm
• Normal axis, PR 168ms, QRS 86ms
• No ST-T changes, no Q waves

Bloodwork (Feb 8, 2026):
• CBC: Normal
• Creatinine: 72 μmol/L (eGFR >90)
• Fasting glucose: 5.2 mmol/L
• Lipids: TC 4.8, LDL 2.2, HDL 1.6, TG 1.2
• TSH: 2.1 mIU/L

──────────────────────────────────────────────────────────────────

CLINICAL ASSESSMENT:
58-year-old woman with new-onset typical anginal symptoms. Given
her risk factor profile (HTN, dyslipidemia, family history, post-
menopausal), I am concerned about possible coronary artery disease.

REQUEST:
• Cardiology assessment
• Consideration for stress testing (exercise or pharmacologic)

Thank you for seeing this patient.

Dr. Sarah Chen, MD, CCFP
Pacific Family Practice
Tel: (416) 555-1001`
      }
    ],
    senderName: "Dr. Sarah Chen - Pacific Family Practice", senderFaxNumber: "4165551002", faxLineId: "line-2",
    documentType: "Cardiology Referral", documentTypeConfidence: 96.1,
    patientId: "pat-21", patientName: "Marie Gagnon", patientMatchStatus: "matched", patientMatchConfidence: 97.5,
    status: "pending-review", slaDeadline: sla(ago(0, 45), 480),
    description: "Referral for chest pain on exertion. 58-year-old female with no prior cardiac history. Stress test recommended.", isReferral: true, referralId: "ref-4",
  },
  {
    id: "fax-8", receivedAt: ago(1, 30).toISOString(), pageCount: 2, priority: "routine",
    pages: [
      {
        id: "p8-1", pageNumber: 1, detectedDocType: "ECG / EKG Report",
        extractedFields: createExtractedFields("fax-8", 1, "Margaret Thompson", "ECG / EKG Report"),
        contentDescription: `12-LEAD ELECTROCARDIOGRAM

Sunnybrook Schulich Heart Centre
Cardiac Diagnostics Laboratory

══════════════════════════════════════════════════════════════════
Patient: Margaret Thompson           DOB: November 28, 1948 (Age: 77)
MRN: SUN-1928374                     OHIP: 3847-192-847-MT
Date/Time: Feb 12, 2026 08:15        Technician: S. Patel, RCT
Ordering: Dr. J. Singh (Cardiology)  Indication: AF monitoring

TECHNICAL PARAMETERS:
──────────────────────────────────────────────────────────────────
Ventricular Rate:      72 bpm           Normal
PR Interval:           N/A (AF)
QRS Duration:          94 ms            Normal
QT/QTc:               382/418 ms        Normal
P-R-T Axes:           N/A, 35°, 48°

AUTOMATED INTERPRETATION:
──────────────────────────────────────────────────────────────────
• Atrial fibrillation with controlled ventricular response
• Normal QRS axis
• No significant ST-T wave abnormalities
• No evidence of acute ischemia

COMPARISON:
Previous ECG (Dec 2025): Atrial fibrillation, rate 84 bpm
Current rate better controlled on increased Bisoprolol

══════════════════════════════════════════════════════════════════
CONFIRMED BY: Dr. A. Patel, MD, FRCPC (Cardiology)
Interpretation: Atrial fibrillation, rate controlled.
No acute changes. Rhythm consistent with known paroxysmal AF
now in persistent phase. Continue current anticoagulation and
rate control strategy.`
      },
      {
        id: "p8-2", pageNumber: 2, extractedFields: [],
        contentDescription: `[ECG RHYTHM STRIP - PAGE 2]

Margaret Thompson - MRN: SUN-1928374

CONTINUOUS RHYTHM STRIP (Lead II) - 10 seconds

    ┌─────────────────────────────────────────────────────────────┐
    │  Atrial Fibrillation - Irregularly irregular rhythm        │
    │  Average rate: 72 bpm (range 64-82 bpm)                    │
    │  No pauses > 2.0 seconds                                    │
    │  No ventricular ectopy noted                                │
    └─────────────────────────────────────────────────────────────┘

CLINICAL NOTES:
──────────────────────────────────────────────────────────────────
Patient presents for routine AF monitoring. Currently asymptomatic.
No palpitations, dyspnea, or chest discomfort reported.

Current Medications for AF:
• Bisoprolol 7.5mg daily (rate control)
• Apixaban 5mg BID (anticoagulation)
• Digoxin 0.125mg daily (added recently)

CHA₂DS₂-VASc Score: 4 (Female, Age >75, HTN, Vascular disease)
HAS-BLED Score: 2 (Age, Medications)

PLAN:
Continue current management. Follow-up in Heart Rhythm Clinic
in 3 months. Patient counselled on stroke prevention and
importance of medication compliance.

──────────────────────────────────────────────────────────────────
Copy to: Dr. R. Goldstein (Family Physician)
         145 Bathurst St, Toronto, ON`
      }
    ],
    senderName: "Sunnybrook Schulich Heart Centre", senderFaxNumber: "4165550002", faxLineId: "line-4",
    documentType: "ECG / EKG Report", documentTypeConfidence: 98.8,
    patientId: "pat-1", patientName: "Margaret Thompson", patientMatchStatus: "matched", patientMatchConfidence: 99.5,
    status: "auto-filed", slaDeadline: sla(ago(1, 30), 480), completedAt: ago(1, 28).toISOString(),
    description: "Routine 12-lead ECG. Atrial fibrillation with controlled ventricular rate. Rate 72 bpm. No acute changes.",
  },
  {
    id: "fax-9", receivedAt: ago(2, 0).toISOString(), pageCount: 4, priority: "routine",
    pages: [
      { id: "p9-1", pageNumber: 1, extractedFields: createExtractedFields("fax-9", 1, undefined, "Cardiology Referral") },
      { id: "p9-2", pageNumber: 2, extractedFields: [] },
      { id: "p9-3", pageNumber: 3, extractedFields: [] },
      { id: "p9-4", pageNumber: 4, extractedFields: [] }
    ],
    senderName: "Dr. James MacLeod - Dundas Medical Centre", senderFaxNumber: "9055552002", faxLineId: "line-2",
    documentType: "Cardiology Referral", documentTypeConfidence: 91.2,
    patientName: "Unknown Patient", patientMatchStatus: "not-found",
    status: "pending-review", slaDeadline: sla(ago(2, 0), 480),
    description: "Referral for cardiology consultation. Patient demographics partially illegible on fax.", isReferral: true, referralId: "ref-5",
  },
  {
    id: "fax-10", receivedAt: ago(2, 45).toISOString(), pageCount: 6, priority: "routine",
    pages: [
      { id: "p10-1", pageNumber: 1, extractedFields: createExtractedFields("fax-10", 1, "Oluwaseun Adeyemi", "Cardiology Referral") },
      { id: "p10-2", pageNumber: 2, extractedFields: [] },
      { id: "p10-3", pageNumber: 3, extractedFields: [] },
      { id: "p10-4", pageNumber: 4, extractedFields: [] },
      { id: "p10-5", pageNumber: 5, extractedFields: [] },
      { id: "p10-6", pageNumber: 6, extractedFields: [] }
    ],
    senderName: "Dr. Deepak Gupta - Brampton Internal Medicine", senderFaxNumber: "9055551202", faxLineId: "line-2",
    documentType: "Cardiology Referral", documentTypeConfidence: 93.7,
    patientId: "pat-5", patientName: "Oluwaseun Adeyemi", patientMatchStatus: "matched", patientMatchConfidence: 96.8,
    status: "in-progress", slaDeadline: sla(ago(2, 45), 480), assignedTo: "user-4",
    description: "Referral for aortic stenosis assessment. Progressive dyspnea over 6 months. Echo showing AVA 1.1 cm2.", isReferral: true, referralId: "ref-6",
  },
  {
    id: "fax-11", receivedAt: ago(3, 15).toISOString(), pageCount: 2, priority: "routine",
    pages: [
      {
        id: "p11-1", pageNumber: 1,
        extractedFields: createExtractedFields("fax-11", 1, "Harjit Dhaliwal", "Lab Results"),
        contentDescription: `LABORATORY REPORT

╔══════════════════════════════════════════════════════════════════╗
║  DYNACARE LABORATORIES                                           ║
║  3100 Steeles Ave E, Markham, ON L3R 8T3                        ║
║  Tel: 1-800-565-5721  |  Fax: (905) 555-9999                    ║
╚══════════════════════════════════════════════════════════════════╝

PATIENT: Harjit Dhaliwal             DOB: February 14, 1958
OHIP: 2847-193-482-HD                Requisition: DYN-2026-482913
Collection Date: Feb 11, 2026 07:45  Report Date: Feb 12, 2026
Ordering Physician: Dr. R. Goldstein  Copy to: Sunnybrook Cardiology

══════════════════════════════════════════════════════════════════

LIPID PANEL (Fasting)
──────────────────────────────────────────────────────────────────
Test                    Result      Reference      Flag
──────────────────────────────────────────────────────────────────
Total Cholesterol       4.2 mmol/L  < 5.2
LDL Cholesterol         1.8 mmol/L  < 2.0         Optimal
HDL Cholesterol         1.4 mmol/L  > 1.0
Triglycerides          1.6 mmol/L  < 1.7
Non-HDL Cholesterol    2.8 mmol/L  < 2.6         Borderline
TC/HDL Ratio           3.0         < 4.0

Note: Patient on Atorvastatin 40mg. LDL at target for secondary
prevention.

COMPLETE BLOOD COUNT
──────────────────────────────────────────────────────────────────
WBC                    6.8 x10^9/L   4.5-11.0
RBC                    4.9 x10^12/L  4.5-5.5
Hemoglobin            152 g/L        135-175
Hematocrit            0.45           0.40-0.50
MCV                   92 fL          80-100
Platelets             218 x10^9/L    150-400`
      },
      {
        id: "p11-2", pageNumber: 2, extractedFields: [],
        contentDescription: `LABORATORY REPORT - Harjit Dhaliwal (cont'd)

RENAL FUNCTION
──────────────────────────────────────────────────────────────────
Test                    Result      Reference      Flag
──────────────────────────────────────────────────────────────────
Creatinine             98 μmol/L    62-115
eGFR                   74 mL/min    > 60
BUN                    6.2 mmol/L   2.9-8.2

ELECTROLYTES
──────────────────────────────────────────────────────────────────
Sodium                 140 mmol/L   136-145
Potassium              4.4 mmol/L   3.5-5.0
Chloride               103 mmol/L   98-106
CO2                    25 mmol/L    22-29

LIVER FUNCTION
──────────────────────────────────────────────────────────────────
ALT                    28 U/L       10-40
AST                    24 U/L       10-35
ALP                    68 U/L       40-130
Bilirubin (Total)      12 μmol/L    < 21

Note: Liver enzymes normal - no statin-related hepatotoxicity.

THYROID FUNCTION
──────────────────────────────────────────────────────────────────
TSH                    2.4 mIU/L    0.4-4.0

══════════════════════════════════════════════════════════════════

SUMMARY: All results within normal limits.
LDL cholesterol well-controlled on current statin therapy.
Renal function stable (eGFR 74, appropriate for age).

──────────────────────────────────────────────────────────────────
Verified by: M. Johnson, MLT
Report generated: Feb 12, 2026 06:15

*** END OF REPORT ***`
      }
    ],
    senderName: "Dynacare Laboratories", senderFaxNumber: "9055559999", faxLineId: "line-4",
    documentType: "Lab Results", documentTypeConfidence: 97.3,
    patientId: "pat-2", patientName: "Harjit Dhaliwal", patientMatchStatus: "matched", patientMatchConfidence: 98.9,
    status: "auto-filed", slaDeadline: sla(ago(3, 15), 1440), completedAt: ago(3, 12).toISOString(),
    description: "Routine bloodwork: Lipid panel, CBC, electrolytes, creatinine. All within normal limits.",
  },
  {
    id: "fax-12", receivedAt: ago(3, 45).toISOString(), pageCount: 3, priority: "routine",
    pages: [
      {
        id: "p12-1", pageNumber: 1, detectedDocType: "Echocardiogram Report",
        extractedFields: createExtractedFields("fax-12", 1, "Fatima Hassan", "Echocardiogram Report"),
        contentDescription: `TRANSTHORACIC ECHOCARDIOGRAM REPORT

Sunnybrook Schulich Heart Centre
Cardiac Imaging Laboratory
2075 Bayview Avenue, Toronto, ON M4N 3M5

══════════════════════════════════════════════════════════════════

Patient: Fatima Hassan               DOB: April 12, 1970 (Age: 55)
MRN: SUN-4829173                     OHIP: 7382-918-472-FH
Study Date: Feb 11, 2026             Study #: ECHO-2026-4829
Referring: Dr. M. Cohen (Cardiology) Indication: HCM surveillance

Sonographer: T. Williams, RDCS       Reviewed by: Dr. S. Kim, MD

══════════════════════════════════════════════════════════════════

LEFT VENTRICLE:
──────────────────────────────────────────────────────────────────
LV Internal Diameter (diastole):     42 mm        (37-53)
LV Internal Diameter (systole):      26 mm        (22-35)
Interventricular Septum (IVSd):      18 mm        ▲ (7-11)
Posterior Wall (PWd):                11 mm        (7-11)
LV Ejection Fraction (Biplane):      65%          (54-74)
LV Mass Index:                       142 g/m²     ▲ (44-88)

REGIONAL WALL MOTION:
All segments normal contractility. No regional wall motion
abnormalities identified.

FINDING: Asymmetric septal hypertrophy, consistent with
hypertrophic cardiomyopathy (HCM)`
      },
      {
        id: "p12-2", pageNumber: 2, extractedFields: [],
        contentDescription: `ECHOCARDIOGRAM REPORT - Fatima Hassan (cont'd)

LEFT VENTRICULAR OUTFLOW TRACT (LVOT):
══════════════════════════════════════════════════════════════════
LVOT Diameter:                       20 mm
Peak LVOT Velocity (rest):           2.9 m/s
Peak LVOT Gradient (rest):           35 mmHg      ▲ (< 30)
Mean LVOT Gradient (rest):           18 mmHg

** SYSTOLIC ANTERIOR MOTION (SAM) OF MITRAL VALVE PRESENT **
SAM-septal contact present in mid-systole

Post-Valsalva:
Peak LVOT Gradient:                  52 mmHg      ▲
(Gradient provoked with Valsalva maneuver)

──────────────────────────────────────────────────────────────────

MITRAL VALVE:
──────────────────────────────────────────────────────────────────
Mitral Valve:                        Structurally normal
Mitral Regurgitation:                Mild-to-moderate (2+)
                                     Posteriorly-directed jet
                                     (SAM-related MR)
MV E velocity:                       0.9 m/s
MV A velocity:                       0.7 m/s
E/A ratio:                           1.3
Deceleration time:                   180 ms
E/e' (lateral):                      12

DIASTOLIC FUNCTION: Grade I diastolic dysfunction`
      },
      {
        id: "p12-3", pageNumber: 3, extractedFields: [],
        contentDescription: `ECHOCARDIOGRAM REPORT - Fatima Hassan (cont'd)

RIGHT VENTRICLE:
──────────────────────────────────────────────────────────────────
RV Size:                             Normal
RV Systolic Function:                Normal (TAPSE 22mm)
Estimated RA Pressure:               5 mmHg (IVC 18mm, >50% collapse)

AORTIC VALVE:
──────────────────────────────────────────────────────────────────
Aortic Valve:                        Trileaflet, normal
Aortic Regurgitation:                Trace
Peak Aortic Velocity:                1.3 m/s (normal)
Aortic Root:                         32 mm (normal)

PERICARDIUM:
──────────────────────────────────────────────────────────────────
No pericardial effusion.

══════════════════════════════════════════════════════════════════

IMPRESSION:
1. Hypertrophic cardiomyopathy with asymmetric septal hypertrophy
   (IVS 18mm)
2. Systolic anterior motion (SAM) of mitral valve leaflet
3. Resting LVOT gradient 35 mmHg, increasing to 52 mmHg with
   Valsalva (obstructive physiology)
4. Mild-moderate mitral regurgitation secondary to SAM
5. Preserved LV systolic function (EF 65%)
6. Grade I diastolic dysfunction

COMPARISON: Previous echo (Feb 2025) showed similar findings.
LVOT gradient was 28 mmHg at rest (slight increase).

RECOMMENDATIONS:
• Continue current medical therapy
• Avoid dehydration and strenuous exertion
• Consider Holter monitor for arrhythmia surveillance
• Follow-up echo in 12 months or sooner if symptomatic

──────────────────────────────────────────────────────────────────
Electronically signed: Dr. Sandra Kim, MD, FRCPC
Cardiac Imaging, Sunnybrook Schulich Heart Centre`
      }
    ],
    senderName: "Sunnybrook Schulich Heart Centre", senderFaxNumber: "4165550002", faxLineId: "line-4",
    documentType: "Echocardiogram Report", documentTypeConfidence: 96.5,
    patientId: "pat-7", patientName: "Fatima Hassan", patientMatchStatus: "matched", patientMatchConfidence: 98.7,
    status: "auto-filed", slaDeadline: sla(ago(3, 45), 480), completedAt: ago(3, 42).toISOString(),
    description: "Echocardiogram: Asymmetric septal hypertrophy (18mm). LVEF 65%. SAM of mitral valve. LVOT gradient 35mmHg at rest.",
  },
  {
    id: "fax-13", receivedAt: ago(4, 30).toISOString(), pageCount: 1, priority: "routine",
    pages: [
      { id: "p13-1", pageNumber: 1, detectedDocType: "Lab Results", extractedFields: createExtractedFields("fax-13", 1, "Mohammed Al-Rashid", "Lab Results") }
    ],
    senderName: "LifeLabs", senderFaxNumber: "4165559876", faxLineId: "line-4",
    documentType: "Lab Results", documentTypeConfidence: 96.1,
    patientId: "pat-12", patientName: "Mohammed Al-Rashid", patientMatchStatus: "matched", patientMatchConfidence: 97.4,
    status: "auto-filed", slaDeadline: sla(ago(4, 30), 1440), completedAt: ago(4, 27).toISOString(),
    description: "INR result: 1.1 (subtherapeutic for patient not on anticoagulation). Renal panel stable.",
  },
  {
    id: "fax-14", receivedAt: ago(5, 0).toISOString(), pageCount: 8, priority: "routine",
    pages: [
      { id: "p14-1", pageNumber: 1, extractedFields: createExtractedFields("fax-14", 1, "George Papadopoulos", "Discharge Summary") },
      { id: "p14-2", pageNumber: 2, extractedFields: [] },
      { id: "p14-3", pageNumber: 3, extractedFields: [] },
      { id: "p14-4", pageNumber: 4, extractedFields: [] },
      { id: "p14-5", pageNumber: 5, extractedFields: [] },
      { id: "p14-6", pageNumber: 6, extractedFields: [] },
      { id: "p14-7", pageNumber: 7, extractedFields: [] },
      { id: "p14-8", pageNumber: 8, extractedFields: [] }
    ],
    senderName: "Hamilton Health Sciences", senderFaxNumber: "9055552002", faxLineId: "line-1",
    documentType: "Discharge Summary", documentTypeConfidence: 94.2,
    patientId: "pat-28", patientName: "George Papadopoulos", patientMatchStatus: "matched", patientMatchConfidence: 99.0,
    status: "auto-filed", slaDeadline: sla(ago(5, 0), 1440), completedAt: ago(4, 55).toISOString(),
    description: "Discharge summary post-CABG x3 (Jan 2026). Uncomplicated recovery. Follow-up in 6 weeks.",
  },
  {
    id: "fax-15", receivedAt: ago(5, 30).toISOString(), pageCount: 2, priority: "routine",
    pages: [
      { id: "p15-1", pageNumber: 1, detectedDocType: "Stress Test Results", extractedFields: createExtractedFields("fax-15", 1, "William Campbell", "Stress Test Results") },
      { id: "p15-2", pageNumber: 2, extractedFields: [] }
    ],
    senderName: "Sunnybrook Schulich Heart Centre", senderFaxNumber: "4165550002", faxLineId: "line-4",
    documentType: "Stress Test Results", documentTypeConfidence: 95.3,
    patientId: "pat-16", patientName: "William Campbell", patientMatchStatus: "matched", patientMatchConfidence: 97.9,
    status: "completed", slaDeadline: sla(ago(5, 30), 480), completedAt: ago(5, 0).toISOString(), assignedTo: "user-3",
    description: "Exercise stress test: Achieved 85% MPHR. No ischemic changes. Normal BP response. Duke score +5 (low risk).",
  },
  {
    id: "fax-16", receivedAt: ago(6, 0).toISOString(), pageCount: 4, priority: "routine",
    pages: [
      { id: "p16-1", pageNumber: 1, extractedFields: createExtractedFields("fax-16", 1, "Anya Kowalski", "Cardiology Referral") },
      { id: "p16-2", pageNumber: 2, extractedFields: [] },
      { id: "p16-3", pageNumber: 3, extractedFields: [] },
      { id: "p16-4", pageNumber: 4, extractedFields: [] }
    ],
    senderName: "Dr. Priya Kapoor - Burnaby Medical Centre", senderFaxNumber: "4165553002", faxLineId: "line-2",
    documentType: "Cardiology Referral", documentTypeConfidence: 89.4,
    patientId: "pat-11", patientName: "Anya Kowalski", patientMatchStatus: "matched", patientMatchConfidence: 94.2,
    status: "completed", slaDeadline: sla(ago(6, 0), 480), completedAt: ago(5, 15).toISOString(), assignedTo: "user-4",
    description: "Referral for syncope workup. Two episodes in past month. No prodrome. ECG showed sinus bradycardia.", isReferral: true, referralId: "ref-7",
  },
  {
    id: "fax-17", receivedAt: ago(6, 30).toISOString(), pageCount: 3, priority: "routine",
    pages: [
      {
        id: "p17-1", pageNumber: 1, detectedDocType: "Holter Monitor Report",
        extractedFields: createExtractedFields("fax-17", 1, "Sofia Petrov", "Holter Monitor Report"),
        contentDescription: `24-HOUR HOLTER MONITOR REPORT

Sunnybrook Schulich Heart Centre
Cardiac Rhythm Monitoring Laboratory

══════════════════════════════════════════════════════════════════

Patient: Sofia Petrov                DOB: June 5, 1982 (Age: 43)
MRN: SUN-6839201                     OHIP: 4928-371-829-SP
Recording Dates: Feb 10-11, 2026     Study #: HOLTER-2026-3829
Referring: Dr. P. Kumar (FP)         Indication: Palpitations

Monitor Type: 3-channel digital Holter
Recording Duration: 23 hours 48 minutes (99.2% analyzable)

══════════════════════════════════════════════════════════════════

HEART RATE SUMMARY:
──────────────────────────────────────────────────────────────────
Minimum Heart Rate:      52 bpm     (02:34 AM - sleeping)
Maximum Heart Rate:      178 bpm    ▲ (03:45 PM - SVT episode)
Average Heart Rate:      72 bpm     Normal

RHYTHM SUMMARY:
──────────────────────────────────────────────────────────────────
Predominant Rhythm:      Sinus rhythm (98.2%)
Supraventricular Ectopy: 847 PACs (0.7% of beats)
                         3 episodes SVT
Ventricular Ectopy:      23 PVCs (< 0.1% of beats)
                         No VT episodes
Pauses:                  1 pause > 2.0 sec (2.1 sec, 03:22 AM)

ATRIAL ARRHYTHMIAS:
══════════════════════════════════════════════════════════════════
PACs:                    847 total (35/hour average)
Couplets:                12 atrial couplets
Runs of SVT:             3 episodes

SVT Episode Details:
  #1: 03:45 PM  |  Duration: 45 sec  |  Rate: 168-178 bpm
  #2: 06:12 PM  |  Duration: 12 sec  |  Rate: 155-162 bpm
  #3: 11:48 PM  |  Duration: 8 sec   |  Rate: 148-158 bpm`
      },
      {
        id: "p17-2", pageNumber: 2, extractedFields: [],
        contentDescription: `HOLTER MONITOR REPORT - Sofia Petrov (cont'd)

VENTRICULAR ARRHYTHMIAS:
══════════════════════════════════════════════════════════════════
PVCs:                    23 total (< 1/hour average)
Morphology:              Unifocal, LBBB pattern
Couplets:                0
Runs of VT:              None
R-on-T phenomenon:       None

HEART RATE VARIABILITY:
──────────────────────────────────────────────────────────────────
SDNN:                    142 ms    (Normal > 100 ms)
RMSSD:                   38 ms     (Normal)

ST SEGMENT ANALYSIS:
──────────────────────────────────────────────────────────────────
No significant ST depression or elevation detected.
No evidence of ischemic changes during monitoring period.

PATIENT DIARY CORRELATION:
══════════════════════════════════════════════════════════════════
Time          Symptom             ECG Finding
──────────────────────────────────────────────────────────────────
03:45 PM      Palpitations        SVT episode (45 sec) ← CORRELATED
              "Racing heart"
06:10 PM      Palpitations        SVT episode (12 sec) ← CORRELATED
08:30 PM      Dizziness           Sinus rhythm, rate 68
              (no correlation)
11:48 PM      "Fluttering"        SVT episode (8 sec) ← CORRELATED`
      },
      {
        id: "p17-3", pageNumber: 3, extractedFields: [],
        contentDescription: `HOLTER MONITOR REPORT - Sofia Petrov (cont'd)

HOURLY HEART RATE TRENDS:
══════════════════════════════════════════════════════════════════
Hour    Min   Avg   Max   PACs  PVCs  Events
────────────────────────────────────────────────────────────────
12 PM   58    74    92    28    2     -
01 PM   62    78    95    31    1     -
02 PM   64    82    98    42    0     -
03 PM   68    88    178   58    3     SVT #1
04 PM   60    76    94    38    1     -
05 PM   56    72    88    32    2     -
06 PM   58    80    162   45    1     SVT #2
07 PM   54    68    82    28    2     -
... (continued overnight)
11 PM   52    64    158   35    1     SVT #3
────────────────────────────────────────────────────────────────

══════════════════════════════════════════════════════════════════

IMPRESSION:
1. Sinus rhythm throughout majority of recording
2. Three episodes of supraventricular tachycardia (SVT)
   - Longest episode 45 seconds, rate up to 178 bpm
   - All episodes symptom-correlated per patient diary
3. Frequent PACs (847/24h) - may represent trigger for SVT
4. Rare PVCs, no ventricular tachycardia
5. One pause 2.1 seconds during sleep (likely physiologic)
6. No ST segment changes suggestive of ischemia

RECOMMENDATIONS:
• Consider electrophysiology consultation for SVT evaluation
• Trial of beta-blocker for symptom control
• Vagal maneuvers education provided
• Return if symptoms worsen or syncope occurs

──────────────────────────────────────────────────────────────────
Interpreted by: Dr. N. Sharma, MD, FRCPC
Cardiac Electrophysiology, Sunnybrook Health Sciences Centre
Feb 12, 2026`
      }
    ],
    senderName: "Sunnybrook Schulich Heart Centre", senderFaxNumber: "4165550002", faxLineId: "line-4",
    documentType: "Holter Monitor Report", documentTypeConfidence: 97.6,
    patientId: "pat-15", patientName: "Sofia Petrov", patientMatchStatus: "matched", patientMatchConfidence: 98.1,
    status: "auto-filed", slaDeadline: sla(ago(6, 30), 1440), completedAt: ago(6, 27).toISOString(),
    description: "24-hour Holter: 3 episodes of SVT, longest 45 seconds. Max HR 178 bpm. Average HR 72 bpm.",
  },
  {
    id: "fax-18", receivedAt: ago(7, 0).toISOString(), pageCount: 1, priority: "routine",
    pages: [
      { id: "p18-1", pageNumber: 1, detectedDocType: "Admin Note", extractedFields: createExtractedFields("fax-18", 1, "Catherine Beaumont", "Admin Note") }
    ],
    senderName: "Dr. Rebecca Goldstein - Bathurst Family Health Centre", senderFaxNumber: "4165559002", faxLineId: "line-1",
    documentType: "Admin Note", documentTypeConfidence: 82.3,
    patientId: "pat-19", patientName: "Catherine Beaumont", patientMatchStatus: "matched", patientMatchConfidence: 95.6,
    status: "auto-filed", slaDeadline: sla(ago(7, 0), 1440), completedAt: ago(6, 55).toISOString(),
    description: "INR management transfer request. Patient relocating to Toronto. Current INR target 2.0-3.0.",
  },
  {
    id: "fax-19", receivedAt: ago(8, 0).toISOString(), pageCount: 5, priority: "routine",
    pages: [
      { id: "p19-1", pageNumber: 1, extractedFields: createExtractedFields("fax-19", 1, "Ahmed Ibrahim", "Cardiology Referral") },
      { id: "p19-2", pageNumber: 2, extractedFields: [] },
      { id: "p19-3", pageNumber: 3, extractedFields: [] },
      { id: "p19-4", pageNumber: 4, extractedFields: [] },
      { id: "p19-5", pageNumber: 5, extractedFields: [] }
    ],
    senderName: "Dr. Michael O'Sullivan - Riverside Family Practice", senderFaxNumber: "4165556002", faxLineId: "line-2",
    documentType: "Cardiology Referral", documentTypeConfidence: 93.8,
    patientId: "pat-26", patientName: "Ahmed Ibrahim", patientMatchStatus: "matched", patientMatchConfidence: 96.7,
    status: "completed", slaDeadline: sla(ago(8, 0), 480), completedAt: ago(7, 0).toISOString(), assignedTo: "user-3",
    description: "Referral for bicuspid aortic valve monitoring. Aortic root 4.2cm on last echo. Annual surveillance.", isReferral: true, referralId: "ref-8",
  },
  {
    id: "fax-20", receivedAt: ago(0, 10).toISOString(), pageCount: 2, priority: "routine",
    pages: [
      { id: "p20-1", pageNumber: 1, detectedDocType: "ECG / EKG Report", extractedFields: createExtractedFields("fax-20", 1, "Thomas Kim", "ECG / EKG Report") },
      { id: "p20-2", pageNumber: 2, extractedFields: [] }
    ],
    senderName: "Dr. Andrew Kim - Scarborough Medical Associates", senderFaxNumber: "4165551402", faxLineId: "line-4",
    documentType: "ECG / EKG Report", documentTypeConfidence: 97.9,
    patientId: "pat-18", patientName: "Thomas Kim", patientMatchStatus: "matched", patientMatchConfidence: 98.3,
    status: "auto-filed", slaDeadline: sla(ago(0, 10), 480), completedAt: ago(0, 8).toISOString(),
    description: "Routine ECG for Long QT monitoring. QTc 460ms (borderline). Sinus rhythm. No arrhythmia.",
  },
  {
    id: "fax-21", receivedAt: ago(9, 0).toISOString(), pageCount: 2, priority: "routine",
    pages: [
      { id: "p21-1", pageNumber: 1, detectedDocType: "CT Scan Report", extractedFields: createExtractedFields("fax-21", 1, "Susan Martinez", "CT Scan Report") },
      { id: "p21-2", pageNumber: 2, extractedFields: [] }
    ],
    senderName: "Toronto General Hospital Radiology", senderFaxNumber: "4165555555", faxLineId: "line-4",
    documentType: "CT Scan Report", documentTypeConfidence: 95.4,
    patientId: "pat-27", patientName: "Susan Martinez", patientMatchStatus: "matched", patientMatchConfidence: 97.2,
    status: "auto-filed", slaDeadline: sla(ago(9, 0), 480), completedAt: ago(8, 55).toISOString(),
    description: "CT pulmonary angiography: No residual PE. Resolution of previously noted bilateral emboli.",
  },
  {
    id: "fax-22", receivedAt: daysAgo(1, 2).toISOString(), pageCount: 3, priority: "routine",
    pages: [
      { id: "p22-1", pageNumber: 1, extractedFields: createExtractedFields("fax-22", 1, "Robert MacLeod", "Consultation Report") },
      { id: "p22-2", pageNumber: 2, extractedFields: [] },
      { id: "p22-3", pageNumber: 3, extractedFields: [] }
    ],
    senderName: "Dr. Natasha Volkov - Vaughan Internal Med Group", senderFaxNumber: "9055551502", faxLineId: "line-2",
    documentType: "Consultation Report", documentTypeConfidence: 91.6,
    patientId: "pat-8", patientName: "Robert MacLeod", patientMatchStatus: "matched", patientMatchConfidence: 96.4,
    status: "completed", slaDeadline: sla(daysAgo(1, 2), 1440), completedAt: daysAgo(1, 0).toISOString(), assignedTo: "user-4",
    description: "Internal medicine consultation re: heart failure management. Recommendation to increase diuretic dose.",
  },
  {
    id: "fax-23", receivedAt: daysAgo(1, 4).toISOString(), pageCount: 1, priority: "routine",
    pages: [
      { id: "p23-1", pageNumber: 1, detectedDocType: "Medication List", extractedFields: createExtractedFields("fax-23", 1, "Mei-Lin Chen", "Medication List") }
    ],
    senderName: "Dr. Helen Nakamura - College Street Medical", senderFaxNumber: "4165551902", faxLineId: "line-1",
    documentType: "Medication List", documentTypeConfidence: 88.9,
    patientId: "pat-4", patientName: "Mei-Lin Chen", patientMatchStatus: "matched", patientMatchConfidence: 97.1,
    status: "auto-filed", slaDeadline: sla(daysAgo(1, 4), 1440), completedAt: daysAgo(1, 3).toISOString(),
    description: "Updated medication list for Mei-Lin Chen. Metoprolol increased from 25mg to 50mg BID.",
  },
  {
    id: "fax-24", receivedAt: daysAgo(1, 6).toISOString(), pageCount: 4, priority: "routine",
    pages: [
      { id: "p24-1", pageNumber: 1, extractedFields: createExtractedFields("fax-24", 1, "James O'Brien", "Cardiology Referral") },
      { id: "p24-2", pageNumber: 2, extractedFields: [] },
      { id: "p24-3", pageNumber: 3, extractedFields: [] },
      { id: "p24-4", pageNumber: 4, extractedFields: [] }
    ],
    senderName: "Dr. Amira Benali - Ottawa General Internal Med", senderFaxNumber: "6135557002", faxLineId: "line-2",
    documentType: "Cardiology Referral", documentTypeConfidence: 94.1,
    patientId: "pat-14", patientName: "James O'Brien", patientMatchStatus: "matched", patientMatchConfidence: 95.8,
    status: "completed", slaDeadline: sla(daysAgo(1, 6), 480), completedAt: daysAgo(1, 2).toISOString(), assignedTo: "user-3",
    description: "Referral for pulmonary hypertension assessment. Progressive dyspnea. Echo showing elevated RVSP 55mmHg.", isReferral: true, referralId: "ref-9",
  },
  {
    id: "fax-25", receivedAt: daysAgo(1, 8).toISOString(), pageCount: 2, priority: "routine",
    pages: [
      { id: "p25-1", pageNumber: 1, detectedDocType: "Nuclear Imaging", extractedFields: createExtractedFields("fax-25", 1, "Harjit Dhaliwal", "Nuclear Imaging") },
      { id: "p25-2", pageNumber: 2, extractedFields: [] }
    ],
    senderName: "Sunnybrook Nuclear Medicine", senderFaxNumber: "4165550003", faxLineId: "line-4",
    documentType: "Nuclear Imaging", documentTypeConfidence: 96.7,
    patientId: "pat-2", patientName: "Harjit Dhaliwal", patientMatchStatus: "matched", patientMatchConfidence: 99.0,
    status: "auto-filed", slaDeadline: sla(daysAgo(1, 8), 480), completedAt: daysAgo(1, 7).toISOString(),
    description: "Myocardial perfusion scan (MIBI): Small fixed inferior defect consistent with prior infarct. No reversible ischemia.",
  },
  {
    id: "fax-26", receivedAt: daysAgo(2, 1).toISOString(), pageCount: 3, priority: "routine",
    pages: [
      { id: "p26-1", pageNumber: 1, extractedFields: createExtractedFields("fax-26", 1, "Priya Sharma", "Cardiology Referral") },
      { id: "p26-2", pageNumber: 2, extractedFields: [] },
      { id: "p26-3", pageNumber: 3, extractedFields: [] }
    ],
    senderName: "Dr. Emily Turner - Lakeshore Community Health", senderFaxNumber: "4165551102", faxLineId: "line-2",
    documentType: "Cardiology Referral", documentTypeConfidence: 87.6,
    patientId: "pat-9", patientName: "Priya Sharma", patientMatchStatus: "matched", patientMatchConfidence: 93.4,
    status: "completed", slaDeadline: sla(daysAgo(2, 1), 480), completedAt: daysAgo(2, 0).toISOString(), assignedTo: "user-4",
    description: "Referral for chest pain workup. 48-year-old female with atypical chest pain and anxiety. Low pre-test probability.", isReferral: true, referralId: "ref-10",
  },
  {
    id: "fax-27", receivedAt: daysAgo(2, 3).toISOString(), pageCount: 1, priority: "routine",
    pages: [
      { id: "p27-1", pageNumber: 1, detectedDocType: "Insurance Form", extractedFields: createExtractedFields("fax-27", 1, "Patrick Stewart", "Insurance Form") }
    ],
    senderName: "Sun Life Financial", senderFaxNumber: "8005551234", faxLineId: "line-1",
    documentType: "Insurance Form", documentTypeConfidence: 78.4,
    patientId: "pat-22", patientName: "Patrick Stewart", patientMatchStatus: "matched", patientMatchConfidence: 91.2,
    status: "completed", slaDeadline: sla(daysAgo(2, 3), 1440), completedAt: daysAgo(2, 1).toISOString(), assignedTo: "user-3",
    description: "Insurance form requesting disability assessment for pacemaker patient.",
  },
  {
    id: "fax-28", receivedAt: daysAgo(2, 5).toISOString(), pageCount: 5, priority: "routine",
    pages: [
      { id: "p28-1", pageNumber: 1, extractedFields: createExtractedFields("fax-28", 1, "Elena Dimitriou", "Cardiology Referral") },
      { id: "p28-2", pageNumber: 2, extractedFields: [] },
      { id: "p28-3", pageNumber: 3, extractedFields: [] },
      { id: "p28-4", pageNumber: 4, extractedFields: [] },
      { id: "p28-5", pageNumber: 5, extractedFields: [] }
    ],
    senderName: "Dr. Daniel Osei - Hamilton Health Sciences", senderFaxNumber: "9055552002", faxLineId: "line-2",
    documentType: "Cardiology Referral", documentTypeConfidence: 95.0,
    patientId: "pat-17", patientName: "Elena Dimitriou", patientMatchStatus: "matched", patientMatchConfidence: 97.3,
    status: "completed", slaDeadline: sla(daysAgo(2, 5), 480), completedAt: daysAgo(2, 2).toISOString(), assignedTo: "user-3",
    description: "Referral for rheumatic mitral stenosis reassessment. Last echo 6 months ago showed MVA 1.3 cm2.", isReferral: true, referralId: "ref-11",
  },
  {
    id: "fax-29", receivedAt: ago(0, 5).toISOString(), pageCount: 2, priority: "routine",
    pages: [
      { id: "p29-1", pageNumber: 1, detectedDocType: "Lab Results", extractedFields: createExtractedFields("fax-29", 1, "Giuseppe Romano", "Lab Results") },
      { id: "p29-2", pageNumber: 2, extractedFields: [] }
    ],
    senderName: "LifeLabs", senderFaxNumber: "4165559876", faxLineId: "line-4",
    documentType: "Lab Results", documentTypeConfidence: 97.8,
    patientId: "pat-10", patientName: "Giuseppe Romano", patientMatchStatus: "matched", patientMatchConfidence: 98.6,
    status: "auto-filed", slaDeadline: sla(ago(0, 5), 1440), completedAt: ago(0, 3).toISOString(),
    description: "Lipid panel: TC 4.2, LDL 1.8, HDL 1.2, TG 1.5. All at target on Atorvastatin 80mg.",
  },
  {
    id: "fax-30", receivedAt: ago(10, 0).toISOString(), pageCount: 3, priority: "routine",
    pages: [
      { id: "p30-1", pageNumber: 1, extractedFields: createExtractedFields("fax-30", 1, "Yuki Tanaka", "Cardiology Referral") },
      { id: "p30-2", pageNumber: 2, extractedFields: [] },
      { id: "p30-3", pageNumber: 3, extractedFields: [] }
    ],
    senderName: "Dr. David Park - North York Medical Clinic", senderFaxNumber: "4165558002", faxLineId: "line-2",
    documentType: "Cardiology Referral", documentTypeConfidence: 90.8,
    patientId: "pat-23", patientName: "Yuki Tanaka", patientMatchStatus: "matched", patientMatchConfidence: 96.5,
    status: "completed", slaDeadline: sla(ago(10, 0), 480), completedAt: ago(8, 0).toISOString(), assignedTo: "user-4",
    description: "Referral for WPW syndrome management. Recurrent palpitations despite Flecainide. Consider ablation.", isReferral: true, referralId: "ref-12",
  },
  {
    id: "fax-31", receivedAt: daysAgo(3, 2).toISOString(), pageCount: 2, priority: "routine",
    pages: [
      { id: "p31-1", pageNumber: 1, extractedFields: createExtractedFields("fax-31", 1, "Linda Nguyen", "Consultation Report") },
      { id: "p31-2", pageNumber: 2, extractedFields: [] }
    ],
    senderName: "Dr. Jasmine Ali - Markham Village Medical", senderFaxNumber: "9055551702", faxLineId: "line-1",
    documentType: "Consultation Report", documentTypeConfidence: 89.3,
    patientId: "pat-13", patientName: "Linda Nguyen", patientMatchStatus: "matched", patientMatchConfidence: 96.0,
    status: "auto-filed", slaDeadline: sla(daysAgo(3, 2), 1440), completedAt: daysAgo(3, 1).toISOString(),
    description: "Follow-up note re: peripartum cardiomyopathy. LVEF recovered to 55%. Recommend continuing Ramipril.",
  },
  {
    id: "fax-32", receivedAt: daysAgo(3, 5).toISOString(), pageCount: 1, priority: "routine",
    pages: [
      { id: "p32-1", pageNumber: 1, detectedDocType: "Lab Results", extractedFields: createExtractedFields("fax-32", 1, "Catherine Beaumont", "Lab Results") }
    ],
    senderName: "Dynacare Laboratories", senderFaxNumber: "9055559999", faxLineId: "line-4",
    documentType: "Lab Results", documentTypeConfidence: 96.9,
    patientId: "pat-19", patientName: "Catherine Beaumont", patientMatchStatus: "matched", patientMatchConfidence: 98.8,
    status: "auto-filed", slaDeadline: sla(daysAgo(3, 5), 1440), completedAt: daysAgo(3, 4).toISOString(),
    description: "INR result: 2.4 (therapeutic range 2.0-3.0). Continue current Warfarin dose 4mg daily.",
  },
  {
    id: "fax-33", receivedAt: ago(11, 30).toISOString(), pageCount: 6, priority: "routine",
    pages: [
      { id: "p33-1", pageNumber: 1, extractedFields: createExtractedFields("fax-33", 1, undefined, "Cardiology Referral") },
      { id: "p33-2", pageNumber: 2, extractedFields: [] },
      { id: "p33-3", pageNumber: 3, detectedDocType: "ECG / EKG Report", extractedFields: [] },
      { id: "p33-4", pageNumber: 4, extractedFields: [] },
      { id: "p33-5", pageNumber: 5, detectedDocType: "Lab Results", extractedFields: [] },
      { id: "p33-6", pageNumber: 6, extractedFields: [] }
    ],
    senderName: "Dr. Robert Bouchard - Waterloo Family Health", senderFaxNumber: "5195551602", faxLineId: "line-2",
    documentType: "Cardiology Referral", documentTypeConfidence: 88.1,
    patientName: "Multiple Documents", patientMatchStatus: "multiple-matches",
    status: "pending-review", slaDeadline: sla(ago(11, 30), 480),
    description: "Multi-document fax containing referral letter, ECG, and lab results. Requires splitting.", isReferral: true,
    notes: "Contains documents for potentially 2 different patients. Needs manual review and splitting.",
  },
  {
    id: "fax-34", receivedAt: daysAgo(4, 1).toISOString(), pageCount: 2, priority: "routine",
    pages: [
      { id: "p34-1", pageNumber: 1, detectedDocType: "MRI Report", extractedFields: createExtractedFields("fax-34", 1, "Ahmed Ibrahim", "MRI Report") },
      { id: "p34-2", pageNumber: 2, extractedFields: [] }
    ],
    senderName: "Toronto Western Hospital Radiology", senderFaxNumber: "4165557777", faxLineId: "line-4",
    documentType: "MRI Report", documentTypeConfidence: 94.8,
    patientId: "pat-26", patientName: "Ahmed Ibrahim", patientMatchStatus: "matched", patientMatchConfidence: 97.5,
    status: "auto-filed", slaDeadline: sla(daysAgo(4, 1), 480), completedAt: daysAgo(4, 0).toISOString(),
    description: "Cardiac MRI: Bicuspid aortic valve confirmed. Aortic root 4.3cm (increased from 4.2cm). No dissection.",
  },
  {
    id: "fax-35", receivedAt: daysAgo(4, 3).toISOString(), pageCount: 3, priority: "routine",
    pages: [
      { id: "p35-1", pageNumber: 1, detectedDocType: "Angiography Report", extractedFields: createExtractedFields("fax-35", 1, "Giuseppe Romano", "Angiography Report") },
      { id: "p35-2", pageNumber: 2, extractedFields: [] },
      { id: "p35-3", pageNumber: 3, extractedFields: [] }
    ],
    senderName: "Sunnybrook Cath Lab", senderFaxNumber: "4165550004", faxLineId: "line-4",
    documentType: "Angiography Report", documentTypeConfidence: 96.2,
    patientId: "pat-10", patientName: "Giuseppe Romano", patientMatchStatus: "matched", patientMatchConfidence: 99.3,
    status: "auto-filed", slaDeadline: sla(daysAgo(4, 3), 240), completedAt: daysAgo(4, 2).toISOString(),
    description: "Coronary angiogram: Patent LIMA-LAD and SVG-OM grafts. 50% stenosis in native RCA. Medical management recommended.",
  },
  {
    id: "fax-36", receivedAt: daysAgo(5, 2).toISOString(), pageCount: 4, priority: "routine",
    pages: [
      { id: "p36-1", pageNumber: 1, extractedFields: createExtractedFields("fax-36", 1, "Karen Taylor", "Cardiology Referral") },
      { id: "p36-2", pageNumber: 2, extractedFields: [] },
      { id: "p36-3", pageNumber: 3, extractedFields: [] },
      { id: "p36-4", pageNumber: 4, extractedFields: [] }
    ],
    senderName: "Dr. Catherine Leclerc - Orleans Family Medicine", senderFaxNumber: "6135551302", faxLineId: "line-2",
    documentType: "Cardiology Referral", documentTypeConfidence: 92.7,
    patientId: "pat-29", patientName: "Karen Taylor", patientMatchStatus: "matched", patientMatchConfidence: 95.4,
    status: "completed", slaDeadline: sla(daysAgo(5, 2), 480), completedAt: daysAgo(5, 0).toISOString(), assignedTo: "user-4",
    description: "Follow-up referral: Post-myocarditis. Persistent fatigue and reduced exercise tolerance. Echo requested.", isReferral: true, referralId: "ref-13",
  },
  {
    id: "fax-37", receivedAt: daysAgo(6, 0).toISOString(), pageCount: 1, priority: "routine",
    pages: [
      { id: "p37-1", pageNumber: 1, detectedDocType: "Admin Note", extractedFields: createExtractedFields("fax-37", 1, undefined, "Admin Note") }
    ],
    senderName: "OHIP", senderFaxNumber: "8005559999", faxLineId: "line-1",
    documentType: "Admin Note", documentTypeConfidence: 75.2,
    patientMatchStatus: "not-found",
    status: "completed", slaDeadline: sla(daysAgo(6, 0), 1440), completedAt: daysAgo(5, 20).toISOString(), assignedTo: "user-6",
    description: "OHIP billing reconciliation notice. Not patient-specific.",
  },

  // --- UNCLASSIFIED items for worklist (AI unsure of doc type) ---
  {
    id: "fax-urgent-2", receivedAt: ago(0, 35).toISOString(), pageCount: 2, priority: "urgent",
    pages: [
      { id: "purg2-1", pageNumber: 1, detectedDocType: "Critical Lab Results", extractedFields: createExtractedFields("fax-urgent-2", 1, "Maria Santos", "Critical Lab Results") },
      { id: "purg2-2", pageNumber: 2, extractedFields: [] }
    ],
    senderName: "Dr. James Wong - Scarborough General ED", senderFaxNumber: "4165552302", faxLineId: "line-4",
    documentType: "Critical Lab Results", documentTypeConfidence: 89,
    patientId: "pat-santos", patientName: "Maria Santos", patientMatchStatus: "matched", patientMatchConfidence: 94.2,
    status: "pending-review", slaDeadline: sla(ago(0, 35), 30),
    description: "Urgent - Critical potassium level 6.8. Urgent electrolyte abnormality requiring immediate attention.",
    notes: "AI flagged as potentially critical lab results but low confidence on document type.",
  },
  {
    id: "fax-triage-1", receivedAt: ago(0, 45).toISOString(), pageCount: 3, priority: "routine",
    pages: [
      { id: "ptr1-1", pageNumber: 1, extractedFields: createExtractedFields("fax-triage-1", 1, "Jennifer Lee", "Lab Results") },
      { id: "ptr1-2", pageNumber: 2, extractedFields: [] },
      { id: "ptr1-3", pageNumber: 3, extractedFields: [] }
    ],
    senderName: "Dr. Angela Roberts - Markham Village Medical", senderFaxNumber: "9055551702", faxLineId: "line-2",
    documentType: "Lab Results", documentTypeConfidence: 58,
    patientId: "pat-lee-j", patientName: "Jennifer Lee", patientMatchStatus: "matched", patientMatchConfidence: 91.5,
    status: "pending-review", slaDeadline: sla(ago(0, 45), 480),
    description: "Unclear document type - possibly lab results or referral. Cover page mentions both cardiology consult and recent bloodwork.",
    notes: "AI unable to determine if this is a referral or just lab results for filing.",
  },
  {
    id: "fax-triage-3", receivedAt: ago(1, 15).toISOString(), pageCount: 8, priority: "routine",
    pages: [
      { id: "ptr3-1", pageNumber: 1, extractedFields: createExtractedFields("fax-triage-3", 1, "Michael Brown", "Holter Report") },
      { id: "ptr3-2", pageNumber: 2, extractedFields: [] },
      { id: "ptr3-3", pageNumber: 3, extractedFields: [] },
      { id: "ptr3-4", pageNumber: 4, extractedFields: [] },
      { id: "ptr3-5", pageNumber: 5, extractedFields: [] },
      { id: "ptr3-6", pageNumber: 6, extractedFields: [] },
      { id: "ptr3-7", pageNumber: 7, extractedFields: [] },
      { id: "ptr3-8", pageNumber: 8, extractedFields: [] }
    ],
    senderName: "Dr. K. Patel - North York Medical Clinic", senderFaxNumber: "4165558002", faxLineId: "line-4",
    documentType: "Holter Report", documentTypeConfidence: 71,
    patientId: "pat-brown-m", patientName: "Michael Brown", patientMatchStatus: "matched", patientMatchConfidence: 93.8,
    status: "pending-review", slaDeadline: sla(ago(1, 15), 480),
    description: "Possibly Holter report or stress test results. Multiple pages with rhythm strips and graphs. No clear cover page.",
    notes: "Document appears to be cardiac monitoring data but type unclear.",
  },
  {
    id: "fax-triage-4", receivedAt: ago(2, 0).toISOString(), pageCount: 2, priority: "routine",
    pages: [
      { id: "ptr4-1", pageNumber: 1, detectedDocType: "Cover Sheet", extractedFields: createExtractedFields("fax-triage-4", 1, "Susan Taylor", "Correspondence") },
      { id: "ptr4-2", pageNumber: 2, extractedFields: [] }
    ],
    senderName: "College Street Medical", senderFaxNumber: "4165551902", faxLineId: "line-1",
    documentType: "Correspondence", documentTypeConfidence: 34,
    patientId: "pat-taylor-s", patientName: "Susan Taylor", patientMatchStatus: "matched", patientMatchConfidence: 87.3,
    status: "pending-review", slaDeadline: sla(ago(2, 0), 480),
    description: "Cover page only visible - cannot determine content. Second page appears blank or very faint.",
    notes: "Poor transmission quality. May need to request re-send.",
  },
  {
    id: "fax-misc-1", receivedAt: ago(3, 20).toISOString(), pageCount: 4, priority: "routine",
    pages: [
      { id: "pmisc1-1", pageNumber: 1, extractedFields: createExtractedFields("fax-misc-1", 1, "Linda Thompson", "Echocardiogram Report") },
      { id: "pmisc1-2", pageNumber: 2, extractedFields: [] },
      { id: "pmisc1-3", pageNumber: 3, extractedFields: [] },
      { id: "pmisc1-4", pageNumber: 4, extractedFields: [] }
    ],
    senderName: "Dr. Robert Bouchard - Waterloo Family Health", senderFaxNumber: "5195551602", faxLineId: "line-2",
    documentType: "Echocardiogram Report", documentTypeConfidence: 82,
    patientId: "pat-thompson-l", patientName: "Linda Thompson", patientMatchStatus: "matched", patientMatchConfidence: 95.1,
    status: "pending-review", slaDeadline: sla(ago(3, 20), 480),
    description: "Likely echo report - No cover sheet, no patient DOB visible on first page. Measurements consistent with echocardiogram.",
    notes: "High confidence this is an echo report but missing identifying information.",
  },
  {
    id: "fax-misc-2", receivedAt: ago(4, 40).toISOString(), pageCount: 6, priority: "routine",
    pages: [
      { id: "pmisc2-1", pageNumber: 1, extractedFields: createExtractedFields("fax-misc-2", 1, "George Kim", "Stress Test") },
      { id: "pmisc2-2", pageNumber: 2, extractedFields: [] },
      { id: "pmisc2-3", pageNumber: 3, extractedFields: [] },
      { id: "pmisc2-4", pageNumber: 4, extractedFields: [] },
      { id: "pmisc2-5", pageNumber: 5, extractedFields: [] },
      { id: "pmisc2-6", pageNumber: 6, extractedFields: [] }
    ],
    senderName: "Vaughan Internal Med Group", senderFaxNumber: "9055551502", faxLineId: "line-4",
    documentType: "Stress Test", documentTypeConfidence: 67,
    patientId: "pat-kim-g", patientName: "George Kim", patientMatchStatus: "matched", patientMatchConfidence: 92.4,
    status: "pending-review", slaDeadline: sla(ago(4, 40), 480),
    description: "Stress test or nuclear imaging - Multiple pages with graphs and numerical data. Could be exercise stress test or nuclear perfusion study.",
    notes: "Contains exercise parameters and imaging data. Needs manual classification.",
  },

  // ============================================================================
  // FAXES LINKED TO EXISTING REFERRALS (incoming documents for pending referrals)
  // ============================================================================

  // BNP Lab Results for Jean-Luc Tremblay (ref-2) - this referral is missing BNP
  {
    id: "fax-linked-1", receivedAt: ago(0, 15).toISOString(), pageCount: 1, priority: "urgent",
    pages: [
      {
        id: "plinked1-1", pageNumber: 1, detectedDocType: "Bloodwork - BNP", detectedPatient: "Jean-Luc Tremblay",
        extractedFields: createExtractedFields("fax-linked-1", 1, "Jean-Luc Tremblay", "Bloodwork - BNP"),
        contentDescription: `LABORATORY RESULTS - CARDIAC BIOMARKERS

Hamilton Health Sciences - Core Laboratory
237 Barton St E, Hamilton, ON L8L 2X2  |  Tel: (905) 555-4001

Patient: Jean-Luc Tremblay                  DOB: November 3, 1967
MRN: HHS-3456789                           OHIP: 3456-789-012-EF
Ordering Physician: Dr. Karim Ramji         Collection: Feb 12, 2026 10:30

══════════════════════════════════════════════════════════════════

                    CARDIAC BIOMARKERS

Test                    Result          Reference Range    Flag
──────────────────────────────────────────────────────────────────
BNP (Brain Natriuretic  1,847 pg/mL     < 100 pg/mL       ▲▲ HIGH
   Peptide)

──────────────────────────────────────────────────────────────────
** ELEVATED BNP **
Result consistent with volume overload / heart failure.
Clinical correlation recommended.
──────────────────────────────────────────────────────────────────

Verified by: M. Patel, MLT                   Feb 12, 2026 11:15`
      }
    ],
    senderName: "Hamilton Health Sciences Lab", senderFaxNumber: "9055554001", faxLineId: "line-2",
    documentType: "Bloodwork - BNP", documentTypeConfidence: 96.8,
    patientId: "pat-3", patientName: "Jean-Luc Tremblay", patientMatchStatus: "matched", patientMatchConfidence: 98.5,
    status: "pending-review", slaDeadline: sla(ago(0, 15), 60),
    description: "BNP lab result showing elevated levels (1,847 pg/mL) - consistent with decompensated heart failure.",
    isReferral: false,
    // LINKED TO EXISTING REFERRAL - This is a missing item for ref-2
    linkedReferralId: "ref-2",
    linkedReferralReason: "Missing BNP result for pending referral",
    // CEREBRUM EMR
    cerebrumCategory: "lab-results",
  },

  // Echocardiogram Report for Jean-Luc Tremblay (ref-2) - this referral is also missing Echo
  {
    id: "fax-linked-2", receivedAt: ago(0, 8).toISOString(), pageCount: 3, priority: "urgent",
    pages: [
      {
        id: "plinked2-1", pageNumber: 1, detectedDocType: "Echocardiogram Report", detectedPatient: "Jean-Luc Tremblay",
        extractedFields: createExtractedFields("fax-linked-2", 1, "Jean-Luc Tremblay", "Echocardiogram Report"),
        contentDescription: `ECHOCARDIOGRAM REPORT

Hamilton Health Sciences - Cardiovascular Imaging
237 Barton St E, Hamilton, ON L8L 2X2  |  Tel: (905) 555-4050

Patient: Jean-Luc Tremblay                  DOB: November 3, 1967
MRN: HHS-3456789                           OHIP: 3456-789-012-EF
Referring Physician: Dr. Karim Ramji        Study Date: Feb 12, 2026
Indication: Heart failure, volume overload

══════════════════════════════════════════════════════════════════

                    TRANSTHORACIC ECHOCARDIOGRAM

LEFT VENTRICLE
──────────────────────────────────────────────────────────────────
LV End-Diastolic Dimension:     62 mm       (Normal: 42-59 mm)  ▲
LV End-Systolic Dimension:      52 mm       (Normal: 25-40 mm)  ▲
Ejection Fraction (Biplane):    28%         (Normal: 55-70%)    ▲▲
Regional Wall Motion:           Global hypokinesis
LV Mass Index:                  142 g/m²    (Normal: < 115)     ▲

DIASTOLIC FUNCTION
E/A Ratio:                      2.1         Restrictive pattern
E/e' (lateral):                 18          Elevated filling pressures

RIGHT VENTRICLE
TAPSE:                          14 mm       (Normal: > 17)      ▲
RV Function:                    Mildly reduced`
      },
      {
        id: "plinked2-2", pageNumber: 2, extractedFields: [],
        contentDescription: `ECHOCARDIOGRAM REPORT - Page 2

Patient: Jean-Luc Tremblay                  Study Date: Feb 12, 2026

VALVULAR ASSESSMENT
──────────────────────────────────────────────────────────────────
Mitral Valve:      Moderate functional MR (ERO 0.25 cm²)
                   Tethering due to LV dilatation
Tricuspid Valve:   Mild TR, RVSP estimated at 45 mmHg
Aortic Valve:      Trileaflet, no stenosis, trace AR
Pulmonic Valve:    Normal

PERICARDIUM
──────────────────────────────────────────────────────────────────
Small pericardial effusion (5mm posterior), no tamponade physiology

IVC ASSESSMENT
──────────────────────────────────────────────────────────────────
IVC Diameter:      24 mm (dilated)
Collapsibility:    < 50%
Estimated RAP:     15 mmHg (elevated)`
      },
      {
        id: "plinked2-3", pageNumber: 3, extractedFields: [],
        contentDescription: `ECHOCARDIOGRAM REPORT - Page 3

Patient: Jean-Luc Tremblay                  Study Date: Feb 12, 2026

══════════════════════════════════════════════════════════════════

IMPRESSION
──────────────────────────────────────────────────────────────────
1. Severely reduced LV systolic function (EF 28%) with global
   hypokinesis - consistent with dilated cardiomyopathy

2. LV dilatation with elevated filling pressures (E/e' = 18)
   - Restrictive filling pattern

3. Moderate functional mitral regurgitation secondary to
   LV dilatation and leaflet tethering

4. Mildly reduced RV function with elevated RVSP (45 mmHg)

5. Elevated right atrial pressure (IVC dilated, poor collapse)

6. Small pericardial effusion, hemodynamically insignificant

COMPARISON: Previous echo from 2025-08-15 showed EF 35%.
Current study shows interval worsening of LV function.

──────────────────────────────────────────────────────────────────
Interpreted by: Dr. Amanda Wilson, FRCPC (Cardiology)
Sonographer: T. Nguyen, RDCS
Verified: Feb 12, 2026 12:45`
      }
    ],
    senderName: "Hamilton Health Sciences - CV Imaging", senderFaxNumber: "9055554050", faxLineId: "line-2",
    documentType: "Echocardiogram Report", documentTypeConfidence: 98.2,
    patientId: "pat-3", patientName: "Jean-Luc Tremblay", patientMatchStatus: "matched", patientMatchConfidence: 99.1,
    status: "pending-review", slaDeadline: sla(ago(0, 8), 60),
    description: "Echocardiogram showing severely reduced LV function (EF 28%) with interval worsening from prior study.",
    isReferral: false,
    // LINKED TO EXISTING REFERRAL - This is a missing item for ref-2
    linkedReferralId: "ref-2",
    linkedReferralReason: "Missing echocardiogram for pending referral",
    // CEREBRUM EMR
    cerebrumCategory: "echo-reports",
  },

  // CT Aorta for Victor Kozlov (ref-3) - this referral is missing CT Aorta for TAVI assessment
  {
    id: "fax-linked-3", receivedAt: ago(0, 45).toISOString(), pageCount: 4, priority: "urgent",
    pages: [
      {
        id: "plinked3-1", pageNumber: 1, detectedDocType: "CT Aorta Report", detectedPatient: "Victor Kozlov",
        extractedFields: createExtractedFields("fax-linked-3", 1, "Victor Kozlov", "CT Aorta Report"),
        contentDescription: `CT AORTA FOR TAVI PLANNING

St. Michael's Hospital - Diagnostic Imaging
30 Bond St, Toronto, ON M5B 1W8  |  Tel: (416) 555-1820

Patient: Victor Kozlov                      DOB: September 18, 1946
MRN: SMH-1947382                           OHIP: 0000-112-233-GH
Referring Physician: Dr. Patrick Murphy     Study Date: Feb 12, 2026
Indication: Pre-TAVI assessment for severe aortic stenosis

══════════════════════════════════════════════════════════════════

                    CT AORTOGRAM - TAVI PROTOCOL
                    (ECG-gated, with contrast)

AORTIC ROOT & VALVE
──────────────────────────────────────────────────────────────────
Annulus Dimensions (systolic):
  - Area:                      452 mm²
  - Perimeter:                 76.8 mm
  - Mean Diameter:             24.4 mm
  - Min x Max:                 22.1 x 27.8 mm

Sinus of Valsalva:             32 x 34 mm
Sinotubular Junction:          28 mm
Ascending Aorta:               36 mm (mildly dilated)

Aortic Valve Calcification:    Severe, Agatston Score 3,842
  - Right coronary cusp:       Heavily calcified
  - Non-coronary cusp:         Moderate calcification
  - Left coronary cusp:        Moderate calcification`
      },
      {
        id: "plinked3-2", pageNumber: 2, extractedFields: [],
        contentDescription: `CT AORTA - TAVI PLANNING - Page 2

Patient: Victor Kozlov                      Study Date: Feb 12, 2026

CORONARY OSTIAL HEIGHTS
──────────────────────────────────────────────────────────────────
Left Main Ostium Height:       13.2 mm from annulus
Right Coronary Ostium Height:  16.8 mm from annulus
(Adequate heights for TAVI - low risk of coronary obstruction)

LVOT ASSESSMENT
──────────────────────────────────────────────────────────────────
LVOT Calcification:            Mild, anterolateral
Septal Hypertrophy:            None
Membranous Septum:             Within normal limits

ASCENDING AORTA & ARCH
──────────────────────────────────────────────────────────────────
Ascending Aorta:               36 mm, mild atheroma
Arch Configuration:            Type I (bovine variant)
Left Subclavian:               Patent, no stenosis
Brachiocephalic:               Patent

DESCENDING AORTA
──────────────────────────────────────────────────────────────────
Thoracic Aorta:                No significant atheroma
Abdominal Aorta:               Moderate atherosclerosis
                               Min diameter 18mm at bifurcation`
      },
      {
        id: "plinked3-3", pageNumber: 3, extractedFields: [],
        contentDescription: `CT AORTA - TAVI PLANNING - Page 3

Patient: Victor Kozlov                      Study Date: Feb 12, 2026

ILIOFEMORAL ACCESS ASSESSMENT
──────────────────────────────────────────────────────────────────
                              RIGHT           LEFT
Common Iliac Artery:          9.2 mm          8.8 mm
External Iliac Artery:        7.8 mm          7.4 mm
Common Femoral Artery:        8.1 mm          7.9 mm
Calcification:                Moderate        Moderate
Tortuosity:                   Mild            Mild

Minimum Vessel Diameter:       7.4 mm (Left EIA)

ACCESS ASSESSMENT:
- Adequate for 14-16 Fr delivery systems
- Right femoral preferred (larger caliber)
- Moderate calcification but no circumferential disease
- Tortuosity manageable`
      },
      {
        id: "plinked3-4", pageNumber: 4, extractedFields: [],
        contentDescription: `CT AORTA - TAVI PLANNING - Page 4

Patient: Victor Kozlov                      Study Date: Feb 12, 2026

══════════════════════════════════════════════════════════════════

IMPRESSION
──────────────────────────────────────────────────────────────────
1. ANNULUS SIZING: Perimeter-derived diameter 24.4 mm
   Suitable for:
   - Edwards SAPIEN 3: 26mm valve
   - Medtronic Evolut: 26mm or 29mm valve

2. CORONARY HEIGHTS: Adequate (LM 13.2mm, RCA 16.8mm)
   Low risk of coronary obstruction

3. AORTIC VALVE: Severe calcification (Agatston 3,842)
   Asymmetric - heaviest on right coronary cusp

4. ILIOFEMORAL ACCESS: SUITABLE for transfemoral approach
   - Right femoral preferred
   - Minimum 7.4mm, adequate for standard delivery systems

5. ASCENDING AORTA: Mildly dilated (36mm), monitor

RECOMMENDATION: Patient is a good candidate for transfemoral TAVI.

──────────────────────────────────────────────────────────────────
Interpreted by: Dr. Richard Lee, FRCPC (Cardiac Imaging)
Verified: Feb 12, 2026 14:20`
      }
    ],
    senderName: "St. Michael's Hospital - Diagnostic Imaging", senderFaxNumber: "4165551820", faxLineId: "line-4",
    documentType: "CT Aorta Report", documentTypeConfidence: 97.5,
    patientId: "pat-30", patientName: "Victor Kozlov", patientMatchStatus: "matched", patientMatchConfidence: 98.8,
    status: "pending-review", slaDeadline: sla(ago(0, 45), 60),
    description: "Pre-TAVI CT aortogram showing suitable anatomy for transfemoral approach. Recommended valve sizes: Edwards 26mm or Medtronic 26-29mm.",
    isReferral: false,
    // LINKED TO EXISTING REFERRAL - This is a missing item for ref-3
    linkedReferralId: "ref-3",
    linkedReferralReason: "Missing CT Aorta for TAVI assessment",
    // CEREBRUM EMR
    cerebrumCategory: "ct-imaging",
  },

  // ============================================================================
  // MULTI-DOCUMENT FAX EXAMPLE (single fax containing docs for multiple patients)
  // ============================================================================
  {
    id: "fax-multi-1", receivedAt: ago(0, 35).toISOString(), pageCount: 8, priority: "routine",
    pages: [
      { id: "pmulti1-1", pageNumber: 1, detectedDocType: "Lab Results", detectedPatient: "Maria Santos", extractedFields: createExtractedFields("fax-multi-1", 1, "Maria Santos", "Lab Results") },
      { id: "pmulti1-2", pageNumber: 2, detectedDocType: "Lab Results", detectedPatient: "Maria Santos", extractedFields: [] },
      { id: "pmulti1-3", pageNumber: 3, detectedDocType: "ECG Report", detectedPatient: "Robert Johnson", extractedFields: createExtractedFields("fax-multi-1", 3, "Robert Johnson", "ECG Report") },
      { id: "pmulti1-4", pageNumber: 4, detectedDocType: "ECG Report", detectedPatient: "Robert Johnson", extractedFields: [] },
      { id: "pmulti1-5", pageNumber: 5, detectedDocType: "Holter Monitor Report", detectedPatient: "Lisa Chen", extractedFields: createExtractedFields("fax-multi-1", 5, "Lisa Chen", "Holter Monitor Report") },
      { id: "pmulti1-6", pageNumber: 6, detectedDocType: "Holter Monitor Report", detectedPatient: "Lisa Chen", extractedFields: [] },
      { id: "pmulti1-7", pageNumber: 7, detectedDocType: "Holter Monitor Report", detectedPatient: "Lisa Chen", extractedFields: [] },
      { id: "pmulti1-8", pageNumber: 8, detectedDocType: "Holter Monitor Report", detectedPatient: "Lisa Chen", extractedFields: [] },
    ],
    senderName: "LifeLabs Diagnostic Centre", senderFaxNumber: "4165556001", faxLineId: "line-1",
    documentType: "Lab Results", documentTypeConfidence: 78.5, // Lower confidence because it's a mixed batch
    patientId: undefined, patientName: undefined, patientMatchStatus: "multiple-matches", patientMatchConfidence: undefined,
    status: "pending-review", slaDeadline: sla(ago(0, 35), 240),
    description: "Batch fax from LifeLabs containing multiple patient documents. AI detected 3 separate patients/document types.",
    // Multi-document detection
    splitAnalysisComplete: true,
    detectedSegments: [
      {
        id: "seg-multi1-1",
        startPage: 1,
        endPage: 2,
        patientName: "Maria Santos",
        patientOhip: "1122-334-455-AB",
        documentType: "Lab Results",
        cerebrumCategory: "lab-results",
        confidence: 94.2,
      },
      {
        id: "seg-multi1-2",
        startPage: 3,
        endPage: 4,
        patientName: "Robert Johnson",
        patientOhip: "2233-445-566-CD",
        documentType: "ECG Report",
        cerebrumCategory: "ecg",
        confidence: 96.8,
      },
      {
        id: "seg-multi1-3",
        startPage: 5,
        endPage: 8,
        patientName: "Lisa Chen",
        patientOhip: "3344-556-677-EF",
        documentType: "Holter Monitor Report",
        cerebrumCategory: "holter",
        confidence: 92.1,
      },
    ],
  },
];
