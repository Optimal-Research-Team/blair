"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Communication } from "@/types/communication";
import { ReferralDocument } from "@/types/referral";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import {
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Bot,
  User,
  Printer,
  ExternalLink,
  Play,
  ChevronRight,
  Sparkles,
  Calendar,
  Eye,
} from "lucide-react";
import { CommunicationDetailPanel } from "./communication-detail-panel";

interface CommunicationsThreadProps {
  communications: Communication[];
  documents: ReferralDocument[];
  recipientName: string;
  recipientClinic?: string;
  recipientPhone?: string;
  onViewDocument?: (docId: string) => void;
  onSendFax?: () => void;
  onCall?: () => void;
  onEmail?: () => void;
}

// Group communications by date
interface DateGroup {
  label: string;
  date: Date;
  items: ThreadItem[];
}

// Unified thread item (can be a communication or a document receipt)
interface ThreadItem {
  id: string;
  type: "outbound" | "inbound" | "system";
  timestamp: Date;
  data: Communication | ReferralDocument;
  isDocument?: boolean;
}

const CHANNEL_CONFIG = {
  fax: { icon: Printer, label: "Fax", bgOut: "bg-blue-50", borderOut: "border-blue-200" },
  voice: { icon: Phone, label: "Call", bgOut: "bg-purple-50", borderOut: "border-purple-200" },
  email: { icon: Mail, label: "Email", bgOut: "bg-cyan-50", borderOut: "border-cyan-200" },
};

const STATUS_CONFIG = {
  scheduled: { label: "Scheduled", icon: Clock, color: "text-gray-500" },
  sent: { label: "Sent", icon: CheckCircle2, color: "text-blue-500" },
  awaiting: { label: "Awaiting", icon: Clock, color: "text-amber-500" },
  received: { label: "Received", icon: CheckCircle2, color: "text-emerald-500" },
  escalated: { label: "Escalated", icon: AlertTriangle, color: "text-orange-500" },
  failed: { label: "Failed", icon: AlertTriangle, color: "text-red-500" },
  closed: { label: "Closed", icon: CheckCircle2, color: "text-gray-500" },
};

function formatDateLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

function formatTime(date: Date): string {
  return format(date, "h:mm a");
}

