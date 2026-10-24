import type { StatusValue } from "./constants";

const statusStyles: Record<StatusValue, string> = {
  waiting: "bg-warning-light text-warning ring-1 ring-inset ring-warning/20",
  in_session: "bg-primary-light text-primary ring-1 ring-inset ring-primary/20",
  done: "bg-success-light text-success ring-1 ring-inset ring-success/20",
  no_show: "bg-error-light text-error ring-1 ring-inset ring-error/20",
};

export function statusBadge(status: StatusValue): string {
  return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status] ?? ""}`;
}

/** Shared input classes — small (admin forms, filters) */
export const inputClass =
  "w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

/** Shared input classes — large (kiosk form, login) */
export const inputClassLg =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-lg text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";
