"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function MobileAdminMenu({
  brand,
  navigation,
  account,
}: {
  brand: React.ReactNode;
  navigation: React.ReactNode;
  account: React.ReactNode;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (detailsRef.current) detailsRef.current.open = false;
  }, [pathname]);

  return (
    <details ref={detailsRef} className="group border-b border-border bg-card md:hidden print:hidden">
      <summary aria-label="Buksan o isara ang admin menu" className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden [&::-webkit-details-marker]:hidden">
        {brand}
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-primary group-open:bg-primary-light" aria-hidden="true">
          <svg className="h-5 w-5 group-open:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
          <svg className="hidden h-5 w-5 group-open:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </span>
      </summary>
      <div onClickCapture={(event) => {
        if ((event.target as HTMLElement).closest("a") && detailsRef.current) detailsRef.current.open = false;
      }}>
        <div className="border-t border-border px-3 py-3">{navigation}</div>
        <div className="border-t border-border px-4 py-3">{account}</div>
      </div>
    </details>
  );
}
