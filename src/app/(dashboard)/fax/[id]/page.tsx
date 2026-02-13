"use client";

import { use, useState, useEffect } from "react";
import { mockFaxes } from "@/data/mock-faxes";
import { mockPatients } from "@/data/mock-patients";
import { currentUser } from "@/data/mock-staff";
import { PageThumbnail } from "@/components/fax-viewer/page-thumbnail";
import { FaxPageViewer } from "@/components/fax-viewer/fax-page-viewer";
import { ReviewPanel } from "@/components/fax-viewer/review-panel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, AlertTriangle, Stethoscope } from "lucide-react";
import Link from "next/link";
import { SlaTimerCell } from "@/components/inbox/sla-timer-cell";
import { PriorityBadge } from "@/components/inbox/priority-badge";
import { useLockStore } from "@/stores/use-lock-store";
import { formatDate, formatPHN } from "@/lib/format";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

interface Props {
  params: Promise<{ id: string }>;
}

export default function FaxDetailPage({ params }: Props) {
  const { id } = use(params);
  const fax = mockFaxes.find((f) => f.id === id);
  const patient = fax?.patientId ? mockPatients.find((p) => p.id === fax.patientId) : null;
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const { lockDocument, unlockDocument, isLockedByOther, getLockedByUser } = useLockStore();
  const lockedByOther = isLockedByOther(id);
  const lockedUser = getLockedByUser(id);

  // Auto-lock on mount, unlock on unmount
  useEffect(() => {
    if (fax && !lockedByOther) {
      lockDocument(id);
    }
    return () => {
      unlockDocument(id);
    };
  }, [id, fax, lockDocument, unlockDocument, lockedByOther]);

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

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Lock warning banner when another user has document */}
      {lockedByOther && lockedUser && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            <strong>{lockedUser.name}</strong> is currently working on this document.
            Changes you make may conflict with their work.
          </span>
        </div>
      )}

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
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{fax.patientName || "Unknown Patient"}</span>
              <PriorityBadge priority={fax.priority} />
              {fax.status !== "completed" && fax.status !== "auto-filed" && (
                <SlaTimerCell
                  deadline={fax.slaDeadline}
                  receivedAt={fax.receivedAt}
                />
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                DOB: {patient ? formatDate(patient.dateOfBirth) : <span className="italic text-muted-foreground/70">Not found</span>}
              </span>
              <span>·</span>
              <span>
                OHIP: {patient ? formatPHN(patient.phn) : <span className="italic text-muted-foreground/70">Not found</span>}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Stethoscope className="h-3 w-3" />
                {fax.senderName || <span className="italic text-muted-foreground/70">Not found</span>}
              </span>
            </div>
          </div>
        </div>
        {/* Show lock status */}
        {!lockedByOther && (
          <div className="flex items-center gap-1.5 text-emerald-600 text-xs">
            <Lock className="h-3 w-3" />
            <span>Locked by you</span>
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

        {/* Resizable document viewer and review panel */}
        <ResizablePanelGroup orientation="horizontal" className="flex-1">
          {/* Center: Document viewer */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <FaxPageViewer
              fax={fax}
              currentPage={fax.pages[currentPageIndex]}
              onPageChange={setCurrentPageIndex}
              currentPageIndex={currentPageIndex}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right: Review panel */}
          <ResizablePanel defaultSize={50} minSize={25}>
            <div className="border-l h-full">
              <ReviewPanel
                fax={fax}
                extractedFields={fax.pages[currentPageIndex]?.extractedFields}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
