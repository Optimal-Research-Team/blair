"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  mockCerebrumPatients,
  getPatientFeedStats,
  filterPatients,
} from "@/data/mock-cerebrum-patients";
import { PatientWithUpdates, PatientSyncStatus } from "@/types/patient-sync";
import {
  Search,
  RefreshCw,
  UserRound,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  FileText,
  Users,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";

type FilterTab = "all" | "synced" | "new" | "info-update";

export default function PatientsFeedPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const stats = getPatientFeedStats();

  // Filter patients
  const filteredPatients = useMemo(() => {
    let filtered = filterPatients(
      activeTab === "all" ? undefined : activeTab,
      searchQuery || undefined
    );

    // Sort by lastSyncedAt descending
    filtered.sort(
      (a, b) =>
        new Date(b.lastSyncedAt).getTime() - new Date(a.lastSyncedAt).getTime()
    );

    return filtered;
  }, [activeTab, searchQuery]);

  // Format time
  const formatTime = (dateStr: string) => {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  };

  // Get status badge
  const getStatusBadge = (status: PatientSyncStatus) => {
    switch (status) {
      case "synced":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">
            <CheckCircle2 className="h-3 w-3 mr-0.5" />
            Synced
          </Badge>
        );
      case "new":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">
            <Sparkles className="h-3 w-3 mr-0.5" />
            New
          </Badge>
        );
      case "info-update":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">
            <AlertTriangle className="h-3 w-3 mr-0.5" />
            Info Update
          </Badge>
        );
      case "not-in-cerebrum":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">
            <Clock className="h-3 w-3 mr-0.5" />
            Not in Cerebrum
          </Badge>
        );
      default:
        return null;
    }
  };

  // Get pending update icon
  const getUpdateIcon = (field: string) => {
    switch (field) {
      case "phone":
        return <Phone className="h-3 w-3" />;
      case "email":
        return <Mail className="h-3 w-3" />;
      case "address":
        return <MapPin className="h-3 w-3" />;
      case "healthCard":
        return <CreditCard className="h-3 w-3" />;
      default:
        return <AlertTriangle className="h-3 w-3" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
            <UserRound className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Cerebrum Patients</h1>
            <p className="text-sm text-muted-foreground">
              Patient demographics synced from Cerebrum EMR
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Stats badges */}
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {stats.syncedPatients} synced
          </Badge>
          {stats.newPatientsToday > 0 && (
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {stats.newPatientsToday} new today
            </Badge>
          )}
          {stats.patientsWithUpdates > 0 && (
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 border-amber-200"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              {stats.patientsWithUpdates} need update
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
            <Users className="h-4 w-4" />
            Total Patients
          </div>
          <p className="text-2xl font-semibold">{stats.totalPatients}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <CheckCircle2 className="h-4 w-4" />
            Synced
          </div>
          <p className="text-2xl font-semibold">
            {stats.syncedPatients}
            <span className="text-sm font-normal text-muted-foreground ml-1">
              (
              {Math.round((stats.syncedPatients / stats.totalPatients) * 100)}%)
            </span>
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Sparkles className="h-4 w-4" />
            New Today
          </div>
          <p className="text-2xl font-semibold">{stats.newPatientsToday}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <AlertTriangle className="h-4 w-4" />
            Needs Update
          </div>
          <p
            className={cn(
              "text-2xl font-semibold",
              stats.patientsWithUpdates > 0
                ? "text-amber-600"
                : "text-emerald-600"
            )}
          >
            {stats.patientsWithUpdates}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as FilterTab)}
        >
          <TabsList>
            <TabsTrigger value="all">
              All
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {mockCerebrumPatients.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="synced">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Synced
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {stats.syncedPatients}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="new">
              <Sparkles className="h-3 w-3 mr-1" />
              New
            </TabsTrigger>
            <TabsTrigger value="info-update">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Info Updates
              {stats.patientsWithUpdates > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 px-1.5 bg-amber-100 text-amber-700"
                >
                  {stats.patientsWithUpdates}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="flex-1 overflow-auto border rounded-lg bg-white">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <UserRound className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No patients found</p>
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
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[200px]">Patient Name</TableHead>
                <TableHead className="w-[100px]">DOB</TableHead>
                <TableHead className="w-[150px]">Health Card</TableHead>
                <TableHead className="w-[130px]">Phone</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[130px]">Last Sync</TableHead>
                <TableHead className="w-[100px]">Faxes</TableHead>
                <TableHead className="w-[100px]">Referrals</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id} className="hover:bg-muted/30">
                  {/* Patient Name */}
                  <TableCell>
                    <div className="text-sm font-medium">
                      {patient.lastName}, {patient.firstName}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {patient.cerebrumId}
                    </div>
                  </TableCell>

                  {/* DOB */}
                  <TableCell>
                    <div className="text-xs">
                      {format(new Date(patient.dateOfBirth), "MMM d, yyyy")}
                    </div>
                  </TableCell>

                  {/* Health Card */}
                  <TableCell>
                    {patient.healthCardNumber ? (
                      <div className="text-xs font-mono">
                        {patient.healthCardNumber}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  {/* Phone */}
                  <TableCell>
                    {patient.phone ? (
                      <div className="text-xs">{patient.phone}</div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(patient.syncStatus)}
                      {patient.pendingUpdates &&
                        patient.pendingUpdates.length > 0 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex gap-1 mt-1">
                                  {patient.pendingUpdates.map((update, idx) => (
                                    <span
                                      key={idx}
                                      className="text-amber-600"
                                    >
                                      {getUpdateIcon(update.field)}
                                    </span>
                                  ))}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-xs">
                                  <p className="font-medium mb-1">
                                    Pending Updates:
                                  </p>
                                  {patient.pendingUpdates.map((update, idx) => (
                                    <div key={idx} className="mb-1">
                                      <span className="capitalize">
                                        {update.field}:
                                      </span>{" "}
                                      <span className="line-through text-muted-foreground">
                                        {update.oldValue.substring(0, 20)}
                                        {update.oldValue.length > 20
                                          ? "..."
                                          : ""}
                                      </span>{" "}
                                      &rarr;{" "}
                                      <span className="text-emerald-600">
                                        {update.newValue.substring(0, 20)}
                                        {update.newValue.length > 20
                                          ? "..."
                                          : ""}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                    </div>
                  </TableCell>

                  {/* Last Sync */}
                  <TableCell>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(patient.lastSyncedAt)}
                    </div>
                  </TableCell>

                  {/* Faxes */}
                  <TableCell>
                    <div className="text-xs">
                      <span className="font-medium">{patient.totalFaxes}</span>
                      {patient.lastFaxDate && (
                        <div className="text-[10px] text-muted-foreground">
                          Last: {formatTime(patient.lastFaxDate)}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Referrals */}
                  <TableCell>
                    <div className="text-xs">
                      <span className="font-medium">
                        {patient.totalReferrals}
                      </span>
                      {patient.lastReferralDate && (
                        <div className="text-[10px] text-muted-foreground">
                          Last: {formatTime(patient.lastReferralDate)}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            asChild
                          >
                            <a
                              href={`https://cerebrum.example.com/patients/${patient.cerebrumId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View in Cerebrum EMR</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
