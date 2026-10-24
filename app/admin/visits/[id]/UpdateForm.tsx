"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import {
  FOLLOW_UP_OUTCOMES,
  OUTCOMES,
  STATUSES,
  type OutcomeValue,
  type StatusValue,
} from "@/lib/constants";
import { updateVisit, type UpdateState } from "./actions";
import { inputClass } from "@/lib/ui";

export default function UpdateForm({
  id,
  status: initialStatus,
  outcome: initialOutcome,
  followUpDate,
  notes,
  onSaved,
}: {
  id: string;
  status: StatusValue;
  outcome: OutcomeValue | null;
  followUpDate: string | null;
  notes: string | null;
  onSaved?: () => void;
}) {
  const [state, action, pending] = useActionState<UpdateState, FormData>(updateVisit, {});
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (state.ok) onSaved?.();
  }, [state, onSaved]);
  const [status, setStatus] = useState<StatusValue>(initialStatus);
  const [outcome, setOutcome] = useState<string>(initialOutcome ?? "");

  const isDone = status === "done";
  const needsFollowUp = isDone && FOLLOW_UP_OUTCOMES.includes(outcome);

  return (
    // Not `action={action}`: React would reset the form after each submit, which puts the
    // controlled selects out of sync with state (e.g. shows "Waiting" while Outcome is visible).
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="space-y-4 print:hidden"
    >
      <input type="hidden" name="id" value={id} />
      {state.error && <p className="rounded-xl bg-error-light p-3 text-sm text-error">{state.error}</p>}

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-text-muted">Status</span>
        <select
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusValue)}
          className={inputClass}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <span className="mt-1.5 block text-xs text-text-muted">
          Ang &quot;Done&quot; at &quot;Umalis / No show&quot; ay awtomatikong nagre-record ng time-out.
          Gamitin ang &quot;No show&quot; kung umalis ang estudyante bago naasikaso.
        </span>
      </label>

      {isDone && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-text-muted">Outcome (required)</span>
          <select
            name="outcome"
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
      )}

      {needsFollowUp && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-text-muted">
            Follow-up date (optional)
          </span>
          <input type="date" name="follow_up_date" defaultValue={followUpDate ?? ""} className={inputClass} />
        </label>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-text-muted">Counselor notes</span>
        <textarea
          name="counselor_notes"
          defaultValue={notes ?? ""}
          rows={6}
          className={inputClass}
        />
      </label>

      <button
        disabled={pending}
        className="rounded-xl bg-primary px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? "Sine-save…" : "I-save"}
      </button>
    </form>
  );
}
