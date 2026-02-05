"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { mockFaxLines } from "@/data/mock-fax-lines";
import { Phone, Plus, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function FaxLinesPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Fax Lines"
        description="Manage fax line configurations and routing"
        action={
          <Button size="sm" onClick={() => toast.info("Add fax line wizard...")}>
            <Plus className="h-4 w-4 mr-1" />
            Add Line
          </Button>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockFaxLines.map((line) => (
          <Card key={line.id} className={cn("transition-all", !line.isActive && "opacity-60")}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", line.isActive ? "bg-blue-50" : "bg-muted")}>
                    <Phone className={cn("h-5 w-5", line.isActive ? "text-blue-600" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <CardTitle className="text-sm">{line.name}</CardTitle>
                    <p className="text-xs text-muted-foreground font-mono">{line.number}</p>
                  </div>
                </div>
                <Switch checked={line.isActive} />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Department:</span>
                <Badge variant="secondary" className="text-[10px]">{line.assignedDepartment}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Daily Volume:</span>
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium tabular-nums">{line.dailyVolume} faxes/day</span>
                </div>
              </div>
              {line.isActive && (
                <div className="flex items-center gap-1 text-emerald-600 text-[10px]">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active &amp; Receiving
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
