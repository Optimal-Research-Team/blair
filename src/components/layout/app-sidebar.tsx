"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useRoutingStore } from "@/stores/use-routing-store";
import { useIntegrationStore } from "@/stores/use-integration-store";
import {
  Inbox,
  ListTodo,
  FileHeart,
  Send,
  BarChart3,
  Settings,
  FileType,
  Clock,
  Plug,
  Zap,
  Phone,
  ChevronDown,
  Activity,
  FileQuestion,
  FileText,
  MessageSquare,
  Building2,
  Ticket,
  Hash,
  ExternalLink,
  Database,
  CheckCircle2,
  Users,
  UserRound,
} from "lucide-react";
import { getZendeskStats } from "@/data/mock-zendesk-tickets";
import { getSlackStats } from "@/data/mock-slack-feed";
import { getProvidersNeedingOutreach } from "@/data/mock-salesforce-providers";
import { getCerebrumExportStats } from "@/data/mock-cerebrum-exports";
import { getPatientFeedStats } from "@/data/mock-cerebrum-patients";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { currentUser } from "@/data/mock-staff";

const iconMap = {
  Inbox,
  ListTodo,
  FileHeart,
  Send,
  BarChart3,
  Settings,
  FileType,
  Clock,
  Plug,
  Zap,
  Phone,
} as const;

const navGroups = [
  {
    title: "Analytics",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: "BarChart3" as const },
    ],
  },
  {
    title: "Main",
    items: [
      { title: "Fax Inbox", href: "/inbox", icon: "Inbox" as const, badgeCount: 23, badgeColor: "bg-blue-500" },
    ],
  },
];

const worklistItems = [
  { title: "All", href: "/worklist", icon: ListTodo, badgeCount: 17, badgeColor: "bg-primary" },
  { title: "Unclassified", href: "/worklist?view=unclassified", icon: FileQuestion, badgeCount: 7, badgeColor: "bg-amber-500" },
  { title: "Referrals", href: "/worklist?view=referral", icon: FileText, badgeCount: 10, badgeColor: "bg-blue-500" },
];

const referralItems = [
  { title: "Referral Comms", href: "/referrals/communications", icon: MessageSquare, badgeCount: 4, badgeColor: "bg-amber-500" },
  { title: "All Referrals", href: "/referrals", icon: FileHeart },
  { title: "Completed Referrals", href: "/referrals/completed", icon: CheckCircle2 },
];

const settingsItems = [
  { title: "Auto-Filing Rules", href: "/settings/document-types", icon: "Zap" as const },
  { title: "SLA Rules", href: "/settings/sla", icon: "Clock" as const },
  { title: "Integrations", href: "/settings/integrations", icon: "Plug" as const },
  { title: "Fax Lines", href: "/settings/fax-lines", icon: "Phone" as const },
];

// Dynamic integration feed items with computed badge counts
function getIntegrationFeedItems() {
  const zendeskStats = getZendeskStats();
  const slackStats = getSlackStats();
  const salesforceOutreach = getProvidersNeedingOutreach();
  const cerebrumStats = getCerebrumExportStats();
  const patientStats = getPatientFeedStats();

  return [
    {
      title: "Cerebrum",
      href: "/integrations/cerebrum",
      icon: Database,
      badgeCount: cerebrumStats.pendingExport > 0 ? cerebrumStats.pendingExport : cerebrumStats.exportedToday,
      badgeColor: cerebrumStats.pendingExport > 0 ? "bg-amber-500" : "bg-purple-500"
    },
    {
      title: "Zendesk",
      href: "/integrations/zendesk",
      icon: Ticket,
      badgeCount: zendeskStats.open + zendeskStats.pending, // Open + pending tickets
      badgeColor: zendeskStats.urgent > 0 ? "bg-red-500" : "bg-amber-500"
    },
    {
      title: "Slack",
      href: "/integrations/slack",
      icon: Hash,
      badgeCount: slackStats.unhandled, // Unhandled alerts
      badgeColor: "bg-purple-500"
    },
    {
      title: "Patients",
      href: "/integrations/patients",
      icon: UserRound,
      badgeCount: patientStats.patientsWithUpdates > 0 ? patientStats.patientsWithUpdates : undefined,
      badgeColor: "bg-amber-500"
    },
    {
      title: "Providers",
      href: "/integrations/salesforce",
      icon: Users,
      badgeCount: salesforceOutreach.length > 0 ? salesforceOutreach.length : undefined, // Providers needing outreach
      badgeColor: "bg-amber-500"
    },
  ];
}

export function AppSidebar() {
  return (
    <Suspense fallback={<SidebarSkeleton />}>
      <AppSidebarContent />
    </Suspense>
  );
}

function SidebarSkeleton() {
  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Activity className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-accent-foreground">Blair</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-2" />
    </Sidebar>
  );
}

function AppSidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view");
  const { highlightedNavItem } = useRoutingStore();

  // Get dynamically added integration items from store
  const { getNewZendeskCount, getNewSlackCount } = useIntegrationStore();

  // Get dynamic integration feed items with computed badge counts (including new items)
  const integrationFeedItems = useMemo(() => {
    const baseItems = getIntegrationFeedItems();
    const newZendeskCount = getNewZendeskCount();
    const newSlackCount = getNewSlackCount();

    // Add new counts to the existing counts
    return baseItems.map(item => {
      if (item.title === "Zendesk") {
        return {
          ...item,
          badgeCount: (item.badgeCount || 0) + newZendeskCount,
          badgeColor: newZendeskCount > 0 || (item.badgeCount && item.badgeCount > 0) ? "bg-red-500" : item.badgeColor,
        };
      }
      if (item.title === "Slack") {
        return {
          ...item,
          badgeCount: (item.badgeCount || 0) + newSlackCount,
        };
      }
      return item;
    });
  }, [getNewZendeskCount, getNewSlackCount]);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href="/inbox" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Activity className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-accent-foreground">
              Blair
            </span>
            <span className="text-[10px] text-sidebar-foreground/60">
              v1.0.0-beta
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        {navGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
              {group.title}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const Icon = iconMap[item.icon];
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span className="flex-1">{item.title}</span>
                        {"badgeCount" in item && item.badgeCount && (
                          <Badge
                            variant="secondary"
                            className={`${item.badgeColor} text-white text-[10px] px-1.5 py-0 min-w-[20px] justify-center h-5`}
                          >
                            {item.badgeCount}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Worklist with expandable subitems - only in Main group */}
              {group.title === "Main" && (
                <>
                  <Collapsible defaultOpen={true} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          isActive={pathname.startsWith("/worklist")}
                          tooltip="Needs Review"
                        >
                          <ListTodo className="h-4 w-4" />
                          <span className="flex-1">Needs Review</span>
                          <Badge
                            variant="secondary"
                            className="bg-amber-500 text-white text-[10px] px-1.5 py-0 min-w-[20px] justify-center h-5 mr-1"
                          >
                            17
                          </Badge>
                          <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {worklistItems.map((item) => {
                            // Check if this nav item matches the current URL
                            const isActive = pathname === "/worklist" && (
                              (item.title === "All" && !currentView) ||
                              (item.title === "Unclassified" && currentView === "unclassified") ||
                              (item.title === "Referrals" && currentView === "referral")
                            );
                            const isHighlighted = highlightedNavItem === item.href;
                            const Icon = item.icon;
                            return (
                              <SidebarMenuSubItem key={item.href}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isActive}
                                  className={isHighlighted ? "animate-pulse bg-emerald-100 ring-2 ring-emerald-400 ring-offset-1" : ""}
                                >
                                  <Link href={item.href} className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                      <Icon className={`h-3 w-3 ${isHighlighted ? "text-emerald-600" : ""}`} />
                                      {item.title}
                                    </span>
                                    <Badge
                                      variant="secondary"
                                      className={`${isHighlighted ? "bg-emerald-500" : item.badgeColor} text-white text-[9px] px-1 py-0 min-w-[16px] justify-center h-4`}
                                    >
                                      {item.badgeCount}
                                    </Badge>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>

                  {/* Referrals with Communications sub-nav */}
                  <Collapsible defaultOpen={true} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          isActive={pathname.startsWith("/referrals")}
                          tooltip="Referrals"
                        >
                          <FileHeart className="h-4 w-4" />
                          <span className="flex-1">Referrals (Summary)</span>
                          <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {referralItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                              <SidebarMenuSubItem key={item.href}>
                                <SidebarMenuSubButton asChild isActive={isActive}>
                                  <Link href={item.href} className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                      <Icon className="h-3 w-3" />
                                      {item.title}
                                    </span>
                                    {"badgeCount" in item && item.badgeCount && (
                                      <Badge
                                        variant="secondary"
                                        className={`${item.badgeColor} text-white text-[9px] px-1 py-0 min-w-[16px] justify-center h-4`}
                                      >
                                        {item.badgeCount}
                                      </Badge>
                                    )}
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                </>
              )}
            </SidebarMenu>
          </SidebarGroup>
        ))}

        {/* Integration Feeds Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
            Integration Feeds
          </SidebarGroupLabel>
          <SidebarMenu>
            <Collapsible defaultOpen={true} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    isActive={pathname.startsWith("/integrations")}
                    tooltip="Integrations"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="flex-1">Feeds</span>
                    {(() => {
                      const totalBadge = integrationFeedItems.reduce(
                        (sum, item) => sum + (item.badgeCount || 0),
                        0
                      );
                      return totalBadge > 0 ? (
                        <Badge
                          variant="secondary"
                          className="bg-purple-500 text-white text-[10px] px-1.5 py-0 min-w-[20px] justify-center h-5 mr-1"
                        >
                          {totalBadge}
                        </Badge>
                      ) : null;
                    })()}
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {integrationFeedItems.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                      const Icon = item.icon;
                      return (
                        <SidebarMenuSubItem key={item.href}>
                          <SidebarMenuSubButton asChild isActive={isActive}>
                            <Link href={item.href} className="flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <Icon className="h-3 w-3" />
                                {item.title}
                              </span>
                              {"badgeCount" in item && item.badgeCount && (
                                <Badge
                                  variant="secondary"
                                  className={`${item.badgeColor} text-white text-[9px] px-1 py-0 min-w-[16px] justify-center h-4`}
                                >
                                  {item.badgeCount}
                                </Badge>
                              )}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
            Configuration
          </SidebarGroupLabel>
          <SidebarMenu>
            <Collapsible defaultOpen={true} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    isActive={pathname.startsWith("/settings")}
                    tooltip="Settings"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="flex-1">Settings</span>
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {settingsItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <SidebarMenuSubItem key={item.href}>
                          <SidebarMenuSubButton asChild isActive={isActive}>
                            <Link href={item.href}>{item.title}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
              {currentUser.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-medium text-sidebar-accent-foreground">
              {currentUser.name}
            </span>
            <span className="text-[10px] capitalize text-sidebar-foreground/60">
              {currentUser.role}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
