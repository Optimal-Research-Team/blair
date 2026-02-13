"use client";

import { use, useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { mockReferrals } from "@/data/mock-referrals";
import { mockPatients } from "@/data/mock-patients";
import { mockPhysicians } from "@/data/mock-physicians";
import { Patient, Physician } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { UrgencyRating } from "@/types/referral";
import { PriorityBadge } from "@/components/inbox/priority-badge";
import { cn } from "@/lib/utils";
import { formatRelativeTime, formatDate, formatPHN } from "@/lib/format";
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
  Save,
  Scissors,
  AlertTriangle,
  Check,
} from "lucide-react";
import Link from "next/link";
import { ReferralDocument, ReferralDocumentPage, TimelineEvent } from "@/types/referral";
import { CompletenessPanel } from "@/components/referral/completeness-panel";
import { CommunicationsThread } from "@/components/referral/communications-thread";
import { ComposeSlideOver, ComposeData } from "@/components/referral/compose-slide-over";
import { PatientIdentificationCard } from "@/components/patient/patient-identification-card";
import { ProviderIdentificationCard } from "@/components/provider/provider-identification-card";
import { HighlightOverlay } from "@/components/highlight/highlight-overlay";
import { useHighlightStore } from "@/stores/use-highlight-store";
import {
  useIntegrationStore,
  createUrgentReferralTicket,
  createUrgentReferralSlackActivity,
} from "@/stores/use-integration-store";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

interface Props {
  params: Promise<{ id: string }>;
}

// Status steps for the workflow stepper
const STATUS_STEPS = [
  { key: "triage", label: "Triage" },
  { key: "incomplete", label: "Incomplete" },
  { key: "pending-review", label: "Pending Review" },
  { key: "routed", label: "Routed to Cerebrum" },
];

