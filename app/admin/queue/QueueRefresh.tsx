"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function QueueRefresh({
  children,
  intervalMs = 20_000,
}: {
  children: React.ReactNode;
  intervalMs?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return <>{children}</>;
}
