import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PURPOSE_LABELS, STATUS_LABELS, type StatusValue, type Visit } from "@/lib/constants";
import { formatDateTime } from "@/lib/dates";
import { statusBadge } from "@/lib/ui";

export default async function StudentHistory({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const studentNumber = decodeURIComponent(number);

  const supabase = await createClient();
  const { data } = await supabase
    .from("visits")
    .select("*")
    .eq("student_number", studentNumber)
    .order("time_in", { ascending: false });

  const visits = (data ?? []) as Visit[];
  const latest = visits[0];

  return (
    <div className="space-y-5">
      <Link href="/admin/visits" className="text-sm text-text-muted transition-colors hover:text-primary print:hidden">
        ← Bumalik sa visits
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-text">{latest?.student_name ?? "Student"}</h1>
        <p className="mt-1 text-text-muted">
          {studentNumber}
          {latest && ` · ${latest.grade_level} · ${latest.section}`} · {visits.length} visit
          {visits.length === 1 ? "" : "s"}
        </p>
      </div>

      <ul className="space-y-3">
        {visits.map((v) => (
          <li key={v.id} className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/20">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link href={`/admin/visits/${v.id}`} className="font-medium text-primary hover:underline">
                {PURPOSE_LABELS[v.purpose]}
                {v.purpose === "others" && v.purpose_other ? `: ${v.purpose_other}` : ""}
              </Link>
              <div className="flex items-center gap-2">
                <span className={statusBadge(v.status as StatusValue)}>
                  {STATUS_LABELS[v.status]}
                </span>
                <span className="text-sm text-text-muted">{formatDateTime(v.time_in)}</span>
              </div>
            </div>
            {v.counselor_notes && (
              <p className="mt-3 whitespace-pre-wrap rounded-xl bg-surface p-3 text-sm text-text-muted">
                {v.counselor_notes}
              </p>
            )}
          </li>
        ))}
        {visits.length === 0 && (
          <li className="py-8 text-center text-text-muted">
            Walang records para sa student number na ito.
          </li>
        )}
      </ul>
    </div>
  );
}
