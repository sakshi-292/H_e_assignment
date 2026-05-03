import {
  GapSeverity,
  GapStatus,
  PlanStatus,
  StudentStatus,
} from "@prisma/client";

/**
 * Shared label + tone maps for status / severity badges.
 *
 * Pages render badges with:
 *   <span className={`${BADGE_BASE} ${STUDENT_STATUS_TONE[student.status]}`}>
 *     {STUDENT_STATUS_LABEL[student.status]}
 *   </span>
 *
 * Keep colour semantics consistent across the app:
 *   emerald → positive / resolved / low-risk
 *   sky     → in-flight / active
 *   amber   → needs attention / in-progress / medium
 *   red     → high-risk / cancelled
 *   zinc    → neutral / draft / archived
 */
export const BADGE_BASE =
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";

export const STUDENT_STATUS_LABEL: Record<StudentStatus, string> = {
  ACTIVE: "Active",
  NEEDS_SUPPORT: "Needs support",
  IMPROVING: "Improving",
  ARCHIVED: "Archived",
};

export const STUDENT_STATUS_TONE: Record<StudentStatus, string> = {
  ACTIVE:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  NEEDS_SUPPORT:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  IMPROVING: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  ARCHIVED: "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400",
};

export const GAP_SEVERITY_LABEL: Record<GapSeverity, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const GAP_SEVERITY_TONE: Record<GapSeverity, string> = {
  LOW: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  MEDIUM: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  HIGH: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
};

export const GAP_STATUS_LABEL: Record<GapStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
};

export const GAP_STATUS_TONE: Record<GapStatus, string> = {
  OPEN: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  IN_PROGRESS:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  RESOLVED:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
};

export const PLAN_STATUS_LABEL: Record<PlanStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const PLAN_STATUS_TONE: Record<PlanStatus, string> = {
  DRAFT: "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400",
  ACTIVE: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  COMPLETED:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  CANCELLED: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
};
