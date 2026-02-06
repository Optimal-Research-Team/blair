"use client";

import { create } from "zustand";
import { currentUser, mockStaff } from "@/data/mock-staff";
import { User } from "@/types";

interface Lock {
  documentId: string;
  userId: string;
  lockedAt: string;
}

interface LockState {
  locks: Lock[];
  lockDocument: (documentId: string) => void;
  unlockDocument: (documentId: string) => void;
  isLockedByMe: (documentId: string) => boolean;
  isLockedByOther: (documentId: string) => boolean;
  getLockedByUser: (documentId: string) => User | null;
}

export const useLockStore = create<LockState>((set, get) => ({
  locks: [],

  lockDocument: (documentId: string) => {
    const existing = get().locks.find((l) => l.documentId === documentId);
    // If already locked by current user, just update timestamp
    if (existing?.userId === currentUser.id) {
      set((state) => ({
        locks: state.locks.map((l) =>
          l.documentId === documentId
            ? { ...l, lockedAt: new Date().toISOString() }
            : l
        ),
      }));
      return;
    }
    // If locked by someone else, don't override
    if (existing) return;
    // Add new lock
    set((state) => ({
      locks: [
        ...state.locks,
        {
          documentId,
          userId: currentUser.id,
          lockedAt: new Date().toISOString(),
        },
      ],
    }));
  },

  unlockDocument: (documentId: string) => {
    const lock = get().locks.find((l) => l.documentId === documentId);
    // Only unlock if current user owns the lock
    if (lock?.userId === currentUser.id) {
      set((state) => ({
        locks: state.locks.filter((l) => l.documentId !== documentId),
      }));
    }
  },

  isLockedByMe: (documentId: string) => {
    const lock = get().locks.find((l) => l.documentId === documentId);
    return lock?.userId === currentUser.id;
  },

  isLockedByOther: (documentId: string) => {
    const lock = get().locks.find((l) => l.documentId === documentId);
    return !!lock && lock.userId !== currentUser.id;
  },

  getLockedByUser: (documentId: string) => {
    const lock = get().locks.find((l) => l.documentId === documentId);
    if (!lock) return null;
    return mockStaff.find((s) => s.id === lock.userId) || null;
  },
}));
