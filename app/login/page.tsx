"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type LoginState } from "./actions";
import { inputClassLg } from "@/lib/ui";

export default function LoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-5 py-10">
      <Link href="/" className="mb-8 text-center">
        <span className="font-heading text-2xl font-bold text-primary">Guidance Office</span>
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="mb-6 text-xl font-bold text-text">Staff login</h1>
        <form action={action} className="space-y-4">
          {state.error && (
            <p className="rounded-xl bg-error-light p-3 text-sm text-error">{state.error}</p>
          )}
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-text-muted">Email</span>
            <input name="email" type="email" autoComplete="email" className={inputClassLg} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-text-muted">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className={inputClassLg}
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-primary px-4 py-2.5 font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {pending ? "Naglo-login…" : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
