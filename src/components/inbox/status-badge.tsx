"use client";

import { FaxStatus } from "@/types";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Zap, Eye, Loader2, Flag, CheckCircle2 } from "lucide-react";

const STATUS_ICONS: Record<FaxStatus, React.ElementType> = {
  "auto-filed": Zap,
  "pending-review": Eye,
  "in-progress": Loader2,
  flagged: Flag,
  completed: CheckCircle2,
};

interface StatusBadgeProps {
  status: FaxStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status];
  const Icon = STATUS_ICONS[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium",
        colors.bg,
        colors.text
      )}
    >
      <Icon className={cn("h-3 w-3", status === "in-progress" && "animate-spin")} />
      {STATUS_LABELS[status]}
    </span>
  );
}
