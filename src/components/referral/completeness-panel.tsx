"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CompletenessItem } from "@/types/referral";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Eye,
  Send,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface CompletenessPanelProps {
  items: CompletenessItem[];
  score: number;
  aiConfidence: number;
  onViewPage?: (pageNumber: number) => void;
  onRequestItem?: (item: CompletenessItem) => void;
  onRequestMissingItems?: () => void;
  onMarkFound?: (itemId: string) => void;
  onMarkMissing?: (itemId: string) => void;
  onUnmarkFound?: (itemId: string) => void;
  onAddItem?: () => void;
}

export function CompletenessPanel({
  items,
  score,
  aiConfidence,
  onViewPage,
  onRequestItem,
  onRequestMissingItems,
  onMarkFound,
  onMarkMissing,
  onUnmarkFound,
  onAddItem,
}: CompletenessPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  const foundItems = items.filter((i) => i.status === "found");
  const missingItems = items.filter((i) => i.status === "missing");
  const uncertainItems = items.filter((i) => i.status === "uncertain");

  const needsManualReview = aiConfidence < 70 || uncertainItems.length > 0;

  const getStatusIcon = (status: CompletenessItem["status"]) => {
    switch (status) {
      case "found":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "missing":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "uncertain":
        return <HelpCircle className="h-4 w-4 text-amber-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-emerald-600";
    if (confidence >= 70) return "text-blue-600";
    if (confidence >= 50) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors">
          <div className="flex items-center gap-2">
            <span className="font-medium">Completeness</span>
            {needsManualReview && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Manual Review
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={cn("text-sm font-medium", getConfidenceColor(score))}>
              {score}%
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="px-3 pb-3">
        {/* AI Confidence indicator */}
        {aiConfidence < 70 && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">
                  AI Confidence: {aiConfidence}%
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Please verify the items below. The AI wasn&apos;t confident in its assessment.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-4">
          <Progress value={score} className="h-2" />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>{foundItems.length} found</span>
            <span>{missingItems.length} missing</span>
          </div>
        </div>

        {/* Found items */}
        {foundItems.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Found Items</p>
            <div className="space-y-1">
              {foundItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-emerald-50/50 rounded-md group"
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <span className="text-sm">{item.label}</span>
                    {item.required && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                        Required
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs", getConfidenceColor(item.confidence))}>
                      {item.confidence}%
                    </span>
                    {item.pageNumber && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => onViewPage?.(item.pageNumber!)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        pg {item.pageNumber}
                      </Button>
                    )}
                    {/* Remove from found button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        onUnmarkFound?.(item.id);
                        toast.info(`"${item.label}" moved to missing items`);
                      }}
                      title="Move to missing items"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Uncertain items (AI suggests, human confirms) */}
        {uncertainItems.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-amber-600 mb-2">
              Needs Verification ({uncertainItems.length})
            </p>
            <div className="space-y-2">
              {uncertainItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-amber-50/50 rounded-md border border-amber-200"
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <span className="text-sm">{item.label}</span>
                    {item.required && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0 border-amber-300">
                        Required
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-amber-600 mr-2">
                      {item.confidence}%
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs text-emerald-600 hover:text-emerald-700"
                      onClick={() => onMarkFound?.(item.id)}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Mark Found
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs text-red-600 hover:text-red-700"
                      onClick={() => onMarkMissing?.(item.id)}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Mark Missing
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing items */}
        {missingItems.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-red-600 mb-2">
              Missing Items ({missingItems.length})
            </p>
            <div className="space-y-2">
              {missingItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-red-50/50 rounded-md border border-red-200"
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <span className="text-sm">{item.label}</span>
                    {item.required && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0 border-red-300 text-red-700">
                        Required
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.requestedAt ? (
                      <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700">
                        Requested
                      </Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-emerald-600 hover:text-emerald-700"
                        onClick={() => onMarkFound?.(item.id)}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Mark Found
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Request all missing items button */}
            {missingItems.filter(i => !i.requestedAt).length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 text-xs border-red-200 text-red-700 hover:bg-red-50"
                onClick={onRequestMissingItems}
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Request Missing Items ({missingItems.filter(i => !i.requestedAt).length})
              </Button>
            )}
          </div>
        )}

        {/* Add custom item */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-muted-foreground"
          onClick={onAddItem}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Missing Item
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
}
