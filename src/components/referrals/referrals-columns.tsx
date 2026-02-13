"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Referral, ReferralStatus } from "@/types/referral";
import { PriorityBadge } from "@/components/inbox/priority-badge";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import {
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

// Status config for referrals
const STATUS_CONFIG: Record<ReferralStatus, { label: string; icon: React.ElementType; color: string }> = {
  triage: { label: "Triage", icon: Clock, color: "bg-gray-100 text-gray-700" },
  incomplete: { label: "Incomplete", icon: AlertTriangle, color: "bg-amber-100 text-amber-700" },
  "pending-review": { label: "Pending Review", icon: Clock, color: "bg-blue-100 text-blue-700" },
  routed: { label: "Routed to Cerebrum", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700" },
  declined: { label: "Declined", icon: XCircle, color: "bg-red-100 text-red-700" },
};

// Helper to calculate SLA status
function getSlaStatus(referral: Referral): { label: string; color: string; met: boolean | null } {
  // For routed/declined referrals - check if SLA was met
  if (referral.status === "routed" || referral.status === "declined") {
    // Calculate time from received to completed/declined
    const receivedTime = new Date(referral.receivedDate).getTime();
    const completedTime = new Date(referral.updatedAt).getTime();
    const hoursToComplete = (completedTime - receivedTime) / (1000 * 60 * 60);

    // SLA is 24 hours for urgent, 72 hours for routine
    const slaHours = referral.priority === "urgent" ? 24 : 72;
    const met = hoursToComplete <= slaHours;

    return {
      label: met ? "Met" : "Missed",
      color: met ? "text-emerald-600" : "text-red-600",
      met,
    };
  }

  // For pending referrals - check time remaining
  const receivedTime = new Date(referral.receivedDate).getTime();
  const now = Date.now();
  const hoursElapsed = (now - receivedTime) / (1000 * 60 * 60);

  const slaHours = referral.priority === "urgent" ? 24 : 72;
  const hoursRemaining = slaHours - hoursElapsed;

  if (hoursRemaining < 0) {
    return { label: "Overdue", color: "text-red-600", met: false };
  } else if (hoursRemaining < 4) {
    return { label: `${Math.round(hoursRemaining)}h left`, color: "text-amber-600", met: null };
  } else if (hoursRemaining < 24) {
    return { label: `${Math.round(hoursRemaining)}h left`, color: "text-blue-600", met: null };
  } else {
    const daysRemaining = Math.round(hoursRemaining / 24);
    return { label: `${daysRemaining}d left`, color: "text-muted-foreground", met: null };
  }
}

export const referralColumns: ColumnDef<Referral>[] = [
  {
    accessorKey: "receivedDate",
    header: "Received",
    cell: ({ row }) => (
      <div className="text-xs">
        <span className="text-foreground">{formatRelativeTime(row.original.receivedDate)}</span>
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    size: 90,
  },
  {
    accessorKey: "patientName",
    header: "Patient",
    cell: ({ row }) => (
      <div className="text-xs">
        <span className="font-medium text-foreground truncate block max-w-[140px]">
          {row.original.patientName}
        </span>
        {row.original.patientDob && (
          <span className="text-muted-foreground">
            DOB: {new Date(row.original.patientDob).toLocaleDateString()}
          </span>
        )}
      </div>
    ),
    size: 150,
  },
  {
    accessorKey: "referringPhysicianName",
    header: "Referring",
    cell: ({ row }) => (
      <div className="text-xs">
        <span className="font-medium text-foreground truncate block max-w-[140px]">
          {row.original.referringPhysicianName}
        </span>
        {row.original.clinicName && (
          <span className="text-muted-foreground truncate block max-w-[140px]">
            {row.original.clinicName}
          </span>
        )}
      </div>
    ),
    size: 160,
  },
  {
    accessorKey: "reasonForReferral",
    header: "Reason",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
        {row.original.reasonForReferral}
      </div>
    ),
    size: 200,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const statusConfig = STATUS_CONFIG[row.original.status];
      const StatusIcon = statusConfig.icon;
      return (
        <Badge className={cn("text-[10px]", statusConfig.color)} variant="secondary">
          <StatusIcon className="h-3 w-3 mr-1" />
          {statusConfig.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    size: 120,
  },
  {
    accessorKey: "completenessScore",
    header: "Completeness",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Progress value={row.original.completenessScore} className="h-1.5 w-16" />
        <span
          className={cn(
            "text-[10px] font-medium tabular-nums",
            row.original.completenessScore === 100
              ? "text-emerald-600"
              : row.original.completenessScore >= 60
              ? "text-amber-600"
              : "text-red-600"
          )}
        >
          {row.original.completenessScore}%
        </span>
      </div>
    ),
    size: 110,
  },
  {
    id: "sla",
    header: "SLA",
    cell: ({ row }) => {
      const slaStatus = getSlaStatus(row.original);
      return (
        <div className="flex items-center gap-1">
          {slaStatus.met === true && (
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          )}
          {slaStatus.met === false && (
            <XCircle className="h-3 w-3 text-red-600" />
          )}
          <span className={cn("text-xs font-medium", slaStatus.color)}>
            {slaStatus.label}
          </span>
        </div>
      );
    },
    size: 90,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Link
        href={`/referrals/${row.original.id}`}
        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5"
      >
        View <ChevronRight className="h-3 w-3" />
      </Link>
    ),
    size: 60,
  },
];

// Simplified columns for completed referrals (no completeness needed)
export const completedReferralColumns: ColumnDef<Referral>[] = [
  {
    accessorKey: "receivedDate",
    header: "Received",
    cell: ({ row }) => (
      <div className="text-xs">
        <span className="text-foreground">{formatRelativeTime(row.original.receivedDate)}</span>
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
    size: 90,
  },
  {
    accessorKey: "patientName",
    header: "Patient",
    cell: ({ row }) => (
      <div className="text-xs">
        <span className="font-medium text-foreground truncate block max-w-[140px]">
          {row.original.patientName}
        </span>
        {row.original.patientDob && (
          <span className="text-muted-foreground">
            DOB: {new Date(row.original.patientDob).toLocaleDateString()}
          </span>
        )}
      </div>
    ),
    size: 150,
  },
  {
    accessorKey: "referringPhysicianName",
    header: "Referring",
    cell: ({ row }) => (
      <div className="text-xs">
        <span className="font-medium text-foreground truncate block max-w-[140px]">
          {row.original.referringPhysicianName}
        </span>
        {row.original.clinicName && (
          <span className="text-muted-foreground truncate block max-w-[140px]">
            {row.original.clinicName}
          </span>
        )}
      </div>
    ),
    size: 160,
  },
  {
    accessorKey: "reasonForReferral",
    header: "Reason",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground truncate max-w-[220px]">
        {row.original.reasonForReferral}
      </div>
    ),
    size: 220,
  },
  {
    accessorKey: "assignedCardiologistName",
    header: "Assigned To",
    cell: ({ row }) => (
      <div className="text-xs">
        {row.original.assignedCardiologistName ? (
          <span className="text-foreground">{row.original.assignedCardiologistName}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
    ),
    size: 130,
  },
  {
    id: "sla",
    header: "SLA",
    cell: ({ row }) => {
      const slaStatus = getSlaStatus(row.original);
      return (
        <div className="flex items-center gap-1">
          {slaStatus.met === true && (
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          )}
          {slaStatus.met === false && (
            <XCircle className="h-3 w-3 text-red-600" />
          )}
          <span className={cn("text-xs font-medium", slaStatus.color)}>
            {slaStatus.label}
          </span>
        </div>
      );
    },
    size: 90,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Link
        href={`/referrals/${row.original.id}`}
        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5"
      >
        View <ChevronRight className="h-3 w-3" />
      </Link>
    ),
    size: 60,
  },
];
