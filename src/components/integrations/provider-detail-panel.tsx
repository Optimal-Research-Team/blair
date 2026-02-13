"use client";

import { SalesforceProvider } from "@/types/integration-feeds";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  ExternalLink,
  Building2,
  Phone,
  Mail,
  FileText,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  XCircle,
  HelpCircle,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

interface ProviderDetailPanelProps {
  provider: SalesforceProvider | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const qualityConfig = {
  excellent: {
    label: "Excellent",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
  },
  good: {
    label: "Good",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
  },
  "needs-improvement": {
    label: "Needs Improvement",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
  },
  poor: {
    label: "Poor",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
  },
};

const statusConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  complete: { label: "Complete", icon: CheckCircle, color: "text-emerald-600" },
  booked: { label: "Booked", icon: Calendar, color: "text-blue-600" },
  accepted: { label: "Accepted", icon: CheckCircle, color: "text-blue-600" },
  routed: { label: "Routed", icon: CheckCircle, color: "text-blue-600" },
  "pending-response": { label: "Pending", icon: HelpCircle, color: "text-amber-600" },
  incomplete: { label: "Incomplete", icon: AlertCircle, color: "text-amber-600" },
  declined: { label: "Declined", icon: XCircle, color: "text-red-600" },
};

export function ProviderDetailPanel({
  provider,
  open,
  onOpenChange,
}: ProviderDetailPanelProps) {
  if (!provider) return null;

  const quality = qualityConfig[provider.qualityTier];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[560px] sm:max-w-[560px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2">
                {provider.name}
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    quality.bgColor,
                    quality.textColor,
                    quality.borderColor
                  )}
                >
                  {quality.label}
                </Badge>
              </SheetTitle>
              <SheetDescription className="flex items-center gap-1 mt-1">
                <Building2 className="h-3 w-3" />
                {provider.clinicName}
              </SheetDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{provider.qualityScore}</div>
              <div className="text-xs text-muted-foreground">Quality Score</div>
            </div>
          </div>
        </SheetHeader>

        {/* Contact Info */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{provider.phone}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">Fax: {provider.fax}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a href={`mailto:${provider.email}`} className="text-blue-600 hover:underline">
              {provider.email}
            </a>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="p-3 border rounded-lg">
            <div className="text-2xl font-bold">{provider.referralsThisMonth}</div>
            <div className="text-xs text-muted-foreground">Referrals this month</div>
            {provider.referralTrend !== 0 && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs mt-1",
                  provider.referralTrend > 0 ? "text-emerald-600" : "text-red-600"
                )}
              >
                {provider.referralTrend > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(provider.referralTrend)}% vs last month
              </div>
            )}
          </div>
          <div className="p-3 border rounded-lg">
            <div className="text-2xl font-bold">{provider.missingInfoRate}%</div>
            <div className="text-xs text-muted-foreground">Missing info rate</div>
            {provider.missingInfoRateTrend !== 0 && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs mt-1",
                  provider.missingInfoRateTrend < 0 ? "text-emerald-600" : "text-red-600"
                )}
              >
                {provider.missingInfoRateTrend < 0 ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <TrendingUp className="h-3 w-3" />
                )}
                {Math.abs(provider.missingInfoRateTrend)}%
              </div>
            )}
          </div>
          <div className="p-3 border rounded-lg">
            <div className="text-2xl font-bold">{provider.avgCompletionDays}d</div>
            <div className="text-xs text-muted-foreground">Avg completion</div>
            {provider.avgCompletionDaysTrend !== 0 && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs mt-1",
                  provider.avgCompletionDaysTrend < 0 ? "text-emerald-600" : "text-red-600"
                )}
              >
                {provider.avgCompletionDaysTrend < 0 ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <TrendingUp className="h-3 w-3" />
                )}
                {Math.abs(provider.avgCompletionDaysTrend)}d
              </div>
            )}
          </div>
        </div>

        {/* Referral History */}
        <div className="mt-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Referral History
          </h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Patient</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-right p-3 font-medium">Complete</th>
                  <th className="text-right p-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {provider.referralHistory.map((ref) => {
                  const status = statusConfig[ref.status] || statusConfig["pending-response"];
                  const StatusIcon = status.icon;
                  return (
                    <tr key={ref.id} className="border-t">
                      <td className="p-3 text-muted-foreground">
                        {format(new Date(ref.date), "MMM d")}
                      </td>
                      <td className="p-3">
                        <a
                          href={`/referrals/${ref.referralId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {ref.patientName}
                        </a>
                      </td>
                      <td className="p-3">
                        <span className={cn("flex items-center gap-1", status.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span
                          className={cn(
                            ref.completenessScore === 100
                              ? "text-emerald-600"
                              : ref.completenessScore >= 80
                              ? "text-blue-600"
                              : "text-amber-600"
                          )}
                        >
                          {ref.completenessScore}%
                        </span>
                      </td>
                      <td className="p-3 text-right text-muted-foreground">
                        {ref.daysToComplete ? `${ref.daysToComplete}d` : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Common Missing Items */}
        {provider.commonMissingItems.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Common Missing Items
            </h3>
            <div className="space-y-2">
              {provider.commonMissingItems.map((item) => (
                <div key={item.item} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{item.item}</span>
                      <span className="text-muted-foreground">{item.percentage}%</span>
                    </div>
                    <Progress value={item.percentage} className="h-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Communication Stats */}
        <div className="mt-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Communication Stats
          </h3>
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Missing item requests sent</span>
              <span className="font-medium">{provider.communicationStats.totalRequestsSent}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Avg response time</span>
              <span className="font-medium">{provider.communicationStats.avgResponseTimeDays} days</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Response rate</span>
              <span
                className={cn(
                  "font-medium",
                  provider.communicationStats.responseRate >= 90
                    ? "text-emerald-600"
                    : provider.communicationStats.responseRate >= 70
                    ? "text-blue-600"
                    : "text-amber-600"
                )}
              >
                {provider.communicationStats.responseRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center gap-2">
          <Button variant="outline" className="flex-1" asChild>
            <a
              href={provider.salesforceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Salesforce
              <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </div>

        {/* Last synced */}
        <div className="mt-4 text-center text-xs text-muted-foreground">
          Last synced: {format(new Date(provider.lastSyncedAt), "MMM d, h:mm a")}
        </div>
      </SheetContent>
    </Sheet>
  );
}
