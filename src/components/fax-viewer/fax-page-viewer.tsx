"use client";

import { Fax, FaxPage } from "@/types";
import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FaxPageViewerProps {
  fax: Fax;
  currentPage: FaxPage;
  onPageChange: (pageIndex: number) => void;
  currentPageIndex: number;
}

export function FaxPageViewer({
  fax,
  currentPage,
  onPageChange,
  currentPageIndex,
}: FaxPageViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b px-3 py-2 bg-muted/30">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onPageChange(Math.max(0, currentPageIndex - 1))}
            disabled={currentPageIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            Page {currentPageIndex + 1} of {fax.pageCount}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() =>
              onPageChange(
                Math.min(fax.pageCount - 1, currentPageIndex + 1)
              )
            }
            disabled={currentPageIndex === fax.pageCount - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setZoom(Math.max(50, zoom - 25))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-10 text-center tabular-nums">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setZoom(Math.min(200, zoom + 25))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 ml-1"
            onClick={() => setRotation((r) => (r + 90) % 360)}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Document view */}
      <div className="flex-1 overflow-auto bg-gray-100 p-6 flex items-start justify-center">
        <div
          className="bg-white shadow-lg border rounded-sm transition-transform"
          style={{
            width: `${(8.5 * 72 * zoom) / 100}px`,
            minHeight: `${(11 * 72 * zoom) / 100}px`,
            transform: `rotate(${rotation}deg)`,
          }}
        >
          {/* Simulated fax content */}
          <div className="p-8 space-y-4" style={{ fontSize: `${(14 * zoom) / 100}px` }}>
            {/* Header */}
            <div className="border-b pb-4 space-y-2">
              <div className="h-3 bg-gray-300 rounded w-48" />
              <div className="h-2 bg-gray-200 rounded w-64" />
              <div className="h-2 bg-gray-200 rounded w-40" />
            </div>

            {/* Fax metadata */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
              <div>
                <span className="text-gray-500">From: </span>
                <span className="font-medium">{fax.senderName}</span>
              </div>
              <div>
                <span className="text-gray-500">Fax: </span>
                <span>{fax.senderFaxNumber.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}</span>
              </div>
              <div>
                <span className="text-gray-500">Patient: </span>
                <span className="font-medium">{fax.patientName || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-500">Date: </span>
                <span>{new Date(fax.receivedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Detected doc type label */}
            {currentPage.detectedDocType && (
              <div className="inline-block bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-xs font-medium">
                Detected: {currentPage.detectedDocType}
              </div>
            )}

            {/* Simulated body text */}
            <div className="space-y-3 pt-4">
              <div className="h-2 bg-gray-100 rounded w-full" />
              <div className="h-2 bg-gray-100 rounded w-11/12" />
              <div className="h-2 bg-gray-100 rounded w-full" />
              <div className="h-2 bg-gray-100 rounded w-4/5" />
              <div className="h-2 bg-gray-100 rounded w-full" />
              <div className="h-2 bg-gray-100 rounded w-3/4" />
              <div className="h-4" />
              <div className="h-2 bg-gray-100 rounded w-full" />
              <div className="h-2 bg-gray-100 rounded w-5/6" />
              <div className="h-2 bg-gray-100 rounded w-full" />
              <div className="h-2 bg-gray-100 rounded w-2/3" />
              <div className="h-4" />
              {fax.description && (
                <p className="text-xs text-gray-600 leading-relaxed border-l-2 border-blue-300 pl-3 italic">
                  {fax.description}
                </p>
              )}
              <div className="h-4" />
              <div className="h-2 bg-gray-100 rounded w-full" />
              <div className="h-2 bg-gray-100 rounded w-11/12" />
              <div className="h-2 bg-gray-100 rounded w-full" />
              <div className="h-2 bg-gray-100 rounded w-3/5" />
              <div className="h-8" />
              <div className="h-2 bg-gray-300 rounded w-32" />
              <div className="h-2 bg-gray-200 rounded w-48" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
