"use client";

import { create } from "zustand";
import { Fax, FaxStatus, Priority } from "@/types";

interface InboxFilters {
  search: string;
  status: FaxStatus | "all";
  priority: Priority | "all";
  documentType: string | "all";
  dateRange: { from?: string; to?: string };
}

interface InboxState {
  faxes: Fax[];
  filters: InboxFilters;
  viewMode: "table" | "grid";
  selectedFaxIds: string[];

  setFaxes: (faxes: Fax[]) => void;
  setFilter: <K extends keyof InboxFilters>(key: K, value: InboxFilters[K]) => void;
  resetFilters: () => void;
  setViewMode: (mode: "table" | "grid") => void;
  toggleFaxSelection: (id: string) => void;
  selectAllFaxes: () => void;
  deselectAllFaxes: () => void;
  updateFax: (id: string, updates: Partial<Fax>) => void;
  lockFax: (faxId: string, userId: string) => void;
  unlockFax: (faxId: string) => void;
}

const defaultFilters: InboxFilters = {
  search: "",
  status: "all",
  priority: "all",
  documentType: "all",
  dateRange: {},
};

export const useInboxStore = create<InboxState>((set) => ({
  faxes: [],
  filters: defaultFilters,
  viewMode: "table",
  selectedFaxIds: [],

  setFaxes: (faxes) => set({ faxes }),
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: defaultFilters }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleFaxSelection: (id) =>
    set((state) => ({
      selectedFaxIds: state.selectedFaxIds.includes(id)
        ? state.selectedFaxIds.filter((fid) => fid !== id)
        : [...state.selectedFaxIds, id],
    })),
  selectAllFaxes: () =>
    set((state) => ({ selectedFaxIds: state.faxes.map((f) => f.id) })),
  deselectAllFaxes: () => set({ selectedFaxIds: [] }),
  updateFax: (id, updates) =>
    set((state) => ({
      faxes: state.faxes.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),
  lockFax: (faxId, userId) =>
    set((state) => ({
      faxes: state.faxes.map((f) =>
        f.id === faxId
          ? { ...f, lockedBy: userId, lockedAt: new Date().toISOString() }
          : f
      ),
    })),
  unlockFax: (faxId) =>
    set((state) => ({
      faxes: state.faxes.map((f) =>
        f.id === faxId ? { ...f, lockedBy: undefined, lockedAt: undefined } : f
      ),
    })),
}));
