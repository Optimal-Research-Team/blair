"use client";

import { useState, useMemo } from "react";
import { Patient } from "@/types";
import { mockPatients } from "@/data/mock-patients";
import { formatDate, formatPHN } from "@/lib/format";
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

interface PatientSearchPopoverProps {
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  trigger?: React.ReactNode;
}

function searchPatients(query: string, patients: Patient[]): Patient[] {
  const q = query.toLowerCase().trim();
  if (!q) return patients.slice(0, 8); // Show first 8 when no search

  return patients.filter((p) => {
    // Search by name
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    if (fullName.includes(q)) return true;
    if (p.firstName.toLowerCase().includes(q)) return true;
    if (p.lastName.toLowerCase().includes(q)) return true;

    // Search by PHN (strip non-digits for comparison)
    const phnDigits = p.phn.replace(/\D/g, "");
    const queryDigits = q.replace(/\D/g, "");
    if (queryDigits.length > 0 && phnDigits.includes(queryDigits)) return true;

    // Search by DOB
    if (p.dateOfBirth.includes(q)) return true;

    return false;
  });
}

export function PatientSearchPopover({
  selectedPatient,
  onSelectPatient,
  trigger,
}: PatientSearchPopoverProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = useMemo(
    () => searchPatients(searchQuery, mockPatients),
    [searchQuery]
  );

  const handleSelect = (patient: Patient) => {
    onSelectPatient(patient);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
            <Search className="h-3 w-3" />
            {selectedPatient ? "Change" : "Search"}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name, DOB, or health card..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No patients found.</CommandEmpty>
            <CommandGroup heading="Patients">
              {filteredPatients.slice(0, 8).map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={patient.id}
                  onSelect={() => handleSelect(patient)}
                  className="flex flex-col items-start gap-1 py-2"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="font-medium">
                      {patient.firstName} {patient.lastName}
                    </span>
                    {selectedPatient?.id === patient.id && (
                      <UserCheck className="h-3.5 w-3.5 text-emerald-600 ml-auto" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>DOB: {formatDate(patient.dateOfBirth)}</span>
                    <span>OHIP: {formatPHN(patient.phn)}</span>
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
