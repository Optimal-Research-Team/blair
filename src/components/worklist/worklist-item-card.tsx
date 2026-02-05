"use client";

import { Fax } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PriorityBadge } from "@/components/inbox/priority-badge";
import { StatusBadge } from "@/components/inbox/status-badge";
import { SlaTimerCell } from "@/components/inbox/sla-timer-cell";
import { ConfidenceBar } from "@/components/inbox/confidence-bar";
import { formatRelativeTime } from "@/lib/format";
import { calculatePriorityScore } from "@/lib/sla";
import { cn } from "@/lib/utils";
import { mockStaff, currentUser } from "@/data/mock-staff";
import {
  Lock,
  HandMetal,
  FileText,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import Link from "next/link";

interface WorklistItemCardProps {
  fax: Fax;
  position: number;
  score: number;
  onClaim: (faxId: string) => void;
}

const MATCH_ICON = {
  matched: UserCheck,
  "not-found": UserX,
  "multiple-matches": Users,
  pending: UserX,
};

export function WorklistItemCard({
  fax,
  position,
  score,
  onClaim,
}: WorklistItemCardProps) {
  const lockedUser = fax.lockedBy
    ? mockStaff.find((s) => s.id === fax.lockedBy)
    : null;
  const assignedUser = fax.assignedTo
    ? mockStaff.find((s) => s.id === fax.assignedTo)
    : null;
  const isLockedByMe = fax.lockedBy === currentUser.id;
  const isLockedByOther = fax.lockedBy && !isLockedByMe;
  const MatchIcon = MATCH_ICON[fax.patientMatchStatus];

  return (
    <Card
      className={cn(
        "border transition-all",
        fax.priority === "stat" && "border-l-4 border-l-red-500 shadow-sm shadow-red-100",
        fax.priority === "urgent" && "border-l-4 border-l-amber-500",
        isLockedByOther && "opacity-75 bg-muted/30",
        isLockedByMe && "ring-2 ring-primary/50"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Position indicator */}
          <div className="flex flex-col items-center gap-1 pt-0.5">
            <span className="text-lg font-bold text-muted-foreground">
              #{position}
            </span>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {score.toFixed(0)}pts
            </span>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Top row: priority + SLA + lock */}
            <div className="flex items-center gap-2 flex-wrap">
              <PriorityBadge priority={fax.priority} />
              <SlaTimerCell
                deadline={fax.slaDeadline}
                receivedAt={fax.receivedAt}
              />
              {lockedUser && (
                <div className="flex items-center gap-1.5 text-amber-600 text-xs ml-auto">
                  <Lock className="h-3 w-3" />
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[8px] bg-amber-100 text-amber-700">
                      {lockedUser.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span>{lockedUser.name}</span>
                </div>
              )}
              {assignedUser && !lockedUser && (
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs ml-auto">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[8px]">
                      {assignedUser.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span>{assignedUser.name}</span>
                </div>
              )}
            </div>

            {/* Sender + patient */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{fax.senderName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatRelativeTime(fax.receivedAt)} &middot;{" "}
                  {fax.pageCount} {fax.pageCount === 1 ? "page" : "pages"}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-right">
                <MatchIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm">{fax.patientName || "Unknown"}</span>
              </div>
            </div>

            {/* Doc type + confidence */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded">
                {fax.documentType}
              </span>
              <div className="flex-1 max-w-[150px]">
                <ConfidenceBar
                  confidence={fax.documentTypeConfidence}
                  showPercentage
                />
              </div>
            </div>

            {/* Description */}
            {fax.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {fax.description}
              </p>
            )}

            {/* Notes/flags */}
            {fax.notes && (
              <div className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">
                {fax.notes}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-0.5">
            {!isLockedByOther && (
              <>
                <Button size="sm" variant="default" asChild className="h-8">
                  <Link href={`/fax/${fax.id}`}>
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Open
                  </Link>
                </Button>
                {!fax.lockedBy && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    onClick={() => onClaim(fax.id)}
                  >
                    <HandMetal className="h-3.5 w-3.5 mr-1" />
                    Claim
                  </Button>
                )}
              </>
            )}
            {isLockedByOther && (
              <span className="text-[11px] text-muted-foreground text-center">
                Locked
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
