import Link from "next/link";
import CheckInForm from "@/components/CheckInForm";
import { formatManilaDateFull } from "@/lib/dates";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Warm gradient header strip */}
      <div className="bg-gradient-to-b from-primary-light to-surface px-5 pt-12 pb-2 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="mb-2 text-sm font-medium text-primary/70">
            {formatManilaDateFull()}
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            Guidance Office
          </h1>
          <p className="mt-3 text-lg text-text-muted">
            Paki-fill up ang form bago pumasok. Walang papel na kailangan.
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="mx-auto w-full max-w-2xl flex-1 px-5 py-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <CheckInForm />
        </div>

        <footer className="mt-8 text-center">
          <Link
            href="/login"
            className="text-sm text-text-muted transition-colors hover:text-primary"
          >
            Staff login
          </Link>
        </footer>
      </div>
    </main>
  );
}
