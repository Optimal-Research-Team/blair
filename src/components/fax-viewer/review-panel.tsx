"use client";

import { Fax, Patient, ExtractedField, Physician, FaxSegment, getCerebrumCategory, getCerebrumCategoryInfo } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityBadge } from "@/components/inbox/priority-badge";
import { StatusBadge } from "@/components/inbox/status-badge";
import { SlaTimerCell } from "@/components/inbox/sla-timer-cell";
import { ConfidenceBar } from "@/components/inbox/confidence-bar";
import { PatientIdentificationCard } from "@/components/patient/patient-identification-card";
import { ProviderIdentificationCard } from "@/components/provider/provider-identification-card";
import { mockDocumentTypes } from "@/data/mock-document-types";
import { mockPatients } from "@/data/mock-patients";
import { mockPhysicians } from "@/data/mock-physicians";
import { mockReferrals } from "@/data/mock-referrals";
import Link from "next/link";
import { toast } from "sonner";
import {
  Save,
  CheckCircle2,
  Scissors,
  Lock,
  Bot,
  Loader2,
  ArrowRight,
  Link2,
  ExternalLink,
  FileText,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useHighlightStore } from "@/stores/use-highlight-store";
import { useRoutingStore } from "@/stores/use-routing-store";

interface ReviewPanelProps {
  fax: Fax;
  extractedFields?: ExtractedField[];
}

