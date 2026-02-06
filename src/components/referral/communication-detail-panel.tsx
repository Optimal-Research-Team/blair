"use client";

import { Communication } from "@/types/communication";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  X,
  Bot,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  VoicemailIcon,
  PhoneMissed,
  PhoneOff,
  Calendar,
  User,
  FileText,
  Printer,
  Mail,
  Sparkles,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

interface CommunicationDetailPanelProps {
  communication: Communication;
  onClose: () => void;
}

export function CommunicationDetailPanel({
  communication,
  onClose,
}: CommunicationDetailPanelProps) {
  const { voiceCallDetails } = communication;
  const isAI = communication.initiator === "ai";
  const isVoiceCall = communication.channel === "voice";
  const isFax = communication.channel === "fax";
  const isEmail = communication.channel === "email";
  const isScheduled = communication.status === "scheduled";
  const isCompleted = communication.status === "sent" || communication.status === "received";

  const getChannelIcon = () => {
    switch (communication.channel) {
      case "voice":
        return <Phone className="h-5 w-5" />;
      case "fax":
        return <Printer className="h-5 w-5" />;
      case "email":
        return <Mail className="h-5 w-5" />;
    }
  };

  const getChannelColor = () => {
    switch (communication.channel) {
      case "voice":
        return isAI ? "text-purple-600 bg-purple-50" : "text-indigo-600 bg-indigo-50";
      case "fax":
        return "text-blue-600 bg-blue-50";
      case "email":
        return "text-cyan-600 bg-cyan-50";
    }
  };

  const getStatusBadge = () => {
    switch (communication.status) {
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Calendar className="h-3 w-3 mr-1" />
            Scheduled
          </Badge>
        );
      case "sent":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Sent
          </Badge>
        );
      case "awaiting":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Awaiting Response
          </Badge>
        );
      case "received":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Response Received
          </Badge>
        );
      case "escalated":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Escalated
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  const getOutcomeIcon = (outcome?: string) => {
    switch (outcome) {
      case "confirmed":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "voicemail":
        return <VoicemailIcon className="h-4 w-4 text-amber-500" />;
      case "no-answer":
        return <PhoneMissed className="h-4 w-4 text-red-500" />;
      case "busy":
        return <PhoneOff className="h-4 w-4 text-amber-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Phone className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Mock AI confidence scores for missing items
  const getAiConfidenceForItem = (item: string) => {
    // Simulate confidence scores
    const scores: Record<string, number> = {
      "ECG": 95,
      "Bloodwork (BNP)": 88,
      "Recent Echocardiogram": 92,
      "CT Aorta": 97,
      "Medication List": 85,
      "Clinical History": 90,
      "Patient demographics": 78,
    };
    return scores[item] || Math.floor(Math.random() * 20) + 75;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className={cn("flex items-center justify-between px-4 py-3 border-b", getChannelColor())}>
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded", getChannelColor())}>
            {getChannelIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-sm">
              {isVoiceCall && isAI ? "AI Agent Call" :
               isVoiceCall ? "Phone Call" :
               isFax ? "Fax Communication" :
               "Email Communication"}
              {isScheduled && " (Scheduled)"}
            </h3>
            <p className="text-xs opacity-80">
              {communication.recipientName}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Meta Info */}
      <div className="p-4 border-b bg-muted/30 space-y-3">
        {/* Status and Initiator */}
        <div className="flex items-center justify-between">
          {getStatusBadge()}
          <div className="flex items-center gap-1.5 text-sm">
            {isAI ? (
              <>
                <Bot className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700 font-medium">Blair AI</span>
              </>
            ) : (
              <>
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">Staff</span>
              </>
            )}
          </div>
        </div>

        {/* Recipient Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Recipient</p>
            <p className="font-medium">{communication.recipientName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {isVoiceCall ? "Phone" : isFax ? "Fax Number" : "Email"}
            </p>
            <p className="font-medium">
              {isVoiceCall ? communication.recipientPhone :
               isFax ? communication.recipientFax :
               communication.recipientEmail || "N/A"}
            </p>
          </div>
        </div>

        {/* Date/Time */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {isScheduled && communication.scheduledAt ? (
            <span>Scheduled for {format(new Date(communication.scheduledAt), "MMM d, yyyy 'at' h:mm a")}</span>
          ) : communication.sentAt ? (
            <span>Sent on {format(new Date(communication.sentAt), "MMM d, yyyy 'at' h:mm a")}</span>
          ) : (
            <span>Created {format(new Date(communication.createdAt), "MMM d, yyyy")}</span>
          )}
        </div>

        {/* Voice Call Specific - Duration and Outcome */}
        {isVoiceCall && voiceCallDetails?.outcome && (
          <div className="flex items-center gap-4 pt-2 border-t">
            <div className="flex items-center gap-2">
              {getOutcomeIcon(voiceCallDetails.outcome)}
              <span className="text-sm font-medium capitalize">{voiceCallDetails.outcome}</span>
            </div>
            {voiceCallDetails.duration && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Duration: {formatDuration(voiceCallDetails.duration)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Subject */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Subject</p>
            <p className="text-sm font-medium">{communication.subject}</p>
          </div>

          {/* Missing Items with AI Confidence (for AI-initiated communications) */}
          {isAI && communication.missingItems && communication.missingItems.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Requested Items
                {isAI && (
                  <span className="ml-2 text-blue-600">
                    <Sparkles className="h-3 w-3 inline mr-0.5" />
                    AI Confidence
                  </span>
                )}
              </p>
              <div className="space-y-2">
                {communication.missingItems.map((item, i) => {
                  const confidence = getAiConfidenceForItem(item);
                  return (
                    <div key={i} className="p-2 bg-muted/50 rounded-md">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item}</span>
                        <span className={cn(
                          "text-xs font-medium",
                          confidence >= 90 ? "text-emerald-600" :
                          confidence >= 75 ? "text-blue-600" : "text-amber-600"
                        )}>
                          {confidence}%
                        </span>
                      </div>
                      <Progress
                        value={confidence}
                        className={cn(
                          "h-1.5",
                          confidence >= 90 ? "[&>div]:bg-emerald-500" :
                          confidence >= 75 ? "[&>div]:bg-blue-500" : "[&>div]:bg-amber-500"
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Message Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">
                {isVoiceCall ? (isAI ? "AI Agent Script" : "Call Notes") :
                 isFax ? "Fax Content" : "Email Content"}
              </p>
              {isAI && (
                <Badge variant="secondary" className="text-[10px]">
                  <Sparkles className="h-2.5 w-2.5 mr-1" />
                  AI Generated
                </Badge>
              )}
            </div>
            <div className={cn(
              "p-4 rounded-lg border",
              isFax ? "bg-blue-50/50 border-blue-200" :
              isEmail ? "bg-cyan-50/50 border-cyan-200" :
              isAI ? "bg-purple-50/50 border-purple-200" : "bg-slate-50 border-slate-200"
            )}>
              <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                {communication.body}
              </pre>
            </div>
          </div>

          {/* Voice Call Transcript (for completed AI calls) */}
          {isVoiceCall && voiceCallDetails?.transcript && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Bot className="h-4 w-4 text-purple-600" />
                <p className="text-xs font-medium text-purple-700">Call Transcript</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed text-slate-800">
                  {voiceCallDetails.transcript}
                </pre>
              </div>
            </div>
          )}

          {/* Escalation Info */}
          {communication.escalationStrategy !== "none" && communication.status === "awaiting" && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-xs text-amber-800">
                <p className="font-medium">Auto-Escalation Scheduled</p>
                <p className="mt-1">
                  If no response received, will escalate via {
                    communication.escalationStrategy === "fax-then-voice" ? "phone call" :
                    communication.escalationStrategy === "voice-then-fax" ? "fax" :
                    "another fax"
                  } in {communication.escalationDelayDays} day{communication.escalationDelayDays !== 1 ? "s" : ""}.
                </p>
              </div>
            </div>
          )}

          {/* Response Received Indicator */}
          {communication.status === "received" && communication.responseReceivedAt && (
            <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div className="text-xs text-emerald-800">
                <p className="font-medium">Response Received</p>
                <p className="mt-1">
                  Documents received on {format(new Date(communication.responseReceivedAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          )}

          {/* View Original Document (for fax) */}
          {isFax && isCompleted && (
            <Button variant="outline" className="w-full" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Original Fax Document
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
