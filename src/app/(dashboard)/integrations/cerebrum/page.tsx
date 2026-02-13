"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  mockCerebrumExports,
  mockCerebrumInboxes,
  getCerebrumExportStats,
  filterCerebrumExports,
} from "@/data/mock-cerebrum-exports";
import {
  CEREBRUM_CATEGORIES,
  getCerebrumCategoryInfo,
  CerebrumDocumentCategory,
  CerebrumExportRecord,
} from "@/types/cerebrum";
import {
  Search,
  RefreshCw,
  Database,
  FolderOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Bot,
  User,
  ExternalLink,
  FileText,
  ArrowUpRight,
  Inbox,
  Filter,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";
import Link from "next/link";

type FilterTab = "all" | "auto" | "manual" | "pending" | "failed";

export default function CerebrumFeedPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [inboxFilter, setInboxFilter] = useState<string>("all");

  const stats = getCerebrumExportStats();

  // Filter exports
  const filteredExports = useMemo(() => {
    let filtered = [...mockCerebrumExports];

    // Filter by tab
    switch (activeTab) {
      case "auto":
        filtered = filtered.filter((e) => e.routingMethod === "auto");
        break;
      case "manual":
        filtered = filtered.filter((e) => e.routingMethod === "manual");
        break;
      case "pending":
        filtered = filtered.filter((e) => e.status === "pending");
        break;
      case "failed":
        filtered = filtered.filter((e) => e.status === "failed");
        break;
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (e) => e.cerebrumCategory === categoryFilter
      );
    }

    // Filter by inbox
    if (inboxFilter !== "all") {
      filtered = filtered.filter((e) => e.destinationInboxId === inboxFilter);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.patientName.toLowerCase().includes(query) ||
          e.documentType.toLowerCase().includes(query) ||
          e.originProvider.toLowerCase().includes(query) ||
          e.destinationInbox.toLowerCase().includes(query) ||
          e.sourceFaxId.toLowerCase().includes(query) ||
          (e.patientOhip && e.patientOhip.toLowerCase().includes(query))
      );
    }

    // Sort by routedAt descending
    filtered.sort(
      (a, b) => new Date(b.routedAt).getTime() - new Date(a.routedAt).getTime()
    );

    return filtered;
  }, [activeTab, categoryFilter, inboxFilter, searchQuery]);

  // Group by date
  const groupedExports = useMemo(() => {
    const groups: { label: string; exports: CerebrumExportRecord[] }[] = [];
    const today: CerebrumExportRecord[] = [];
    const yesterday: CerebrumExportRecord[] = [];
    const older: CerebrumExportRecord[] = [];

    filteredExports.forEach((exp) => {
      const date = new Date(exp.routedAt);
      if (isToday(date)) {
        today.push(exp);
      } else if (isYesterday(date)) {
        yesterday.push(exp);
      } else {
        older.push(exp);
      }
    });

    if (today.length > 0) groups.push({ label: "Today", exports: today });
    if (yesterday.length > 0) groups.push({ label: "Yesterday", exports: yesterday });
    if (older.length > 0) groups.push({ label: "Earlier", exports: older });

    return groups;
  }, [filteredExports]);

  // Format time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return format(date, "h:mm a");
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, "h:mm a")}`;
    }
    return format(date, "MMM d, h:mm a");
  };

  // Get status badge
  const getStatusBadge = (status: CerebrumExportRecord["status"]) => {
    switch (status) {
      case "exported":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">
            <CheckCircle2 className="h-3 w-3 mr-0.5" />
            Exported
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">
            <Clock className="h-3 w-3 mr-0.5" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">
            <AlertTriangle className="h-3 w-3 mr-0.5" />
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  // Get routing method badge
  const getRoutingBadge = (exp: CerebrumExportRecord) => {
    if (exp.routingMethod === "auto") {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]"
              >
                <Bot className="h-3 w-3 mr-0.5" />
                Auto
                {exp.routingConfidence && (
                  <span className="ml-1 font-semibold">
                    {exp.routingConfidence.toFixed(0)}%
                  </span>
                )}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Auto-routed by AI with {exp.routingConfidence?.toFixed(1)}% confidence</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge
              variant="outline"
              className="bg-gray-50 text-gray-700 border-gray-200 text-[10px]"
            >
              <User className="h-3 w-3 mr-0.5" />
              Manual
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Manually routed by {exp.routedByName}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
            <Database className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Cerebrum EMR Feed</h1>
            <p className="text-sm text-muted-foreground">
              Document exports to Cerebrum EMR by folder
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Stats badges */}
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {stats.exportedToday} today
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Bot className="h-3 w-3 mr-1" />
            {stats.avgRoutingConfidence}% avg confidence
          </Badge>
          {stats.pendingExport > 0 && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              <Clock className="h-3 w-3 mr-1" />
              {stats.pendingExport} pending
            </Badge>
          )}

          <Button variant="outline" size="icon" className="h-9 w-9">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <FileText className="h-4 w-4" />
            Total Documents
          </div>
          <p className="text-2xl font-semibold">{stats.totalDocuments}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Bot className="h-4 w-4" />
            Auto-Routed
          </div>
          <p className="text-2xl font-semibold">
            {stats.autoRouted}
            <span className="text-sm font-normal text-muted-foreground ml-1">
              ({Math.round((stats.autoRouted / stats.totalDocuments) * 100)}%)
            </span>
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <User className="h-4 w-4" />
            Manually Routed
          </div>
          <p className="text-2xl font-semibold">{stats.manuallyRouted}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <TrendingUp className="h-4 w-4" />
            Avg Confidence
          </div>
          <p className="text-2xl font-semibold">{stats.avgRoutingConfidence}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
          <TabsList>
            <TabsTrigger value="all">
              All
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {mockCerebrumExports.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="auto">
              <Bot className="h-3 w-3 mr-1" />
              Auto
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {stats.autoRouted}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="manual">
              <User className="h-3 w-3 mr-1" />
              Manual
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {stats.manuallyRouted}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending">
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="failed">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Failed
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          {/* Category filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 h-9 text-xs">
              <FolderOpen className="h-3.5 w-3.5 mr-1" />
              <SelectValue placeholder="All Folders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Folders</SelectItem>
              {CEREBRUM_CATEGORIES.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Inbox filter */}
          <Select value={inboxFilter} onValueChange={setInboxFilter}>
            <SelectTrigger className="w-44 h-9 text-xs">
              <Inbox className="h-3.5 w-3.5 mr-1" />
              <SelectValue placeholder="All Inboxes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Inboxes</SelectItem>
              {mockCerebrumInboxes.map((inbox) => (
                <SelectItem key={inbox.id} value={inbox.id}>
                  {inbox.providerName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="flex-1 overflow-auto border rounded-lg bg-white">
        {filteredExports.length === 0 ? (
          <div className="text-center py-12">
            <Database className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No documents found</p>
            {searchQuery && (
              <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[100px]">Fax ID</TableHead>
                <TableHead className="w-[180px]">Patient</TableHead>
                <TableHead>Document Type</TableHead>
                <TableHead className="w-[120px]">Folder</TableHead>
                <TableHead className="w-[160px]">Provider Inbox</TableHead>
                <TableHead className="w-[160px]">Origin Provider</TableHead>
                <TableHead className="w-[130px]">Routed</TableHead>
                <TableHead className="w-[110px]">Routing</TableHead>
                <TableHead className="w-[90px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedExports.map((group) => (
                <>
                  {/* Date group header */}
                  <TableRow key={`header-${group.label}`} className="bg-muted/50 hover:bg-muted/50">
                    <TableCell colSpan={9} className="py-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {group.label}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({group.exports.length} documents)
                      </span>
                    </TableCell>
                  </TableRow>

                  {/* Document rows */}
                  {group.exports.map((exp) => {
                    const catInfo = getCerebrumCategoryInfo(exp.cerebrumCategory);
                    return (
                      <TableRow key={exp.id} className="hover:bg-muted/30">
                        {/* Fax ID - clickable link */}
                        <TableCell>
                          <Link
                            href={`/fax/${exp.sourceFaxId}`}
                            className="text-xs font-mono text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                          >
                            {exp.sourceFaxId.substring(0, 12)}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                          {exp.sourcePages.length > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              p.{exp.sourcePages.join(",")}
                            </span>
                          )}
                        </TableCell>

                        {/* Patient */}
                        <TableCell>
                          <div className="text-xs font-medium truncate max-w-[170px]">
                            {exp.patientName}
                          </div>
                          {exp.patientOhip && (
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {exp.patientOhip}
                            </div>
                          )}
                        </TableCell>

                        {/* Document Type */}
                        <TableCell>
                          <div className="text-xs truncate max-w-[180px]">{exp.documentType}</div>
                          {exp.linkedReferralId && (
                            <Link
                              href={`/referrals/${exp.linkedReferralId}`}
                              className="text-[10px] text-amber-600 hover:underline flex items-center gap-0.5"
                            >
                              Linked to referral
                              <ArrowUpRight className="h-2.5 w-2.5" />
                            </Link>
                          )}
                        </TableCell>

                        {/* Cerebrum Folder */}
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-purple-50 text-purple-700 border-purple-200"
                          >
                            <FolderOpen className="h-3 w-3 mr-0.5" />
                            {catInfo?.label || exp.cerebrumCategory}
                          </Badge>
                        </TableCell>

                        {/* Destination Inbox */}
                        <TableCell>
                          <div className="text-xs truncate max-w-[150px]">{exp.destinationInbox}</div>
                        </TableCell>

                        {/* Origin Provider */}
                        <TableCell>
                          <div className="text-xs truncate max-w-[150px]">{exp.originProvider}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {exp.originFaxNumber.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}
                          </div>
                        </TableCell>

                        {/* Routed At */}
                        <TableCell>
                          <div className="text-xs">{formatTime(exp.routedAt)}</div>
                          {exp.routingMethod === "manual" && exp.routedByName && (
                            <div className="text-[10px] text-muted-foreground">
                              by {exp.routedByName}
                            </div>
                          )}
                        </TableCell>

                        {/* Routing Method */}
                        <TableCell>{getRoutingBadge(exp)}</TableCell>

                        {/* Status */}
                        <TableCell>
                          {getStatusBadge(exp.status)}
                          {exp.status === "failed" && exp.errorMessage && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertTriangle className="h-3 w-3 text-red-500 ml-1" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="text-xs">{exp.errorMessage}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
