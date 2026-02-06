"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockCommunications } from "@/data/mock-communications";
import { mockTemplates } from "@/data/mock-templates";
import { mockReferrals } from "@/data/mock-referrals";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Mail,
  Printer,
  Eye,
  RotateCcw,
  Bell,
  ArrowUpRight,
  X,
  User,
} from "lucide-react";
import { CommunicationStatus, CommunicationType } from "@/types";

const STATUS_CONFIG: Record<CommunicationStatus, { label: string; icon: React.ElementType; color: string }> = {
  scheduled: { label: "Scheduled", icon: Clock, color: "bg-gray-100 text-gray-700" },
  sent: { label: "Sent", icon: Send, color: "bg-blue-100 text-blue-700" },
  awaiting: { label: "Awaiting Response", icon: Clock, color: "bg-amber-100 text-amber-700" },
  received: { label: "Response Received", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700" },
  escalated: { label: "Escalated", icon: AlertTriangle, color: "bg-orange-100 text-orange-700" },
  failed: { label: "Failed", icon: XCircle, color: "bg-red-100 text-red-700" },
  closed: { label: "Closed", icon: CheckCircle2, color: "bg-gray-100 text-gray-700" },
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
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading communications...</div>}>
      <CommunicationsPageContent />
    </Suspense>
  );
}

function CommunicationsPageContent() {
  const searchParams = useSearchParams();
  const referralIdFilter = searchParams.get("referralId");

  // Get the referral if we're filtering by one
  const filteredReferral = referralIdFilter
    ? mockReferrals.find((r) => r.id === referralIdFilter)
    : null;

  // Filter communications based on referralId query param
  const filteredCommunications = useMemo(() => {
    if (!referralIdFilter) return mockCommunications;
    return mockCommunications.filter((c) => c.referralId === referralIdFilter);
  }, [referralIdFilter]);

  const [selectedComm, setSelectedComm] = useState(filteredCommunications[0]);

  const pendingFollowUps = filteredCommunications.filter(
    (c) => c.status === "awaiting" || c.status === "scheduled"
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Communications"
        description={
          filteredReferral
            ? `Showing communications for ${filteredReferral.patientName}`
            : "Outbound communication tracking and templates"
        }
        action={
          <div className="flex items-center gap-3 text-sm">
            {filteredReferral && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/communications">
                  <X className="h-3 w-3 mr-1" />
                  Clear Filter
                </Link>
              </Button>
            )}
            <div className="flex items-center gap-1.5 text-amber-600">
              <Bell className="h-4 w-4" />
              <span className="font-semibold">{pendingFollowUps.length} pending follow-ups</span>
            </div>
          </div>
        }
      />

      {/* Referral context banner when filtering */}
      {filteredReferral && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Referral: {filteredReferral.patientName}
                  </p>
                  <p className="text-xs text-blue-700">
                    Referred by {filteredReferral.referringPhysicianName} · Status: {filteredReferral.status}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-blue-700 border-blue-300 hover:bg-blue-100" asChild>
                <Link href={`/referrals/${filteredReferral.id}`}>
                  View Referral
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
              {filteredCommunications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No communications found</p>
                  {referralIdFilter && (
                    <Button variant="link" size="sm" asChild className="mt-2">
                      <Link href="/communications">View all communications</Link>
                    </Button>
                  )}
                </div>
              ) : null}
              {filteredCommunications.map((comm) => {
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
                        {" "}{comm.sentAt ? formatRelativeTime(comm.sentAt) : "Scheduled"}
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
                      {selectedComm.referralId && (() => {
                        const linkedReferral = mockReferrals.find(r => r.id === selectedComm.referralId);
                        return linkedReferral ? (
                          <p className="flex items-center gap-1">
                            Referral:
                            <Link
                              href={`/referrals/${linkedReferral.id}`}
                              className="text-primary hover:underline inline-flex items-center gap-0.5"
                            >
                              {linkedReferral.patientName}
                              <ArrowUpRight className="h-3 w-3" />
                            </Link>
                          </p>
                        ) : null;
                      })()}
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
                      {selectedComm.referralId && !referralIdFilter && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/referrals/${selectedComm.referralId}`}>
                            <FileText className="h-3.5 w-3.5 mr-1" />
                            View Referral
                          </Link>
                        </Button>
                      )}
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
                  <div className="text-center">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No pending follow-ups</p>
                    {referralIdFilter && (
                      <Button variant="link" size="sm" asChild className="mt-2">
                        <Link href="/communications?tab=follow-ups">View all follow-ups</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              pendingFollowUps.map((comm) => {
                const linkedReferral = mockReferrals.find(r => r.id === comm.referralId);
                return (
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
                            {linkedReferral && !referralIdFilter && (
                              <Link
                                href={`/referrals/${linkedReferral.id}`}
                                className="text-xs text-primary hover:underline inline-flex items-center gap-0.5"
                              >
                                {linkedReferral.patientName}
                                <ArrowUpRight className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          {comm.scheduledAt && (
                            <p className="text-xs text-muted-foreground">
                              Scheduled: {new Date(comm.scheduledAt).toLocaleDateString()}
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
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
