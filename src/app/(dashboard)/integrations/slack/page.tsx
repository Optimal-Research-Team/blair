"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SlackActivityCard } from "@/components/integrations/slack-activity-card";
import {
  mockSlackActivities,
  mockSlackChannelConfig,
  getSlackStats,
  getSlackActivitiesByDate,
} from "@/data/mock-slack-feed";
import { SlackActivity } from "@/types/integration-feeds";
import { useIntegrationStore } from "@/stores/use-integration-store";
import {
  Hash,
  Search,
  Settings,
  RefreshCw,
  Bell,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, startOfWeek, isThisWeek } from "date-fns";

type FilterTab = "all" | "alerts" | "digests";

export default function SlackFeedPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [channelConfig, setChannelConfig] = useState(mockSlackChannelConfig);

  // Get dynamically added activities from store
  const { addedSlackActivities } = useIntegrationStore();

  // Combine mock activities with dynamically added ones
  const activities = useMemo(() => {
    return [...addedSlackActivities, ...mockSlackActivities];
  }, [addedSlackActivities]);

  const stats = getSlackStats();
  // Adjust stats for new activities
  const adjustedStats = useMemo(() => {
    const alertTypes = ["urgent-alert", "sla-warning", "sla-breach"] as const;
    const newAlerts = addedSlackActivities.filter(a => alertTypes.includes(a.type as typeof alertTypes[number])).length;
    const newUnhandled = addedSlackActivities.filter(a => a.hasQuickActions && !a.handled).length;
    const newTodayCount = addedSlackActivities.filter(a => isToday(new Date(a.postedAt))).length;
    const newAlertsToday = addedSlackActivities.filter(a =>
      alertTypes.includes(a.type as typeof alertTypes[number]) && isToday(new Date(a.postedAt))
    ).length;

    return {
      ...stats,
      alerts: stats.alerts + newAlerts,
      unhandled: stats.unhandled + newUnhandled,
      totalToday: stats.totalToday + newTodayCount,
      alertsToday: stats.alertsToday + newAlertsToday,
      total: stats.total + addedSlackActivities.length,
    };
  }, [stats, addedSlackActivities]);

  // Filter and group activities
  const filteredActivities = useMemo(() => {
    let filtered = [...activities];

    // Filter by tab
    switch (activeTab) {
      case "alerts":
        filtered = filtered.filter(
          (a) =>
            a.type === "urgent-alert" ||
            a.type === "sla-warning" ||
            a.type === "sla-breach"
        );
        break;
      case "digests":
        filtered = filtered.filter(
          (a) => a.type === "daily-digest" || a.type === "weekly-report"
        );
        break;
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.message.toLowerCase().includes(query) ||
          a.channel.toLowerCase().includes(query) ||
          a.linkedItems?.some((item) =>
            item.label.toLowerCase().includes(query)
          )
      );
    }

    // Sort by date (newest first)
    filtered.sort(
      (a, b) =>
        new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
    );

    return filtered;
  }, [activities, activeTab, searchQuery]);

  // Group by date
  const groupedActivities = useMemo(() => {
    const groups: { label: string; activities: SlackActivity[] }[] = [];
    const today: SlackActivity[] = [];
    const yesterday: SlackActivity[] = [];
    const thisWeek: SlackActivity[] = [];
    const older: SlackActivity[] = [];

    filteredActivities.forEach((activity) => {
      const date = new Date(activity.postedAt);
      if (isToday(date)) {
        today.push(activity);
      } else if (isYesterday(date)) {
        yesterday.push(activity);
      } else if (isThisWeek(date)) {
        thisWeek.push(activity);
      } else {
        older.push(activity);
      }
    });

    if (today.length > 0) groups.push({ label: "Today", activities: today });
    if (yesterday.length > 0)
      groups.push({ label: "Yesterday", activities: yesterday });
    if (thisWeek.length > 0)
      groups.push({ label: "This Week", activities: thisWeek });
    if (older.length > 0) groups.push({ label: "Older", activities: older });

    return groups;
  }, [filteredActivities]);

  // Note: This feed is read-only. Alerts are auto-handled when the linked
  // referral/fax is processed in Blair, or when closed via Zendesk.

  const toggleChannel = (channel: string) => {
    setChannelConfig((prev) =>
      prev.map((c) =>
        c.channel === channel ? { ...c, enabled: !c.enabled } : c
      )
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
            <Hash className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Slack Notifications</h1>
            <p className="text-sm text-muted-foreground">
              Outbound notifications posted by Blair to Slack
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {adjustedStats.unhandled > 0 && (
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 border-amber-200"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              {adjustedStats.unhandled} unhandled
            </Badge>
          )}
          {adjustedStats.failed > 0 && (
            <Badge
              variant="outline"
              className="bg-red-50 text-red-700 border-red-200"
            >
              {adjustedStats.failed} failed
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Configure
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <Send className="h-4 w-4" />
            Notifications Today
          </div>
          <div className="text-3xl font-bold">{adjustedStats.totalToday}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {adjustedStats.alertsToday} alerts, {adjustedStats.totalToday - adjustedStats.alertsToday} other
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <AlertTriangle className="h-4 w-4" />
            Unhandled Alerts
          </div>
          <div className={cn(
            "text-3xl font-bold",
            adjustedStats.unhandled > 0 ? "text-amber-600" : "text-emerald-600"
          )}>
            {adjustedStats.unhandled}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {adjustedStats.handled} handled by team
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <XCircle className="h-4 w-4" />
            Failed Sends
          </div>
          <div className={cn(
            "text-3xl font-bold",
            adjustedStats.failed > 0 ? "text-red-600" : "text-emerald-600"
          )}>
            {adjustedStats.failed}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {adjustedStats.failed === 0 ? "All notifications delivered" : "Requires attention"}
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <BarChart3 className="h-4 w-4" />
            Reports This Week
          </div>
          <div className="text-3xl font-bold">{adjustedStats.digestsThisWeek}</div>
          <div className="text-sm text-muted-foreground mt-1">
            Daily digests & weekly reports
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as FilterTab)}
        >
          <TabsList>
            <TabsTrigger value="all">
              All Activity
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {activities.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <Bell className="h-3 w-3 mr-1" />
              Alerts
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {adjustedStats.alerts}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="digests">
              <BarChart3 className="h-3 w-3 mr-1" />
              Digests
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {adjustedStats.digests}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Activity List (grouped by date) */}
      <div className="flex-1 overflow-auto">
        {groupedActivities.length === 0 ? (
          <div className="text-center py-12">
            <Hash className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No activity found</p>
            {searchQuery && (
              <Button
                variant="link"
                onClick={() => setSearchQuery("")}
                className="mt-2"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {groupedActivities.map((group) => (
              <div key={group.label}>
                {/* Date header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    {group.label}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Activities */}
                <div className="space-y-3">
                  {group.activities.map((activity) => (
                    <SlackActivityCard
                      key={activity.id}
                      activity={activity}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings Sheet */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent className="w-[480px] sm:max-w-[480px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Slack Channel Configuration
            </SheetTitle>
            <SheetDescription>
              Configure which Slack channels receive Blair notifications.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {channelConfig.map((config) => (
              <div
                key={config.channel}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono font-medium">
                      {config.channel}
                    </span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {config.events.map((event) => (
                      <Badge
                        key={event}
                        variant="outline"
                        className="text-[10px]"
                      >
                        {event.replace("-", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={() => toggleChannel(config.channel)}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Note: Outbound only. Blair posts notifications to these channels.
              Inbound Slack messages are not currently synced.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
