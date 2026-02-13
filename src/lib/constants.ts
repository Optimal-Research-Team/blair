export const APP_NAME = "Blair";
export const APP_VERSION = "1.0.0-beta";

export const PRIORITY_COLORS = {
  urgent: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
  routine: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", dot: "bg-green-500" },
} as const;

export const STATUS_COLORS = {
  "auto-filed": { bg: "bg-emerald-100", text: "text-emerald-700" },
  "pending-review": { bg: "bg-blue-100", text: "text-blue-700" },
  "in-progress": { bg: "bg-purple-100", text: "text-purple-700" },
  flagged: { bg: "bg-red-100", text: "text-red-700" },
  completed: { bg: "bg-gray-100", text: "text-gray-700" },
} as const;

export const STATUS_LABELS = {
  "auto-filed": "Auto-Filed",
  "pending-review": "Needs Review",
  "in-progress": "In Progress",
  flagged: "Flagged",
  completed: "Completed",
} as const;

export const MATCH_STATUS_LABELS = {
  matched: "Match Found",
  "not-found": "No Match",
  "multiple-matches": "Multiple Matches",
  pending: "Pending",
} as const;

export const MATCH_STATUS_COLORS = {
  matched: { bg: "bg-green-100", text: "text-green-700" },
  "not-found": { bg: "bg-red-100", text: "text-red-700" },
  "multiple-matches": { bg: "bg-amber-100", text: "text-amber-700" },
  pending: { bg: "bg-gray-100", text: "text-gray-500" },
} as const;
