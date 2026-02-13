"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Fax } from "@/types";
import {
  ListTodo,
  AlertTriangle,
  Clock,
  TrendingUp,
  Zap,
} from "lucide-react";
import { differenceInMinutes } from "date-fns";

interface QueueStatsBarProps {
  faxes: Fax[];
}

export function QueueStatsBar({ faxes }: QueueStatsBarProps) {
  const actionable = faxes.filter(
    (f) =>
      f.status === "pending-review" ||
      f.status === "in-progress" ||
      f.status === "flagged"
  );

  const urgentCount = actionable.filter(
    (f) => f.priority === "urgent"
  ).length;

  const now = new Date();
  const breachedCount = actionable.filter(
    (f) => new Date(f.slaDeadline) <= now
  ).length;

  const avgWait =
    actionable.length > 0
      ? Math.round(
          actionable.reduce(
            (sum, f) => sum + differenceInMinutes(now, new Date(f.receivedAt)),
            0
          ) / actionable.length
        )
      : 0;

  const completedToday = faxes.filter((f) => {
    if (!f.completedAt) return false;
    const completed = new Date(f.completedAt);
    return (
      completed.toDateString() === now.toDateString()
    );
  }).length;

  const stats = [
    {
      label: "Queue Depth",
      value: actionable.length,
      icon: ListTodo,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Urgent",
      value: urgentCount,
      icon: AlertTriangle,
      color: urgentCount > 0 ? "text-red-600" : "text-muted-foreground",
      bgColor: urgentCount > 0 ? "bg-red-50" : "bg-gray-50",
    },
    {
      label: "SLA Breached",
      value: breachedCount,
      icon: Clock,
      color: breachedCount > 0 ? "text-red-600" : "text-emerald-600",
      bgColor: breachedCount > 0 ? "bg-red-50" : "bg-emerald-50",
    },
    {
      label: "Avg Wait",
      value: `${avgWait}m`,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "Processed Today",
      value: completedToday,
      icon: Zap,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-0 shadow-sm">
          <CardContent className="p-3 flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bgColor}`}
            >
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-lg font-bold leading-none">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {stat.label}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
