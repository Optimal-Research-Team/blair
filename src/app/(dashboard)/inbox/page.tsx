"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { InboxToolbar } from "@/components/inbox/inbox-toolbar";
import { InboxDataTable } from "@/components/inbox/inbox-data-table";
import { InboxGridView } from "@/components/inbox/inbox-grid-view";
import { InboxStats } from "@/components/inbox/inbox-stats";
import { columns } from "@/components/inbox/columns";
import { mockFaxes } from "@/data/mock-faxes";
import { FaxStatus, Priority } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";

export default function InboxPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FaxStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const debouncedSearch = useDebounce(search, 300);

  const filteredFaxes = useMemo(() => {
    let result = [...mockFaxes];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((f) => f.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      result = result.filter((f) => f.priority === priorityFilter);
    }

    // Apply search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (f) =>
          f.patientName?.toLowerCase().includes(query) ||
          f.senderName.toLowerCase().includes(query) ||
          f.documentType.toLowerCase().includes(query) ||
          f.senderFaxNumber.includes(query) ||
          f.description?.toLowerCase().includes(query)
      );
    }

    // Sort: STAT first, then urgent, then routine. Within each, by receivedAt desc
    result.sort((a, b) => {
      const priorityOrder = { stat: 0, urgent: 1, routine: 2 };
      const statusOrder = {
        "flagged": 0,
        "pending-review": 1,
        "in-progress": 2,
        "auto-filed": 3,
        "completed": 4,
      };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
    });

    return result;
  }, [debouncedSearch, statusFilter, priorityFilter]);

  const handleReset = () => {
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Fax Inbox"
        description="View and manage incoming faxes"
        action={
          <InboxStats faxes={mockFaxes} />
        }
      />

      <InboxToolbar
        table={null as never}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onReset={handleReset}
      />

      {viewMode === "table" ? (
        <InboxDataTable
          columns={columns}
          data={filteredFaxes}
          globalFilter={debouncedSearch}
        />
      ) : (
        <InboxGridView faxes={filteredFaxes} />
      )}
    </div>
  );
}
