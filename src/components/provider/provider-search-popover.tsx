"use client";

import { useState, useMemo } from "react";
import { Physician } from "@/types";
import { mockPhysicians } from "@/data/mock-physicians";
import { formatPhone } from "@/lib/format";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Search, UserCheck } from "lucide-react";

interface ProviderSearchPopoverProps {
  selectedProvider: Physician | null;
  onSelectProvider: (provider: Physician) => void;
  trigger?: React.ReactNode;
}

function searchPhysicians(query: string, physicians: Physician[]): Physician[] {
  const q = query.toLowerCase().trim();
  if (!q) return physicians.slice(0, 8); // Show first 8 when no search

  return physicians.filter((p) => {
    // Search by name
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    if (fullName.includes(q)) return true;
    if (p.firstName.toLowerCase().includes(q)) return true;
    if (p.lastName.toLowerCase().includes(q)) return true;

    // Search by clinic name
    if (p.clinicName.toLowerCase().includes(q)) return true;

    // Search by CPSO number
    if (p.cpsoNumber && p.cpsoNumber.includes(q)) return true;

    // Search by city
    if (p.clinicCity.toLowerCase().includes(q)) return true;

    // Search by fax number
    const faxDigits = p.fax.replace(/\D/g, "");
    const queryDigits = q.replace(/\D/g, "");
    if (queryDigits.length > 0 && faxDigits.includes(queryDigits)) return true;

    return false;
  });
}

export function ProviderSearchPopover({
  selectedProvider,
  onSelectProvider,
  trigger,
}: ProviderSearchPopoverProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPhysicians = useMemo(
    () => searchPhysicians(searchQuery, mockPhysicians),
    [searchQuery]
  );

  const handleSelect = (physician: Physician) => {
    onSelectProvider(physician);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
            <Search className="h-3 w-3" />
            {selectedProvider ? "Change" : "Search"}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name, clinic, CPSO, or fax..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No providers found.</CommandEmpty>
            <CommandGroup heading="Providers">
              {filteredPhysicians.slice(0, 8).map((physician) => (
                <CommandItem
                  key={physician.id}
                  value={physician.id}
                  onSelect={() => handleSelect(physician)}
                  className="flex flex-col items-start gap-1 py-2"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="font-medium">
                      Dr. {physician.firstName} {physician.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {physician.designation}
                    </span>
                    {selectedProvider?.id === physician.id && (
                      <UserCheck className="h-3.5 w-3.5 text-emerald-600 ml-auto" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{physician.clinicName}</span>
                    {physician.cpsoNumber && (
                      <span>CPSO: {physician.cpsoNumber}</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {physician.clinicCity} · Fax: {formatPhone(physician.fax)}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
