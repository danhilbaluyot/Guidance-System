"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({
  href,
  exact = false,
  icon,
  children,
}: {
  href: string;
  exact?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-text-muted hover:bg-surface hover:text-text"
      }`}
    >
      {icon && <span className="h-5 w-5 shrink-0">{icon}</span>}
      {children}
    </Link>
  );
}
