"use client";

import { ZendeskTicket } from "@/types/integration-feeds";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ExternalLink,
  AlertCircle,
  Clock,
  CheckCircle2,
  Link as LinkIcon,
  Bot,
  MessageSquare,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface ZendeskTicketCardProps {
  ticket: ZendeskTicket;
}

const priorityConfig = {
  urgent: {
    label: "URGENT",
    bgColor: "bg-red-500",
    borderColor: "border-l-red-500",
    textColor: "text-red-700",
    icon: AlertCircle,
  },
  high: {
    label: "TIME-SENSITIVE",
    bgColor: "bg-orange-500",
    borderColor: "border-l-orange-500",
    textColor: "text-orange-700",
    icon: Clock,
  },
  normal: {
    label: "NORMAL",
    bgColor: "bg-blue-500",
    borderColor: "border-l-blue-500",
    textColor: "text-blue-700",
    icon: null,
  },
  low: {
    label: "LOW",
    bgColor: "bg-gray-400",
    borderColor: "border-l-gray-400",
    textColor: "text-gray-600",
    icon: null,
  },
};

const statusConfig = {
  open: { label: "Open", color: "bg-blue-100 text-blue-700" },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700" },
  resolved: { label: "Resolved", color: "bg-emerald-100 text-emerald-700" },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-600" },
};

export function ZendeskTicketCard({ ticket }: ZendeskTicketCardProps) {
  const priority = priorityConfig[ticket.priority];
  const status = statusConfig[ticket.status];
  const PriorityIcon = priority.icon;

  const isResolved = ticket.status === "resolved" || ticket.status === "closed";

  return (
    <div
      className={cn(
        "border rounded-lg p-4 transition-all hover:shadow-md",
        "border-l-4",
        priority.borderColor,
        isResolved && "opacity-75"
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          {PriorityIcon && (
            <PriorityIcon className={cn("h-4 w-4", priority.textColor)} />
          )}
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-semibold",
              priority.bgColor,
              "text-white border-0"
            )}
          >
            {priority.label}
          </Badge>
          <Badge variant="outline" className={cn("text-[10px]", status.color)}>
            {status.label}
          </Badge>
          {ticket.source === "auto-created" && (
            <Badge
              variant="outline"
              className="text-[10px] bg-purple-50 text-purple-700 border-purple-200"
            >
              <Bot className="h-3 w-3 mr-1" />
              Auto
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
        </span>
      </div>

      {/* Subject */}
      <h3 className="font-medium text-sm mb-1">{ticket.subject}</h3>

      {/* Ticket number, linked entity, and response info */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        <span className="font-mono">{ticket.ticketNumber}</span>
        {ticket.linkedEntityType && ticket.linkedEntityId && (
          <>
            <span>•</span>
            <Link
              href={
                ticket.linkedEntityType === "referral"
                  ? `/referrals/${ticket.linkedEntityId}`
                  : `/fax/${ticket.linkedEntityId}`
              }
              className="flex items-center gap-1 text-blue-600 hover:underline"
            >
              <LinkIcon className="h-3 w-3" />
              {ticket.linkedEntityLabel || `View ${ticket.linkedEntityType}`}
            </Link>
          </>
        )}
        {!isResolved && (
          <>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Open {formatDistanceToNow(new Date(ticket.createdAt))}
            </span>
          </>
        )}
      </div>

      {/* First response needed indicator */}
      {!isResolved && ticket.firstResponseNeeded && (
        <div className="flex items-center gap-2 text-xs text-amber-600 mb-3 bg-amber-50 px-2 py-1.5 rounded-md w-fit">
          <MessageSquare className="h-3 w-3" />
          <span className="font-medium">First response needed</span>
        </div>
      )}

      {/* Auto-close info (if resolved) */}
      {isResolved && ticket.autoClosedAt && (
        <div className="flex items-center gap-2 text-xs text-emerald-600 mb-3">
          <CheckCircle2 className="h-3 w-3" />
          <span>
            Auto-closed{" "}
            {formatDistanceToNow(new Date(ticket.autoClosedAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          asChild
        >
          <a
            href={ticket.zendeskUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Zendesk
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </Button>
      </div>
    </div>
  );
}
