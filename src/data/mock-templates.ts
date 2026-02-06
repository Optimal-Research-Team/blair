import { CommunicationTemplate } from "@/types";

export const mockTemplates: CommunicationTemplate[] = [
  {
    id: "tmpl-1",
    name: "Referral Received Confirmation",
    type: "referral-received",
    channel: "fax",
    subject: "Referral Received - {{patientName}}",
    body: `Dear Dr. {{referringPhysicianName}},

Thank you for referring {{patientName}} (DOB: {{patientDOB}}) to Sunnybrook Schulich Heart Centre.

We have received your referral on {{receivedDate}} and it has been assigned to {{assignedCardiologist}} for review.

Referral Details:
- Reason for Referral: {{reasonForReferral}}
- Priority: {{priority}}
- Estimated Wait Time: {{estimatedWaitTime}}

We will contact the patient directly to schedule an appointment. If you have any questions, please contact our referral intake line at (416) 555-0101.

Sincerely,
Sunnybrook Schulich Heart Centre
Referral Intake Team`,
    triggerEvent: "referral.received",
    isActive: true,
    variables: ["patientName", "patientDOB", "referringPhysicianName", "receivedDate", "assignedCardiologist", "reasonForReferral", "priority", "estimatedWaitTime"],
  },
  {
    id: "tmpl-2",
    name: "Missing Items Request",
    type: "missing-items",
    channel: "fax",
    subject: "Additional Information Required - Referral for {{patientName}}",
    body: `Dear Dr. {{referringPhysicianName}},

Thank you for your referral of {{patientName}} (DOB: {{patientDOB}}) to our cardiology clinic.

To complete the assessment of this referral, we require the following additional documentation:

{{missingItemsList}}

Please fax the requested documents to (416) 555-0101 at your earliest convenience, referencing patient {{patientName}} and referral ID {{referralId}}.

If the requested items are not received within {{deadlineDays}} business days, the referral may be returned.

Thank you for your cooperation.

Sincerely,
Sunnybrook Schulich Heart Centre
Referral Intake Team`,
    triggerEvent: "referral.incomplete",
    isActive: true,
    variables: ["patientName", "patientDOB", "referringPhysicianName", "missingItemsList", "referralId", "deadlineDays"],
  },
  {
    id: "tmpl-3",
    name: "Referral Declined",
    type: "decline",
    channel: "fax",
    subject: "Referral Declined - {{patientName}}",
    body: `Dear Dr. {{referringPhysicianName}},

We are writing to inform you that the referral for {{patientName}} (DOB: {{patientDOB}}) has been reviewed and unfortunately cannot be accepted at this time.

Reason for Decline: {{declineReason}}

{{additionalNotes}}

If you believe this decision should be reconsidered, or if you have additional information that may change the assessment, please contact our referral intake team at (416) 555-0101.

We recommend the following alternative: {{alternativeSuggestion}}

Sincerely,
Sunnybrook Schulich Heart Centre`,
    isActive: true,
    variables: ["patientName", "patientDOB", "referringPhysicianName", "declineReason", "additionalNotes", "alternativeSuggestion"],
  },
  {
    id: "tmpl-4",
    name: "Appointment Confirmation",
    type: "appointment-confirmation",
    channel: "fax",
    subject: "Appointment Confirmed - {{patientName}} on {{appointmentDate}}",
    body: `Dear Dr. {{referringPhysicianName}},

This letter confirms that an appointment has been scheduled for your patient {{patientName}} (DOB: {{patientDOB}}).

Appointment Details:
- Date: {{appointmentDate}}
- Time: {{appointmentTime}}
- Cardiologist: {{assignedCardiologist}}
- Location: Sunnybrook Schulich Heart Centre, 2075 Bayview Avenue, Toronto, ON M4N 3M5
- Phone: (416) 555-0100

Preparation Instructions:
{{prepInstructions}}

The patient has been contacted directly. A copy of the consultation report will be sent to your office following the appointment.

Sincerely,
Sunnybrook Schulich Heart Centre`,
    triggerEvent: "referral.booked",
    isActive: true,
    variables: ["patientName", "patientDOB", "referringPhysicianName", "appointmentDate", "appointmentTime", "assignedCardiologist", "prepInstructions"],
  },
  {
    id: "tmpl-5",
    name: "Follow-Up Reminder",
    type: "follow-up-reminder",
    channel: "fax",
    subject: "Reminder: Outstanding Items for Referral - {{patientName}}",
    body: `Dear Dr. {{referringPhysicianName}},

This is a follow-up reminder regarding our request for additional documentation for {{patientName}} (DOB: {{patientDOB}}, Referral ID: {{referralId}}).

The following items remain outstanding:

{{missingItemsList}}

This is reminder #{{reminderNumber}}. Our original request was sent on {{originalRequestDate}}.

Please fax the requested documents to (416) 555-0101 as soon as possible. If the items are not received within {{remainingDays}} business days, the referral will be returned.

Thank you,
Sunnybrook Schulich Heart Centre
Referral Intake Team`,
    triggerEvent: "referral.followup_due",
    isActive: true,
    variables: ["patientName", "patientDOB", "referringPhysicianName", "referralId", "missingItemsList", "reminderNumber", "originalRequestDate", "remainingDays"],
  },
  {
    id: "tmpl-6",
    name: "Voice Follow-Up Script",
    type: "follow-up-reminder",
    channel: "voice",
    subject: "Voice Follow-Up Call",
    body: "Automated voice follow-up script for missing items",
    voiceScript: `Hello, this is an automated call from Sunnybrook Schulich Heart Centre regarding a referral for patient {{patientName}}.

We previously sent a fax requesting additional documentation. We are still waiting for the following items: {{missingItemsList}}.

Please fax these documents to (416) 555-0101 at your earliest convenience.

If you have questions, please call our referral intake line at (416) 555-0100.

Thank you. Goodbye.`,
    isActive: true,
    variables: ["patientName", "missingItemsList"],
  },
];
