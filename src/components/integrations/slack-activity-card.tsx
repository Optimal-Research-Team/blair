"use client";

import { useState } from "react";
import { SlackActivity } from "@/types/integration-feeds";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ExternalLink,
  AlertTriangle,
  Bell,
  BarChart3,
  FileText,
  Ticket,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface SlackActivityCardProps {
  activity: SlackActivity;
}

const typeConfig = {
  "urgent-alert": {
    icon: AlertTriangle,
    label: "Urgent Alert",
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
    borderColor: "border-l-red-500",
  },
  "sla-warning": {
    icon: Bell,
    label: "SLA Warning",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-600",
    borderColor: "border-l-amber-500",
  },
  "sla-breach": {
    icon: AlertTriangle,
    label: "SLA Breach",
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
    borderColor: "border-l-red-500",
  },
  "daily-digest": {
    icon: BarChart3,
    label: "Daily Digest",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    borderColor: "border-l-blue-500",
  },
  "weekly-report": {
    icon: FileText,
    label: "Weekly Report",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    borderColor: "border-l-purple-500",
  },
  "ticket-posted": {
    icon: Ticket,
    label: "Ticket Created",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
    borderColor: "border-l-orange-500",
  },
};

const statusConfig = {
  sent: { label: "Sent", color: "text-emerald-600", icon: CheckCircle2 },
  failed: { label: "Failed", color: "text-red-600", icon: XCircle },
  pending: { label: "Pending", color: "text-amber-600", icon: Bell },
};

export function SlackActivityCard({
  activity,
}: SlackActivityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = typeConfig[activity.type];
  const statusCfg = statusConfig[activity.status];
  const TypeIcon = config.icon;
  const StatusIcon = statusCfg.icon;

  const hasLinkedItems = activity.linkedItems && activity.linkedItems.length > 0;
  const canExpand = hasLinkedItems && activity.linkedItems!.length > 1;

  return (
    <div
      className={cn(
        "border rounded-lg p-4 transition-all hover:shadow-sm",
        "border-l-4",
        config.borderColor,
        activity.handled && "opacity-75"
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
              config.bgColor
            )}
          >
            <TypeIcon className={cn("h-4 w-4", config.iconColor)} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className={cn("text-[10px]", config.bgColor, config.iconColor)}
              >
                {config.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                posted to{" "}
                <span className="font-mono font-medium">{activity.channel}</span>
              </span>
            </div>
            <p className="text-sm">&ldquo;{activity.message}&rdquo;</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1">
            <StatusIcon className={cn("h-3 w-3", statusCfg.color)} />
            <span className={cn("text-xs", statusCfg.color)}>
              {statusCfg.label}
            </span>
          </div>
        </div>
      </div>

      {/* Linked items (expandable) */}
      {hasLinkedItems && (
        <div className="mt-3 ml-11">
          {canExpand ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-muted-foreground -ml-2"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="h-3 w-3 mr-1" />
                ) : (
                  <ChevronDown className="h-3 w-3 mr-1" />
                )}
                {activity.linkedItems!.length} items
              </Button>
              {isExpanded && (
                <div className="mt-2 space-y-1 pl-2 border-l-2 border-muted">
                  {activity.linkedItems!.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm py-1"
                    >
                      <Link
                        href={
                          item.type === "referral"
                            ? `/referrals/${item.id}`
                            : `/fax/${item.id}`
                        }
                        className="text-blue-600 hover:underline"
                      >
                        {item.label}
                      </Link>
                      {item.timeRemaining && (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-amber-50 text-amber-700"
                        >
                          {item.timeRemaining} remaining
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <Link
                href={
                  activity.linkedItems![0].type === "referral"
                    ? `/referrals/${activity.linkedItems![0].id}`
                    : `/fax/${activity.linkedItems![0].id}`
                }
                className="text-blue-600 hover:underline"
              >
                {activity.linkedItems![0].label}
              </Link>
              {activity.linkedItems![0].timeRemaining && (
                <Badge
                  variant="outline"
                  className="text-[10px] bg-amber-50 text-amber-700"
                >
                  {activity.linkedItems![0].timeRemaining} remaining
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 ml-11">
        <span className="text-xs text-muted-foreground">
          Posted by Blair Bot • {format(new Date(activity.postedAt), "h:mm a")}
        </span>

        <div className="flex items-center gap-2">
          {/* Handled indicator */}
          {activity.handled && activity.handledBy && (
            <Badge
              variant="outline"
              className="text-[10px] bg-emerald-50 text-emerald-700"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Handled by {activity.handledBy}
            </Badge>
          )}

          {/* Quick actions - view only (read-only feed) */}
          {activity.linkedItems?.[0] && !activity.handled && (
            <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
              <Link
                href={
                  activity.linkedItems[0].type === "referral"
                    ? `/referrals/${activity.linkedItems[0].id}`
                    : `/fax/${activity.linkedItems[0].id}`
                }
              >
                <Eye className="h-3 w-3 mr-1" />
                View in Blair
              </Link>
            </Button>
          )}

          {activity.slackUrl && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
              <a
                href={activity.slackUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View in Slack
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