export function ReviewPanel({ fax, extractedFields }: ReviewPanelProps) {
  const router = useRouter();
  const { setHighlight, clearHighlight } = useHighlightStore();
  const { startRouting, completeRouting, setHighlightedNavItem } = useRoutingStore();
  const [docType, setDocType] = useState(fax.documentType);
  const [priority, setPriority] = useState(fax.priority);
  const [notes, setNotes] = useState(fax.notes || "");
  const [description, setDescription] = useState(fax.description || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(() => {
    return mockPatients.find((p) => p.id === fax.patientId) || null;
  });

  // Find matching physician based on sender fax number
  const { matchedPhysician, providerMatchConfidence } = useMemo(() => {
    const senderFaxDigits = fax.senderFaxNumber?.replace(/\D/g, "") || "";
    if (senderFaxDigits.length > 0) {
      const found = mockPhysicians.find((p) => {
        const physicianFaxDigits = p.fax.replace(/\D/g, "");
        return physicianFaxDigits === senderFaxDigits;
      });
      // If fax number matches exactly, high confidence
      return { matchedPhysician: found, providerMatchConfidence: found ? 95 : undefined };
    }
    return { matchedPhysician: null, providerMatchConfidence: undefined };
  }, [fax.senderFaxNumber]);

  const [selectedProvider, setSelectedProvider] = useState<Physician | null>(
    matchedPhysician || null
  );


  // Detect multi-patient/multi-document fax segments
  const detectedSegments: FaxSegment[] = useMemo(() => {
    // If segments are already detected on the fax, use those
    if (fax.detectedSegments && fax.detectedSegments.length > 0) {
      return fax.detectedSegments;
    }

    // Otherwise, analyze pages for potential splits
    const segments: FaxSegment[] = [];
    let currentSegment: FaxSegment | null = null;

    fax.pages.forEach((page, idx) => {
      const pagePatient = page.detectedPatient;
      const pageDocType = page.detectedDocType;

      // Check if this is a new segment (different patient or doc type)
      if (!currentSegment ||
          (pagePatient && currentSegment.patientName && pagePatient !== currentSegment.patientName) ||
          (pageDocType && currentSegment.documentType && pageDocType !== currentSegment.documentType && idx > 0)) {
        // Save previous segment
        if (currentSegment) {
          segments.push(currentSegment);
        }
        // Start new segment
        currentSegment = {
          id: `seg-${fax.id}-${segments.length + 1}`,
          startPage: page.pageNumber,
          endPage: page.pageNumber,
          patientName: pagePatient,
          documentType: pageDocType,
          cerebrumCategory: pageDocType ? getCerebrumCategory(pageDocType) : undefined,
          confidence: 85 + Math.random() * 10,
        };
      } else if (currentSegment) {
        // Extend current segment
        currentSegment.endPage = page.pageNumber;
      }
    });

    // Add final segment
    if (currentSegment) {
      segments.push(currentSegment);
    }

    return segments;
  }, [fax.pages, fax.detectedSegments, fax.id]);

  const isMultiSegmentFax = detectedSegments.length > 1;

  // Handle doc type change
  const handleDocTypeChange = (newDocType: string) => {
    setDocType(newDocType);
  };

  // Look up linked referral information
  const linkedReferral = useMemo(() => {
    if (!fax.linkedReferralId) return null;
    return mockReferrals.find((r) => r.id === fax.linkedReferralId) || null;
  }, [fax.linkedReferralId]);

  // Find the document type extracted field
  const docTypeField = extractedFields?.find(
    (f) => f.fieldType === "document-type"
  );

  // Handle hover on document type
  const handleDocTypeHover = () => {
    if (docTypeField) {
      setHighlight({
        fieldId: docTypeField.id,
        pageNumber: docTypeField.pageNumber,
        boundingBox: docTypeField.boundingBox,
      });
    }
  };

  const handlePatientChange = (patient: Patient) => {
    setSelectedPatient(patient);
    toast.success(`Patient updated to ${patient.firstName} ${patient.lastName}`);
  };

  const handleProviderChange = (provider: Physician) => {
    setSelectedProvider(provider);
    toast.success(`Provider updated to Dr. ${provider.firstName} ${provider.lastName}`);
  };

  // Check if this is a referral type
  const isReferralType = docType === "Referral" || docType === "Referral Form";
  const wasOriginallyReferral = fax.documentType === "Referral" || fax.documentType === "Referral Form";
  const isNewReferralClassification = isReferralType && !wasOriginallyReferral;

  const handleSave = () => {
    toast.success("Review saved successfully");
  };

  const handleComplete = () => {
    if (isReferralType) {
      // Referrals go through AI processing
      handleSubmitForAIProcessing();
    } else {
      toast.success("Fax marked as completed and filed", {
        description: `Filed as ${docType}`,
      });
      // Navigate back to inbox after short delay
      setTimeout(() => router.push("/inbox"), 1500);
    }
  };

  const handleSubmitForAIProcessing = () => {
    setIsProcessing(true);
    startRouting(fax.id, docType);

    // Simulate AI processing - randomly decide if auto-routed or needs review
    const willAutoRoute = Math.random() > 0.3; // 70% chance of auto-routing success

    toast.custom(
      (t) => (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg max-w-md">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 shrink-0">
              <Bot className="h-4 w-4 text-blue-600 animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900">
                Fax classified as Cardiology Referral
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Sent to Blair AI for attempted auto-routing...
              </p>
              <p className="text-[11px] text-blue-600 mt-1.5 italic">
                If auto-routing fails, will appear in &quot;Needs Review&quot;
              </p>
            </div>
          </div>
        </div>
      ),
      { duration: 3000 }
    );

    // Simulate AI processing delay
    setTimeout(() => {
      if (willAutoRoute) {
        // Auto-routed successfully
        completeRouting({
          faxId: fax.id,
          status: "auto-filed",
          destination: "auto-filed",
          documentType: docType,
          message: "Referral auto-routed successfully",
        });
        setHighlightedNavItem("/worklist?view=referral", 5000);

        toast.custom(
          (t) => (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 shadow-lg max-w-md">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-900">
                    Auto-Routed Successfully
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">
                    Referral extracted and routed to worklist
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-1">
                    Status: <span className="font-medium">Auto-Filed</span>
                  </p>
                </div>
              </div>
            </div>
          ),
          { duration: 4000 }
        );
      } else {
        // Needs human review
        completeRouting({
          faxId: fax.id,
          status: "needs-review",
          destination: "worklist-referral",
          documentType: docType,
          message: "Referral requires human review",
        });
        setHighlightedNavItem("/worklist?view=referral", 5000);

        toast.custom(
          (t) => (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg max-w-md">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 shrink-0">
                  <FileText className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900">
                    Sent to Needs Review
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    AI could not auto-route — requires human review
                  </p>
                  <p className="text-[11px] text-amber-600 mt-1">
                    Status: <span className="font-medium">Pending Review</span>
                  </p>
                </div>
              </div>
            </div>
          ),
          { duration: 4000 }
        );
      }

      setIsProcessing(false);
      // Navigate to worklist after showing result
      setTimeout(() => router.push("/worklist?view=referral"), 1000);
    }, 2500);
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="border-b px-4 py-3 bg-muted/30">
        <h3 className="font-semibold text-sm">Review Panel</h3>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {/* Linked Referral Alert Banner */}
        {linkedReferral && (
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-300 rounded-lg shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 shrink-0">
              <Link2 className="h-4 w-4 text-amber-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-amber-900">
                  Existing Referral in System
                </span>
              </div>
              <p className="text-xs text-amber-800 mb-2">
                {fax.linkedReferralReason || "This document is associated with an existing referral"}
              </p>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-amber-800">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="font-medium">{linkedReferral.patientName}</span>
                </div>
                <span className="text-amber-600">•</span>
                <span className="text-amber-700 capitalize">{linkedReferral.status}</span>
                <span className="text-amber-600">•</span>
                <span className="text-amber-700">{linkedReferral.completenessScore}% complete</span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <Link
                  href={`/referrals/${linkedReferral.id}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 hover:text-amber-900 hover:underline"
                >
                  View Referral
                  <ExternalLink className="h-3 w-3" />
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200 hover:text-amber-900"
                  onClick={() => {
                    toast.success("Document attached to referral", {
                      description: `Linked to referral for ${linkedReferral.patientName}`,
                    });
                    // In a real app, this would update the referral's documents and potentially mark completeness items
                    setTimeout(() => router.push(`/referrals/${linkedReferral.id}`), 1500);
                  }}
                >
                  <Link2 className="h-3 w-3 mr-1" />
                  Attach & View
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Patient Identification - Top priority */}
        <PatientIdentificationCard
          patient={selectedPatient}
          matchConfidence={fax.patientMatchConfidence}
          matchStatus={fax.patientMatchStatus}
          onPatientChange={handlePatientChange}
          extractedFields={extractedFields}
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
                  name: fax.senderName,
                  fax: fax.senderFaxNumber,
                }
          }
          matchConfidence={selectedProvider ? providerMatchConfidence : undefined}
          onProviderChange={handleProviderChange}
        />

        {/* Status & SLA */}
        <Card>
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <StatusBadge status={fax.status} />
              <SlaTimerCell
                deadline={fax.slaDeadline}
                receivedAt={fax.receivedAt}
              />
            </div>
            <div className="flex items-center justify-between">
              <PriorityBadge priority={fax.priority} />
              {fax.lockedBy && (
                <div className="flex items-center gap-1 text-amber-600 text-xs">
                  <Lock className="h-3 w-3" />
                  <span>Locked</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Detection */}
        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              AI Detection
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div
              className={docTypeField ? "hover:bg-muted/50 rounded px-1 -mx-1 transition-colors cursor-pointer" : ""}
              onMouseEnter={handleDocTypeHover}
              onMouseLeave={clearHighlight}
            >
              <Label className="text-xs">Document Type</Label>
              <ConfidenceBar
                confidence={fax.documentTypeConfidence}
                label={fax.documentType}
                showPercentage
              />
            </div>
          </CardContent>
        </Card>

        {/* Edit fields */}
        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Review Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Document Type</Label>
              <Select value={docType} onValueChange={handleDocTypeChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockDocumentTypes.map((dt) => (
                    <SelectItem key={dt.id} value={dt.name}>
                      {dt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs min-h-[60px] resize-none"
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs min-h-[60px] resize-none"
                placeholder="Add review notes..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Multi-segment detection alert */}
        {isMultiSegmentFax && (
          <Card className="border-amber-200 bg-amber-50/30">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-800">
                  <span className="font-medium">Multi-document fax detected</span>
                  <p className="mt-0.5">
                    This fax contains {detectedSegments.length} separate documents:
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {detectedSegments.map((seg) => {
                      const catInfo = seg.cerebrumCategory ? getCerebrumCategoryInfo(seg.cerebrumCategory) : null;
                      return (
                        <li key={seg.id} className="flex items-center gap-1.5">
                          <span className="text-amber-600">•</span>
                          <span>
                            Pages {seg.startPage}-{seg.endPage}:
                          </span>
                          {seg.patientName && (
                            <span className="font-medium">{seg.patientName}</span>
                          )}
                          {seg.documentType && (
                            <span className="text-amber-600">({seg.documentType})</span>
                          )}
                          {catInfo && (
                            <Badge variant="outline" className="text-[9px] h-4 px-1 bg-purple-100 text-purple-700 border-purple-300">
                              → {catInfo.label}
                            </Badge>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 h-6 text-xs bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200"
                    onClick={() => router.push(`/split/${fax.id}`)}
                  >
                    <Scissors className="h-3 w-3 mr-1" />
                    Split & Route Separately
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions */}
      <div className="border-t p-3 space-y-2 bg-muted/20">
        {/* Show AI processing info for referrals */}
        {isReferralType && (
          <div className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md mb-2">
            <Bot className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-800">
              <span className="font-medium">Referral detected.</span>{" "}
              Completing will send this to AI for automatic extraction of patient info, physician details, and clinical data.
            </div>
          </div>
        )}

        <Button className="w-full h-9" onClick={handleSave} disabled={isProcessing}>
          <Save className="h-4 w-4 mr-2" />
          Save Review
        </Button>

        <div className="grid grid-cols-2 gap-2">
          {isReferralType ? (
            <Button
              className="h-9 text-xs bg-blue-600 hover:bg-blue-700 col-span-2"
              onClick={handleComplete}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Bot className="h-3.5 w-3.5 mr-1" />
                  Send to AI Processing
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                className="h-9 text-xs"
                onClick={handleComplete}
                disabled={isProcessing}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Complete & File
              </Button>
              <Button
                variant="outline"
                className="h-9 text-xs"
                disabled={isProcessing || fax.pageCount <= 1}
                asChild={fax.pageCount > 1}
              >
                {fax.pageCount > 1 ? (
                  <a href={`/split/${fax.id}`}>
                    <Scissors className="h-3.5 w-3.5 mr-1" />
                    Split Document
                  </a>
                ) : (
                  <>
                    <Scissors className="h-3.5 w-3.5 mr-1" />
                    Split Document
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
