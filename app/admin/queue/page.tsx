import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { PURPOSE_LABELS, type Visit } from "@/lib/constants";
import { formatElapsed } from "@/lib/dates";
import QueueRefresh from "./QueueRefresh";
import StartSessionButton from "./StartSessionButton";
import SessionCard from "./SessionCard";

export default async function QueuePage() {
  const profile = await getCurrentProfile();
  const isCounselor = profile?.role === "counselor";

  const supabase = await createClient();
  const [waitingRes, inSessionRes, profilesRes] = await Promise.all([
    supabase
      .from("visits")
      .select("*")
      .eq("status", "waiting")
      .order("time_in", { ascending: true }),
    supabase
      .from("visits")
      .select("*")
      .eq("status", "in_session")
      .order("session_started_at", { ascending: true }),
    supabase.from("profiles").select("id, full_name"),
  ]);

  const waitingVisits = (waitingRes.data ?? []) as Visit[];
  const inSessionVisits = (inSessionRes.data ?? []) as Visit[];
  const staffName = new Map(
    (profilesRes.data ?? []).map((p) => [p.id as string, p.full_name as string]),
  );

  return (
    <QueueRefresh>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-text">Pila</h1>
          <p className="text-sm text-text-muted">
            {waitingVisits.length} naghihintay · {inSessionVisits.length} nasa session
          </p>
        </div>

        {/* Naghihintay section */}
        <section>
          <h2 className="mb-4 font-semibold text-text">Naghihintay</h2>
          {waitingVisits.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-12 text-center">
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
                  d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
                />
              </svg>
              <p className="mt-3 font-medium text-text-muted">Walang naghihintay</p>
              <p className="mt-1 text-sm text-text-muted/70">
                Ang mga bagong check-in ay lalabas dito.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {waitingVisits.map((v) => (
                <div key={v.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="mb-1">
                    <Link
                      href={`/admin/visits/${v.id}`}
                      className="font-medium text-text hover:text-primary hover:underline"
                    >
                      {v.student_name}
                    </Link>
                    <p className="text-sm text-text-muted">{v.student_number}</p>
                  </div>
                  <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-muted">
                    <span>{PURPOSE_LABELS[v.purpose]}</span>
                    <span>·</span>
                    <span>
                      {v.grade_level} · {v.section}
                    </span>
                  </div>
                  <div className="mb-4 flex items-center gap-2 text-sm">
                    <svg
                      className="h-4 w-4 text-warning"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium text-warning">{formatElapsed(v.time_in)}</span>
                  </div>
                  {isCounselor && <StartSessionButton visitId={v.id} />}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Nasa session section */}
        <section>
          <h2 className="mb-4 font-semibold text-text">Nasa session</h2>
          {inSessionVisits.length === 0 ? (
            <p className="text-text-muted">Walang nasa session ngayon.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {inSessionVisits.map((v) => (
                <SessionCard
                  key={v.id}
                  visit={{
                    id: v.id,
                    studentName: v.student_name,
                    studentNumber: v.student_number,
                    purposeLabel:
                      PURPOSE_LABELS[v.purpose] +
                      (v.purpose === "others" && v.purpose_other ? `: ${v.purpose_other}` : ""),
                    counselorName: v.handled_by ? (staffName.get(v.handled_by) ?? null) : null,
                    sessionDuration: formatElapsed(v.session_started_at),
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </QueueRefresh>
  );
}