const STATUS_ORDER = ["triage", "incomplete", "pending-review", "routed", "declined"];

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

  // Urgency triage state
  const [urgencyRating, setUrgencyRating] = useState<UrgencyRating>(
    referral?.urgencyRating || "unknown"
  );
  const [urgencyConfirmed, setUrgencyConfirmed] = useState<boolean>(
    referral?.urgencyConfirmedBy === "human" ||
    (referral?.urgencyConfirmedBy === "ai" && (referral?.urgencyConfidence || 0) >= 90)
  );

  // Integration dialogs state
  const [showZendeskDialog, setShowZendeskDialog] = useState(false);
  const [showSlackDialog, setShowSlackDialog] = useState(false);
  const [createdTicketNumber, setCreatedTicketNumber] = useState("");
  const [createdSlackChannel, setCreatedSlackChannel] = useState("");

  // Integration store
  const { addZendeskTicket, addSlackActivity } = useIntegrationStore();

  const handleConfirmUrgency = () => {
    if (urgencyRating === "unknown") {
      toast.error("Please select an urgency level first");
      return;
    }
    setUrgencyConfirmed(true);

    if (urgencyRating === "urgent" && referral) {
      // Create Zendesk ticket
      const ticket = createUrgentReferralTicket(referral.id, referral.patientName);
      addZendeskTicket(ticket);
      setCreatedTicketNumber(ticket.ticketNumber);

      // Create Slack notification
      const slackActivity = createUrgentReferralSlackActivity(referral.id, referral.patientName);
      addSlackActivity(slackActivity);
      setCreatedSlackChannel(slackActivity.channel);

      // Show success toast and then dialogs
      toast.success("Referral marked as URGENT", {
        description: "Creating Zendesk ticket and Slack notification...",
      });

      // Show Zendesk dialog first, then Slack
      setTimeout(() => setShowZendeskDialog(true), 500);
    } else {
      toast.success("Referral marked as NOT URGENT");
    }
  };

  // Decline confirmation dialog state
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [showDeclineReason, setShowDeclineReason] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  const handleDeclineClick = () => {
    setShowDeclineConfirm(true);
  };

  const handleDeclineConfirm = () => {
    setShowDeclineConfirm(false);
    setShowDeclineReason(true);
  };

  const handleDeclineFax = () => {
    if (!declineReason.trim()) {
      toast.error("Please provide a reason for declining");
      return;
    }
    toast.success("Decline reason sent via fax", {
      description: `Fax sent to ${referral?.referringPhysicianName}`,
    });
    setShowDeclineReason(false);
    setDeclineReason("");
    setTimeout(() => router.push("/referrals"), 1500);
  };

  // Patient identification state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(() => {
    return mockPatients.find((p) => p.id === referral?.patientId) || null;
  });

  const handlePatientChange = (patient: Patient) => {
    setSelectedPatient(patient);
    toast.success(`Patient updated to ${patient.firstName} ${patient.lastName}`);
  };

  // Find matching physician based on referring physician fax
  const { matchedPhysician, providerMatchConfidence } = useMemo(() => {
    const physicianFaxDigits = referral?.referringPhysicianFax?.replace(/\D/g, "") || "";
    if (physicianFaxDigits.length > 0) {
      const found = mockPhysicians.find((p) => {
        const pFaxDigits = p.fax.replace(/\D/g, "");
        return pFaxDigits === physicianFaxDigits;
      });
      return { matchedPhysician: found, providerMatchConfidence: found ? 95 : undefined };
    }
    return { matchedPhysician: null, providerMatchConfidence: undefined };
  }, [referral?.referringPhysicianFax]);

  const [selectedProvider, setSelectedProvider] = useState<Physician | null>(
    matchedPhysician || null
  );

  const handleProviderChange = (provider: Physician) => {
    setSelectedProvider(provider);
    toast.success(`Provider updated to Dr. ${provider.firstName} ${provider.lastName}`);
  };

  // Highlight store for linked scrolling
  const {
    activePageNumber,
    activeDocumentId,
    activeBoundingBox,
    isTransitioning,
    setTransitioning,
  } = useHighlightStore();

  // Sync tab with URL params when they change
  useEffect(() => {
    if (tabParam === "comms") {
      setActiveTab("comms");
    } else if (tabParam === "timeline") {
      setActiveTab("timeline");
    }
  }, [tabParam]);

  // Auto-navigate to highlighted page/document
  useEffect(() => {
    if (!referral || activePageNumber === null) return;

    // Find the target document index based on activeDocumentId
    let targetDocIndex = selectedDocIndex;
    if (activeDocumentId) {
      const docIdx = referral.documents.findIndex((d) => d.id === activeDocumentId);
      if (docIdx >= 0 && docIdx !== selectedDocIndex) {
        targetDocIndex = docIdx;
      }
    }

    // Get the target page index within that document
    const targetPageIndex = activePageNumber - 1;
    const targetDoc = referral.documents[targetDocIndex];

    // Only navigate if we're on a different page/document
    if (
      targetDocIndex !== selectedDocIndex ||
      (targetDoc && targetPageIndex !== selectedPageIndex && targetPageIndex < targetDoc.pages.length)
    ) {
      setTransitioning(true);
      setSelectedDocIndex(targetDocIndex);
      setSelectedPageIndex(Math.min(targetPageIndex, targetDoc?.pages.length - 1 || 0));
      const timer = setTimeout(() => setTransitioning(false), 300);
      return () => clearTimeout(timer);
    }
  }, [activePageNumber, activeDocumentId, referral, selectedDocIndex, selectedPageIndex, setTransitioning]);

  // Check if highlight should be visible on current page
  const isHighlightVisible =
    activeBoundingBox !== null &&
    activePageNumber === selectedPageIndex + 1 &&
    (!activeDocumentId || activeDocumentId === referral?.documents[selectedDocIndex]?.id) &&
    !isTransitioning;

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

  // Get patient info extracted fields from the original referral's first page
  const { patientExtractedFields, originalReferralDocId } = useMemo(() => {
    const originalReferral = referral.documents.find(d => d.type === "original-referral");
    if (originalReferral && originalReferral.pages.length > 0) {
      return {
        patientExtractedFields: originalReferral.pages[0].extractedFields || [],
        originalReferralDocId: originalReferral.id,
      };
    }
    return { patientExtractedFields: [], originalReferralDocId: undefined };
  }, [referral.documents]);

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
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {referral.patientDob && (
                  <>
                    <span>DOB: {formatDate(referral.patientDob)}</span>
                    <span>·</span>
                  </>
                )}
                {referral.patientOhip && (
                  <>
                    <span>OHIP: {formatPHN(referral.patientOhip)}</span>
                    <span>·</span>
                  </>
                )}
                <span className="flex items-center gap-1">
                  <Stethoscope className="h-3 w-3" />
                  {referral.referringPhysicianName}
                </span>
                <span>·</span>
                <span>{formatRelativeTime(referral.receivedDate)}</span>
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
        <div className="w-24 flex-shrink-0 border-r bg-muted/30 overflow-y-auto p-2">
          {referral.documents.map((doc, docIndex) => (
            <div key={doc.id} className="mb-3">
              {/* Document header */}
              <div className={cn(
                "px-1.5 py-1 rounded-t text-[10px] font-medium flex items-center gap-1",
                doc.type === "original-referral" && "bg-blue-100 text-blue-800",
                doc.type === "response" && "bg-emerald-100 text-emerald-800",
                doc.type === "additional" && "bg-gray-100 text-gray-800"
              )}>
                {doc.type === "original-referral" && <FileText className="h-2.5 w-2.5" />}
                {doc.type === "response" && <ArrowUpRight className="h-2.5 w-2.5" />}
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

        {/* Resizable document viewer and review panel */}
        <ResizablePanelGroup orientation="horizontal" className="flex-1">
          {/* Center: Document viewer */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="flex flex-col h-full bg-muted/10">
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
              className="bg-white shadow-lg rounded border relative"
              style={{
                width: `${(8.5 * 72 * zoom) / 100}px`,
                minHeight: `${(11 * 72 * zoom) / 100}px`,
              }}
            >
              {/* Highlight overlay for linked scrolling */}
              {activeBoundingBox && (
                <HighlightOverlay
                  boundingBox={activeBoundingBox}
                  zoom={zoom}
                  isVisible={isHighlightVisible}
                />
              )}

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
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right: Tabbed review panel */}
          <ResizablePanel defaultSize={50} minSize={25}>
            <div className="border-l bg-background flex flex-col h-full">
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
            <TabsContent value="review" className="flex-1 overflow-y-auto m-0 p-4 space-y-3">
              {/* Patient Identification */}
              <PatientIdentificationCard
                patient={selectedPatient}
                matchConfidence={referral.aiConfidence}
                matchStatus={selectedPatient ? "matched" : "not-found"}
                onPatientChange={handlePatientChange}
                extractedFields={patientExtractedFields}
                documentId={originalReferralDocId}
              />

              {/* Provider Identification */}
              <ProviderIdentificationCard
                provider={
                  selectedProvider
                    ? {
                        name: `Dr. ${selectedProvider.firstName} ${selectedProvider.lastName}`,
                        designation: selectedProvider.designation,
                        clinicName: selectedProvider.clinicName,
                        clinicAddress: selectedProvider.clinicAddress,
                        clinicCity: selectedProvider.clinicCity,
                        clinicProvince: selectedProvider.clinicProvince,
                        phone: selectedProvider.phone,
                        fax: selectedProvider.fax,
                        email: selectedProvider.email,
                        cpsoNumber: selectedProvider.cpsoNumber,
                      }
                    : {
                        name: referral.referringPhysicianName,
                        clinicName: referral.clinicName,
                        clinicCity: referral.clinicCity,
                        phone: referral.referringPhysicianPhone,
                        fax: referral.referringPhysicianFax,
                        email: referral.referringPhysicianEmail,
                      }
                }
                matchConfidence={selectedProvider ? providerMatchConfidence : undefined}
                onProviderChange={handleProviderChange}
              />

              {/* Urgency Triage */}
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Urgency Triage</span>
                    {referral.urgencyConfirmedBy === "ai" && referral.urgencyConfidence && !urgencyConfirmed && (
                      <Badge variant="outline" className="text-[10px]">
                        AI {referral.urgencyConfidence}%
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={urgencyRating}
                      onValueChange={(val) => {
                        setUrgencyRating(val as UrgencyRating);
                        // Allow re-confirmation by resetting confirmed state when changed
                        if (urgencyConfirmed) setUrgencyConfirmed(false);
                      }}
                    >
                      <SelectTrigger className={cn(
                        "w-[130px] h-8 text-xs",
                        urgencyRating === "urgent" && "border-red-300 bg-red-50 text-red-700",
                        urgencyRating === "not-urgent" && "border-emerald-300 bg-emerald-50 text-emerald-700",
                        urgencyRating === "unknown" && "border-amber-300 bg-amber-50 text-amber-700"
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unknown">
                          <span className="flex items-center gap-1.5">
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                            Unknown
                          </span>
                        </SelectItem>
                        <SelectItem value="urgent">
                          <span className="flex items-center gap-1.5">
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                            Urgent
                          </span>
                        </SelectItem>
                        <SelectItem value="not-urgent">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            Not Urgent
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {!urgencyConfirmed ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs px-3"
                        onClick={handleConfirmUrgency}
                        disabled={urgencyRating === "unknown"}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Confirm
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 h-8 px-3 flex items-center">
                        <Check className="h-2.5 w-2.5 mr-1" />
                        Confirmed
                      </Badge>
                    )}
                  </div>
                </div>
                {urgencyRating === "unknown" && !urgencyConfirmed && (
                  <p className="text-xs text-amber-600 mt-2">
                    Urgency must be confirmed before referral can progress from Triage stage.
                  </p>
                )}
              </div>

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

              {/* Review action buttons */}
              <div className="border-t pt-4 space-y-2">
                <Button className="w-full h-9" onClick={() => toast.success("Review saved successfully")}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Review
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="h-9 text-xs"
                    onClick={() => {
                      toast.success("Referral marked as completed and filed", {
                        description: `Filed referral for ${referral.patientName}`,
                      });
                      setTimeout(() => router.push("/worklist"), 1500);
                    }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Complete & File
                  </Button>
                  <Button
                    variant="outline"
                    className="h-9 text-xs"
                    disabled={totalPages <= 1}
                    asChild={totalPages > 1}
                  >
                    {totalPages > 1 ? (
                      <Link href={`/split/${referral.id}`}>
                        <Scissors className="h-3.5 w-3.5 mr-1" />
                        Split Document
                      </Link>
                    ) : (
                      <>
                        <Scissors className="h-3.5 w-3.5 mr-1" />
                        Split Document
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Decline Referral - at the very bottom */}
              {!isDeclined && referral.status !== "routed" && (
                <div className="border-t pt-4 mt-4">
                  <Button
                    variant="outline"
                    className="w-full h-9 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={handleDeclineClick}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline Referral
                  </Button>
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
          </ResizablePanel>
        </ResizablePanelGroup>
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

      {/* Decline Confirmation Dialog */}
      <Dialog open={showDeclineConfirm} onOpenChange={setShowDeclineConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Referral</DialogTitle>
            <DialogDescription>
              Are you sure you want to decline this referral for {referral.patientName}?
              This action will require you to provide a reason and fax it back to the referring physician.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeclineConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeclineConfirm}>
              Yes, Decline Referral
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Reason Dialog */}
      <Dialog open={showDeclineReason} onOpenChange={setShowDeclineReason}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Reason</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this referral. This will be faxed to {referral.referringPhysicianName}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter reason for declining referral..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeclineReason(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeclineFax} disabled={!declineReason.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send Decline via Fax
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Zendesk Ticket Created Dialog */}
      <Dialog open={showZendeskDialog} onOpenChange={(open) => {
        setShowZendeskDialog(open);
        // Show Slack dialog after Zendesk is closed
        if (!open) {
          setTimeout(() => setShowSlackDialog(true), 300);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <svg className="h-5 w-5 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div>
                <DialogTitle className="text-lg">Zendesk Ticket Created</DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-left">
              An urgent ticket has been automatically created in Zendesk to track this referral.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-orange-800">Ticket #{createdTicketNumber}</p>
                <p className="text-xs text-orange-600">Urgent referral: {referral.patientName}</p>
              </div>
              <Badge className="bg-red-100 text-red-700 border-red-200">Urgent</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              This ticket will be automatically closed when the referral is routed.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowZendeskDialog(false)}
            >
              Close
            </Button>
            <Button asChild>
              <Link href="/integrations/zendesk">
                View in Zendesk Feed
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Slack Notification Sent Dialog */}
      <Dialog open={showSlackDialog} onOpenChange={setShowSlackDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <svg className="h-5 w-5 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                </svg>
              </div>
              <div>
                <DialogTitle className="text-lg">Slack Notification Sent</DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-left">
              An urgent alert has been posted to Slack to notify the team.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-purple-800">{createdSlackChannel}</p>
                <p className="text-xs text-purple-600">🚨 Urgent referral triaged: {referral.patientName}</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Sent</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Team members can view and act on this alert from Slack or the Blair Slack feed.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSlackDialog(false)}
            >
              Close
            </Button>
            <Button asChild>
              <Link href="/integrations/slack">
                View in Slack Feed
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