export function CommunicationsThread({
  communications,
  documents,
  recipientName,
  recipientClinic,
  recipientPhone,
  onViewDocument,
  onSendFax,
  onCall,
  onEmail,
}: CommunicationsThreadProps) {
  const [selectedComm, setSelectedComm] = useState<Communication | null>(null);

  // Build unified timeline
  const dateGroups = useMemo(() => {
    const items: ThreadItem[] = [];

    // Add communications
    communications.forEach((comm) => {
      const timestamp = new Date(comm.sentAt || comm.createdAt);
      items.push({
        id: comm.id,
        type: comm.status === "received" ? "inbound" : "outbound",
        timestamp,
        data: comm,
        isDocument: false,
      });
    });

    // Add document receipts (responses)
    documents.forEach((doc) => {
      if (doc.type === "response" || doc.communicationId) {
        const timestamp = new Date(doc.receivedAt);
        items.push({
          id: doc.id,
          type: "inbound",
          timestamp,
          data: doc,
          isDocument: true,
        });
      }
    });

    // Sort by timestamp (newest first for reverse chronological)
    items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Group by date
    const groups: DateGroup[] = [];
    let currentGroup: DateGroup | null = null;

    items.forEach((item) => {
      if (!currentGroup || !isSameDay(currentGroup.date, item.timestamp)) {
        currentGroup = {
          label: formatDateLabel(item.timestamp),
          date: item.timestamp,
          items: [],
        };
        groups.push(currentGroup);
      }
      currentGroup.items.push(item);
    });

    return groups;
  }, [communications, documents]);

  const hasAwaitingItems = communications.some((c) => c.status === "awaiting");

  return (
    <div className="flex flex-col h-full">
      {/* Header with recipient info */}
      <div className="flex-shrink-0 p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">{recipientName}</h3>
            {recipientClinic && (
              <p className="text-xs text-muted-foreground">{recipientClinic}</p>
            )}
            {recipientPhone && (
              <p className="text-xs text-muted-foreground">{recipientPhone}</p>
            )}
          </div>
          {hasAwaitingItems && (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
              <Clock className="h-3 w-3 mr-1" />
              Awaiting response
            </Badge>
          )}
        </div>
      </div>

      {/* Thread content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {dateGroups.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Printer className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No communications yet</p>
            <p className="text-xs mt-1">Send a fax or make a call to start the conversation</p>
          </div>
        ) : (
          dateGroups.map((group) => (
            <div key={group.label}>
              {/* Date separator */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs font-medium text-muted-foreground px-2">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Items for this date */}
              <div className="space-y-3">
                {group.items.map((item) => (
                  <ThreadItemCard
                    key={item.id}
                    item={item}
                    onViewDocument={onViewDocument}
                    onViewComm={(comm) => setSelectedComm(comm)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Communication Detail Sheet */}
      <Sheet open={!!selectedComm} onOpenChange={(open) => !open && setSelectedComm(null)}>
        <SheetContent side="right" className="w-[480px] sm:max-w-[480px] p-0">
          {selectedComm && (
            <CommunicationDetailPanel
              communication={selectedComm}
              onClose={() => setSelectedComm(null)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Action bar */}
      <div className="flex-shrink-0 p-3 border-t bg-muted/30">
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={onSendFax}>
            <Printer className="h-4 w-4 mr-1.5" />
            Send Fax
          </Button>
          <Button variant="outline" size="sm" onClick={onCall}>
            <Phone className="h-4 w-4 mr-1.5" />
            Call Now
          </Button>
          <Button variant="outline" size="sm" onClick={onEmail}>
            <Mail className="h-4 w-4 mr-1.5" />
            Email
          </Button>
        </div>
      </div>
    </div>
  );
}

// Individual thread item card
function ThreadItemCard({
  item,
  onViewDocument,
  onViewComm,
}: {
  item: ThreadItem;
  onViewDocument?: (docId: string) => void;
  onViewComm?: (comm: Communication) => void;
}) {
  const isOutbound = item.type === "outbound";

  if (item.isDocument) {
    // Document receipt card
    const doc = item.data as ReferralDocument;
    return (
      <div className={cn("flex", isOutbound ? "justify-end" : "justify-start")}>
        <div
          className={cn(
            "max-w-[85%] rounded-lg border p-3",
            "bg-emerald-50 border-emerald-200"
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">
              Document Received
            </span>
            <span className="text-xs text-emerald-600 ml-auto">
              {formatTime(item.timestamp)}
            </span>
          </div>
          <p className="text-sm font-medium text-emerald-900">{doc.label}</p>
          <p className="text-xs text-emerald-700 mt-0.5">
            {doc.pageCount} page{doc.pageCount !== 1 ? "s" : ""}
          </p>
          {onViewDocument && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-7 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100 p-0"
              onClick={() => onViewDocument(doc.id)}
            >
              View Document
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Communication card
  const comm = item.data as Communication;
  const channel = CHANNEL_CONFIG[comm.channel];
  const status = STATUS_CONFIG[comm.status];
  const ChannelIcon = channel.icon;
  const StatusIcon = status.icon;
  const isAI = comm.initiator === "ai";
  const isAiVoiceCall = comm.channel === "voice" && isAI;
  const isScheduled = comm.status === "scheduled";

  return (
    <div className={cn("flex", isOutbound ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-lg border p-3 cursor-pointer hover:shadow-md transition-shadow",
          isOutbound
            ? cn(channel.bgOut, channel.borderOut)
            : "bg-white border-gray-200"
        )}
        onClick={() => onViewComm?.(comm)}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <ChannelIcon className={cn(
              "h-3.5 w-3.5",
              isAiVoiceCall ? "text-purple-600" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-xs",
              isAiVoiceCall ? "text-purple-700 font-medium" : "text-muted-foreground"
            )}>
              {isAiVoiceCall ? "AI Agent Call" : channel.label}
            </span>
          </div>
          {isOutbound && isAI && !isAiVoiceCall && (
            <div className="flex items-center gap-1 text-blue-600">
              <Bot className="h-3 w-3" />
              <span className="text-[10px] font-medium">Blair</span>
            </div>
          )}
          {isOutbound && !isAI && (
            <div className="flex items-center gap-1 text-gray-600">
              <User className="h-3 w-3" />
              <span className="text-[10px] font-medium">Staff</span>
            </div>
          )}
          <Badge variant="outline" className={cn(
            "ml-auto text-[10px] h-5 px-1.5",
            isAiVoiceCall ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-muted text-muted-foreground"
          )}>
            <Eye className="h-2.5 w-2.5 mr-0.5" />
            View
          </Badge>
        </div>

        {/* AI auto-action callout */}
        {isOutbound && isAI && comm.type === "missing-items" && (
          <div className="flex items-start gap-2 mb-2 p-2 rounded bg-blue-100/50 border border-blue-200/50">
            <Sparkles className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              Automatically requested missing items based on referral analysis
            </p>
          </div>
        )}

        {/* Subject */}
        <p className="text-sm font-medium mb-1">{comm.subject}</p>

        {/* Missing items */}
        {comm.missingItems && comm.missingItems.length > 0 && (
          <p className="text-xs text-muted-foreground mb-2">
            Requesting: {comm.missingItems.join(", ")}
          </p>
        )}

        {/* Voice call details - only show for completed calls with duration/outcome */}
        {comm.channel === "voice" && comm.voiceCallDetails && comm.voiceCallDetails.outcome && (
          <div className="mt-2 p-2 bg-white/50 rounded border text-xs">
            <div className="flex items-center justify-between">
              {comm.voiceCallDetails.duration !== undefined && (
                <span className="text-muted-foreground">
                  Duration: {Math.floor(comm.voiceCallDetails.duration / 60)}:
                  {(comm.voiceCallDetails.duration % 60).toString().padStart(2, "0")}
                </span>
              )}
              <Badge variant="outline" className="text-[10px] h-5">
                {comm.voiceCallDetails.outcome}
              </Badge>
            </div>
            {comm.voiceCallDetails.recordingUrl && (
              <Button variant="ghost" size="sm" className="h-6 text-xs mt-2 p-0">
                <Play className="h-3 w-3 mr-1" />
                Play Recording
              </Button>
            )}
          </div>
        )}

        {/* Status and escalation */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-current/10">
          <div className={cn(
            "flex items-center gap-1 text-xs",
            isScheduled && isAiVoiceCall ? "text-purple-600" : status.color
          )}>
            {isScheduled ? <Calendar className="h-3 w-3" /> : <StatusIcon className="h-3 w-3" />}
            <span>{isScheduled && isAiVoiceCall ? "Scheduled" : status.label}</span>
          </div>
          {comm.status === "awaiting" && comm.escalationStrategy !== "none" && (
            <span className="text-[10px] text-muted-foreground">
              Auto-call in {comm.escalationDelayDays}d
            </span>
          )}
          {isScheduled && comm.scheduledAt && (
            <span className="text-[10px] text-purple-600">
              {format(new Date(comm.scheduledAt), "MMM d 'at' h:mm a")}
            </span>
          )}
        </div>

        {/* Linked document indicator */}
        {comm.status === "received" && (
          <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
            <FileText className="h-3 w-3" />
            <span>Response received</span>
            <ChevronRight className="h-3 w-3" />
          </div>
        )}
      </div>
    </div>
  );
}
