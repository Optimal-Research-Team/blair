"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockDocumentTypes } from "@/data/mock-document-types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Zap, Shield, AlertTriangle, Eye, Check } from "lucide-react";

export default function AutoFilingRulesPage() {
  // Global settings state
  const [autoFileEnabled, setAutoFileEnabled] = useState(true);
  const [shadowMode, setShadowMode] = useState(false);
  const [globalThreshold, setGlobalThreshold] = useState(90);

  // Per-document type state
  const [thresholds, setThresholds] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    mockDocumentTypes.forEach((dt) => {
      initial[dt.id] = dt.autoFileThreshold;
    });
    return initial;
  });

  const [editedThresholds, setEditedThresholds] = useState<Record<string, number>>({});
  const [autoFileStates, setAutoFileStates] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    mockDocumentTypes.forEach((dt) => {
      initial[dt.id] = dt.autoFileEnabled;
    });
    return initial;
  });

  // Handle global threshold change - updates all individual thresholds
  const handleGlobalThresholdChange = (value: number) => {
    setGlobalThreshold(value);
  };

  const applyGlobalThreshold = () => {
    const newThresholds: Record<string, number> = {};
    mockDocumentTypes.forEach((dt) => {
      newThresholds[dt.id] = globalThreshold;
    });
    setThresholds(newThresholds);
    setEditedThresholds({});
    toast.success(`All thresholds updated to ${globalThreshold}%`);
  };

  // Handle individual threshold edit
  const handleThresholdEdit = (id: string, value: number) => {
    setEditedThresholds((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Confirm individual threshold change
  const confirmThreshold = (id: string, docName: string) => {
    const newValue = editedThresholds[id];
    if (newValue !== undefined) {
      setThresholds((prev) => ({
        ...prev,
        [id]: newValue,
      }));
      setEditedThresholds((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      toast.success(`Threshold for ${docName} updated to ${newValue}%`);
    }
  };

  // Toggle auto-file for a document type
  const toggleAutoFile = (id: string) => {
    setAutoFileStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Auto-Filing Rules"
        description="Configure automatic filing thresholds for each document type"
      />

      {/* Global Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Auto-File Engine Card */}
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
                <p className="text-xs text-muted-foreground mt-0.5">
                  Automatically file documents when AI confidence exceeds threshold
                </p>
              </div>
              <Switch checked={autoFileEnabled} onCheckedChange={setAutoFileEnabled} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Global Confidence Threshold</Label>
                <span className="text-sm font-bold tabular-nums">{globalThreshold}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={99}
                value={globalThreshold}
                onChange={(e) => handleGlobalThresholdChange(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>50% (Aggressive)</span>
                <span>99% (Conservative)</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2"
                onClick={applyGlobalThreshold}
              >
                Apply to All Document Types
              </Button>
            </div>
            {autoFileEnabled && !shadowMode && (
              <div className="bg-emerald-50 rounded-lg p-3 text-xs space-y-1">
                <p className="font-medium text-emerald-700">Auto-file is active</p>
                <p className="text-emerald-600">
                  Documents with AI confidence above threshold will be automatically filed.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shadow Mode Card */}
        <Card className={cn("border-2", shadowMode ? "border-amber-400 bg-amber-50/30" : "border-border")}>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4 text-amber-600" />
              Shadow Mode
              <Badge variant="secondary" className="text-[9px] bg-amber-100 text-amber-700">
                Key Feature
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Enable Shadow Mode</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  AI processes faxes but holds actions for human review
                </p>
              </div>
              <Switch checked={shadowMode} onCheckedChange={setShadowMode} />
            </div>
            <div className={cn("rounded-lg p-3 text-xs space-y-2", shadowMode ? "bg-amber-50" : "bg-muted/30")}>
              <p className="font-medium text-amber-700 flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                {shadowMode ? "Shadow Mode Active" : "Shadow Mode Inactive"}
              </p>
              <p className="text-muted-foreground">
                When enabled, Blair processes all faxes through AI but does NOT auto-file. All AI
                decisions appear as suggestions for human review. Ideal for pilot deployments.
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

      {/* Document Types Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Document Type Thresholds</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-6 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-3 px-4 border-b bg-muted/30">
            <span className="col-span-3">Document Type</span>
            <span>Category</span>
            <span className="text-center">Auto-File</span>
            <span className="text-center">Threshold</span>
          </div>
          {mockDocumentTypes.map((dt) => {
            const currentThreshold = thresholds[dt.id];
            const editedValue = editedThresholds[dt.id];
            const displayValue = editedValue !== undefined ? editedValue : currentThreshold;
            const hasChanges = editedValue !== undefined && editedValue !== currentThreshold;

            return (
              <div
                key={dt.id}
                className="grid grid-cols-6 items-center py-3 px-4 border-b last:border-0 hover:bg-muted/30 transition-colors"
              >
                <span className="col-span-3 text-sm font-medium">{dt.name}</span>
                <Badge variant="secondary" className="text-[10px] w-fit">
                  {dt.category}
                </Badge>
                <div className="flex justify-center">
                  <Switch
                    checked={autoFileStates[dt.id]}
                    onCheckedChange={() => toggleAutoFile(dt.id)}
                  />
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Input
                    type="number"
                    min={50}
                    max={99}
                    value={displayValue}
                    onChange={(e) => handleThresholdEdit(dt.id, Number(e.target.value))}
                    className="w-16 h-7 text-xs text-center tabular-nums"
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                  <Button
                    size="sm"
                    variant={hasChanges ? "default" : "ghost"}
                    className={cn("h-7 w-7 p-0", !hasChanges && "opacity-30")}
                    disabled={!hasChanges}
                    onClick={() => confirmThreshold(dt.id, dt.name)}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Auto-File Performance (Last 7 Days)</CardTitle>
        </CardHeader>
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
