import Link from "next/link";
import EditVisitButton from "@/components/EditVisitButton";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  OUTCOMES,
  OUTCOME_LABELS,
  PURPOSES,
  PURPOSE_LABELS,
  STATUSES,
  STATUS_LABELS,
  type Visit,
  type StatusValue,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/dates";
import { applyFilters, parseFilters } from "@/lib/visit-filters";
import { inputClass, statusBadge } from "@/lib/ui";

const PAGE_SIZE = 25;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const filters = parseFilters(raw);
  const page = Math.max(1, Number.parseInt(String(raw.page ?? "1"), 10) || 1);
  const from = (page - 1) * PAGE_SIZE;

  const hasFilters = Object.values(filters).some((v) => v);
  const canEdit = (await getCurrentProfile())?.role === "counselor";

  const supabase = await createClient();

  let visits: Visit[] = [];
  let total = 0;
  let pages = 1;
  let error: { message: string } | null = null;

  if (hasFilters) {
    const result = await applyFilters(
      supabase.from("visits").select("*", { count: "exact" }),
      filters,
    )
      .order("time_in", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    visits = (result.data ?? []) as Visit[];
    total = result.count ?? 0;
    pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    error = result.error;
  }

  const qs = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) if (v) params.set(k, v);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return s ? `?${s}` : "";
  };

  const field = inputClass;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-text">Paghahanap</h1>

      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="mb-4 text-sm text-text-muted">
          Maghanap ng estudyante gamit ang pangalan, student number, o i-filter ayon sa purpose, status, at iba pa.
        </p>
        <form className="flex flex-wrap items-end gap-3">
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="Hanapin: name / student no."
            className={`${field} w-56`}
          />
          <select name="purpose" defaultValue={filters.purpose ?? ""} className={field}>
            <option value="">Lahat ng purpose</option>
            {PURPOSES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <select name="status" defaultValue={filters.status ?? ""} className={field}>
            <option value="">Lahat ng status</option>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select name="outcome" defaultValue={filters.outcome ?? ""} className={field}>
            <option value="">Lahat ng outcome</option>
            {OUTCOMES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <input name="grade" defaultValue={filters.grade} placeholder="Grade/Year" className={`${field} w-32`} />
          <label className="text-xs text-text-muted">
            Mula
            <input type="date" name="from" defaultValue={filters.from} className={`${field} ml-1`} />
          </label>
          <label className="text-xs text-text-muted">
            Hanggang
            <input type="date" name="to" defaultValue={filters.to} className={`${field} ml-1`} />
          </label>
          <button className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark">
            Hanapin
          </button>
          {hasFilters && (
            <Link href="/admin/search" className="px-2 py-2 text-sm text-text-muted transition-colors hover:text-text">
              I-clear
            </Link>
          )}
        </form>
      </div>

      {error && <p className="rounded-xl bg-error-light p-3 text-error">May error: {error.message}</p>}

      {!hasFilters && (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 px-4 py-16 text-center">
          <svg
            className="mx-auto h-12 w-12 text-text-muted/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <p className="mt-3 font-medium text-text-muted">Maghanap ng visit records</p>
          <p className="mt-1 text-sm text-text-muted/70">
            Gamitin ang mga filter sa itaas para magsimulang maghanap.
          </p>
        </div>
      )}

      {hasFilters && (
        <>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-text-muted">
                  <th className="px-4 py-3 font-medium">Time in</th>
                  <th className="px-4 py-3 font-medium">Time out</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Student no.</th>
                  <th className="px-4 py-3 font-medium">Grade / Section</th>
                  <th className="px-4 py-3 font-medium">Purpose</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Outcome</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {visits.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-text-muted/40"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                      <p className="mt-3 font-medium text-text-muted">Walang nahanap na records</p>
                      <p className="mt-1 text-sm text-text-muted/70">
                        Subukang baguhin ang mga filter o hanapin gamit ang ibang keyword.
                      </p>
                    </td>
                  </tr>
                )}
                {visits.map((v) => (
                  <tr key={v.id} className="border-t border-border transition-colors hover:bg-surface/60">
                    <td className="px-4 py-3 whitespace-nowrap text-text-muted">{formatDateTime(v.time_in)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-text-muted">{formatDateTime(v.time_out)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/visits/${v.id}`} className="font-medium text-primary hover:underline">
                        {v.student_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/students/${encodeURIComponent(v.student_number)}`}
                        className="text-text-muted hover:text-text hover:underline"
                      >
                        {v.student_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {v.grade_level} · {v.section}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {PURPOSE_LABELS[v.purpose]}
                      {v.purpose === "others" && v.purpose_other ? `: ${v.purpose_other}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <span className={statusBadge(v.status as StatusValue)}>
                        {STATUS_LABELS[v.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{v.outcome ? OUTCOME_LABELS[v.outcome] : "—"}</td>
                    <td className="px-4 py-3">
                      {canEdit && <EditVisitButton visit={v} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm text-text-muted">
            <span>
              {total} result{total === 1 ? "" : "s"} · Page {page} of {pages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/search${qs(page - 1)}`}
                  className="rounded-xl border border-border bg-card px-3 py-1.5 transition-colors hover:bg-surface"
                >
                  Nakaraan
                </Link>
              )}
              {page < pages && (
                <Link
                  href={`/admin/search${qs(page + 1)}`}
                  className="rounded-xl border border-border bg-card px-3 py-1.5 transition-colors hover:bg-surface"
                >
                  Susunod
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
