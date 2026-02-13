"use client";

import { Physician } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProviderSearchPopover } from "./provider-search-popover";
import { cn } from "@/lib/utils";
import { formatPhone } from "@/lib/format";
import {
  Stethoscope,
  Building2,
  Phone,
  Printer,
  Mail,
  MapPin,
  FileText,
} from "lucide-react";

interface ProviderInfo {
  name: string;
  designation?: string;
  clinicName?: string;
  clinicAddress?: string;
  clinicCity?: string;
  clinicProvince?: string;
  phone?: string;
  fax?: string;
  email?: string;
  cpsoNumber?: string;
}

interface ProviderIdentificationCardProps {
  provider: ProviderInfo | null;
  matchConfidence?: number;
  onProviderChange?: (provider: Physician) => void;
  className?: string;
}

export function ProviderIdentificationCard({
  provider,
  matchConfidence,
  onProviderChange,
  className,
}: ProviderIdentificationCardProps) {
  // Convert provider info to a format compatible with the search popover
  const selectedPhysician: Physician | null = provider
    ? {
        id: "current",
        firstName: provider.name.split(" ")[0] || "",
        lastName: provider.name.split(" ").slice(1).join(" ") || "",
        designation: (provider.designation as "MD" | "DO" | "NP") || "MD",
        specialty: "",
        cpsoNumber: provider.cpsoNumber,
        clinicName: provider.clinicName || "",
        clinicAddress: provider.clinicAddress || "",
        clinicCity: provider.clinicCity || "",
        clinicProvince: provider.clinicProvince || "",
        phone: provider.phone || "",
        fax: provider.fax || "",
        email: provider.email,
      }
    : null;

  if (!provider) {
    return (
      <Card className={cn("border border-gray-200", className)}>
        <CardHeader className="px-3 py-2 bg-gray-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Referring Provider
            </CardTitle>
            {onProviderChange && (
              <ProviderSearchPopover
                selectedProvider={null}
                onSelectProvider={onProviderChange}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="px-3 py-2">
          <p className="text-sm text-muted-foreground">No provider information available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border border-blue-200", className)}>
      <CardHeader className="px-3 py-2 bg-blue-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Referring Provider
          </CardTitle>
          {onProviderChange && (
            <ProviderSearchPopover
              selectedProvider={selectedPhysician}
              onSelectProvider={onProviderChange}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 py-1.5">
        <div className="space-y-1">
          {/* Provider name, designation, and confidence */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold">{provider.name}</span>
              {provider.designation && (
                <span className="text-xs text-muted-foreground">
                  ({provider.designation})
                </span>
              )}
            </div>
            {matchConfidence !== undefined && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                {matchConfidence.toFixed(0)}%
              </span>
            )}
          </div>

          {/* Details - compact grid */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
            {provider.cpsoNumber && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">CPSO:</span>
                <span className="font-medium">{provider.cpsoNumber}</span>
              </div>
            )}
            {provider.clinicName && (
              <div className="flex items-center gap-1 col-span-2">
                <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="truncate">{provider.clinicName}</span>
              </div>
            )}
            {provider.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span>{formatPhone(provider.phone)}</span>
              </div>
            )}
            {provider.fax && (
              <div className="flex items-center gap-1">
                <Printer className="h-3 w-3 text-muted-foreground" />
                <span>{formatPhone(provider.fax)}</span>
              </div>
            )}
            {provider.email && (
              <div className="flex items-center gap-1 col-span-2">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <span className="truncate">{provider.email}</span>
              </div>
            )}
          </div>

          {/* Address */}
          {(provider.clinicAddress || provider.clinicCity) && (
            <div className="flex items-start gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
              <span>
                {provider.clinicAddress}
                {provider.clinicAddress && provider.clinicCity && ", "}
                {provider.clinicCity}
                {provider.clinicProvince && `, ${provider.clinicProvince}`}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
