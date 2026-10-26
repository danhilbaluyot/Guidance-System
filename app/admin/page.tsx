import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PURPOSE_LABELS } from "@/lib/constants";
import { formatElapsed, startOfManilaDay, startOfManilaMonth, startOfManilaWeek } from "@/lib/dates";

export default async function Dashboard() {
  const supabase = await createClient();
  const monthStart = startOfManilaMonth();
  const todayStart = startOfManilaDay();

  const countSince = (since: string) =>
    supabase.from("visits").select("*", { count: "exact", head: true }).gte("time_in", since);

  const [today, week, month, waiting, inSession, , todayWaits, queuePreview, monthRows] =
    await Promise.all([
      countSince(todayStart),
      countSince(startOfManilaWeek()),
      countSince(monthStart),
      supabase.from("visits").select("*", { count: "exact", head: true }).eq("status", "waiting"),
      supabase
        .from("visits")
        .select("*", { count: "exact", head: true })
        .eq("status", "in_session"),
      supabase
        .from("visits")
        .select("*", { count: "exact", head: true })
        .eq("status", "no_show")
        .gte("time_in", monthStart),
      supabase
        .from("visits")
        .select("time_in, session_started_at")
        .gte("time_in", todayStart)
        .not("session_started_at", "is", null),
      supabase
        .from("visits")
        .select("id, student_name, time_in, purpose")
        .eq("status", "waiting")
        .order("time_in", { ascending: true })
        .limit(3),
      supabase.from("visits").select("purpose").gte("time_in", monthStart).limit(10000),
    ]);

  // Compute average wait time today
  const waitMs = (todayWaits.data ?? [])
    .map((r) => new Date(r.session_started_at!).getTime() - new Date(r.time_in).getTime())
    .filter((ms) => ms >= 0);
  const avgWaitMins =
    waitMs.length > 0
      ? Math.round(waitMs.reduce((a, b) => a + b, 0) / waitMs.length / 60000)
      : null;
  const avgWaitLabel =
    avgWaitMins === null
      ? "—"
      : avgWaitMins < 1
        ? "< 1 min"
        : avgWaitMins < 60
          ? `${avgWaitMins} min`
          : `${Math.floor(avgWaitMins / 60)} hr ${avgWaitMins % 60} min`;

  const byPurpose = new Map<string, number>();
  for (const r of monthRows.data ?? []) {
    byPurpose.set(r.purpose, (byPurpose.get(r.purpose) ?? 0) + 1);
  }
  const breakdown = [...byPurpose.entries()].sort((a, b) => b[1] - a[1]);
  const max = breakdown[0]?.[1] ?? 1;

  type StatCard = { label: string; value: number | string; style: "default" | "warning" | "session" | "plain" };
  const stats: StatCard[] = [
    { label: "Ngayon", value: today.count ?? 0, style: "default" },
    { label: "Linggong ito", value: week.count ?? 0, style: "default" },
    { label: "Buwan na ito", value: month.count ?? 0, style: "default" },
    { label: "Naghihintay", value: waiting.count ?? 0, style: "warning" },
    { label: "Nasa session", value: inSession.count ?? 0, style: "session" },
    { label: "Avg. hintay ngayon", value: avgWaitLabel, style: "plain" },
  ];

  const preview = (queuePreview.data ?? []) as { id: string; student_name: string; time_in: string; purpose: string }[];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-text">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => {
          const isLink = s.style === "warning";
          const card = (
            <div
              key={s.label}
              className={`rounded-2xl border p-5 transition-colors ${
                s.style === "warning"
                  ? "border-warning/30 bg-warning-light hover:border-warning/50"
                  : s.style === "session"
                    ? "border-primary/20 bg-primary-light"
                    : "border-border bg-card"
              }`}
            >
              <p className="text-sm text-text-muted">{s.label}</p>
              <p
                className={`mt-1 text-3xl font-bold ${
                  s.style === "warning"
                    ? "text-warning"
                    : s.style === "session"
                      ? "text-primary"
                      : s.style === "plain"
                        ? "text-text text-xl"
                        : "text-primary"
                }`}
              >
                {s.value}
              </p>
            </div>
          );
          return isLink ? (
            <Link key={s.label} href="/admin/queue">
              {card}
            </Link>
          ) : (
            <div key={s.label}>{card}</div>
          );
        })}
      </div>

      {/* Mini queue preview */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-text">Pila ngayon</h2>
          <Link
            href="/admin/queue"
            className="text-sm font-medium text-primary hover:underline"
          >
            Tingnan ang pila
          </Link>
        </div>
        {preview.length === 0 ? (
          <p className="text-sm text-text-muted">Walang naghihintay.</p>
        ) : (
          <ul className="divide-y divide-border">
            {preview.map((v) => (
              <li key={v.id} className="flex items-center justify-between py-2.5">
                <div>
                  <span className="font-medium text-text">{v.student_name}</span>
                  <span className="ml-2 text-sm text-text-muted">
                    {PURPOSE_LABELS[v.purpose] ?? v.purpose}
                  </span>
                </div>
                <span className="text-sm font-medium text-warning">
                  {formatElapsed(v.time_in)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-5 font-semibold text-text">Visits ngayong buwan ayon sa purpose</h2>
        {breakdown.length === 0 ? (
          <p className="text-text-muted">Wala pang records ngayong buwan.</p>
        ) : (
          <ul className="space-y-3">
            {breakdown.map(([purpose, n]) => (
              <li key={purpose} className="flex items-center gap-3">
                <span className="w-48 shrink-0 text-sm text-text-muted sm:w-56">
                  {PURPOSE_LABELS[purpose] ?? purpose}
                </span>
                <div className="h-5 flex-1 overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-5 rounded-full bg-primary transition-all"
                    style={{ width: `${(n / max) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-semibold text-text">{n}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link
        href="/admin/visits"
        className="inline-block rounded-xl bg-primary px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-dark"
      >
        Tingnan ang lahat ng visits
      </Link>
    </div>
  );
}
