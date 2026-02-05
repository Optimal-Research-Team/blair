"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Zap, Shield, AlertTriangle, Eye } from "lucide-react";

export default function AutoFilePage() {
  const [autoFileEnabled, setAutoFileEnabled] = useState(true);
  const [shadowMode, setShadowMode] = useState(false);
  const [globalThreshold, setGlobalThreshold] = useState(90);

  return (
    <div className="space-y-4">
      <PageHeader title="Auto-File Settings" description="Configure automatic filing thresholds and shadow mode" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-600" />
              Auto-File Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Enable Auto-Filing</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Automatically file documents when AI confidence exceeds threshold</p>
              </div>
              <Switch checked={autoFileEnabled} onCheckedChange={setAutoFileEnabled} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Global Confidence Threshold</Label>
                <span className="text-sm font-bold tabular-nums">{globalThreshold}%</span>
              </div>
              <input type="range" min={50} max={99} value={globalThreshold} onChange={(e) => setGlobalThreshold(Number(e.target.value))} className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>50% (Aggressive)</span>
                <span>99% (Conservative)</span>
              </div>
            </div>
            {autoFileEnabled && (
              <div className="bg-emerald-50 rounded-lg p-3 text-xs space-y-1">
                <p className="font-medium text-emerald-700">Auto-file is active</p>
                <p className="text-emerald-600">Documents with AI confidence above {globalThreshold}% will be automatically filed.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={cn("border-2", shadowMode ? "border-amber-400 bg-amber-50/30" : "border-border")}>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4 text-amber-600" />
              Shadow Mode
              <Badge variant="secondary" className="text-[9px] bg-amber-100 text-amber-700">Key Feature</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Enable Shadow Mode</Label>
                <p className="text-xs text-muted-foreground mt-0.5">AI processes faxes but holds actions for human review</p>
              </div>
              <Switch checked={shadowMode} onCheckedChange={setShadowMode} />
            </div>
            <div className={cn("rounded-lg p-3 text-xs space-y-2", shadowMode ? "bg-amber-50" : "bg-muted/30")}>
              <p className="font-medium text-amber-700 flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                {shadowMode ? "Shadow Mode Active" : "Shadow Mode Inactive"}
              </p>
              <p className="text-muted-foreground">
                When enabled, Blair processes all faxes through AI but does NOT auto-file. All AI decisions appear as suggestions for human review. Ideal for pilot deployments.
              </p>
            </div>
            {shadowMode && (
              <div className="flex items-center gap-2 text-amber-700 text-xs bg-amber-100 rounded p-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>Shadow mode overrides auto-file. All items require manual review.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Auto-File Performance (Last 7 Days)</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold text-emerald-600">94.2%</p>
              <p className="text-xs text-muted-foreground mt-1">Auto-File Accuracy</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold">643</p>
              <p className="text-xs text-muted-foreground mt-1">Auto-Filed This Week</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">38</p>
              <p className="text-xs text-muted-foreground mt-1">Overridden by Staff</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">3.2m</p>
              <p className="text-xs text-muted-foreground mt-1">Avg Time Saved/Fax</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
