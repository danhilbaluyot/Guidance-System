"use client";

import { useState } from "react";
import { inputClass } from "@/lib/ui";

export default function ExportBar() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const exportHref = () => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString();
    return `/admin/export${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-text">I-download ang Records</h2>
          <p className="text-xs text-text-muted">Pumili ng petsa bago i-download. Kung walang pinili, lahat ng records ang mado-download.</p>
        </div>

        <div className="flex flex-wrap items-end gap-3 ml-auto">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-text-muted">Mula</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={`${inputClass} w-40`}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-text-muted">Hanggang</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={`${inputClass} w-40`}
            />
          </label>
          <a
            href={exportHref()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            I-download CSV
          </a>
          {(from || to) && (
            <button
              type="button"
              onClick={() => { setFrom(""); setTo(""); }}
              className="px-2 py-2 text-xs text-text-muted transition-colors hover:text-text"
            >
              I-clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
