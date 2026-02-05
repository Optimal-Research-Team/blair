export type CommunicationType = "referral-received" | "missing-items" | "decline" | "appointment-confirmation" | "follow-up-reminder" | "custom";
export type CommunicationChannel = "fax" | "email";
export type CommunicationStatus = "draft" | "sent" | "delivered" | "failed" | "pending-response" | "response-received";

export interface Communication {
  id: string;
  referralId?: string;
  faxId?: string;
  templateId: string;
  type: CommunicationType;
  channel: CommunicationChannel;
  status: CommunicationStatus;
  recipientName: string;
  recipientFax?: string;
  recipientEmail?: string;
  subject: string;
  body: string;
  sentAt?: string;
  responseReceivedAt?: string;
  followUpDueAt?: string;
  remindersSent: number;
  createdAt: string;
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  type: CommunicationType;
  subject: string;
  body: string;
  triggerEvent?: string;
  isActive: boolean;
  variables: string[];
}
