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
import { ZendeskTicketCard } from "@/components/integrations/zendesk-ticket-card";
import {
  mockZendeskTickets,
  mockZendeskSettings,
  getZendeskStats,
} from "@/data/mock-zendesk-tickets";
import { useIntegrationStore } from "@/stores/use-integration-store";
import {
  Ticket,
  Search,
  Settings,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  MessageSquare,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "auto-created" | "manual" | "resolved";

export default function ZendeskFeedPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(mockZendeskSettings);

  // Get dynamically added tickets from store
  const { addedZendeskTickets } = useIntegrationStore();

  const stats = getZendeskStats();
  // Adjust stats for new tickets
  const adjustedStats = useMemo(() => {
    const newUrgent = addedZendeskTickets.filter(t => t.priority === "urgent" && t.status === "open").length;
    const newOpen = addedZendeskTickets.filter(t => t.status === "open").length;
    const newAutoCreated = addedZendeskTickets.filter(t => t.source === "auto-created").length;
    return {
      ...stats,
      urgent: stats.urgent + newUrgent,
      open: stats.open + newOpen,
      total: stats.total + addedZendeskTickets.length,
      autoCreated: stats.autoCreated + newAutoCreated,
      needsFirstResponse: stats.needsFirstResponse + addedZendeskTickets.filter(t => t.firstResponseNeeded).length,
    };
  }, [stats, addedZendeskTickets]);

  // Filter tickets based on active tab and search
  const filteredTickets = useMemo(() => {
    // Combine mock tickets with dynamically added tickets
    let tickets = [...addedZendeskTickets, ...mockZendeskTickets];

    // Filter by tab
    switch (activeTab) {
      case "auto-created":
        tickets = tickets.filter((t) => t.source === "auto-created");
        break;
      case "manual":
        tickets = tickets.filter((t) => t.source === "manual");
        break;
      case "resolved":
        tickets = tickets.filter(
          (t) => t.status === "resolved" || t.status === "closed"
        );
        break;
      // "all" shows everything
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      tickets = tickets.filter(
        (t) =>
          t.subject.toLowerCase().includes(query) ||
          t.ticketNumber.toLowerCase().includes(query) ||
          t.linkedEntityLabel?.toLowerCase().includes(query)
      );
    }

    // Sort: urgent first, then high, then by date
    tickets.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      const statusOrder = { open: 0, pending: 1, resolved: 2, closed: 3 };

      // First by status (open/pending before resolved)
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }

      // Then by priority
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      // Then by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return tickets;
  }, [activeTab, searchQuery]);

  const toggleRule = (ruleId: string) => {
    setSettings((prev) => ({
      ...prev,
      rules: prev.rules.map((r) =>
        r.rule === ruleId ? { ...r, enabled: !r.enabled } : r
      ),
    }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
            <Ticket className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Zendesk Feed</h1>
            <p className="text-sm text-muted-foreground">
              Tickets synced from Zendesk • Auto-created from Blair events
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Priority counts */}
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            {adjustedStats.urgent} urgent
          </Badge>
          <Badge
            variant="outline"
            className="bg-orange-50 text-orange-700 border-orange-200"
          >
            <Clock className="h-3 w-3 mr-1" />
            {adjustedStats.high} time-sensitive
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
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
            <Ticket className="h-4 w-4" />
            Open Tickets
          </div>
          <div className="text-3xl font-bold">{adjustedStats.open + adjustedStats.pending}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {adjustedStats.open} open, {adjustedStats.pending} pending
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <MessageSquare className="h-4 w-4" />
            Needs Response
          </div>
          <div className={cn(
            "text-3xl font-bold",
            adjustedStats.needsFirstResponse > 0 ? "text-amber-600" : "text-emerald-600"
          )}>
            {adjustedStats.needsFirstResponse}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Awaiting first reply
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <Clock className="h-4 w-4" />
            Avg Response
          </div>
          <div className="text-3xl font-bold">
            {adjustedStats.avgResponseTimeMinutes < 60
              ? `${adjustedStats.avgResponseTimeMinutes}m`
              : `${Math.round(adjustedStats.avgResponseTimeMinutes / 60)}h`}
          </div>
          <div className="flex items-center gap-1 text-sm text-emerald-600 mt-1">
            <TrendingDown className="h-3 w-3" />
            12% faster than last week
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <CheckCircle2 className="h-4 w-4" />
            Auto-Closed Today
          </div>
          <div className="text-3xl font-bold text-emerald-600">{adjustedStats.autoClosedToday}</div>
          <div className="text-sm text-muted-foreground mt-1">
            Resolved automatically
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
              All
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {adjustedStats.total}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="auto-created">
              Auto-Created
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {adjustedStats.autoCreated}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="manual">
              Manual
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {adjustedStats.manual}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {adjustedStats.resolved}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Ticket List */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No tickets found</p>
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
            filteredTickets.map((ticket) => (
              <ZendeskTicketCard key={ticket.id} ticket={ticket} />
            ))
          )}
        </div>
      </div>

      {/* Settings Sheet */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent className="w-[480px] sm:max-w-[480px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Zendesk Auto-Ticket Rules
            </SheetTitle>
            <SheetDescription>
              Configure which Blair events automatically create Zendesk tickets.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Master toggle */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <Label className="font-medium">Auto-Create Tickets</Label>
                <p className="text-sm text-muted-foreground">
                  Enable automatic ticket creation
                </p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, enabled: checked }))
                }
              />
            </div>

            {/* Rules */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">
                Auto-Creation Rules
              </Label>
              {settings.rules.map((rule) => (
                <div
                  key={rule.rule}
                  className={cn(
                    "flex items-center justify-between p-3 border rounded-lg",
                    !settings.enabled && "opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => toggleRule(rule.rule)}
                      disabled={!settings.enabled}
                    />
                    <div>
                      <p className="text-sm font-medium">{rule.label}</p>
                      <p className="text-xs text-muted-foreground">
                        Creates{" "}
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] ml-1",
                            rule.priority === "urgent" &&
                              "bg-red-50 text-red-700",
                            rule.priority === "high" &&
                              "bg-orange-50 text-orange-700",
                            rule.priority === "normal" &&
                              "bg-blue-50 text-blue-700",
                            rule.priority === "low" &&
                              "bg-gray-50 text-gray-600"
                          )}
                        >
                          {rule.priority}
                        </Badge>{" "}
                        ticket
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Auto-close toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="font-medium">Auto-Close on Resolve</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically close tickets when Blair action resolves the
                  issue
                </p>
              </div>
              <Switch
                checked={settings.autoCloseOnResolve}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    autoCloseOnResolve: checked,
                  }))
                }
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
