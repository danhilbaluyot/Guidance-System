import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OUTCOME_LABELS, PURPOSE_LABELS, STATUS_LABELS, type StatusValue, type Visit } from "@/lib/constants";
import { formatDate, formatDateTime, formatDuration } from "@/lib/dates";
import { getCurrentProfile } from "@/lib/auth";
import { statusBadge } from "@/lib/ui";
import DeleteButton from "./DeleteButton";
import EditVisitButton from "@/components/EditVisitButton";

export default async function VisitDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { data } = await supabase.from("visits").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const v = data as Visit;

  const { data: handler } = v.handled_by
    ? await supabase.from("profiles").select("full_name").eq("id", v.handled_by).maybeSingle()
    : { data: null };
  // A no-show never started a session, so their wait ends when they left.
  const waitEnd = v.session_started_at ?? (v.status === "no_show" ? v.time_out : null);

  const rows: [string, string | null, "badge" | "text"][] = [
    ["Name", v.student_name, "text"],
    ["Student number", v.student_number, "text"],
    ["Grade / Year", v.grade_level, "text"],
    ["Section / Course", v.section, "text"],
    [
      "Purpose",
      PURPOSE_LABELS[v.purpose] + (v.purpose === "others" && v.purpose_other ? `: ${v.purpose_other}` : ""),
      "text",
    ],
    ["Detalye", v.details || "—", "text"],
    ["Time in", formatDateTime(v.time_in), "text"],
    ["Time out", formatDateTime(v.time_out), "text"],
    ["Status", v.status, "badge"],
    ["Outcome", v.outcome ? OUTCOME_LABELS[v.outcome] : "—", "text"],
    ["Follow-up date", formatDate(v.follow_up_date), "text"],
    ["Hinawakan ni", handler?.full_name ?? "—", "text"],
    ["Tagal ng paghihintay", formatDuration(v.time_in, waitEnd), "text"],
    ["Tagal ng session", formatDuration(v.session_started_at, v.time_out), "text"],
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/admin/visits" className="text-sm text-text-muted transition-colors hover:text-primary print:hidden">
        ← Bumalik sa visits
      </Link>
      <h1 className="text-2xl font-bold text-text">Visit record</h1>

      <dl className="divide-y divide-border rounded-2xl border border-border bg-card">
        {rows.map(([k, val, type]) => (
          <div key={k} className="flex gap-4 px-5 py-3.5">
            <dt className="w-40 shrink-0 text-sm text-text-muted">{k}</dt>
            <dd className="whitespace-pre-wrap text-text">
              {type === "badge" && val ? (
                <span className={statusBadge(val as StatusValue)}>
                  {STATUS_LABELS[val as StatusValue] ?? val}
                </span>
              ) : (
                val
              )}
            </dd>
          </div>
        ))}
      </dl>

      <Link
        href={`/admin/students/${encodeURIComponent(v.student_number)}`}
        className="inline-block text-sm font-medium text-primary hover:underline print:hidden"
      >
        Tingnan ang lahat ng visits ni {v.student_name}
      </Link>

      {profile?.role === "counselor" && (
        <div className="print:hidden">
          <EditVisitButton
            visit={v}
            className="rounded-xl bg-primary px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-dark"
          />
        </div>
      )}

      {v.counselor_notes && (
        <section>
          <h2 className="mb-2 text-sm font-medium text-text-muted">Counselor notes</h2>
          <p className="whitespace-pre-wrap rounded-2xl border border-border bg-card p-5 text-text">
            {v.counselor_notes}
          </p>
        </section>
      )}

      {profile?.role === "admin" && <DeleteButton id={v.id} />}
    </div>
  );
}
