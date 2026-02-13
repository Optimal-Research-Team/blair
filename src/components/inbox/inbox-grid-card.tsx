"use client";

import { Fax } from "@/types";
import { formatRelativeTime } from "@/lib/format";
import { Lock, FileText, User, AlertTriangle, Eye, CheckCircle2, Flag, Clock, Link2 } from "lucide-react";
import { mockStaff } from "@/data/mock-staff";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSlaTimer } from "@/hooks/use-sla-timer";

interface InboxGridCardProps {
  fax: Fax;
}

export function InboxGridCard({ fax }: InboxGridCardProps) {
  const lockedUser = fax.lockedBy
    ? mockStaff.find((s) => s.id === fax.lockedBy)
    : null;
  const isActive = fax.status !== "completed" && fax.status !== "auto-filed";
  const { timeRemaining, status: slaStatus, isBreached } = useSlaTimer(fax.slaDeadline, fax.receivedAt);

  const needsAction = fax.status === "pending-review" || fax.status === "flagged";
  const isResolved = fax.status === "completed" || fax.status === "auto-filed";

  // Confidence indicator
  const confidenceLevel = fax.documentTypeConfidence >= 90 ? "high" : fax.documentTypeConfidence >= 70 ? "medium" : "low";

  return (
    <Link href={`/fax/${fax.id}`} className="block group">
      <div
        className={cn(
          "relative rounded-lg border transition-all",
          // Base states
          isResolved && "bg-gray-50/80 border-gray-200",
          needsAction && "bg-white border-gray-200 shadow-sm hover:shadow-md",
          fax.status === "in-progress" && "bg-white border-purple-200 shadow-sm",
          // Priority overrides - Urgent items get red styling
          fax.priority === "urgent" && !isResolved && "bg-red-50 border-red-200 shadow-sm hover:shadow-md",
        )}
      >
        {/* Top accent bar for urgent items */}
        {fax.priority === "urgent" && !isResolved && (
          <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-lg bg-red-500" />
        )}

        {/* Card content */}
        <div className="px-3 py-2.5">
          {/* Header: Priority/Status indicator + Time */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-medium">
              {fax.priority === "urgent" && (
                <span className="inline-flex items-center gap-0.5 text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                  <AlertTriangle className="h-3 w-3" />
                  Urgent
                </span>
              )}
              {fax.status === "auto-filed" && (
                <span className="inline-flex items-center gap-0.5 text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                  <CheckCircle2 className="h-3 w-3" />
                  Auto-filed
                </span>
              )}
              {fax.status === "flagged" && (
                <span className="inline-flex items-center gap-0.5 text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                  <Flag className="h-3 w-3" />
                  Flagged
                </span>
              )}
              {fax.status === "in-progress" && (
                <span className="inline-flex items-center gap-0.5 text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                  <Clock className="h-3 w-3" />
                  In Progress
                </span>
              )}
              {fax.lockedBy && (
                <span className="inline-flex items-center gap-0.5 text-amber-700">
                  <Lock className="h-3 w-3" />
                  {lockedUser?.initials}
                </span>
              )}
              {fax.linkedReferralId && (
                <span className="inline-flex items-center gap-0.5 text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded" title={fax.linkedReferralReason || "Linked to existing referral"}>
                  <Link2 className="h-3 w-3" />
                  Linked
                </span>
              )}
            </div>
            <span className="text-[11px] text-gray-500">{formatRelativeTime(fax.receivedAt)}</span>
          </div>

          {/* Sender - main content */}
          <p className={cn(
            "text-[13px] font-medium leading-snug truncate",
            isResolved ? "text-gray-600" : "text-gray-900"
          )}>
            {fax.senderName}
          </p>

          {/* Doc type + Patient in single dense row */}
          <div className="flex items-center gap-2 mt-1 text-[11px]">
            <span className="flex items-center gap-1 text-gray-500 min-w-0">
              <FileText className="h-3 w-3 shrink-0" />
              <span className="truncate">{fax.documentType}</span>
              <span className={cn(
                "shrink-0 font-medium",
                confidenceLevel === "high" ? "text-emerald-600" :
                confidenceLevel === "medium" ? "text-gray-600" : "text-amber-600"
              )}>
                {fax.documentTypeConfidence}%
              </span>
            </span>
            {fax.patientName && (
              <>
                <span className="text-gray-300">·</span>
                <span className={cn(
                  "flex items-center gap-1 min-w-0",
                  fax.patientMatchStatus === "matched" ? "text-gray-600" :
                  fax.patientMatchStatus === "not-found" ? "text-red-600" : "text-amber-600"
                )}>
                  <User className="h-3 w-3 shrink-0" />
                  <span className="truncate">{fax.patientName}</span>
                </span>
              </>
            )}
          </div>

          {/* Footer: Only show for active items - SLA timer */}
          {isActive && (
            <div className={cn(
              "mt-2 pt-2 border-t flex items-center justify-between text-[11px]",
              isBreached ? "border-red-200" : "border-gray-100"
            )}>
              <span className="text-gray-500">
                {fax.status === "pending-review" ? "Needs review" :
                 fax.status === "in-progress" ? "Being processed" : "Requires attention"}
              </span>
              <span className={cn(
                "font-semibold tabular-nums",
                isBreached ? "text-red-600" :
                slaStatus === "red" ? "text-red-600" :
                slaStatus === "yellow" ? "text-amber-600" : "text-emerald-600"
              )}>
                {isBreached ? `${timeRemaining} overdue` : timeRemaining}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
