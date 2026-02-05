"use client";

import { use, useState } from "react";
import { mockFaxes } from "@/data/mock-faxes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { ArrowLeft, Scissors, Save, Plus, X, GripVertical } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Segment {
  id: string;
  pages: number[];
  label: string;
  docType: string;
  patient: string;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function SplitPage({ params }: Props) {
  const { id } = use(params);
  const fax = mockFaxes.find((f) => f.id === id);

  const [segments, setSegments] = useState<Segment[]>(() => {
    if (!fax) return [];
    // Default: all pages in one segment
    return [
      {
        id: "seg-1",
        pages: fax.pages.map((p) => p.pageNumber),
        label: "Segment 1",
        docType: fax.documentType,
        patient: fax.patientName || "Unknown",
      },
    ];
  });

  const [splitAfter, setSplitAfter] = useState<Set<number>>(new Set());

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

  const toggleSplit = (afterPage: number) => {
    const newSplits = new Set(splitAfter);
    if (newSplits.has(afterPage)) {
      newSplits.delete(afterPage);
    } else {
      newSplits.add(afterPage);
    }
    setSplitAfter(newSplits);

    // Recalculate segments based on splits
    const sortedSplits = Array.from(newSplits).sort((a, b) => a - b);
    const newSegments: Segment[] = [];
    let startPage = 1;
    let segIndex = 0;

    for (const splitPage of sortedSplits) {
      const pages: number[] = [];
      for (let p = startPage; p <= splitPage; p++) pages.push(p);
      segIndex++;
      const firstPage = fax.pages.find((fp) => fp.pageNumber === startPage);
      newSegments.push({
        id: `seg-${segIndex}`,
        pages,
        label: `Segment ${segIndex}`,
        docType: firstPage?.detectedDocType || fax.documentType,
        patient: firstPage?.detectedPatient || fax.patientName || "Unknown",
      });
      startPage = splitPage + 1;
    }

    // Last segment
    if (startPage <= fax.pageCount) {
      segIndex++;
      const pages: number[] = [];
      for (let p = startPage; p <= fax.pageCount; p++) pages.push(p);
      const firstPage = fax.pages.find((fp) => fp.pageNumber === startPage);
      newSegments.push({
        id: `seg-${segIndex}`,
        pages,
        label: `Segment ${segIndex}`,
        docType: firstPage?.detectedDocType || fax.documentType,
        patient: firstPage?.detectedPatient || fax.patientName || "Unknown",
      });
    }

    setSegments(newSegments);
  };

  const handleSaveSplit = () => {
    toast.success(`Fax split into ${segments.length} segments`);
  };

  const segmentColors = [
    "bg-blue-100 border-blue-300 text-blue-800",
    "bg-emerald-100 border-emerald-300 text-emerald-800",
    "bg-purple-100 border-purple-300 text-purple-800",
    "bg-amber-100 border-amber-300 text-amber-800",
    "bg-rose-100 border-rose-300 text-rose-800",
  ];

  const getSegmentForPage = (pageNum: number) => {
    return segments.findIndex((s) => s.pages.includes(pageNum));
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Document Splitting"
        description={`Split ${fax.senderName} — ${fax.pageCount} pages`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/fax/${fax.id}`}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Viewer
              </Link>
            </Button>
            <Button onClick={handleSaveSplit} disabled={segments.length <= 1}>
              <Save className="h-4 w-4 mr-1" />
              Save Split ({segments.length} segments)
            </Button>
          </div>
        }
      />

      {/* Page strip */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">
            Click between pages to add split markers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-stretch gap-0 overflow-x-auto pb-2">
            {fax.pages.map((page, index) => {
              const segIndex = getSegmentForPage(page.pageNumber);
              const colorClass =
                segmentColors[segIndex % segmentColors.length];
              const showSplitMarker =
                index < fax.pages.length - 1;
              const isSplit = splitAfter.has(page.pageNumber);

              return (
                <div key={page.id} className="flex items-stretch shrink-0">
                  {/* Page card */}
                  <div
                    className={cn(
                      "w-24 border-2 rounded-lg p-2 flex flex-col items-center gap-1 transition-all",
                      colorClass
                    )}
                  >
                    {/* Mini page preview */}
                    <div className="w-16 h-20 bg-white rounded border shadow-sm flex flex-col p-1.5 gap-0.5">
                      <div className="h-1 bg-gray-200 rounded w-3/4" />
                      <div className="h-0.5 bg-gray-100 rounded w-full" />
                      <div className="h-0.5 bg-gray-100 rounded w-5/6" />
                      <div className="h-0.5 bg-gray-100 rounded w-full" />
                      <div className="h-0.5 bg-gray-100 rounded w-2/3" />
                    </div>
                    <span className="text-[10px] font-semibold">
                      Page {page.pageNumber}
                    </span>
                    {page.detectedDocType && (
                      <span className="text-[8px] truncate max-w-full text-center">
                        {page.detectedDocType}
                      </span>
                    )}
                  </div>

                  {/* Split marker zone */}
                  {showSplitMarker && (
                    <button
                      onClick={() => toggleSplit(page.pageNumber)}
                      className={cn(
                        "flex items-center justify-center w-8 transition-all group",
                        isSplit
                          ? "bg-red-50"
                          : "hover:bg-muted/50"
                      )}
                    >
                      {isSplit ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <Scissors className="h-4 w-4 text-red-500 rotate-90" />
                          <div className="w-0.5 h-full bg-red-400 absolute" />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Segments summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.map((segment, index) => (
          <Card
            key={segment.id}
            className={cn("border-2", segmentColors[index % segmentColors.length])}
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">{segment.label}</h4>
                <Badge variant="secondary" className="text-[10px]">
                  {segment.pages.length} {segment.pages.length === 1 ? "page" : "pages"}
                </Badge>
              </div>
              <div className="text-xs space-y-1">
                <p>
                  <span className="text-muted-foreground">Pages: </span>
                  {segment.pages.join(", ")}
                </p>
                <p>
                  <span className="text-muted-foreground">Type: </span>
                  {segment.docType}
                </p>
                <p>
                  <span className="text-muted-foreground">Patient: </span>
                  {segment.patient}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
