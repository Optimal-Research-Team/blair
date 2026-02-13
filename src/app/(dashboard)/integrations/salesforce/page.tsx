"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProviderCard } from "@/components/integrations/provider-card";
import { ProviderDetailPanel } from "@/components/integrations/provider-detail-panel";
import {
  mockSalesforceProviders,
  mockSalesforceOverview,
  getProvidersByClinic,
  getProvidersByQuality,
  getProvidersNeedingOutreach,
} from "@/data/mock-salesforce-providers";
import { SalesforceProvider } from "@/types/integration-feeds";
import {
  Building2,
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  Clock,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ViewTab = "overview" | "by-provider" | "by-clinic";

export default function SalesforceFeedPage() {
  const [activeTab, setActiveTab] = useState<ViewTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<SalesforceProvider | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  const overview = mockSalesforceOverview;
  const providers = mockSalesforceProviders;
  const providersByClinic = getProvidersByClinic();
  const providersByQuality = getProvidersByQuality();
  const providersNeedingOutreach = getProvidersNeedingOutreach();

  // Calculate total referrals this month for percentage calculations
  const totalReferralsThisMonth = useMemo(() => {
    return providers.reduce((sum, p) => sum + p.referralsThisMonth, 0);
  }, [providers]);

  // Filter providers by search
  const filteredProviders = useMemo(() => {
    if (!searchQuery) return providers;
    const query = searchQuery.toLowerCase();
    return providers.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.clinicName.toLowerCase().includes(query) ||
        (p.email && p.email.toLowerCase().includes(query))
    );
  }, [providers, searchQuery]);

  // Sort providers by referrals (descending)
  const sortedProviders = useMemo(() => {
    return [...filteredProviders].sort(
      (a, b) => b.referralsThisMonth - a.referralsThisMonth
    );
  }, [filteredProviders]);

  const handleViewDetails = (provider: SalesforceProvider) => {
    setSelectedProvider(provider);
    setDetailPanelOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Provider Relationships (Salesforce)</h1>
            <p className="text-sm text-muted-foreground">
              Provider relationships and referral analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {providersNeedingOutreach.length > 0 && (
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 border-amber-200"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              {providersNeedingOutreach.length} need outreach
            </Badge>
          )}
          <Button variant="outline" size="icon" className="h-9 w-9">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as ViewTab)}
        className="flex-1 flex flex-col"
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="by-provider">
              By Provider
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {providers.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="by-clinic">
              By Clinic
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {providersByClinic.size}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="flex-1 overflow-auto mt-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <FileText className="h-4 w-4" />
                Total Referrals
              </div>
              <div className="text-3xl font-bold">{overview.totalReferrals}</div>
              <div
                className={cn(
                  "flex items-center gap-1 text-sm mt-1",
                  overview.totalReferralsTrend >= 0
                    ? "text-emerald-600"
                    : "text-red-600"
                )}
              >
                {overview.totalReferralsTrend >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(overview.totalReferralsTrend)}% vs last month
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <AlertTriangle className="h-4 w-4" />
                Missing Info Rate
              </div>
              <div className="text-3xl font-bold">{overview.missingInfoRate}%</div>
              <div
                className={cn(
                  "flex items-center gap-1 text-sm mt-1",
                  overview.missingInfoRateTrend <= 0
                    ? "text-emerald-600"
                    : "text-red-600"
                )}
              >
                {overview.missingInfoRateTrend <= 0 ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <TrendingUp className="h-3 w-3" />
                )}
                {Math.abs(overview.missingInfoRateTrend)}%
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <Clock className="h-4 w-4" />
                Avg Completion
              </div>
              <div className="text-3xl font-bold">{overview.avgCompletionDays}d</div>
              <div
                className={cn(
                  "flex items-center gap-1 text-sm mt-1",
                  overview.avgCompletionDaysTrend <= 0
                    ? "text-emerald-600"
                    : "text-red-600"
                )}
              >
                {overview.avgCompletionDaysTrend <= 0 ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <TrendingUp className="h-3 w-3" />
                )}
                {Math.abs(overview.avgCompletionDaysTrend)}d
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <Users className="h-4 w-4" />
                Top Referrer
              </div>
              <div className="text-xl font-bold">{overview.topReferrer.name}</div>
              <div className="text-sm text-muted-foreground">
                {overview.topReferrer.count} referrals this month
              </div>
            </div>
          </div>

          {/* Top Referring Providers */}
          <div className="mb-6">
            <h2 className="font-semibold mb-3">Top Referring Providers</h2>
            <div className="grid gap-3">
              {sortedProviders.slice(0, 5).map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  totalReferrals={totalReferralsThisMonth}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </div>

          {/* Providers Needing Outreach */}
          {providersNeedingOutreach.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Providers Needing Outreach
              </h2>
              <div className="grid gap-3">
                {providersNeedingOutreach.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    totalReferrals={totalReferralsThisMonth}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* By Provider Tab */}
        <TabsContent value="by-provider" className="flex-1 overflow-auto mt-0">
          {/* Quality Score Distribution */}
          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm">
              <span className="font-medium">{providersByQuality.excellent.length}</span>
              Excellent
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm">
              <span className="font-medium">{providersByQuality.good.length}</span>
              Good
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-sm">
              <span className="font-medium">{providersByQuality.needsImprovement.length}</span>
              Needs Improvement
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-sm">
              <span className="font-medium">{providersByQuality.poor.length}</span>
              Poor
            </div>
          </div>

          {/* Provider List */}
          <div className="grid gap-3">
            {sortedProviders.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No providers found</p>
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
              sortedProviders.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  totalReferrals={totalReferralsThisMonth}
                  onViewDetails={handleViewDetails}
                />
              ))
            )}
          </div>
        </TabsContent>

        {/* By Clinic Tab */}
        <TabsContent value="by-clinic" className="flex-1 overflow-auto mt-0">
          <div className="space-y-6">
            {Array.from(providersByClinic.entries())
              .filter(([clinicName, clinicProviders]) => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                return (
                  clinicName.toLowerCase().includes(query) ||
                  clinicProviders.some(
                    (p) =>
                      p.name.toLowerCase().includes(query) ||
                      (p.email && p.email.toLowerCase().includes(query))
                  )
                );
              })
              .map(([clinicName, clinicProviders]) => (
                <div key={clinicName}>
                  {/* Clinic header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{clinicName}</span>
                    </div>
                    <Badge variant="secondary" className="h-5 px-1.5">
                      {clinicProviders.length} provider
                      {clinicProviders.length !== 1 ? "s" : ""}
                    </Badge>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Clinic providers */}
                  <div className="grid gap-3 pl-6">
                    {clinicProviders
                      .sort((a, b) => b.referralsThisMonth - a.referralsThisMonth)
                      .map((provider) => (
                        <ProviderCard
                          key={provider.id}
                          provider={provider}
                          totalReferrals={totalReferralsThisMonth}
                          onViewDetails={handleViewDetails}
                        />
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Provider Detail Panel */}
      <ProviderDetailPanel
        provider={selectedProvider}
        open={detailPanelOpen}
        onOpenChange={setDetailPanelOpen}
      />
    </div>
  );
}
