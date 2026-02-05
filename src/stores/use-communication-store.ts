"use client";

import { create } from "zustand";
import { Communication, CommunicationTemplate } from "@/types";

interface CommunicationState {
  communications: Communication[];
  templates: CommunicationTemplate[];
  activeTab: "templates" | "log" | "followups";

  setCommunications: (comms: Communication[]) => void;
  setTemplates: (templates: CommunicationTemplate[]) => void;
  setActiveTab: (tab: "templates" | "log" | "followups") => void;
  addCommunication: (comm: Communication) => void;
  updateCommunication: (id: string, updates: Partial<Communication>) => void;
}

export const useCommunicationStore = create<CommunicationState>((set) => ({
  communications: [],
  templates: [],
  activeTab: "templates",

  setCommunications: (communications) => set({ communications }),
  setTemplates: (templates) => set({ templates }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  addCommunication: (comm) =>
    set((state) => ({ communications: [comm, ...state.communications] })),
  updateCommunication: (id, updates) =>
    set((state) => ({
      communications: state.communications.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),
}));
