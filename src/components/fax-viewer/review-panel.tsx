"use client";

import { Fax } from "@/types";
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
import { PatientMatchBadge } from "@/components/inbox/patient-match-badge";
import { mockDocumentTypes } from "@/data/mock-document-types";
import { mockPatients } from "@/data/mock-patients";
import { toast } from "sonner";
import {
  Save,
  CheckCircle2,
  Send,
  Scissors,
  Lock,
  Unlock,
} from "lucide-react";
import { useState } from "react";

interface ReviewPanelProps {
  fax: Fax;
}

export function ReviewPanel({ fax }: ReviewPanelProps) {
  const [docType, setDocType] = useState(fax.documentType);
  const [priority, setPriority] = useState(fax.priority);
  const [notes, setNotes] = useState(fax.notes || "");
  const [description, setDescription] = useState(fax.description || "");

  const handleSave = () => {
    toast.success("Review saved successfully");
  };

  const handleComplete = () => {
    toast.success("Fax marked as completed and filed");
  };

  const handleSendComm = () => {
    toast.info("Opening communication template...");
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="border-b px-4 py-3 bg-muted/30">
        <h3 className="font-semibold text-sm">Review Panel</h3>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
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
          <CardContent className="p-3 pt-0 space-y-3">
            <div>
              <Label className="text-xs">Document Type</Label>
              <ConfidenceBar
                confidence={fax.documentTypeConfidence}
                label={fax.documentType}
                showPercentage
              />
            </div>
            <div>
              <Label className="text-xs">Patient Match</Label>
              <PatientMatchBadge
                status={fax.patientMatchStatus}
                patientName={fax.patientName}
                confidence={fax.patientMatchConfidence}
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
              <Select value={docType} onValueChange={setDocType}>
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
              <Label className="text-xs">Patient</Label>
              <Select defaultValue={fax.patientId || ""}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select patient..." />
                </SelectTrigger>
                <SelectContent>
                  {mockPatients.slice(0, 10).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
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
                  <SelectItem value="stat">STAT</SelectItem>
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
      </div>

      {/* Actions */}
      <div className="border-t p-3 space-y-2 bg-muted/20">
        <Button className="w-full h-9" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Review
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-9 text-xs"
            onClick={handleComplete}
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Complete
          </Button>
          <Button
            variant="outline"
            className="h-9 text-xs"
            onClick={handleSendComm}
          >
            <Send className="h-3.5 w-3.5 mr-1" />
            Communicate
          </Button>
        </div>
        {fax.pageCount > 1 && (
          <Button variant="secondary" className="w-full h-9 text-xs" asChild>
            <a href={`/split/${fax.id}`}>
              <Scissors className="h-3.5 w-3.5 mr-1" />
              Split Document
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
