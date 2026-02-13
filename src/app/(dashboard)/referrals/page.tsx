"use client";

import { useState, useMemo } from "react";
import { ReferralsDataTable } from "@/components/referrals/referrals-data-table";
import { referralColumns } from "@/components/referrals/referrals-columns";
import { mockReferrals } from "@/data/mock-referrals";
import { ReferralStatus } from "@/types/referral";
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
import {
  Search,
  X,
  FileHeart,
  AlertTriangle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: ReferralStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "triage", label: "Triage" },
  { value: "incomplete", label: "Incomplete" },
  { value: "pending-review", label: "Pending Review" },
  { value: "routed", label: "Routed to Cerebrum" },
  { value: "declined", label: "Declined" },
];

export default function ReferralsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<"urgent" | "routine" | "all">("all");

  const debouncedSearch = useDebounce(search, 300);

  // Calculate stats
  const stats = useMemo(() => {
    const incompleteCount = mockReferrals.filter(
      (r) => r.status === "incomplete" || r.status === "triage"
    ).length;
    const urgentCount = mockReferrals.filter(
      (r) => r.priority === "urgent" && r.status !== "routed" && r.status !== "declined"
    ).length;
    const pendingCount = mockReferrals.filter(
      (r) => r.status === "pending-review"
    ).length;

    return { total: mockReferrals.length, incompleteCount, urgentCount, pendingCount };
  }, []);

  const filteredReferrals = useMemo(() => {
    let result = [...mockReferrals];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      result = result.filter((r) => r.priority === priorityFilter);
    }

    // Apply search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (r) =>
          r.patientName?.toLowerCase().includes(query) ||
          r.referringPhysicianName?.toLowerCase().includes(query) ||
          r.clinicName?.toLowerCase().includes(query) ||
          r.reasonForReferral?.toLowerCase().includes(query) ||
          r.conditions?.some((c) => c.toLowerCase().includes(query))
      );
    }

    // Sort: urgent first, then by status, then by received date
    result.sort((a, b) => {
      const priorityOrder = { urgent: 0, routine: 1 };
      const statusOrder: Record<string, number> = {
        triage: 0,
        incomplete: 1,
        "pending-review": 2,
        routed: 3,
        declined: 4,
      };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime();
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

  const toggleIncompleteFilter = () => {
    if (statusFilter === "incomplete") {
      setStatusFilter("all");
    } else {
      setStatusFilter("incomplete");
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
            <FileHeart className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">Referrals</h1>
          </div>
          <span className="text-sm text-muted-foreground">
            {stats.total} referrals
          </span>
        </div>

        {/* Center: Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search patient, physician, clinic, reason..."
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

        {/* Right: Quick Filters */}
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
          {stats.incompleteCount > 0 && (
            <Button
              variant={statusFilter === "incomplete" ? "default" : "outline"}
              size="sm"
              onClick={toggleIncompleteFilter}
              className="h-8 text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              {stats.incompleteCount} Incomplete
            </Button>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* Filters Dropdown */}
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ReferralStatus | "all")}
          >
            <SelectTrigger className="w-[150px] h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
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

      {/* Table */}
      <ReferralsDataTable
        columns={referralColumns}
        data={filteredReferrals}
        globalFilter={debouncedSearch}
      />
    </div>
  );
}
