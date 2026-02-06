"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UnclassifiedCard } from "@/components/worklist/unclassified-card";
import { ReferralCard } from "@/components/worklist/referral-card";
import { Button } from "@/components/ui/button";
import { mockWorklistItems, mockQueueStats, getWorklistByView } from "@/data/mock-worklist";
import { WorklistView } from "@/types/worklist";
import { useLockStore } from "@/stores/use-lock-store";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Zap,
  CheckCircle2,
  RefreshCw,
  ListTodo,
  FileQuestion,
  FileText,
  Clock,
} from "lucide-react";

export default function WorklistPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading worklist...</div>}>
      <WorklistPageContent />
    </Suspense>
  );
}

function WorklistPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view") as WorklistView | null;
  const [activeView, setActiveView] = useState<WorklistView>(viewParam || "all");
  const [priorityFilter, setPriorityFilter] = useState<"stat" | "urgent" | "all">("all");

  const { getLockedByUser } = useLockStore();

  // Sync view with URL query parameter
  useEffect(() => {
    if (viewParam && ["all", "unclassified", "referral"].includes(viewParam)) {
      setActiveView(viewParam);
    } else if (!viewParam) {
      setActiveView("all");
    }
  }, [viewParam]);

  const counts = useMemo(() => ({
    all: mockWorklistItems.length,
    unclassified: mockWorklistItems.filter((i) => i.category === "unclassified").length,
    referral: mockWorklistItems.filter((i) => i.category === "referral").length,
  }), []);

  // Calculate STAT and Urgent counts separately
  const statCount = useMemo(() =>
    mockWorklistItems.filter((i) => i.priority === "stat").length,
  []);
  const urgentCount = useMemo(() =>
    mockWorklistItems.filter((i) => i.priority === "urgent").length,
  []);

  const filteredItems = useMemo(() => {
    let items = getWorklistByView(activeView);
    if (priorityFilter !== "all") {
      items = items.filter((i) => i.priority === priorityFilter);
    }
    return items;
  }, [activeView, priorityFilter]);

  const handleOpen = (id: string) => {
    const item = mockWorklistItems.find((i) => i.id === id || i.faxId === id || i.referralId === id);
    if (item?.referralId) {
      router.push(`/referrals/${item.referralId}`);
    } else {
      router.push(`/fax/${item?.faxId ?? id}`);
    }
  };

  const handleViewChange = (view: WorklistView) => {
    setActiveView(view);
    setPriorityFilter("all");
    if (view === "all") {
      router.push("/worklist", { scroll: false });
    } else {
      router.push(`/worklist?view=${view}`, { scroll: false });
    }
  };

  const toggleStatFilter = () => {
    setPriorityFilter(priorityFilter === "stat" ? "all" : "stat");
  };

  const toggleUrgentFilter = () => {
    setPriorityFilter(priorityFilter === "urgent" ? "all" : "urgent");
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Single Header Row - matches inbox pattern */}
      <div className="flex items-center gap-4">
        {/* Left: Title + Count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">Worklist</h1>
          </div>
          <span className="text-sm text-muted-foreground">
            {counts.all} items
          </span>
        </div>

        {/* Category filter buttons */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          <Button
            variant={activeView === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => handleViewChange("all")}
            className="h-7 text-xs px-3"
          >
            All
            <span className="ml-1.5 text-muted-foreground">{counts.all}</span>
          </Button>
          <Button
            variant={activeView === "unclassified" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => handleViewChange("unclassified")}
            className="h-7 text-xs px-3"
          >
            <FileQuestion className="h-3 w-3 mr-1" />
            Unclassified
            <span className="ml-1.5 text-muted-foreground">{counts.unclassified}</span>
          </Button>
          <Button
            variant={activeView === "referral" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => handleViewChange("referral")}
            className="h-7 text-xs px-3"
          >
            <FileText className="h-3 w-3 mr-1" />
            Referrals
            <span className="ml-1.5 text-muted-foreground">{counts.referral}</span>
          </Button>
        </div>

        {/* Priority quick filters */}
        <div className="flex items-center gap-2">
          {statCount > 0 && (
            <Button
              variant={priorityFilter === "stat" ? "default" : "outline"}
              size="sm"
              onClick={toggleStatFilter}
              className={cn(
                "h-8 text-xs",
                priorityFilter === "stat"
                  ? "bg-red-600 hover:bg-red-700"
                  : "border-red-200 text-red-700 hover:bg-red-50"
              )}
            >
              <Zap className="h-3 w-3 mr-1" />
              {statCount} STAT
            </Button>
          )}
          {urgentCount > 0 && (
            <Button
              variant={priorityFilter === "urgent" ? "default" : "outline"}
              size="sm"
              onClick={toggleUrgentFilter}
              className={cn(
                "h-8 text-xs",
                priorityFilter === "urgent"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "border-orange-200 text-orange-700 hover:bg-orange-50"
              )}
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              {urgentCount} Urgent
            </Button>
          )}
        </div>

        {/* Avg wait time */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{mockQueueStats.averageWaitMinutes}m avg</span>
        </div>

        {/* Refresh */}
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-auto">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Items list - no Card wrapper, cleaner */}
      <div className="rounded-lg border bg-card">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-emerald-500" />
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs text-muted-foreground">No items match your filters.</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredItems.map((item) => {
              // Check lock status from store
              const lockedUser = getLockedByUser(item.faxId);
              const isLocked = !!lockedUser;

              if (item.category === "unclassified") {
                return (
                  <UnclassifiedCard
                    key={item.id}
                    item={item}
                    onOpen={handleOpen}
                    isLocked={isLocked}
                    lockedByName={lockedUser?.name}
                  />
                );
              }

              return (
                <ReferralCard
                  key={item.id}
                  item={item}
                  onOpen={handleOpen}
                  isLocked={isLocked}
                  lockedByName={lockedUser?.name}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
