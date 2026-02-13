"use client";

import { useState } from "react";
import { Patient, PatientMatchStatus, ExtractedField } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PatientSearchPopover } from "./patient-search-popover";
import { CreatePatientDialog } from "./create-patient-dialog";
import { formatDate, formatPHN, formatGenderShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useHighlightStore } from "@/stores/use-highlight-store";
import {
  UserCheck,
  UserX,
  Users,
  HelpCircle,
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  Plus,
  Database,
} from "lucide-react";
import { formatPhone } from "@/lib/format";

const MATCH_ICONS: Record<PatientMatchStatus, React.ElementType> = {
  matched: UserCheck,
  "not-found": UserX,
  "multiple-matches": Users,
  pending: HelpCircle,
};

const MATCH_COLORS: Record<PatientMatchStatus, { bg: string; text: string; border: string }> = {
  matched: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  "not-found": {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
  "multiple-matches": {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  pending: {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
  },
};

interface PatientIdentificationCardProps {
  patient: Patient | null;
  matchConfidence?: number;
  matchStatus?: PatientMatchStatus;
  onPatientChange: (patient: Patient) => void;
  extractedFields?: ExtractedField[];
  /** Document ID for multi-document referrals - enables navigation to correct document */
  documentId?: string;
  /** Pre-extracted patient data for creating new patient in Cerebrum */
  extractedPatientData?: Partial<Patient>;
  className?: string;
}

export function PatientIdentificationCard({
  patient,
  matchConfidence,
  matchStatus = patient ? "matched" : "not-found",
  onPatientChange,
  extractedFields,
  documentId,
  extractedPatientData,
  className,
}: PatientIdentificationCardProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { setHighlight, clearHighlight } = useHighlightStore();
  const colors = MATCH_COLORS[matchStatus];
  const Icon = MATCH_ICONS[matchStatus];

  // Show create button when patient not found or pending
  const showCreateButton = matchStatus === "not-found" || matchStatus === "pending";

  // Find extracted fields for patient info
  const nameField = extractedFields?.find((f) => f.fieldType === "patient-name");
  const dobField = extractedFields?.find((f) => f.fieldType === "patient-dob");
  const phnField = extractedFields?.find((f) => f.fieldType === "patient-phn");

  // Create hover handler for a specific field
  const createHoverHandler = (field: ExtractedField | undefined) => {
    if (!field) return { onMouseEnter: undefined, onMouseLeave: undefined };
    return {
      onMouseEnter: () =>
        setHighlight({
          fieldId: field.id,
          pageNumber: field.pageNumber,
          documentId,
          boundingBox: field.boundingBox,
        }),
      onMouseLeave: clearHighlight,
    };
  };

  const nameHover = createHoverHandler(nameField);
  const dobHover = createHoverHandler(dobField);
  const phnHover = createHoverHandler(phnField);

  return (
    <Card className={cn("border", colors.border, className)}>
      <CardHeader className={cn("px-3 py-2", colors.bg)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Patient Identification
          </CardTitle>
          <PatientSearchPopover
            selectedPatient={patient}
            onSelectPatient={onPatientChange}
          />
        </div>
      </CardHeader>
      <CardContent className="px-3 py-1.5">
        {patient ? (
          <div className="space-y-1">
            {/* Patient name and match status */}
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  "flex items-center gap-1.5",
                  nameField && "hover:bg-muted/50 rounded px-1 -mx-1 transition-colors cursor-pointer"
                )}
                {...nameHover}
              >
                <Icon className={cn("h-4 w-4", colors.text)} />
                <span className="text-sm font-semibold">
                  {patient.firstName} {patient.lastName}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({formatGenderShort(patient.gender)})
                </span>
              </div>
              {matchConfidence !== undefined && (
                <span
                  className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                    colors.bg,
                    colors.text
                  )}
                >
                  {matchConfidence.toFixed(0)}%
                </span>
              )}
            </div>

            {/* Patient details - compact grid */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
              <div
                className={cn(
                  "flex items-center gap-1",
                  dobField && "hover:bg-muted/50 rounded px-0.5 -mx-0.5 transition-colors cursor-pointer"
                )}
                {...dobHover}
              >
                <span className="text-muted-foreground">DOB:</span>
                <span className="font-medium">{formatDate(patient.dateOfBirth)}</span>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1",
                  phnField && "hover:bg-muted/50 rounded px-0.5 -mx-0.5 transition-colors cursor-pointer"
                )}
                {...phnHover}
              >
                <span className="text-muted-foreground">OHIP:</span>
                <span className="font-medium font-mono text-[11px]">
                  {formatPHN(patient.phn)}
                </span>
              </div>
              {patient.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span>{formatPhone(patient.phone)}</span>
                </div>
              )}
              {patient.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">{patient.email}</span>
                </div>
              )}
            </div>

            {/* Address */}
            {patient.address && (
              <div className="flex items-start gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                <span>
                  {patient.address.street}, {patient.address.city}, {patient.address.province} {patient.address.postalCode}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 py-1">
              <div className={cn("p-1.5 rounded-full", colors.bg)}>
                <AlertTriangle className={cn("h-4 w-4", colors.text)} />
              </div>
              <div>
                <p className={cn("text-sm font-medium", colors.text)}>No patient matched</p>
                <p className="text-xs text-muted-foreground">
                  Search to find and assign a patient
                </p>
              </div>
            </div>

            {/* Create in Cerebrum button */}
            {showCreateButton && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Database className="h-3.5 w-3.5 mr-1.5" />
                Create in Cerebrum
              </Button>
            )}
          </div>
        )}
      </CardContent>

      {/* Create Patient Dialog */}
      <CreatePatientDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        extractedPatient={extractedPatientData}
        onPatientCreated={onPatientChange}
      />
    </Card>
  );
}
