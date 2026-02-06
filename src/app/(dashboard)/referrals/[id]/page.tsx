"use client";

import { use, useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { mockReferrals } from "@/data/mock-referrals";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriorityBadge } from "@/components/inbox/priority-badge";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Printer,
  Bot,
  User,
  Plus,
  Calendar,
  Stethoscope,
  FileCheck,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { ReferralDocument, ReferralDocumentPage, TimelineEvent } from "@/types/referral";
import { CompletenessPanel } from "@/components/referral/completeness-panel";
import { CommunicationsThread } from "@/components/referral/communications-thread";
import { ComposeSlideOver, ComposeData } from "@/components/referral/compose-slide-over";

interface Props {
  params: Promise<{ id: string }>;
}

// Status steps for the workflow stepper
const STATUS_STEPS = [
  { key: "triage", label: "Triage" },
  { key: "incomplete", label: "Incomplete" },
  { key: "pending-response", label: "Pending" },
  { key: "complete", label: "Complete" },
  { key: "routed", label: "Routed" },
  { key: "accepted", label: "Accepted" },
  { key: "booked", label: "Booked" },
];

const STATUS_ORDER = ["triage", "incomplete", "pending-response", "complete", "routed", "accepted", "declined", "booked"];

export default function ReferralDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <ReferralDetailContent params={params} />
    </Suspense>
  );
}

