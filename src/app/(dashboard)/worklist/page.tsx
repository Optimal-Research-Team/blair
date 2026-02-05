"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { QueueStatsBar } from "@/components/worklist/queue-stats-bar";
import { WorklistItemCard } from "@/components/worklist/worklist-item-card";
import { mockFaxes } from "@/data/mock-faxes";
import { calculatePriorityScore } from "@/lib/sla";
import { currentUser } from "@/data/mock-staff";
import { Fax } from "@/types";
import { toast } from "sonner";

export default function WorklistPage() {
  const [faxes, setFaxes] = useState<Fax[]>(mockFaxes);

  const queueItems = useMemo(() => {
    // Only show actionable items in the worklist
    const actionable = faxes.filter(
      (f) =>
        f.status === "pending-review" ||
        f.status === "in-progress" ||
        f.status === "flagged"
    );

    // Calculate priority scores and sort
    const scored = actionable.map((fax) => ({
      fax,
      score: calculatePriorityScore(
        fax.priority,
        fax.slaDeadline,
        fax.receivedAt,
        fax.priority === "stat" ? 10 : fax.priority === "urgent" ? 7 : 3
      ),
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored;
  }, [faxes]);

  const handleClaim = (faxId: string) => {
    setFaxes((prev) =>
      prev.map((f) =>
        f.id === faxId
          ? {
              ...f,
              assignedTo: currentUser.id,
              lockedBy: currentUser.id,
              lockedAt: new Date().toISOString(),
              status: f.status === "pending-review" ? "in-progress" : f.status,
            }
          : f
      )
    );
    toast.success("Fax claimed and locked to you");
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Worklist"
        description="Prioritized work queue — highest priority items first"
      />

      <QueueStatsBar faxes={faxes} />

      <div className="space-y-3">
        {queueItems.map(({ fax, score }, index) => (
          <WorklistItemCard
            key={fax.id}
            fax={fax}
            position={index + 1}
            score={score}
            onClaim={handleClaim}
          />
        ))}

        {queueItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">Queue is empty</p>
            <p className="text-sm">All faxes have been processed</p>
          </div>
        )}
      </div>
    </div>
  );
}
