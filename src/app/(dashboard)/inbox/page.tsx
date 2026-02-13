"use client";

import { useState, useMemo } from "react";
import { InboxDataTable } from "@/components/inbox/inbox-data-table";
import { columns } from "@/components/inbox/columns";
import { mockFaxes } from "@/data/mock-faxes";
import { FaxStatus } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_LABELS } from "@/lib/constants";
import {
  Search,
  X,
  Inbox,
  AlertTriangle,
  Eye,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function InboxPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FaxStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<"urgent" | "routine" | "all">("all");

  const debouncedSearch = useDebounce(search, 300);

  // Calculate stats
  const stats = useMemo(() => {
    const pendingReview = mockFaxes.filter((f) => f.status === "pending-review").length;
    const urgentCount = mockFaxes.filter(
      (f) => f.priority === "urgent" && f.status !== "completed" && f.status !== "auto-filed"
    ).length;

    return { total: mockFaxes.length, pendingReview, urgentCount };
  }, []);

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

    // Sort: urgent first, then routine. Within each, by receivedAt desc
    result.sort((a, b) => {
      const priorityOrder = { urgent: 0, routine: 1 };
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

  const hasFilters = search || statusFilter !== "all" || priorityFilter !== "all";

  // Quick filter handlers
  const toggleUrgentFilter = () => {
    if (priorityFilter === "urgent") {
      setPriorityFilter("all");
    } else {
      setPriorityFilter("urgent");
      setStatusFilter("all");
    }
  };

  const toggleNeedsReviewFilter = () => {
    if (statusFilter === "pending-review") {
      setStatusFilter("all");
    } else {
      setStatusFilter("pending-review");
      setPriorityFilter("all");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Single Header Row */}
      <div className="flex items-center gap-4">
        {/* Left: Title + Count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Inbox className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">Fax Inbox</h1>
          </div>
          <span className="text-sm text-muted-foreground">
            {stats.total} faxes
          </span>
        </div>

        {/* Center: Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search patient, provider, document..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-16 h-9"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-muted-foreground hover:text-foreground p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Quick Filters (these ARE the stats) */}
        <div className="flex items-center gap-2">
          {stats.urgentCount > 0 && (
            <Button
              variant={priorityFilter === "urgent" ? "default" : "outline"}
              size="sm"
              onClick={toggleUrgentFilter}
              className={cn(
                "h-8 text-xs",
                priorityFilter === "urgent"
                  ? "bg-red-600 hover:bg-red-700"
                  : "border-red-200 text-red-700 hover:bg-red-50"
              )}
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              {stats.urgentCount} Urgent
            </Button>
          )}
          <Button
            variant={statusFilter === "pending-review" ? "default" : "outline"}
            size="sm"
            onClick={toggleNeedsReviewFilter}
            className="h-8 text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            {stats.pendingReview} Need Review
          </Button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* Filters Dropdown */}
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as FaxStatus | "all")}
          >
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {(Object.entries(STATUS_LABELS) as [FaxStatus, string][]).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 px-2 text-xs">
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Refresh */}
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-auto">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Table Only */}
      <InboxDataTable
        columns={columns}
        data={filteredFaxes}
        globalFilter={debouncedSearch}
      />
    </div>
  );
}
