"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Fax } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { PriorityBadge } from "./priority-badge";
import { StatusBadge } from "./status-badge";
import { SlaTimerCell } from "./sla-timer-cell";
import { ConfidenceBar } from "./confidence-bar";
import { PatientMatchBadge } from "./patient-match-badge";
import { formatRelativeTime } from "@/lib/format";
import { Lock, FileText } from "lucide-react";
import { mockStaff } from "@/data/mock-staff";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const columns: ColumnDef<Fax>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "receivedAt",
    header: "Received",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm text-foreground">
          {formatRelativeTime(row.original.receivedAt)}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {row.original.pageCount} {row.original.pageCount === 1 ? "page" : "pages"}
        </span>
      </div>
    ),
    size: 130,
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    size: 110,
  },
  {
    accessorKey: "senderName",
    header: "From",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium truncate max-w-[180px]">
          {row.original.senderName}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {row.original.senderFaxNumber.replace(
            /(\d{3})(\d{3})(\d{4})/,
            "($1) $2-$3"
          )}
        </span>
      </div>
    ),
    size: 200,
  },
  {
    accessorKey: "documentType",
    header: "Document Type",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium truncate max-w-[160px]">
          {row.original.documentType}
        </span>
        <ConfidenceBar
          confidence={row.original.documentTypeConfidence}
        />
      </div>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    size: 200,
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
    size: 170,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <StatusBadge status={row.original.status} />
        {row.original.lockedBy && (
          <div className="flex items-center gap-1 text-amber-600" title={`Locked by ${mockStaff.find(s => s.id === row.original.lockedBy)?.name || 'Unknown'}`}>
            <Lock className="h-3 w-3" />
          </div>
        )}
      </div>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    size: 150,
  },
  {
    accessorKey: "slaDeadline",
    header: "SLA",
    cell: ({ row }) => {
      if (row.original.status === "completed" || row.original.status === "auto-filed") {
        return (
          <span className="text-xs text-muted-foreground">Completed</span>
        );
      }
      return (
        <SlaTimerCell
          deadline={row.original.slaDeadline}
          receivedAt={row.original.receivedAt}
        />
      );
    },
    size: 130,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" asChild className="h-8 px-2">
        <Link href={`/fax/${row.original.id}`}>
          <FileText className="h-4 w-4 mr-1" />
          View
        </Link>
      </Button>
    ),
    size: 80,
  },
];
