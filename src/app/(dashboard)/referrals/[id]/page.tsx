"use client";

import { use, useState } from "react";
import { mockReferrals } from "@/data/mock-referrals";
import { mockPatients } from "@/data/mock-patients";
import { mockPhysicians } from "@/data/mock-physicians";
import { mockStaff } from "@/data/mock-staff";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PriorityBadge } from "@/components/inbox/priority-badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Stethoscope,
  FileText,
  CheckCircle2,
  Send,
  XCircle,
  Calendar,
} from "lucide-react";
import Link from "next/link";

const STEPS = [
  { id: 1, label: "Patient", icon: User },
  { id: 2, label: "Physician", icon: Stethoscope },
  { id: 3, label: "Referral Details", icon: FileText },
  { id: 4, label: "Review & Action", icon: CheckCircle2 },
];

interface Props {
  params: Promise<{ id: string }>;
}

export default function ReferralDetailPage({ params }: Props) {
  const { id } = use(params);
  const referral = mockReferrals.find((r) => r.id === id);
  const [currentStep, setCurrentStep] = useState(1);
  const [completenessItems, setCompletenessItems] = useState(
    referral?.completenessItems || []
  );

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

  const patient = mockPatients.find((p) => p.id === referral.patientId);
  const physician = mockPhysicians.find(
    (p) => p.id === referral.referringPhysicianId
  );

  const completenessScore = Math.round(
    (completenessItems.filter((i) => i.present).length /
      completenessItems.length) *
      100
  );

  const toggleCompleteness = (itemId: string) => {
    setCompletenessItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, present: !item.present } : item
      )
    );
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Referral — ${referral.patientName}`}
        description={`From ${referral.referringPhysicianName}`}
        action={
          <Button variant="outline" asChild>
            <Link href="/referrals">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
        }
      />

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.id;
          const isComplete = currentStep > step.id;

          return (
            <div key={step.id} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => setCurrentStep(step.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full",
                  isActive && "bg-primary text-primary-foreground",
                  isComplete && "bg-emerald-100 text-emerald-700",
                  !isActive && !isComplete && "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <StepIcon className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.id}</span>
              </button>
              {index < STEPS.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">First Name</Label>
                    <Input defaultValue={patient?.firstName || ""} className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Last Name</Label>
                    <Input defaultValue={patient?.lastName || ""} className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Date of Birth</Label>
                    <Input defaultValue={patient?.dateOfBirth || ""} className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">PHN</Label>
                    <Input defaultValue={patient?.phn || ""} className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Phone</Label>
                    <Input defaultValue={patient?.phone || ""} className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Gender</Label>
                    <Select defaultValue={patient?.gender || ""}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Male</SelectItem>
                        <SelectItem value="F">Female</SelectItem>
                        <SelectItem value="O">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {patient?.conditions && patient.conditions.length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Existing Conditions</Label>
                    <div className="flex gap-1.5 flex-wrap">
                      {patient.conditions.map((c) => (
                        <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {patient?.medications && patient.medications.length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Current Medications</Label>
                    <div className="flex gap-1.5 flex-wrap">
                      {patient.medications.map((m) => (
                        <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Referring Physician</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Physician Name</Label>
                    <Input defaultValue={physician ? `${physician.firstName} ${physician.lastName}` : referral.referringPhysicianName} className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Specialty</Label>
                    <Input defaultValue={physician?.specialty || ""} className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Clinic</Label>
                    <Input defaultValue={physician?.clinicName || ""} className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Phone</Label>
                    <Input defaultValue={physician?.phone || ""} className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Fax</Label>
                    <Input defaultValue={physician?.fax || ""} className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">City</Label>
                    <Input defaultValue={physician?.clinicCity || ""} className="h-9" />
                  </div>
                </div>
                {physician && (
                  <div className="bg-blue-50 rounded-lg p-3 text-xs space-y-1">
                    <p className="font-medium text-blue-700">AI Physician Match</p>
                    <p className="text-blue-600">
                      Matched based on fax number and header. CPSO #{physician.cpsoNumber}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Referral Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Reason for Referral</Label>
                  <Textarea defaultValue={referral.reasonForReferral} className="text-sm min-h-[80px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Clinical History</Label>
                  <Textarea defaultValue={referral.clinicalHistory} className="text-sm min-h-[80px]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Priority</Label>
                    <Select defaultValue={referral.priority}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stat">STAT</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="routine">Routine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Assign to Cardiologist</Label>
                    <Select defaultValue={referral.assignedCardiologist || ""}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        {mockStaff.filter(s => s.role === "physician").map((doc) => (
                          <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {referral.conditions.length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Conditions</Label>
                    <div className="flex gap-1.5 flex-wrap">
                      {referral.conditions.map((c) => (
                        <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Review Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Patient: </span>
                      <span className="font-medium">{referral.patientName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Referring: </span>
                      <span className="font-medium">{referral.referringPhysicianName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Priority: </span>
                      <PriorityBadge priority={referral.priority} />
                    </div>
                    <div>
                      <span className="text-muted-foreground">Completeness: </span>
                      <span className={cn("font-medium", completenessScore === 100 ? "text-emerald-600" : "text-amber-600")}>
                        {completenessScore}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Reason: </span>
                    <p className="text-sm">{referral.reasonForReferral}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-3">
                <Button className="h-12 bg-emerald-600 hover:bg-emerald-700" onClick={() => toast.success("Referral accepted")}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Accept
                </Button>
                <Button variant="destructive" className="h-12" onClick={() => toast.info("Referral declined")}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline
                </Button>
                <Button variant="outline" className="h-12" onClick={() => toast.info("Request missing items sent")}>
                  <Send className="h-4 w-4 mr-2" />
                  Request Missing Items
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Completeness checker */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Completeness Checker</span>
                <span className={cn(
                  "text-lg font-bold tabular-nums",
                  completenessScore === 100 ? "text-emerald-600" : completenessScore >= 60 ? "text-amber-600" : "text-red-600"
                )}>
                  {completenessScore}%
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={completenessScore} className="h-2" />
              <div className="space-y-1.5 pt-2">
                {completenessItems.map((item) => (
                  <label
                    key={item.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg text-sm cursor-pointer transition-colors",
                      item.present ? "bg-emerald-50" : "bg-red-50"
                    )}
                  >
                    <Checkbox
                      checked={item.present}
                      onCheckedChange={() => toggleCompleteness(item.id)}
                    />
                    <span className={cn(
                      "flex-1",
                      item.present ? "text-emerald-700" : "text-red-600"
                    )}>
                      {item.label}
                    </span>
                    {item.required && (
                      <Badge variant="outline" className="text-[9px] h-4">Required</Badge>
                    )}
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>
                <span className="text-muted-foreground">Received: </span>
                <span>{new Date(referral.receivedDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status: </span>
                <Badge variant="secondary" className="text-[10px]">{referral.status}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Fax ID: </span>
                <span>{referral.faxId}</span>
              </div>
              {referral.assignedCardiologistName && (
                <div>
                  <span className="text-muted-foreground">Cardiologist: </span>
                  <span>{referral.assignedCardiologistName}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2 border-t">
        <Button
          variant="outline"
          onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Step {currentStep} of {STEPS.length}
        </span>
        <Button
          onClick={() => setCurrentStep((s) => Math.min(4, s + 1))}
          disabled={currentStep === 4}
        >
          Next
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
