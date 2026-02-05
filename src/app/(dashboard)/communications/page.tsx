"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockCommunications } from "@/data/mock-communications";
import { mockTemplates } from "@/data/mock-templates";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Mail,
  Printer,
  Eye,
  RotateCcw,
  Bell,
} from "lucide-react";
import { CommunicationStatus, CommunicationType } from "@/types";

const STATUS_CONFIG: Record<CommunicationStatus, { label: string; icon: React.ElementType; color: string }> = {
  draft: { label: "Draft", icon: FileText, color: "bg-gray-100 text-gray-700" },
  sent: { label: "Sent", icon: Send, color: "bg-blue-100 text-blue-700" },
  delivered: { label: "Delivered", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700" },
  failed: { label: "Failed", icon: XCircle, color: "bg-red-100 text-red-700" },
  "pending-response": { label: "Awaiting Response", icon: Clock, color: "bg-amber-100 text-amber-700" },
  "response-received": { label: "Response Received", icon: CheckCircle2, color: "bg-green-100 text-green-700" },
};

const TYPE_CONFIG: Record<CommunicationType, { label: string; color: string }> = {
  "referral-received": { label: "Referral Received", color: "bg-blue-50 text-blue-700" },
  "missing-items": { label: "Missing Items", color: "bg-amber-50 text-amber-700" },
  decline: { label: "Decline", color: "bg-red-50 text-red-700" },
  "appointment-confirmation": { label: "Appointment", color: "bg-emerald-50 text-emerald-700" },
  "follow-up-reminder": { label: "Follow-up", color: "bg-purple-50 text-purple-700" },
  custom: { label: "Custom", color: "bg-gray-50 text-gray-700" },
};

export default function CommunicationsPage() {
  const [selectedComm, setSelectedComm] = useState(mockCommunications[0]);

  const pendingFollowUps = mockCommunications.filter(
    (c) => c.followUpDueAt && c.status !== "response-received"
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Communications"
        description="Outbound communication tracking and templates"
        action={
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5 text-amber-600">
              <Bell className="h-4 w-4" />
              <span className="font-semibold">{pendingFollowUps.length} pending follow-ups</span>
            </div>
          </div>
        }
      />

      <Tabs defaultValue="log">
        <TabsList>
          <TabsTrigger value="log">Communication Log</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="follow-ups">Follow-ups</TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* List */}
            <div className="lg:col-span-2 space-y-2 max-h-[600px] overflow-auto">
              {mockCommunications.map((comm) => {
                const statusConfig = STATUS_CONFIG[comm.status];
                const typeConfig = TYPE_CONFIG[comm.type];
                const StatusIcon = statusConfig.icon;
                const isSelected = selectedComm?.id === comm.id;

                return (
                  <button
                    key={comm.id}
                    onClick={() => setSelectedComm(comm)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all",
                      isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{comm.recipientName}</span>
                      <Badge className={cn("text-[9px] shrink-0", statusConfig.color)} variant="secondary">
                        <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{comm.subject}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={cn("text-[9px]", typeConfig.color)} variant="secondary">
                        {typeConfig.label}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {comm.channel === "fax" ? <Printer className="h-3 w-3 inline" /> : <Mail className="h-3 w-3 inline" />}
                        {" "}{comm.sentAt ? formatRelativeTime(comm.sentAt) : "Draft"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Preview */}
            <div className="lg:col-span-3">
              {selectedComm && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{selectedComm.subject}</CardTitle>
                      <Badge className={cn("text-xs", STATUS_CONFIG[selectedComm.status].color)} variant="secondary">
                        {STATUS_CONFIG[selectedComm.status].label}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>To: {selectedComm.recipientName} ({selectedComm.recipientFax || selectedComm.recipientEmail})</p>
                      <p>Channel: {selectedComm.channel.toUpperCase()} &middot; Type: {TYPE_CONFIG[selectedComm.type].label}</p>
                      {selectedComm.sentAt && <p>Sent: {new Date(selectedComm.sentAt).toLocaleString()}</p>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/30 rounded-lg p-4 text-sm whitespace-pre-wrap font-mono border">
                      {selectedComm.body}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => toast.info("Resending...")}>
                        <RotateCcw className="h-3.5 w-3.5 mr-1" />
                        Resend
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toast.info("Preview opened")}>
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{template.name}</CardTitle>
                    <Badge variant={template.isActive ? "default" : "secondary"} className="text-[10px]">
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Badge className={cn("text-[10px]", TYPE_CONFIG[template.type].color)} variant="secondary">
                    {TYPE_CONFIG[template.type].label}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{template.subject}</p>
                  {template.variables.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {template.variables.map((v) => (
                        <Badge key={v} variant="outline" className="text-[9px] font-mono">
                          {`{{${v}}}`}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {template.triggerEvent && (
                    <p className="text-[10px] text-muted-foreground">
                      Trigger: {template.triggerEvent}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="follow-ups" className="mt-4">
          <div className="space-y-3">
            {pendingFollowUps.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
                  No pending follow-ups
                </CardContent>
              </Card>
            ) : (
              pendingFollowUps.map((comm) => (
                <Card key={comm.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{comm.recipientName}</p>
                        <p className="text-xs text-muted-foreground">{comm.subject}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={cn("text-[10px]", TYPE_CONFIG[comm.type].color)} variant="secondary">
                            {TYPE_CONFIG[comm.type].label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Reminders sent: {comm.remindersSent}
                          </span>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        {comm.followUpDueAt && (
                          <p className="text-xs text-muted-foreground">
                            Follow-up due: {new Date(comm.followUpDueAt).toLocaleDateString()}
                          </p>
                        )}
                        <Button size="sm" onClick={() => toast.info("Reminder sent")}>
                          <Send className="h-3.5 w-3.5 mr-1" />
                          Send Reminder
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
