"use client";

import { Fax } from "@/types";
import { InboxGridCard } from "./inbox-grid-card";

interface InboxGridViewProps {
  faxes: Fax[];
}

export function InboxGridView({ faxes }: InboxGridViewProps) {
  if (faxes.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        No faxes found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {faxes.map((fax) => (
        <InboxGridCard key={fax.id} fax={fax} />
      ))}
    </div>
  );
}
