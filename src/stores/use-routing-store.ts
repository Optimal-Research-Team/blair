"use client";

import { create } from "zustand";

export type RoutingStatus = "idle" | "processing" | "auto-filed" | "needs-review" | "failed";

export interface RoutingResult {
  faxId: string;
  status: RoutingStatus;
  destination?: "worklist-referral" | "worklist-unclassified" | "inbox" | "auto-filed";
  documentType?: string;
  message?: string;
  timestamp: string;
}

interface RoutingState {
  // Current routing operation
  currentRouting: RoutingResult | null;

  // Sidebar highlight state
  highlightedNavItem: string | null;
  highlightExpiry: number | null;

  // Actions
  startRouting: (faxId: string, documentType: string) => void;
  completeRouting: (result: Omit<RoutingResult, "timestamp">) => void;
  clearRouting: () => void;
  setHighlightedNavItem: (item: string | null, durationMs?: number) => void;
  clearHighlight: () => void;
}

export const useRoutingStore = create<RoutingState>((set, get) => ({
  currentRouting: null,
  highlightedNavItem: null,
  highlightExpiry: null,

  startRouting: (faxId, documentType) => {
    set({
      currentRouting: {
        faxId,
        status: "processing",
        documentType,
        timestamp: new Date().toISOString(),
      },
    });
  },

  completeRouting: (result) => {
    set({
      currentRouting: {
        ...result,
        timestamp: new Date().toISOString(),
      },
    });
  },

  clearRouting: () => {
    set({ currentRouting: null });
  },

  setHighlightedNavItem: (item, durationMs = 5000) => {
    set({
      highlightedNavItem: item,
      highlightExpiry: Date.now() + durationMs,
    });

    // Auto-clear after duration
    if (item) {
      setTimeout(() => {
        const state = get();
        if (state.highlightExpiry && Date.now() >= state.highlightExpiry) {
          set({ highlightedNavItem: null, highlightExpiry: null });
        }
      }, durationMs);
    }
  },

  clearHighlight: () => {
    set({ highlightedNavItem: null, highlightExpiry: null });
  },
}));
