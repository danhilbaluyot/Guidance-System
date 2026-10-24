import Link from "next/link";
import EditVisitButton from "@/components/EditVisitButton";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  OUTCOME_LABELS,
  PURPOSE_LABELS,
  STATUS_LABELS,
  type Visit,
  type StatusValue,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/dates";
import { statusBadge } from "@/lib/ui";

const PAGE_SIZE = 25;

export default async function VisitsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const page = Math.max(1, Number.parseInt(String(raw.page ?? "1"), 10) || 1);
  const from = (page - 1) * PAGE_SIZE;

  const canEdit = (await getCurrentProfile())?.role === "counselor";

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("visits")
    .select("*", { count: "exact" })
    .order("time_in", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  const visits = (data ?? []) as Visit[];
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const qs = (p: number) => {
    if (p <= 1) return "";
    return `?page=${p}`;
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-text print:hidden">Visits</h1>

      {error && <p className="rounded-xl bg-error-light p-3 text-error">May error: {error.message}</p>}

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
              <th className="px-4 py-3 print:hidden"></th>
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
                  <p className="mt-3 font-medium text-text-muted">Walang records</p>
                  <p className="mt-1 text-sm text-text-muted/70">
                    Wala pang nag-check in na estudyante.
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
                <td className="px-4 py-3 print:hidden">
                  {canEdit && <EditVisitButton visit={v} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-text-muted print:hidden">
        <span>
          {total} record{total === 1 ? "" : "s"} · Page {page} of {pages}
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link
              href={`/admin/visits${qs(page - 1)}`}
              className="rounded-xl border border-border bg-card px-3 py-1.5 transition-colors hover:bg-surface"
            >
              Nakaraan
            </Link>
          )}
          {page < pages && (
            <Link
              href={`/admin/visits${qs(page + 1)}`}
              className="rounded-xl border border-border bg-card px-3 py-1.5 transition-colors hover:bg-surface"
            >
              Susunod
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
