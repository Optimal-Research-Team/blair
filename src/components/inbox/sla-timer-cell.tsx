"use client";

import { useSlaTimer } from "@/hooks/use-sla-timer";
import { SLA_STATUS_COLORS } from "@/lib/sla";
import { cn } from "@/lib/utils";
import { Clock, AlertTriangle } from "lucide-react";

interface SlaTimerCellProps {
  deadline: string;
  receivedAt: string;
  compact?: boolean;
}

export function SlaTimerCell({ deadline, receivedAt, compact }: SlaTimerCellProps) {
  const { timeRemaining, status, isBreached } = useSlaTimer(deadline, receivedAt);
  const colors = SLA_STATUS_COLORS[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        colors.bg,
        colors.text,
        isBreached && "sla-breached"
      )}
    >
      {isBreached ? (
        <AlertTriangle className="h-3 w-3" />
      ) : (
        <Clock className="h-3 w-3" />
      )}
      {!compact && <span>{timeRemaining}</span>}
      {compact && <span>{timeRemaining}</span>}
    </div>
  );
}
