"use client";

import { cn } from "@/lib/utils";

interface ConfidenceBarProps {
  confidence: number;
  label?: string;
  showPercentage?: boolean;
}

export function ConfidenceBar({
  confidence,
  label,
  showPercentage = true,
}: ConfidenceBarProps) {
  const getColor = (value: number) => {
    if (value >= 95) return "bg-emerald-500";
    if (value >= 85) return "bg-blue-500";
    if (value >= 75) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
          {label}
        </span>
      )}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden min-w-[40px]">
          <div
            className={cn("h-full rounded-full transition-all", getColor(confidence))}
            style={{ width: `${confidence}%` }}
          />
        </div>
        {showPercentage && (
          <span className="text-[11px] font-medium text-muted-foreground tabular-nums w-[38px] text-right">
            {confidence.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
