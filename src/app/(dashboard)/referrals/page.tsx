"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mockReferrals } from "@/data/mock-referrals";
import { PriorityBadge } from "@/components/inbox/priority-badge";
import { formatRelativeTime } from "@/lib/format";
import {
  FileHeart,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Calendar,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ReferralStatus } from "@/types";

const STATUS_CONFIG: Record<ReferralStatus, { label: string; icon: React.ElementType; color: string }> = {
  received: { label: "Received", icon: Clock, color: "bg-blue-100 text-blue-700" },
  incomplete: { label: "Incomplete", icon: AlertTriangle, color: "bg-amber-100 text-amber-700" },
  complete: { label: "Complete", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700" },
  accepted: { label: "Accepted", icon: CheckCircle2, color: "bg-green-100 text-green-700" },
  declined: { label: "Declined", icon: XCircle, color: "bg-red-100 text-red-700" },
  booked: { label: "Booked", icon: Calendar, color: "bg-purple-100 text-purple-700" },
};

export default function ReferralsPage() {
  const stats = {
    total: mockReferrals.length,
    incomplete: mockReferrals.filter((r) => r.status === "incomplete").length,
    complete: mockReferrals.filter((r) => r.status === "complete").length,
    accepted: mockReferrals.filter((r) => r.status === "accepted").length,
    booked: mockReferrals.filter((r) => r.status === "booked").length,
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Referrals"
        description="Manage incoming referral pipeline"
        action={
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold">{stats.total}</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-semibold">{stats.incomplete} incomplete</span>
            </div>
          </div>
        }
      />

      <div className="space-y-3">
        {mockReferrals.map((referral) => {
          const statusConfig = STATUS_CONFIG[referral.status];
          const StatusIcon = statusConfig.icon;

          return (
            <Card key={referral.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
                    <FileHeart className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold">{referral.patientName}</h3>
                      <PriorityBadge priority={referral.priority} />
                      <Badge className={cn("text-[10px]", statusConfig.color)} variant="secondary">
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      From {referral.referringPhysicianName} &middot;{" "}
                      {formatRelativeTime(referral.receivedDate)}
                    </p>

                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {referral.reasonForReferral}
                    </p>

                    <div className="flex items-center gap-3">
                      <Progress value={referral.completenessScore} className="h-2 flex-1 max-w-[200px]" />
                      <span
                        className={cn(
                          "text-xs font-medium tabular-nums",
                          referral.completenessScore === 100
                            ? "text-emerald-600"
                            : referral.completenessScore >= 60
                            ? "text-amber-600"
                            : "text-red-600"
                        )}
                      >
                        {referral.completenessScore}% complete
                      </span>
                    </div>

                    <div className="flex gap-1.5 flex-wrap">
                      {referral.completenessItems.map((item) => (
                        <span
                          key={item.id}
                          className={cn(
                            "inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded",
                            item.present ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                          )}
                        >
                          {item.present ? "✓" : "✗"} {item.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/referrals/${referral.id}`}>
                        Review
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
