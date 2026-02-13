"use client";

import { SalesforceProvider } from "@/types/integration-feeds";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  ExternalLink,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Building2,
  Phone,
  Mail,
} from "lucide-react";

interface ProviderCardProps {
  provider: SalesforceProvider;
  totalReferrals: number;
  onViewDetails: (provider: SalesforceProvider) => void;
}

const qualityConfig = {
  excellent: {
    label: "Excellent",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    progressColor: "bg-emerald-500",
  },
  good: {
    label: "Good",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    progressColor: "bg-blue-500",
  },
  "needs-improvement": {
    label: "Needs Improvement",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    progressColor: "bg-amber-500",
  },
  poor: {
    label: "Poor",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    progressColor: "bg-red-500",
  },
};

export function ProviderCard({
  provider,
  totalReferrals,
  onViewDetails,
}: ProviderCardProps) {
  const quality = qualityConfig[provider.qualityTier];
  const referralPercentage = Math.round(
    (provider.referralsThisMonth / totalReferrals) * 100
  );

  return (
    <div
      className={cn(
        "border rounded-lg p-4 transition-all hover:shadow-md",
        provider.needsOutreach && "border-amber-300 bg-amber-50/30"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{provider.name}</h3>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px]",
                quality.bgColor,
                quality.textColor,
                quality.borderColor
              )}
            >
              {quality.label}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <Building2 className="h-3 w-3" />
            {provider.clinicName}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{provider.qualityScore}</div>
          <div className="text-xs text-muted-foreground">Quality Score</div>
        </div>
      </div>

      {/* Referral progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-muted-foreground">
            {provider.referralsThisMonth} referrals this month
          </span>
          <span className="font-medium">{referralPercentage}% of total</span>
        </div>
        <Progress value={referralPercentage} className="h-2" />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-sm mb-3">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Missing info:</span>
          <span
            className={cn(
              "font-medium",
              provider.missingInfoRate > 30
                ? "text-red-600"
                : provider.missingInfoRate > 15
                ? "text-amber-600"
                : "text-emerald-600"
            )}
          >
            {provider.missingInfoRate}%
          </span>
          {provider.missingInfoRateTrend !== 0 && (
            <span
              className={cn(
                "flex items-center text-xs",
                provider.missingInfoRateTrend < 0
                  ? "text-emerald-600"
                  : "text-red-600"
              )}
            >
              {provider.missingInfoRateTrend < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <TrendingUp className="h-3 w-3" />
              )}
              {Math.abs(provider.missingInfoRateTrend)}%
            </span>
          )}
        </div>
        <span className="text-muted-foreground">|</span>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Avg completion:</span>
          <span className="font-medium">{provider.avgCompletionDays} days</span>
          {provider.avgCompletionDaysTrend !== 0 && (
            <span
              className={cn(
                "flex items-center text-xs",
                provider.avgCompletionDaysTrend < 0
                  ? "text-emerald-600"
                  : "text-red-600"
              )}
            >
              {provider.avgCompletionDaysTrend < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <TrendingUp className="h-3 w-3" />
              )}
              {Math.abs(provider.avgCompletionDaysTrend)}d
            </span>
          )}
        </div>
      </div>

      {/* Outreach warning */}
      {provider.needsOutreach && (
        <div className="flex items-center gap-2 p-2 bg-amber-100 rounded-md mb-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4" />
          <span>High missing info rate - consider provider outreach</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => onViewDetails(provider)}
        >
          View Details
        </Button>
        <Button variant="outline" size="sm" className="h-8" asChild>
          <a
            href={provider.salesforceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View in Salesforce
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </Button>
      </div>
    </div>
  );
}
