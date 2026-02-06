"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  X,
  Send,
  FileText,
  Phone,
  Mail,
  Bot,
  Clock,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { CompletenessItem } from "@/types/referral";

interface ComposeSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientClinic?: string;
  recipientFax?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  missingItems: CompletenessItem[];
  preSelectedChannel?: "fax" | "phone" | "email";
  onSend: (data: ComposeData) => void;
}

export interface ComposeData {
  channel: "fax" | "phone" | "email";
  selectedItems: string[];
  message: string;
  scheduleFollowUp: boolean;
  followUpDays: number;
  followUpMethod: "call" | "fax" | "email" | "ai-call";
  isAiAgentCall?: boolean; // For phone channel - let AI agent make the call
}

// AI-generated message templates based on missing items
function generateMessage(items: CompletenessItem[], channel: "fax" | "phone" | "email", recipientName: string, isAiAgentCall: boolean = false): string {
  const itemNames = items.map(i => i.label).join(", ");

  if (channel === "phone") {
    if (isAiAgentCall) {
      return `AI Agent Call Script:\n\nHello, this is Blair AI calling on behalf of Sunnybrook Cardiology regarding a referral.\n\nWe are requesting the following documentation:\n${items.map(i => `• ${i.label}`).join("\n")}\n\nPlease fax the documents to (416) 555-0101 or confirm when they will be available.\n\nThank you for your assistance.`;
    }
    return `Calling regarding referral - requesting: ${itemNames}.\n\nKey points to cover:\n- Confirm patient details\n- Request missing documentation\n- Confirm fax number for documents`;
  }

  if (channel === "email") {
    return `Dear ${recipientName},\n\nWe are processing a referral from your office and require the following documentation to proceed:\n\n${items.map(i => `• ${i.label}`).join("\n")}\n\nPlease reply to this email with the requested documents or fax them to our office at your earliest convenience.\n\nThank you for your assistance.\n\nBest regards,\nCardiology Clinic`;
  }

  // Fax (default)
  return `RE: Request for Additional Documentation\n\nDear ${recipientName},\n\nWe have received a referral from your office and require the following documentation to complete our review:\n\n${items.map(i => `• ${i.label}`).join("\n")}\n\nPlease fax the requested documents to our office at your earliest convenience.\n\nThank you for your prompt attention to this matter.\n\nCardiology Clinic`;
}

