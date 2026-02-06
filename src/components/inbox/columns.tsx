"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Fax } from "@/types";
import { PriorityBadge } from "./priority-badge";
import { StatusBadge } from "./status-badge";
import { SlaTimerCell } from "./sla-timer-cell";
import { PatientMatchBadge } from "./patient-match-badge";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { LockIndicator } from "./lock-indicator";

export const columns: ColumnDef<Fax>[] = [
  {
    accessorKey: "receivedAt",
    header: "Received",
    cell: ({ row }) => (
      <div className="text-xs">
        <span className="text-foreground">{formatRelativeTime(row.original.receivedAt)}</span>
        <span className="text-muted-foreground ml-1">· {row.original.pageCount}p</span>
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    size: 100,
  },
  {
    accessorKey: "senderName",
    header: "From",
    cell: ({ row }) => (
      <div className="text-xs">
        <span className="font-medium text-foreground truncate block max-w-[160px]">
          {row.original.senderName}
        </span>
        <span className="text-muted-foreground">
          {row.original.senderFaxNumber.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}
        </span>
      </div>
    ),
    size: 180,
  },
  {
    accessorKey: "documentType",
    header: "Document",
    cell: ({ row }) => {
      const confidence = row.original.documentTypeConfidence;
      return (
        <div className="text-xs">
          <span className="font-medium truncate block max-w-[140px]">{row.original.documentType}</span>
          <span className="text-[10px] text-muted-foreground">
            {confidence}% confidence
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    size: 160,
  },
  {
    accessorKey: "patientName",
    header: "Patient",
    cell: ({ row }) => (
      <PatientMatchBadge
        status={row.original.patientMatchStatus}
        patientName={row.original.patientName}
        confidence={row.original.patientMatchConfidence}
      />
    ),
    size: 150,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <StatusBadge status={row.original.status} />
        <LockIndicator documentId={row.original.id} />
      </div>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    size: 130,
  },
  {
    accessorKey: "slaDeadline",
    header: "SLA",
    cell: ({ row }) => {
      if (row.original.status === "completed" || row.original.status === "auto-filed") {
        return <span className="text-xs text-muted-foreground">—</span>;
      }
      return (
        <SlaTimerCell
          deadline={row.original.slaDeadline}
          receivedAt={row.original.receivedAt}
          compact
        />
      );
    },
    size: 100,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Link
        href={`/fax/${row.original.id}`}
        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5"
      >
        View <ChevronRight className="h-3 w-3" />
      </Link>
    ),
    size: 60,
  },
];
