"use client";

import { Fax } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { PriorityBadge } from "./priority-badge";
import { StatusBadge } from "./status-badge";
import { SlaTimerCell } from "./sla-timer-cell";
import { ConfidenceBar } from "./confidence-bar";
import { PatientMatchBadge } from "./patient-match-badge";
import { formatRelativeTime } from "@/lib/format";
import { Lock, FileText, FileIcon } from "lucide-react";
import { mockStaff } from "@/data/mock-staff";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface InboxGridCardProps {
  fax: Fax;
}

export function InboxGridCard({ fax }: InboxGridCardProps) {
  const lockedUser = fax.lockedBy
    ? mockStaff.find((s) => s.id === fax.lockedBy)
    : null;
  const isActive =
    fax.status !== "completed" && fax.status !== "auto-filed";

  return (
    <Link href={`/fax/${fax.id}`}>
      <Card
        className={cn(
          "group hover:shadow-md transition-all cursor-pointer border",
          fax.priority === "stat" && "border-l-4 border-l-red-500",
          fax.priority === "urgent" && "border-l-4 border-l-amber-500",
          fax.lockedBy && "ring-1 ring-amber-300"
        )}
      >
        <CardContent className="p-4 space-y-3">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <PriorityBadge priority={fax.priority} />
              {fax.lockedBy && (
                <div
                  className="flex items-center gap-1 text-amber-600 text-xs"
                  title={`Locked by ${lockedUser?.name}`}
                >
                  <Lock className="h-3 w-3" />
                  <span className="hidden sm:inline">{lockedUser?.initials}</span>
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatRelativeTime(fax.receivedAt)}
            </span>
          </div>

          {/* Sender */}
          <div>
            <p className="text-sm font-medium truncate">{fax.senderName}</p>
            <p className="text-xs text-muted-foreground">
              {fax.pageCount} {fax.pageCount === 1 ? "page" : "pages"}
            </p>
          </div>

          {/* Document type + confidence */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <FileIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium truncate">
                {fax.documentType}
              </span>
            </div>
            <ConfidenceBar confidence={fax.documentTypeConfidence} />
          </div>

          {/* Patient */}
          <PatientMatchBadge
            status={fax.patientMatchStatus}
            patientName={fax.patientName}
            confidence={fax.patientMatchConfidence}
          />

          {/* Description */}
          {fax.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {fax.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t">
            <StatusBadge status={fax.status} />
            {isActive && (
              <SlaTimerCell
                deadline={fax.slaDeadline}
                receivedAt={fax.receivedAt}
                compact
              />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
