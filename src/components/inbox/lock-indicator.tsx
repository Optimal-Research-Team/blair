"use client";

import { Lock } from "lucide-react";
import { useLockStore } from "@/stores/use-lock-store";
import { currentUser } from "@/data/mock-staff";

interface LockIndicatorProps {
  documentId: string;
}

export function LockIndicator({ documentId }: LockIndicatorProps) {
  const { getLockedByUser } = useLockStore();
  const lockedUser = getLockedByUser(documentId);

  if (!lockedUser) return null;

  const isMe = lockedUser.id === currentUser.id;

  return (
    <div
      className={`flex items-center gap-1 text-xs ${isMe ? "text-emerald-600" : "text-amber-600"}`}
      title={`Locked by ${lockedUser.name}`}
    >
      <Lock className="h-3 w-3" />
      <span>{isMe ? "You" : lockedUser.initials}</span>
    </div>
  );
}