export function ComposeSlideOver({
  isOpen,
  onClose,
  recipientName,
  recipientClinic,
  recipientFax,
  recipientPhone,
  recipientEmail,
  missingItems,
  preSelectedChannel,
  onSend,
}: ComposeSlideOverProps) {
  // Determine best channel based on available contact info
  const getRecommendedChannel = (): "fax" | "phone" | "email" => {
    if (recipientFax) return "fax";
    if (recipientPhone) return "phone";
    if (recipientEmail) return "email";
    return "fax";
  };

  const [channel, setChannel] = useState<"fax" | "phone" | "email">(
    preSelectedChannel || getRecommendedChannel()
  );
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(
    missingItems.map(i => i.id)
  );
  const [message, setMessage] = useState(() =>
    generateMessage(missingItems, preSelectedChannel || getRecommendedChannel(), recipientName)
  );
  const [scheduleFollowUp, setScheduleFollowUp] = useState(true);
  const [followUpDays, setFollowUpDays] = useState(2);
  const [followUpMethod, setFollowUpMethod] = useState<"call" | "fax" | "email" | "ai-call">("ai-call");
  const [isSending, setIsSending] = useState(false);
  const [isAiAgentCall, setIsAiAgentCall] = useState(true); // For phone channel - AI agent makes the call

  // Update message when channel changes
  const handleChannelChange = (newChannel: "fax" | "phone" | "email") => {
    setChannel(newChannel);
    const selectedItems = missingItems.filter(i => selectedItemIds.includes(i.id));
    setMessage(generateMessage(selectedItems, newChannel, recipientName, newChannel === "phone" && isAiAgentCall));
  };

  // Update message when AI agent call toggle changes
  const handleAiAgentCallChange = (enabled: boolean) => {
    setIsAiAgentCall(enabled);
    const selectedItems = missingItems.filter(i => selectedItemIds.includes(i.id));
    setMessage(generateMessage(selectedItems, channel, recipientName, enabled));
  };

  // Toggle item selection
  const toggleItem = (itemId: string) => {
    setSelectedItemIds(prev => {
      const newIds = prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];

      // Regenerate message with new selection
      const selectedItems = missingItems.filter(i => newIds.includes(i.id));
      if (selectedItems.length > 0) {
        setMessage(generateMessage(selectedItems, channel, recipientName, channel === "phone" && isAiAgentCall));
      }
      return newIds;
    });
  };

  const handleSend = async () => {
    if (selectedItemIds.length === 0) {
      toast.error("Please select at least one item to request");
      return;
    }

    setIsSending(true);

    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1500));

    onSend({
      channel,
      selectedItems: selectedItemIds,
      message,
      scheduleFollowUp,
      followUpDays,
      followUpMethod,
      isAiAgentCall: channel === "phone" && isAiAgentCall,
    });

    const channelLabel = channel === "fax" ? "Fax" :
      channel === "phone" ? (isAiAgentCall ? "AI Agent Call" : "Call notes") : "Email";

    toast.success(
      <div className="space-y-1">
        <div className="font-medium">
          {channel === "phone" && isAiAgentCall
            ? "AI Agent Call scheduled"
            : `${channelLabel} sent successfully`}
        </div>
        {channel === "phone" && isAiAgentCall && (
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Bot className="h-3 w-3" />
            AI will call {recipientName} within the next hour
          </div>
        )}
        {scheduleFollowUp && (
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Bot className="h-3 w-3" />
            AI follow-up {followUpMethod === "ai-call" ? "call" : followUpMethod} scheduled in {followUpDays} day{followUpDays !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    );

    setIsSending(false);
    onClose();
  };

  if (!isOpen) return null;

  const selectedItems = missingItems.filter(i => selectedItemIds.includes(i.id));

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 w-[560px] max-w-full bg-background shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
          <div>
            <h2 className="text-lg font-semibold">Request Missing Items</h2>
            <p className="text-sm text-muted-foreground">
              {recipientName}{recipientClinic ? ` · ${recipientClinic}` : ""}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Channel Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Communication Channel</Label>
            <RadioGroup
              value={channel}
              onValueChange={(v) => handleChannelChange(v as typeof channel)}
              className="grid grid-cols-3 gap-3"
            >
              <Label
                htmlFor="channel-fax"
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors",
                  channel === "fax"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground",
                  !recipientFax && "opacity-50 cursor-not-allowed"
                )}
              >
                <RadioGroupItem value="fax" id="channel-fax" className="sr-only" disabled={!recipientFax} />
                <FileText className={cn("h-5 w-5", channel === "fax" ? "text-primary" : "text-muted-foreground")} />
                <span className="text-sm font-medium">Fax</span>
                {recipientFax && (
                  <span className="text-[10px] text-muted-foreground">{recipientFax}</span>
                )}
                {channel === "fax" && getRecommendedChannel() === "fax" && (
                  <Badge variant="secondary" className="text-[10px] h-4">
                    <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                    Recommended
                  </Badge>
                )}
              </Label>

              <Label
                htmlFor="channel-phone"
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors",
                  channel === "phone"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground",
                  !recipientPhone && "opacity-50 cursor-not-allowed"
                )}
              >
                <RadioGroupItem value="phone" id="channel-phone" className="sr-only" disabled={!recipientPhone} />
                <Phone className={cn("h-5 w-5", channel === "phone" ? "text-primary" : "text-muted-foreground")} />
                <span className="text-sm font-medium">Call</span>
                {recipientPhone && (
                  <span className="text-[10px] text-muted-foreground">{recipientPhone}</span>
                )}
              </Label>

              <Label
                htmlFor="channel-email"
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors",
                  channel === "email"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground",
                  !recipientEmail && "opacity-50 cursor-not-allowed"
                )}
              >
                <RadioGroupItem value="email" id="channel-email" className="sr-only" disabled={!recipientEmail} />
                <Mail className={cn("h-5 w-5", channel === "email" ? "text-primary" : "text-muted-foreground")} />
                <span className="text-sm font-medium">Email</span>
                {recipientEmail && (
                  <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">{recipientEmail}</span>
                )}
              </Label>
            </RadioGroup>

            {/* AI Agent Call toggle - only shown for phone channel */}
            {channel === "phone" && recipientPhone && (
              <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-purple-600" />
                    <div>
                      <Label htmlFor="ai-agent-call" className="text-sm font-medium text-purple-900 cursor-pointer">
                        AI Agent Call
                      </Label>
                      <p className="text-xs text-purple-700">
                        Blair AI will make the call automatically
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="ai-agent-call"
                    checked={isAiAgentCall}
                    onCheckedChange={handleAiAgentCallChange}
                  />
                </div>
                {isAiAgentCall && (
                  <div className="mt-2 pt-2 border-t border-purple-200">
                    <div className="flex items-center gap-2 text-xs text-purple-700">
                      <Sparkles className="h-3 w-3" />
                      <span>AI will call, request documents, and log the conversation</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Items to Request */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Items to Request</Label>
              <span className="text-xs text-muted-foreground">
                {selectedItemIds.length} of {missingItems.length} selected
              </span>
            </div>
            <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
              {missingItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-md transition-colors",
                    selectedItemIds.includes(item.id) ? "bg-background" : "opacity-60"
                  )}
                >
                  <Checkbox
                    id={item.id}
                    checked={selectedItemIds.includes(item.id)}
                    onCheckedChange={() => toggleItem(item.id)}
                  />
                  <Label
                    htmlFor={item.id}
                    className="flex-1 text-sm cursor-pointer"
                  >
                    {item.label}
                  </Label>
                  {item.required && (
                    <Badge variant="outline" className="text-[10px] h-4 text-red-600 border-red-200">
                      Required
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                {channel === "phone"
                  ? (isAiAgentCall ? "AI Agent Script" : "Call Script / Notes")
                  : "Message"}
              </Label>
              <Badge variant="secondary" className="text-[10px]">
                <Sparkles className="h-2.5 w-2.5 mr-1" />
                AI Generated
              </Badge>
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[180px] text-sm font-mono"
              placeholder="Enter message..."
            />
          </div>

          {/* AI Follow-up Scheduling */}
          <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Bot className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="schedule-followup" className="text-sm font-medium text-blue-900">
                    Schedule AI Follow-up
                  </Label>
                  <Switch
                    id="schedule-followup"
                    checked={scheduleFollowUp}
                    onCheckedChange={setScheduleFollowUp}
                  />
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  AI agent will automatically follow up if no response is received
                </p>
              </div>
            </div>

            {scheduleFollowUp && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-blue-200">
                <div className="space-y-1.5">
                  <Label className="text-xs text-blue-800">Follow up in</Label>
                  <Select
                    value={followUpDays.toString()}
                    onValueChange={(v) => setFollowUpDays(parseInt(v))}
                  >
                    <SelectTrigger className="h-8 text-sm bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="2">2 days</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="5">5 days</SelectItem>
                      <SelectItem value="7">1 week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-blue-800">Follow-up method</Label>
                  <Select
                    value={followUpMethod}
                    onValueChange={(v) => setFollowUpMethod(v as typeof followUpMethod)}
                  >
                    <SelectTrigger className="h-8 text-sm bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai-call">
                        <span className="flex items-center gap-2">
                          <Bot className="h-3 w-3" /> AI Agent Call
                        </span>
                      </SelectItem>
                      <SelectItem value="call">
                        <span className="flex items-center gap-2">
                          <Phone className="h-3 w-3" /> Manual Call
                        </span>
                      </SelectItem>
                      <SelectItem value="fax">
                        <span className="flex items-center gap-2">
                          <FileText className="h-3 w-3" /> Fax Reminder
                        </span>
                      </SelectItem>
                      <SelectItem value="email">
                        <span className="flex items-center gap-2">
                          <Mail className="h-3 w-3" /> Email
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t px-6 py-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={onClose} disabled={isSending}>
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={isSending || selectedItemIds.length === 0}
                onClick={() => {
                  toast.info("Draft saved");
                  onClose();
                }}
              >
                Save as Draft
              </Button>
              <Button
                onClick={handleSend}
                disabled={isSending || selectedItemIds.length === 0}
                className="min-w-[120px]"
              >
                {isSending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    {channel === "phone" && isAiAgentCall ? (
                      <>
                        <Bot className="h-4 w-4 mr-2" />
                        Schedule AI Call
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {channel === "phone" ? "Log Call" : `Send ${channel === "fax" ? "Fax" : "Email"}`}
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
