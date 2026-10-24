"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { submitCheckIn, type CheckInState } from "@/app/actions";
import { PURPOSES } from "@/lib/constants";
import { inputClassLg } from "@/lib/ui";

const initialState: CheckInState = { ok: false };
const RESET_AFTER_MS = 6000;

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-text-muted">{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm text-error">{error}</span>}
    </label>
  );
}

function Form({ onDone }: { onDone: () => void }) {
  const [state, formAction, pending] = useActionState(submitCheckIn, initialState);
  const [, startTransition] = useTransition();
  const [purpose, setPurpose] = useState(state.values?.purpose ?? "");

  useEffect(() => {
    if (!state.ok) return;
    const t = setTimeout(onDone, RESET_AFTER_MS);
    return () => clearTimeout(t);
  }, [state.ok, onDone]);

  if (state.ok) {
    return (
      <div className="rounded-2xl bg-success-light p-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 animate-scale-in">
          <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-2xl font-semibold text-success sm:text-3xl">
          Salamat! Naitala na ang visit mo.
        </p>
        <p className="mt-2 text-text-muted">
          Pakihintay ang guidance staff. Magre-reset ang form para sa susunod na estudyante.
        </p>
        <button
          type="button"
          onClick={onDone}
          className="mt-6 rounded-xl bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
        >
          Bagong entry
        </button>
      </div>
    );
  }

  const e = state.errors ?? {};
  const v = state.values ?? {};

  return (
    // Not `action={formAction}`: React would reset the form after a failed submit, which wipes
    // what the student typed and desyncs the controlled Purpose select.
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        const data = new FormData(ev.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="space-y-5"
    >
      {state.message && (
        <p className="rounded-xl bg-error-light p-3 text-error">{state.message}</p>
      )}

      <Field label="Name" error={e.student_name}>
        <input
          name="student_name"
          defaultValue={v.student_name}
          autoComplete="off"
          placeholder="Apelyido, Pangalan"
          className={inputClassLg}
        />
      </Field>

      <Field label="Student Number" error={e.student_number}>
        <input
          name="student_number"
          defaultValue={v.student_number}
          autoComplete="off"
          inputMode="text"
          className={inputClassLg}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Grade / Year level" error={e.grade_level}>
          <input
            name="grade_level"
            defaultValue={v.grade_level}
            autoComplete="off"
            placeholder="hal. Grade 11 / 2nd Year"
            className={inputClassLg}
          />
        </Field>
        <Field label="Section / Course" error={e.section}>
          <input
            name="section"
            defaultValue={v.section}
            autoComplete="off"
            placeholder="hal. STEM-A / BSIT"
            className={inputClassLg}
          />
        </Field>
      </div>

      <Field label="Purpose" error={e.purpose}>
        <select
          name="purpose"
          value={purpose}
          onChange={(ev) => setPurpose(ev.target.value)}
          className={inputClassLg}
        >
          <option value="" disabled>
            Pumili ng purpose…
          </option>
          {PURPOSES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </Field>

      {purpose === "others" && (
        <Field label="Ano ang purpose?" error={e.purpose_other}>
          <input
            name="purpose_other"
            defaultValue={v.purpose_other}
            autoComplete="off"
            className={inputClassLg}
          />
        </Field>
      )}

      <Field label="Karagdagang detalye (optional)" error={e.details}>
        <textarea
          name="details"
          defaultValue={v.details}
          rows={3}
          className={inputClassLg}
        />
      </Field>

      {/* Honeypot for bots; hidden from real users */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-primary px-6 py-4 text-lg font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? "Sine-save…" : "Mag-check in"}
      </button>
    </form>
  );
}

export default function CheckInForm() {
  const [formKey, setFormKey] = useState(0);
  return <Form key={formKey} onDone={() => setFormKey((k) => k + 1)} />;
}
