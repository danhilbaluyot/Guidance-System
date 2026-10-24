"use client";

import { useActionState } from "react";
import { startSession, type QueueActionState } from "./actions";

export default function StartSessionButton({ visitId }: { visitId: string }) {
  const [state, action, pending] = useActionState<QueueActionState, FormData>(startSession, {});

  return (
    <form action={action}>
      <input type="hidden" name="id" value={visitId} />
      {state.error && (
        <p className="mb-2 rounded-lg bg-error-light p-2 text-xs text-error">{state.error}</p>
      )}
      <button
        disabled={pending}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? "Sinisimulan…" : "Simulan ang session"}
      </button>
    </form>
  );
}
