"use client";

import { useActionState } from "react";
import { deleteVisit, type UpdateState } from "./actions";

export default function DeleteButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState<UpdateState, FormData>(deleteVisit, {});

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Sigurado ka bang buburahin ang record na ito? Hindi na ito mababawi.")) {
          e.preventDefault();
        }
      }}
      className="border-t border-border pt-6 print:hidden"
    >
      <input type="hidden" name="id" value={id} />
      {state.error && <p className="mb-3 rounded-xl bg-error-light p-3 text-sm text-error">{state.error}</p>}
      <button
        disabled={pending}
        className="rounded-xl border border-error/30 px-4 py-2 text-sm font-medium text-error transition-colors hover:bg-error-light disabled:opacity-60"
      >
        {pending ? "Binubura…" : "Burahin ang record (Admin)"}
      </button>
    </form>
  );
}
