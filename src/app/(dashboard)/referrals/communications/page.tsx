"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockReferrals } from "@/data/mock-referrals";
import { mockPhysicians } from "@/data/mock-physicians";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle2,
  Phone,
  User,
  Filter,
  ArrowRight,
  Search,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Referral } from "@/types/referral";
import { CommunicationStatus } from "@/types";

// Group referrals by clinic
interface ClinicGroup {
  clinicName: string;
  clinicCity: string;
  physicians: string[];
  referrals: Referral[];
  awaitingCount: number;
  totalCommsCount: number;
  clinicPhone?: string;
}

// Get the clinic name for a referral (from physician data)
function getClinicInfo(referral: Referral): { clinicName: string; clinicCity: string; clinicPhone?: string } {
  // First try the referral's own clinic info
  if (referral.clinicName) {
    return { clinicName: referral.clinicName, clinicCity: referral.clinicCity || "" };
  }
  // Fall back to physician lookup
  const physician = mockPhysicians.find(p => p.id === referral.referringPhysicianId);
  if (physician) {
    return { clinicName: physician.clinicName, clinicCity: physician.clinicCity, clinicPhone: physician.phone };
  }
  return { clinicName: "Unknown Clinic", clinicCity: "" };
}

// Count communications by status
function countByStatus(referral: Referral, status: CommunicationStatus): number {
  return referral.communications.filter(c => c.status === status).length;
}

// Get the oldest awaiting communication age in days
function getOldestAwaitingDays(referral: Referral): number | null {
  const awaitingComms = referral.communications.filter(c => c.status === "awaiting");
  if (awaitingComms.length === 0) return null;

  const oldest = awaitingComms.reduce((min, c) => {
    const date = new Date(c.sentAt || c.createdAt);
    return date < min ? date : min;
  }, new Date());

  const days = Math.floor((Date.now() - oldest.getTime()) / (1000 * 60 * 60 * 24));
  return days;
}

// Get last message preview
function getLastMessagePreview(referral: Referral): string {
  if (referral.communications.length === 0) return "";

  const sorted = [...referral.communications].sort((a, b) =>
    new Date(b.sentAt || b.createdAt).getTime() - new Date(a.sentAt || a.createdAt).getTime()
  );

  const last = sorted[0];
  if (last.missingItems && last.missingItems.length > 0) {
    return `Requesting: ${last.missingItems.join(", ")}`;
  }
  return last.subject || "";
}

type FilterType = "all" | "awaiting" | "sent-today";

// Check if referral matches search query
function matchesSearch(referral: Referral, query: string): boolean {
  if (!query.trim()) return true;

  const searchLower = query.toLowerCase().trim();
  const physician = mockPhysicians.find(p => p.id === referral.referringPhysicianId);

  // Search across multiple fields
  const searchableFields = [
    referral.patientName,
    referral.referringPhysicianName,
    referral.clinicName,
    referral.clinicCity,
    referral.referringPhysicianFax,
    referral.referringPhysicianPhone,
    referral.referringPhysicianEmail,
    physician?.phone,
    physician?.fax,
    physician?.email,
    physician?.clinicName,
    physician?.clinicCity,
  ].filter(Boolean);

  return searchableFields.some(field =>
    field?.toLowerCase().includes(searchLower)
  );
}

