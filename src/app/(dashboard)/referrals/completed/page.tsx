"use client";

import { useState, useMemo } from "react";
import { ReferralsDataTable } from "@/components/referrals/referrals-data-table";
import { completedReferralColumns } from "@/components/referrals/referrals-columns";
import { mockReferrals } from "@/data/mock-referrals";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  X,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function CompletedReferralsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Filter to only show routed (completed) referrals
  const completedReferrals = useMemo(() => {
    let result = mockReferrals.filter((r) => r.status === "routed");

    // Apply search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (r) =>
          r.patientName?.toLowerCase().includes(query) ||
          r.referringPhysicianName?.toLowerCase().includes(query) ||
          r.clinicName?.toLowerCase().includes(query) ||
          r.reasonForReferral?.toLowerCase().includes(query) ||
          r.assignedCardiologistName?.toLowerCase().includes(query) ||
          r.conditions?.some((c) => c.toLowerCase().includes(query))
      );
    }

    // Sort by received date, newest first
    result.sort((a, b) =>
      new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime()
    );

    return result;
  }, [debouncedSearch]);

  // Calculate SLA stats
  const slaStats = useMemo(() => {
    const completedList = mockReferrals.filter((r) => r.status === "routed");
    let metCount = 0;
    let missedCount = 0;

    completedList.forEach((r) => {
      const receivedTime = new Date(r.receivedDate).getTime();
      const completedTime = new Date(r.updatedAt).getTime();
      const hoursToComplete = (completedTime - receivedTime) / (1000 * 60 * 60);
      const slaHours = r.priority === "urgent" ? 24 : 72;
      if (hoursToComplete <= slaHours) {
        metCount++;
      } else {
        missedCount++;
      }
    });

    return { total: completedList.length, met: metCount, missed: missedCount };
  }, []);

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Single Header Row */}
      <div className="flex items-center gap-4">
        {/* Left: Title + Count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h1 className="text-xl font-semibold">Routed Referrals</h1>
          </div>
          <span className="text-sm text-muted-foreground">
            {slaStats.total} routed to Cerebrum
          </span>
        </div>

        {/* SLA Stats */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="font-medium">{slaStats.met} SLA met</span>
          </div>
          {slaStats.missed > 0 && (
            <div className="flex items-center gap-1.5 text-red-600">
              <X className="h-3.5 w-3.5" />
              <span className="font-medium">{slaStats.missed} SLA missed</span>
            </div>
          )}
        </div>

        {/* Center: Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search patient, physician, cardiologist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-10 h-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Refresh */}
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-auto">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <ReferralsDataTable
        columns={completedReferralColumns}
        data={completedReferrals}
        globalFilter={debouncedSearch}
        emptyMessage="No routed referrals yet."
      />
    </div>
  );
}
