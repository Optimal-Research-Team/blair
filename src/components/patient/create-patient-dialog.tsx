"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Patient } from "@/types";
import { Database, CheckCircle2, Loader2 } from "lucide-react";

interface CreatePatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-populated patient data extracted from the document */
  extractedPatient?: Partial<Patient>;
  /** Callback when patient is successfully created */
  onPatientCreated?: (patient: Patient) => void;
}

export function CreatePatientDialog({
  open,
  onOpenChange,
  extractedPatient,
  onPatientCreated,
}: CreatePatientDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState(extractedPatient?.firstName || "");
  const [lastName, setLastName] = useState(extractedPatient?.lastName || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    extractedPatient?.dateOfBirth || ""
  );
  const [gender, setGender] = useState<"M" | "F" | "X">(
    extractedPatient?.gender || "M"
  );
  const [phone, setPhone] = useState(extractedPatient?.phone || "");
  const [healthCardNumber, setHealthCardNumber] = useState(
    extractedPatient?.phn || ""
  );

  // Reset form when dialog opens with new data
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && extractedPatient) {
      setFirstName(extractedPatient.firstName || "");
      setLastName(extractedPatient.lastName || "");
      setDateOfBirth(extractedPatient.dateOfBirth || "");
      setGender(extractedPatient.gender || "M");
      setPhone(extractedPatient.phone || "");
      setHealthCardNumber(extractedPatient.phn || "");
      setSuccessMessage(null);
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create mock patient object with all required fields
    const newPatient: Patient = {
      id: `pat-new-${Date.now()}`,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone: phone || "",
      phn: healthCardNumber || "",
      address: {
        street: "",
        city: "",
        province: "ON",
        postalCode: "",
      },
      conditions: [],
      medications: [],
    };

    setIsSubmitting(false);
    setSuccessMessage(`${firstName} ${lastName} has been added to Cerebrum EMR`);

    // Auto-close after showing success
    setTimeout(() => {
      onOpenChange(false);
      setSuccessMessage(null);
      onPatientCreated?.(newPatient);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-600" />
            Create Patient in Cerebrum
          </DialogTitle>
          <DialogDescription>
            Create a new patient record in Cerebrum EMR. The information below
            has been extracted from the fax document.
          </DialogDescription>
        </DialogHeader>

        {successMessage ? (
          <Alert className="bg-emerald-50 border-emerald-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-700">
              {successMessage}
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Smith"
                  required
                />
              </div>
            </div>

            {/* DOB and Gender row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={gender}
                  onValueChange={(v) =>
                    setGender(v as "M" | "F" | "X")
                  }
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="X">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(416) 555-0123"
              />
            </div>

            {/* Health Card */}
            <div className="space-y-2">
              <Label htmlFor="healthCard">OHIP Number</Label>
              <Input
                id="healthCard"
                value={healthCardNumber}
                onChange={(e) => setHealthCardNumber(e.target.value)}
                placeholder="1234-567-890-AB"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Create Patient
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