export default function ReferralCommunicationsPage() {
  const [filter, setFilter] = useState<FilterType>("awaiting");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedClinics, setExpandedClinics] = useState<Set<string>>(new Set());

  // Group referrals by clinic
  const clinicGroups = useMemo(() => {
    const groups = new Map<string, ClinicGroup>();

    mockReferrals.forEach(referral => {
      // Skip referrals with no communications
      if (referral.communications.length === 0) return;

      // Apply search filter
      if (!matchesSearch(referral, searchQuery)) return;

      const { clinicName, clinicCity, clinicPhone } = getClinicInfo(referral);
      const key = clinicName;

      if (!groups.has(key)) {
        groups.set(key, {
          clinicName,
          clinicCity,
          physicians: [],
          referrals: [],
          awaitingCount: 0,
          totalCommsCount: 0,
          clinicPhone,
        });
      }

      const group = groups.get(key)!;

      // Add physician if not already present
      if (!group.physicians.includes(referral.referringPhysicianName)) {
        group.physicians.push(referral.referringPhysicianName);
      }

      // Check if this referral should be included based on filter
      const awaitingCount = countByStatus(referral, "awaiting");
      const hasAwaiting = awaitingCount > 0;

      // Filter logic
      if (filter === "awaiting" && !hasAwaiting) return;

      group.referrals.push(referral);
      group.awaitingCount += awaitingCount;
      group.totalCommsCount += referral.communications.length;
    });

    // Sort by awaiting count (most urgent first)
    return Array.from(groups.values())
      .filter(g => g.referrals.length > 0)
      .sort((a, b) => b.awaitingCount - a.awaitingCount);
  }, [filter, searchQuery]);

  // Auto-expand clinics with awaiting items
  useMemo(() => {
    const toExpand = new Set<string>();
    clinicGroups.forEach(group => {
      if (group.awaitingCount > 0) {
        toExpand.add(group.clinicName);
      }
    });
    if (toExpand.size > 0 && expandedClinics.size === 0) {
      setExpandedClinics(toExpand);
    }
  }, [clinicGroups, expandedClinics.size]);

  const toggleClinic = (clinicName: string) => {
    setExpandedClinics(prev => {
      const next = new Set(prev);
      if (next.has(clinicName)) {
        next.delete(clinicName);
      } else {
        next.add(clinicName);
      }
      return next;
    });
  };

  const totalAwaiting = clinicGroups.reduce((acc, g) => acc + g.awaitingCount, 0);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Referral Communications"
        description="Track outbound communications grouped by referring clinic"
        action={
          <div className="flex items-center gap-3">
            {totalAwaiting > 0 && (
              <div className="flex items-center gap-1.5 text-amber-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-semibold">{totalAwaiting} awaiting response</span>
              </div>
            )}
          </div>
        }
      />

      {/* Search and filter bar */}
      <div className="flex items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search physician, clinic, fax, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-8 h-8"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="awaiting">Awaiting Response</SelectItem>
              <SelectItem value="all">All Communications</SelectItem>
              <SelectItem value="sent-today">Sent Today</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <span className="text-sm text-muted-foreground">
          {clinicGroups.length} clinic{clinicGroups.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Clinic groups */}
      <div className="space-y-3">
        {clinicGroups.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {searchQuery ? (
                <>
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No results for &ldquo;{searchQuery}&rdquo;</p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-sm text-primary hover:underline mt-1"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No communications {filter === "awaiting" ? "awaiting response" : "found"}</p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          clinicGroups.map((group) => (
            <Collapsible
              key={group.clinicName}
              open={expandedClinics.has(group.clinicName)}
              onOpenChange={() => toggleClinic(group.clinicName)}
            >
              <Card className={cn(
                "overflow-hidden",
                group.awaitingCount > 0 && "border-amber-200"
              )}>
                {/* Clinic header */}
                <CollapsibleTrigger asChild>
                  <button className="w-full text-left">
                    <div className={cn(
                      "flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors",
                      group.awaitingCount > 0 && "bg-amber-50/50"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          group.awaitingCount > 0 ? "bg-amber-100" : "bg-muted"
                        )}>
                          <Building2 className={cn(
                            "h-5 w-5",
                            group.awaitingCount > 0 ? "text-amber-700" : "text-muted-foreground"
                          )} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{group.clinicName}</span>
                            {group.awaitingCount > 0 && (
                              <Badge className="bg-amber-500 text-white text-[10px] h-5">
                                {group.awaitingCount} awaiting
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{group.clinicCity}</span>
                            <span>·</span>
                            <span>{group.physicians.join(", ")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Call clinic button - only in header */}
                        {group.awaitingCount > 0 && group.clinicPhone && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.info(`Calling ${group.clinicName}...`);
                            }}
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            Call Clinic
                          </Button>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {group.referrals.length} referral{group.referrals.length !== 1 ? "s" : ""}
                        </span>
                        {expandedClinics.has(group.clinicName) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </button>
                </CollapsibleTrigger>

                {/* Referrals within clinic */}
                <CollapsibleContent>
                  <div className="border-t divide-y">
                    {group.referrals.map((referral) => (
                      <ReferralCommRow key={referral.id} referral={referral} />
                    ))}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        )}
      </div>
    </div>
  );
}

// Individual referral row within a clinic - simplified, click to navigate
function ReferralCommRow({ referral }: { referral: Referral }) {
  const awaitingCount = countByStatus(referral, "awaiting");
  const hasAwaiting = awaitingCount > 0;
  const oldestDays = getOldestAwaitingDays(referral);
  const preview = getLastMessagePreview(referral);

  return (
    <Link
      href={`/referrals/${referral.id}?tab=comms`}
      className={cn(
        "flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer group",
        hasAwaiting && "bg-amber-50/30"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          hasAwaiting ? "bg-amber-100" : "bg-muted"
        )}>
          <User className={cn(
            "h-4 w-4",
            hasAwaiting ? "text-amber-700" : "text-muted-foreground"
          )} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">
              {referral.patientName}
            </span>
          </div>
          {preview && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {preview}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Waiting duration badge */}
        {hasAwaiting && oldestDays !== null && (
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] h-5",
              oldestDays >= 3 ? "bg-red-50 text-red-700 border-red-200" :
              oldestDays >= 1 ? "bg-amber-50 text-amber-700 border-amber-200" :
              "bg-gray-50 text-gray-700 border-gray-200"
            )}
          >
            <Clock className="h-3 w-3 mr-0.5" />
            {oldestDays === 0 ? "Today" : `${oldestDays}d`}
          </Badge>
        )}

        {/* Arrow indicator */}
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
}
