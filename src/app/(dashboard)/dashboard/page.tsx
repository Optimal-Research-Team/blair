"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  mockDashboardMetrics,
  mockThroughputData,
  mockDocTypeBreakdown,
  mockStaffProductivity,
  mockReferralFunnel,
} from "@/data/mock-dashboard-stats";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Zap,
  CheckCircle2,
  FileText,
  Users,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const m = mockDashboardMetrics;

  const statCards = [
    { label: "Queue Depth", value: m.queueDepth.toString(), icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Auto-File Rate", value: `${m.autoFileRate}%`, icon: Zap, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "SLA Compliance", value: `${m.slaComplianceRate}%`, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { label: "Avg Processing", value: `${m.avgProcessingTimeMinutes}m`, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Processed Today", value: m.faxesProcessedToday.toString(), icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Referrals Today", value: m.referralsReceivedToday.toString(), icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  const todayThroughput = mockThroughputData.filter((d) => d.date === "Today");
  const maxThroughput = Math.max(...todayThroughput.map((d) => d.faxesProcessed));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard"
        description="Operational analytics and performance metrics"
        action={
          <div className="flex items-center gap-1.5 text-sm text-emerald-600">
            <Activity className="h-4 w-4" />
            <span className="font-medium">Live</span>
          </div>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", stat.bg)}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Throughput chart (bar chart via divs) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Fax Throughput (Today)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1.5 h-48">
              {todayThroughput.map((point) => (
                <div key={point.time} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-muted-foreground tabular-nums">
                    {point.faxesProcessed}
                  </span>
                  <div
                    className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                    style={{
                      height: `${(point.faxesProcessed / maxThroughput) * 140}px`,
                    }}
                  />
                  <span className="text-[8px] text-muted-foreground -rotate-45 origin-center">
                    {point.time.replace(":00", "").replace(" ", "")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Document type breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Document Type Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockDocTypeBreakdown.map((item) => (
              <div key={item.type} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.type}</span>
                  <span className="font-medium tabular-nums">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Referral funnel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Referral Pipeline Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockReferralFunnel.map((stage, index) => {
                const prevPercentage = index > 0 ? mockReferralFunnel[index - 1].percentage : 100;
                const conversionRate = index > 0
                  ? ((stage.count / mockReferralFunnel[index - 1].count) * 100).toFixed(1)
                  : "100";

                return (
                  <div key={stage.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-sm"
                          style={{ backgroundColor: stage.color }}
                        />
                        <span className="font-medium">{stage.stage}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground tabular-nums">{stage.count}</span>
                        {index > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            ({conversionRate}% conv.)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-8 bg-muted/30 rounded overflow-hidden">
                      <div
                        className="h-full rounded transition-all flex items-center px-2"
                        style={{
                          width: `${stage.percentage}%`,
                          backgroundColor: stage.color + "33",
                          borderLeft: `3px solid ${stage.color}`,
                        }}
                      >
                        <span className="text-xs font-medium" style={{ color: stage.color }}>
                          {stage.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Staff productivity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Staff Productivity (This Week)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="grid grid-cols-5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-2 border-b">
                <span className="col-span-2">Staff</span>
                <span className="text-right">Processed</span>
                <span className="text-right">Avg Time</span>
                <span className="text-right">SLA %</span>
              </div>
              {mockStaffProductivity.map((staff) => (
                <div key={staff.staffId} className="grid grid-cols-5 text-sm py-2 border-b border-dashed last:border-0">
                  <div className="col-span-2">
                    <p className="font-medium text-xs">{staff.staffName}</p>
                    <p className="text-[10px] text-muted-foreground">{staff.role}</p>
                  </div>
                  <span className="text-right tabular-nums font-medium">{staff.faxesProcessed}</span>
                  <span className="text-right tabular-nums text-muted-foreground">{staff.avgTimePerFaxMinutes}m</span>
                  <span className={cn(
                    "text-right tabular-nums font-medium",
                    staff.slaComplianceRate >= 97 ? "text-emerald-600" : "text-amber-600"
                  )}>
                    {staff.slaComplianceRate}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
