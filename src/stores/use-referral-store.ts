"use client";

import { create } from "zustand";
import { Referral, ReferralStatus } from "@/types";

interface ReferralState {
  referrals: Referral[];
  currentReferralId: string | null;

  setReferrals: (referrals: Referral[]) => void;
  setCurrentReferral: (id: string | null) => void;
  updateReferral: (id: string, updates: Partial<Referral>) => void;
  updateReferralStatus: (id: string, status: ReferralStatus) => void;
  setReferralStep: (id: string, step: number) => void;
  toggleCompletenessItem: (referralId: string, itemId: string) => void;
}

export const useReferralStore = create<ReferralState>((set) => ({
  referrals: [],
  currentReferralId: null,

  setReferrals: (referrals) => set({ referrals }),
  setCurrentReferral: (id) => set({ currentReferralId: id }),
  updateReferral: (id, updates) =>
    set((state) => ({
      referrals: state.referrals.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),
  updateReferralStatus: (id, status) =>
    set((state) => ({
      referrals: state.referrals.map((r) =>
        r.id === id ? { ...r, status } : r
      ),
    })),
  setReferralStep: (id, step) =>
    set((state) => ({
      referrals: state.referrals.map((r) =>
        r.id === id ? { ...r, currentStep: step } : r
      ),
    })),
  toggleCompletenessItem: (referralId, itemId) =>
    set((state) => ({
      referrals: state.referrals.map((r) => {
        if (r.id !== referralId) return r;
        const items = r.completenessItems.map((item) =>
          item.id === itemId ? { ...item, present: !item.present } : item
        );
        const requiredItems = items.filter((i) => i.required);
        const score =
          requiredItems.length > 0
            ? Math.round(
                (requiredItems.filter((i) => i.present).length /
                  requiredItems.length) *
                  100
              )
            : 100;
        return { ...r, completenessItems: items, completenessScore: score };
      }),
    })),
}));