function ReferralDetailContent({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const referral = mockReferrals.find((r) => r.id === id);

  // Check for tab query param (e.g., ?tab=comms)
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam === "comms" ? "comms" : tabParam === "timeline" ? "timeline" : "review";

  // UI State
  const [activeTab, setActiveTab] = useState<"review" | "comms" | "timeline">(initialTab);
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [zoom, setZoom] = useState(100);

  // Completeness state for the panel
  const [completenessItems, setCompletenessItems] = useState(
    referral?.completenessItems || []
  );

  // Compose slide-over state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeChannel, setComposeChannel] = useState<"fax" | "phone" | "email" | undefined>(undefined);

  // Sync tab with URL params when they change
  useEffect(() => {
    if (tabParam === "comms") {
      setActiveTab("comms");
    } else if (tabParam === "timeline") {
      setActiveTab("timeline");
    }
  }, [tabParam]);

  if (!referral) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-lg text-muted-foreground">Referral not found</p>
        <Button variant="outline" asChild>
          <Link href="/referrals">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Referrals
          </Link>
        </Button>
      </div>
    );
  }

  // Get all pages across all documents for navigation
  const allPages = useMemo(() => {
    const pages: { doc: ReferralDocument; page: ReferralDocumentPage; docIndex: number; pageIndex: number }[] = [];
    referral.documents.forEach((doc, docIndex) => {
      doc.pages.forEach((page, pageIndex) => {
        pages.push({ doc, page, docIndex, pageIndex });
      });
    });
    return pages;
  }, [referral.documents]);

  const currentDoc = referral.documents[selectedDocIndex];
  const currentPage = currentDoc?.pages[selectedPageIndex];
  const totalPages = allPages.length;

  // Calculate global page index for navigation
  const globalPageIndex = useMemo(() => {
    let count = 0;
    for (let i = 0; i < selectedDocIndex; i++) {
      count += referral.documents[i].pages.length;
    }
    return count + selectedPageIndex;
  }, [selectedDocIndex, selectedPageIndex, referral.documents]);

  const goToPrevPage = () => {
    if (selectedPageIndex > 0) {
      setSelectedPageIndex(selectedPageIndex - 1);
    } else if (selectedDocIndex > 0) {
      const prevDoc = referral.documents[selectedDocIndex - 1];
      setSelectedDocIndex(selectedDocIndex - 1);
      setSelectedPageIndex(prevDoc.pages.length - 1);
    }
  };

  const goToNextPage = () => {
    if (selectedPageIndex < currentDoc.pages.length - 1) {
      setSelectedPageIndex(selectedPageIndex + 1);
    } else if (selectedDocIndex < referral.documents.length - 1) {
      setSelectedDocIndex(selectedDocIndex + 1);
      setSelectedPageIndex(0);
    }
  };

  const selectPage = (docIndex: number, pageIndex: number) => {
    setSelectedDocIndex(docIndex);
    setSelectedPageIndex(pageIndex);
  };

  // Get current status position for stepper
  const currentStatusIndex = STATUS_ORDER.indexOf(referral.status);
  const isDeclined = referral.status === "declined";

  // Handlers
  const handleViewPage = (pageNumber: number) => {
    // Find the page across all documents
    let foundDocIndex = 0;
    let foundPageIndex = pageNumber - 1;

    for (let i = 0; i < referral.documents.length; i++) {
      const doc = referral.documents[i];
      if (foundPageIndex < doc.pages.length) {
        foundDocIndex = i;
        break;
      }
      foundPageIndex -= doc.pages.length;
    }

    setSelectedDocIndex(foundDocIndex);
    setSelectedPageIndex(foundPageIndex);
  };

  const handleMarkFound = (itemId: string) => {
    setCompletenessItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, status: "found" as const } : item
      )
    );
    toast.success("Item marked as found");
  };

  const handleMarkMissing = (itemId: string) => {
    setCompletenessItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, status: "missing" as const } : item
      )
    );
  };

  const handleUnmarkFound = (itemId: string) => {
    setCompletenessItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, status: "missing" as const } : item
      )
    );
  };

  const handleRequestItem = () => {
    setComposeChannel(undefined);
    setIsComposeOpen(true);
  };

  const handleOpenCompose = (channel?: "fax" | "phone" | "email") => {
    setComposeChannel(channel);
    setIsComposeOpen(true);
  };

  const handleComposeSend = (data: ComposeData) => {
    // Mark requested items as requested
    setCompletenessItems(prev =>
      prev.map(item =>
        data.selectedItems.includes(item.id)
          ? { ...item, requestedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const handleAccept = () => {
    toast.success("Referral accepted");
  };

  const handleDecline = () => {
    toast.info("Opening decline dialog...");
  };

  const handleRequestMissingItems = () => {
    setComposeChannel(undefined);
    setIsComposeOpen(true);
  };

  // Completeness score calculation
  const completenessScore = Math.round(
    (completenessItems.filter((i) => i.status === "found").length /
      completenessItems.length) *
      100
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Back + Patient info */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">{referral.patientName}</h1>
                <PriorityBadge priority={referral.priority} />
                {referral.pendingCommunicationsCount > 0 && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {referral.pendingCommunicationsCount} awaiting
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Stethoscope className="h-3 w-3" />
                  {referral.referringPhysicianName}
                </span>
                <span>·</span>
                <span>{formatRelativeTime(referral.receivedDate)}</span>
                <span>·</span>
                <span>{referral.documents.reduce((acc, d) => acc + d.pageCount, 0)} pages</span>
              </div>
            </div>
          </div>

          {/* Right: Status stepper (simplified) */}
          <div className="flex items-center gap-1">
            {STATUS_STEPS.slice(0, isDeclined ? 4 : undefined).map((step, idx) => {
              const stepIndex = STATUS_ORDER.indexOf(step.key);
              const isActive = step.key === referral.status;
              const isPast = stepIndex < currentStatusIndex;

              return (
                <div key={step.key} className="flex items-center">
                  <div
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      isActive && "bg-primary text-primary-foreground",
                      isPast && "bg-emerald-100 text-emerald-700",
                      !isActive && !isPast && "bg-muted text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </div>
                  {idx < (isDeclined ? 3 : STATUS_STEPS.length - 1) && (
                    <ChevronRight className="h-3 w-3 text-muted-foreground mx-0.5" />
                  )}
                </div>
              );
            })}
            {isDeclined && (
              <>
                <ChevronRight className="h-3 w-3 text-muted-foreground mx-0.5" />
                <div className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                  Declined
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main content: 3-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Document thumbnails */}
        <div className="w-48 flex-shrink-0 border-r bg-muted/30 overflow-y-auto p-2">
          {referral.documents.map((doc, docIndex) => (
            <div key={doc.id} className="mb-4">
              {/* Document header */}
              <div className={cn(
                "px-2 py-1.5 rounded-t text-xs font-medium flex items-center gap-1.5",
                doc.type === "original-referral" && "bg-blue-100 text-blue-800",
                doc.type === "response" && "bg-emerald-100 text-emerald-800",
                doc.type === "additional" && "bg-gray-100 text-gray-800"
              )}>
                {doc.type === "original-referral" && <FileText className="h-3 w-3" />}
                {doc.type === "response" && <ArrowUpRight className="h-3 w-3" />}
                <span className="truncate">{doc.label}</span>
              </div>

              {/* Page thumbnails */}
              <div className="space-y-1 mt-1">
                {doc.pages.map((page, pageIndex) => (
                  <button
                    key={page.id}
                    onClick={() => selectPage(docIndex, pageIndex)}
                    className={cn(
                      "w-full aspect-[8.5/11] rounded border-2 bg-white flex items-center justify-center text-xs text-muted-foreground transition-colors",
                      selectedDocIndex === docIndex && selectedPageIndex === pageIndex
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <span className="text-[10px]">
                      Page {page.pageNumber}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Center: Document viewer */}
        <div className="flex-1 flex flex-col bg-muted/10">
          {/* Viewer toolbar */}
          <div className="flex-shrink-0 border-b bg-background px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevPage}
                disabled={globalPageIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[80px] text-center">
                {globalPageIndex + 1} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextPage}
                disabled={globalPageIndex === totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(Math.max(50, zoom - 25))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground w-12 text-center">{zoom}%</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(Math.min(200, zoom + 25))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <div className="w-px h-4 bg-border mx-2" />
              <Button variant="ghost" size="sm">
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Document display area */}
          <div className="flex-1 overflow-auto p-4 flex items-start justify-center">
            <div
              className="bg-white shadow-lg rounded border"
              style={{
                width: `${(8.5 * 72 * zoom) / 100}px`,
                minHeight: `${(11 * 72 * zoom) / 100}px`,
              }}
            >
              {/* Mock fax content */}
              <div className="p-8 text-sm text-muted-foreground">
                <div className="text-center mb-6 pb-4 border-b">
                  <div className="font-mono text-xs">FAX TRANSMISSION</div>
                  <div className="text-lg font-semibold text-foreground mt-2">
                    {currentDoc?.label}
                  </div>
                  <div className="text-xs mt-1">
                    Page {currentPage?.pageNumber} of {currentDoc?.pageCount}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-foreground font-medium">
                    {currentPage?.detectedContent}
                  </p>

                  {/* Mock content lines */}
                  <div className="space-y-2 pt-4 border-t">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-3 bg-muted/50 rounded"
                        style={{ width: `${60 + Math.random() * 40}%` }}
                      />
                    ))}
                  </div>

                  {/* Signature line if last page */}
                  {currentPage?.pageNumber === currentDoc?.pageCount && (
                    <div className="mt-8 pt-4 border-t">
                      <div className="text-xs text-muted-foreground">Signature:</div>
                      <div className="h-8 border-b border-muted-foreground/30 w-48 mt-2" />
                      <div className="text-xs mt-1">{referral.referringPhysicianName}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Tabbed review panel */}
        <div className="w-96 flex-shrink-0 border-l bg-background flex flex-col">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex flex-col h-full">
            <TabsList className="w-full rounded-none border-b bg-transparent h-auto p-0">
              <TabsTrigger
                value="review"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
              >
                <FileCheck className="h-4 w-4 mr-1.5" />
                Review
              </TabsTrigger>
              <TabsTrigger
                value="comms"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 relative"
              >
                <MessageSquare className="h-4 w-4 mr-1.5" />
                Comms
                {referral.pendingCommunicationsCount > 0 && (
                  <span className="absolute top-2 right-4 h-2 w-2 rounded-full bg-amber-500" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
              >
                <Clock className="h-4 w-4 mr-1.5" />
                Timeline
              </TabsTrigger>
            </TabsList>

            {/* Review Tab */}
            <TabsContent value="review" className="flex-1 overflow-y-auto m-0 p-4 space-y-4">
              {/* Completeness Panel */}
              <CompletenessPanel
                items={completenessItems}
                score={completenessScore}
                aiConfidence={referral.aiConfidence}
                onViewPage={handleViewPage}
                onRequestItem={handleRequestItem}
                onRequestMissingItems={handleRequestMissingItems}
                onMarkFound={handleMarkFound}
                onMarkMissing={handleMarkMissing}
                onUnmarkFound={handleUnmarkFound}
              />

              {/* Clinical Summary */}
              <div className="border rounded-lg p-3 space-y-3">
                <h3 className="text-sm font-medium">Reason for Referral</h3>
                <p className="text-sm text-muted-foreground">{referral.reasonForReferral}</p>

                {referral.conditions.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Conditions</p>
                    <div className="flex flex-wrap gap-1">
                      {referral.conditions.map((c) => (
                        <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {referral.medications.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Medications</p>
                    <div className="flex flex-wrap gap-1">
                      {referral.medications.map((m) => (
                        <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Routing info */}
              {referral.assignedCardiologistName && (
                <div className="border rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Assigned to</p>
                  <p className="text-sm font-medium">{referral.assignedCardiologistName}</p>
                  {referral.appointmentDate && (
                    <div className="flex items-center gap-1 text-sm text-emerald-600 mt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Appointment: {referral.appointmentDate}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Decline reason if declined */}
              {referral.declineReason && (
                <div className="border border-red-200 bg-red-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-red-700 mb-1">Decline Reason</p>
                  <p className="text-sm text-red-800">{referral.declineReason}</p>
                </div>
              )}

              {/* Action buttons - only show Accept/Decline when complete */}
              {!isDeclined && referral.status !== "booked" && completenessScore === 100 && (
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAccept}>
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      Accept
                    </Button>
                    <Button variant="destructive" onClick={handleDecline}>
                      <XCircle className="h-4 w-4 mr-1.5" />
                      Decline
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Communications Tab - Full Thread View */}
            <TabsContent value="comms" className="flex-1 overflow-hidden m-0">
              <CommunicationsThread
                communications={referral.communications}
                documents={referral.documents}
                recipientName={referral.referringPhysicianName}
                recipientClinic={referral.clinicName}
                recipientPhone={referral.referringPhysicianPhone}
                onViewDocument={(docId) => {
                  const docIndex = referral.documents.findIndex(d => d.id === docId);
                  if (docIndex >= 0) {
                    setSelectedDocIndex(docIndex);
                    setSelectedPageIndex(0);
                    setActiveTab("review");
                  }
                }}
                onSendFax={() => handleOpenCompose("fax")}
                onCall={() => handleOpenCompose("phone")}
                onEmail={() => handleOpenCompose("email")}
              />
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="flex-1 overflow-y-auto m-0 p-4">
              <div className="space-y-4">
                {referral.timeline.sort((a, b) =>
                  new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                ).map((event, idx) => (
                  <TimelineItem key={event.id} event={event} isLast={idx === referral.timeline.length - 1} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Compose Slide-Over */}
      <ComposeSlideOver
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        recipientName={referral.referringPhysicianName}
        recipientClinic={referral.clinicName}
        recipientFax={referral.referringPhysicianFax}
        recipientPhone={referral.referringPhysicianPhone}
        recipientEmail={referral.referringPhysicianEmail}
        missingItems={completenessItems.filter(i => i.status === "missing")}
        preSelectedChannel={composeChannel}
        onSend={handleComposeSend}
      />
    </div>
  );
}

// Timeline item component
function TimelineItem({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
  const getEventIcon = () => {
    switch (event.type) {
      case "referral-received":
        return <FileText className="h-3.5 w-3.5" />;
      case "ai-classified":
        return <Bot className="h-3.5 w-3.5" />;
      case "status-changed":
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case "communication-sent":
        return <Send className="h-3.5 w-3.5" />;
      case "communication-received":
        return <ArrowUpRight className="h-3.5 w-3.5" />;
      case "document-added":
        return <Plus className="h-3.5 w-3.5" />;
      case "item-marked-found":
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case "item-marked-missing":
        return <XCircle className="h-3.5 w-3.5" />;
      case "assigned":
        return <User className="h-3.5 w-3.5" />;
      case "note-added":
        return <MessageSquare className="h-3.5 w-3.5" />;
      default:
        return <Clock className="h-3.5 w-3.5" />;
    }
  };

  const getEventColor = () => {
    switch (event.type) {
      case "communication-sent":
      case "communication-received":
        return "bg-blue-100 text-blue-700";
      case "document-added":
      case "item-marked-found":
        return "bg-emerald-100 text-emerald-700";
      case "item-marked-missing":
        return "bg-red-100 text-red-700";
      case "ai-classified":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="relative flex gap-3">
      {/* Line */}
      {!isLast && (
        <div className="absolute left-[13px] top-7 bottom-0 w-px bg-border" />
      )}

      {/* Icon */}
      <div className={cn("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0", getEventColor())}>
        {getEventIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium">{event.title}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {event.actor === "ai" ? (
              <Bot className="h-3 w-3" />
            ) : (
              <User className="h-3 w-3" />
            )}
          </div>
        </div>
        {event.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {formatRelativeTime(event.timestamp)}
          {event.actorName && ` · ${event.actorName}`}
        </p>
      </div>
    </div>
  );
}
