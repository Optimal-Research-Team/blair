"use client";

import { create } from "zustand";
import { AppSettings, DocumentTypeConfig, FaxLineConfig } from "@/types";

interface SettingsState {
  settings: AppSettings;
  documentTypes: DocumentTypeConfig[];
  faxLines: FaxLineConfig[];

  updateSettings: (updates: Partial<AppSettings>) => void;
  setDocumentTypes: (types: DocumentTypeConfig[]) => void;
  updateDocumentType: (id: string, updates: Partial<DocumentTypeConfig>) => void;
  setFaxLines: (lines: FaxLineConfig[]) => void;
  updateFaxLine: (id: string, updates: Partial<FaxLineConfig>) => void;
}

const defaultSettings: AppSettings = {
  shadowModeEnabled: false,
  defaultConfidenceThreshold: 90,
  requireMrpAssignment: true,
  autoCreatePatientChart: false,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,
  documentTypes: [],
  faxLines: [],

  updateSettings: (updates) =>
    set((state) => ({ settings: { ...state.settings, ...updates } })),
  setDocumentTypes: (types) => set({ documentTypes: types }),
  updateDocumentType: (id, updates) =>
    set((state) => ({
      documentTypes: state.documentTypes.map((dt) =>
        dt.id === id ? { ...dt, ...updates } : dt
      ),
    })),
  setFaxLines: (lines) => set({ faxLines: lines }),
  updateFaxLine: (id, updates) =>
    set((state) => ({
      faxLines: state.faxLines.map((fl) =>
        fl.id === id ? { ...fl, ...updates } : fl
      ),
    })),
}));
