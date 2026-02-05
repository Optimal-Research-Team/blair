"use client";

import { use, useState } from "react";
import { mockFaxes } from "@/data/mock-faxes";
import { PageThumbnail } from "@/components/fax-viewer/page-thumbnail";
import { FaxPageViewer } from "@/components/fax-viewer/fax-page-viewer";
import { ReviewPanel } from "@/components/fax-viewer/review-panel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { SlaTimerCell } from "@/components/inbox/sla-timer-cell";
import { PriorityBadge } from "@/components/inbox/priority-badge";
import { mockStaff } from "@/data/mock-staff";

interface Props {
  params: Promise<{ id: string }>;
}

export default function FaxDetailPage({ params }: Props) {
  const { id } = use(params);
  const fax = mockFaxes.find((f) => f.id === id);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  if (!fax) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-lg text-muted-foreground">Fax not found</p>
        <Button variant="outline" asChild>
          <Link href="/inbox">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inbox
          </Link>
        </Button>
      </div>
    );
  }

  const lockedUser = fax.lockedBy
    ? mockStaff.find((s) => s.id === fax.lockedBy)
    : null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b px-4 py-2 bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="h-8">
            <Link href="/inbox">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <div className="h-5 w-px bg-border" />
          <span className="text-sm font-medium">{fax.senderName}</span>
          <PriorityBadge priority={fax.priority} />
          {fax.status !== "completed" && fax.status !== "auto-filed" && (
            <SlaTimerCell
              deadline={fax.slaDeadline}
              receivedAt={fax.receivedAt}
            />
          )}
        </div>
        {lockedUser && (
          <div className="flex items-center gap-1.5 text-amber-600 text-xs">
            <Lock className="h-3 w-3" />
            <span>Locked by {lockedUser.name}</span>
          </div>
        )}
      </div>

      {/* 3-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Thumbnails */}
        <div className="w-24 border-r bg-muted/30 p-2 space-y-2 overflow-auto shrink-0">
          {fax.pages.map((page, index) => (
            <PageThumbnail
              key={page.id}
              page={page}
              isActive={index === currentPageIndex}
              onClick={() => setCurrentPageIndex(index)}
            />
          ))}
        </div>

        {/* Center: Document viewer */}
        <div className="flex-1 min-w-0">
          <FaxPageViewer
            fax={fax}
            currentPage={fax.pages[currentPageIndex]}
            onPageChange={setCurrentPageIndex}
            currentPageIndex={currentPageIndex}
          />
        </div>

        {/* Right: Review panel */}
        <div className="w-80 border-l shrink-0">
          <ReviewPanel fax={fax} />
        </div>
      </div>
    </div>
  );
}
