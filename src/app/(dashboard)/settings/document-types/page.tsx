"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { mockDocumentTypes } from "@/data/mock-document-types";
import { cn } from "@/lib/utils";

export default function DocumentTypesPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Document Types"
        description="Manage document type classifications and auto-file settings"
      />

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-3 px-4 border-b bg-muted/30">
            <span className="col-span-2">Document Type</span>
            <span>Category</span>
            <span className="text-center">Auto-File</span>
            <span className="text-center">Threshold</span>
            <span className="text-center">Priority</span>
            <span className="text-center">Active</span>
          </div>
          {mockDocumentTypes.map((dt) => (
            <div key={dt.id} className="grid grid-cols-7 items-center py-3 px-4 border-b last:border-0 hover:bg-muted/30 transition-colors">
              <span className="col-span-2 text-sm font-medium">{dt.name}</span>
              <Badge variant="secondary" className="text-[10px] w-fit">{dt.category}</Badge>
              <div className="flex justify-center">
                <Switch checked={dt.autoFileEnabled} />
              </div>
              <span className="text-center text-sm tabular-nums">{dt.autoFileThreshold}%</span>
              <div className="flex justify-center">
                <span className={cn(
                  "text-xs font-semibold tabular-nums px-2 py-0.5 rounded",
                  dt.priorityWeight >= 8 ? "bg-red-50 text-red-700" :
                  dt.priorityWeight >= 5 ? "bg-amber-50 text-amber-700" :
                  "bg-gray-50 text-gray-600"
                )}>
                  {dt.priorityWeight}/10
                </span>
              </div>
              <div className="flex justify-center">
                <Switch checked={dt.isActive} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
