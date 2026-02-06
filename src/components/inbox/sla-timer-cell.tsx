"use client";

import { useSlaTimer } from "@/hooks/use-sla-timer";
import { cn } from "@/lib/utils";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface SlaTimerCellProps {
  deadline: string;
  receivedAt: string;
  compact?: boolean;
}

export function SlaTimerCell({ deadline, receivedAt, compact }: SlaTimerCellProps) {
  const { timeRemaining, status, isBreached } = useSlaTimer(deadline, receivedAt);

  // Clear, explicit status labels for medical admin staff
  const getStatusConfig = () => {
    if (isBreached) {
      return {
        icon: AlertTriangle,
        label: "OVERDUE",
        bg: "bg-red-600",
        text: "text-white",
        animate: "animate-pulse",
      };
    }

    switch (status) {
      case "red":
        return {
          icon: AlertTriangle,
          label: "Due Soon",
          bg: "bg-red-100",
          text: "text-red-700",
          animate: "",
        };
      case "yellow":
        return {
          icon: Clock,
          label: "On Track",
          bg: "bg-amber-100",
          text: "text-amber-700",
          animate: "",
        };
      case "green":
      default:
        return {
          icon: CheckCircle2,
          label: "On Track",
          bg: "bg-green-100",
          text: "text-green-700",
          animate: "",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.bg,
        config.text,
        config.animate
      )}
    >
      <Icon className="h-3 w-3" />
      {compact ? (
        <span>{timeRemaining}</span>
      ) : (
        <span>
          {isBreached ? timeRemaining : `${timeRemaining} left`}
        </span>
      )}
    </div>
  );
}
