"use client";

import { create } from "zustand";
import { BoundingBox } from "@/types";

interface HighlightState {
  /** ID of the currently highlighted field */
  activeFieldId: string | null;
  /** Page number (1-indexed) where the highlighted field is located */
  activePageNumber: number | null;
  /** Document ID for multi-document referrals */
  activeDocumentId: string | null;
  /** Bounding box coordinates for the highlight overlay */
  activeBoundingBox: BoundingBox | null;
  /** Whether a page transition is in progress (used to fade out/in the overlay) */
  isTransitioning: boolean;

  /** Set the highlight state when hovering over a field */
  setHighlight: (params: {
    fieldId: string;
    pageNumber: number;
    documentId?: string;
    boundingBox: BoundingBox;
  }) => void;

  /** Clear the highlight when mouse leaves a field */
  clearHighlight: () => void;

  /** Set transitioning state during page navigation */
  setTransitioning: (isTransitioning: boolean) => void;
}

export const useHighlightStore = create<HighlightState>((set) => ({
  activeFieldId: null,
  activePageNumber: null,
  activeDocumentId: null,
  activeBoundingBox: null,
  isTransitioning: false,

  setHighlight: ({ fieldId, pageNumber, documentId, boundingBox }) =>
    set({
      activeFieldId: fieldId,
      activePageNumber: pageNumber,
      activeDocumentId: documentId ?? null,
      activeBoundingBox: boundingBox,
    }),

  clearHighlight: () =>
    set({
      activeFieldId: null,
      activePageNumber: null,
      activeDocumentId: null,
      activeBoundingBox: null,
    }),

  setTransitioning: (isTransitioning) => set({ isTransitioning }),
}));
