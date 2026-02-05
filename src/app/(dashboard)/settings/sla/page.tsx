"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockDocumentTypes } from "@/data/mock-document-types";

function formatSlaTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (hours < 24) return rem > 0 ? `${hours}h ${rem}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `${days}d ${remHours}h` : `${days}d`;
}

export default function SlaPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="SLA Rules"
        description="Configure SLA targets per document type and priority level"
      />

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-3 px-4 border-b bg-muted/30">
            <span className="col-span-2">Document Type</span>
            <span className="text-center">STAT</span>
            <span className="text-center">Urgent</span>
            <span className="text-center">Routine</span>
          </div>
          {mockDocumentTypes.map((dt) => (
            <div key={dt.id} className="grid grid-cols-5 items-center py-3 px-4 border-b last:border-0 hover:bg-muted/30">
              <span className="col-span-2 text-sm font-medium">{dt.name}</span>
              <span className="text-center text-sm font-medium text-red-600 tabular-nums">
                {formatSlaTime(dt.slaMinutes.stat)}
              </span>
              <span className="text-center text-sm font-medium text-amber-600 tabular-nums">
                {formatSlaTime(dt.slaMinutes.urgent)}
              </span>
              <span className="text-center text-sm font-medium text-green-600 tabular-nums">
                {formatSlaTime(dt.slaMinutes.routine)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">SLA Legend</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p><span className="text-red-600 font-medium">STAT:</span> Life-threatening or critical findings. Must be actioned within the specified time.</p>
          <p><span className="text-amber-600 font-medium">Urgent:</span> Time-sensitive items requiring prompt attention.</p>
          <p><span className="text-green-600 font-medium">Routine:</span> Standard processing timeline. No immediate clinical urgency.</p>
        </CardContent>
      </Card>
    </div>
  );
}
