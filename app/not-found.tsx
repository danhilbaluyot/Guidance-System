import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col justify-center px-5 py-16 text-center">
      <div className="rounded-2xl border border-border bg-card p-10 shadow-sm">
        <p className="font-heading text-6xl font-bold text-primary/20">404</p>
        <h1 className="mt-4 text-xl font-semibold text-text">Hindi nahanap ang page</h1>
        <p className="mt-2 text-text-muted">
          Mukhang wala sa lugar ka. Bumalik sa simula.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/admin"
            className="rounded-xl bg-primary px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Bumalik sa dashboard
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-border px-5 py-2.5 font-medium text-text-muted transition-colors hover:bg-surface hover:text-text"
          >
            Kiosk check-in
          </Link>
        </div>
      </div>
    </main>
  );
}
