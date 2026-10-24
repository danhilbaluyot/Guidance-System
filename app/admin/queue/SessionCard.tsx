"use client";

import { useActionState, useState, useTransition } from "react";
import { markDone, markNoShow, type QueueActionState } from "./actions";
import { OUTCOMES, FOLLOW_UP_OUTCOMES } from "@/lib/constants";
import { inputClass } from "@/lib/ui";

export default function SessionCard({
  visit,
}: {
  visit: {
    id: string;
    studentName: string;
    studentNumber: string;
    purposeLabel: string;
    counselorName: string | null;
    sessionDuration: string;
  };
}) {
  const [expanded, setExpanded] = useState(false);
  const [outcome, setOutcome] = useState("");
  const [doneState, doneAction] = useActionState<QueueActionState, FormData>(markDone, {});
  const [, startTransition] = useTransition();
  const [noShowState, noShowAction, noShowPending] = useActionState<QueueActionState, FormData>(
    markNoShow,
    {},
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3">
        <p className="font-medium text-text">{visit.studentName}</p>
        <p className="text-sm text-text-muted">{visit.studentNumber}</p>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-muted">
        <span>{visit.purposeLabel}</span>
        <span>·</span>
        <span className="text-primary font-medium">{visit.sessionDuration}</span>
        {visit.counselorName && (
          <>
            <span>·</span>
            <span>{visit.counselorName}</span>
          </>
        )}
      </div>

      {(doneState.error || noShowState.error) && (
        <p className="mb-3 rounded-lg bg-error-light p-2 text-xs text-error">
          {doneState.error || noShowState.error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            expanded
              ? "bg-primary/10 text-primary"
              : "bg-primary text-white hover:bg-primary-dark"
          }`}
        >
          Tapos na
        </button>
        <form
          action={noShowAction}
          onSubmit={(e) => {
            if (!confirm("I-mark ba bilang No Show ang estudyanteng ito?")) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={visit.id} />
          <button
            disabled={noShowPending}
            className="rounded-xl border border-border px-4 py-2 text-sm text-text-muted transition-colors hover:border-error/30 hover:text-error disabled:opacity-60"
          >
            {noShowPending ? "…" : "No show"}
          </button>
        </form>
      </div>

      {expanded && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            startTransition(() => doneAction(data));
          }}
          className="mt-4 space-y-3 border-t border-border pt-4"
        >
          <input type="hidden" name="id" value={visit.id} />

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-text-muted">Outcome</span>
            <select
              name="outcome"
              required
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Pumili ng outcome…
              </option>
              {OUTCOMES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          {outcome && FOLLOW_UP_OUTCOMES.includes(outcome) && (
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-text-muted">
                Follow-up date (optional)
              </span>
              <input type="date" name="follow_up_date" className={inputClass} />
            </label>
          )}

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-text-muted">Notes (optional)</span>
            <textarea name="counselor_notes" rows={3} className={inputClass} />
          </label>

          <button className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark">
            I-save
          </button>
        </form>
      )}
    </div>
  );
}
