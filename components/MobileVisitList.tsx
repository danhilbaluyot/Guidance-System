import Link from "next/link";
import EditVisitButton from "@/components/EditVisitButton";
import { OUTCOME_LABELS, PURPOSE_LABELS, STATUS_LABELS, type StatusValue, type Visit } from "@/lib/constants";
import { formatDateTime } from "@/lib/dates";
import { statusBadge } from "@/lib/ui";

export default function MobileVisitList({
  visits,
  canEdit,
  emptyMessage,
}: {
  visits: Visit[];
  canEdit: boolean;
  emptyMessage: string;
}) {
  return (
    <div className="space-y-3 md:hidden print:hidden">
      {visits.length === 0 && (
        <p className="rounded-2xl border border-border bg-card px-4 py-10 text-center text-sm text-text-muted">
          {emptyMessage}
        </p>
      )}
      {visits.map((visit) => (
        <article key={visit.id} className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={`/admin/visits/${visit.id}`} className="break-words font-semibold text-primary hover:underline">
                {visit.student_name}
              </Link>
              <Link href={`/admin/students/${encodeURIComponent(visit.student_number)}`} className="block break-all text-sm text-text-muted hover:underline">
                {visit.student_number}
              </Link>
            </div>
            <span className={statusBadge(visit.status as StatusValue)}>{STATUS_LABELS[visit.status]}</span>
          </div>
          <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-sm">
            <dt className="text-text-muted">Time in</dt>
            <dd className="text-right text-text">{formatDateTime(visit.time_in)}</dd>
            <dt className="text-text-muted">Grade / Section</dt>
            <dd className="break-words text-right text-text">{visit.grade_level} · {visit.section}</dd>
            <dt className="text-text-muted">Purpose</dt>
            <dd className="break-words text-right text-text">
              {PURPOSE_LABELS[visit.purpose]}
              {visit.purpose === "others" && visit.purpose_other ? `: ${visit.purpose_other}` : ""}
            </dd>
            {visit.outcome && (
              <>
                <dt className="text-text-muted">Outcome</dt>
                <dd className="break-words text-right text-text">{OUTCOME_LABELS[visit.outcome]}</dd>
              </>
            )}
          </dl>
          {canEdit && <div className="mt-4 border-t border-border pt-3"><EditVisitButton visit={visit} /></div>}
        </article>
      ))}
    </div>
  );
}
