function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 space-y-2">
        <div className="h-4 w-32 rounded bg-surface" />
        <div className="h-3 w-24 rounded bg-surface" />
      </div>
      <div className="mb-4 flex gap-2">
        <div className="h-3 w-20 rounded bg-surface" />
        <div className="h-3 w-28 rounded bg-surface" />
      </div>
      <div className="h-10 w-full rounded-xl bg-surface" />
    </div>
  );
}

export default function QueueLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="h-7 w-24 animate-pulse rounded bg-surface" />
        <div className="h-4 w-48 animate-pulse rounded bg-surface" />
      </div>

      <section>
        <div className="mb-4 h-5 w-32 animate-pulse rounded bg-surface" />
        <div className="grid gap-4 sm:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </section>

      <section>
        <div className="mb-4 h-5 w-32 animate-pulse rounded bg-surface" />
        <div className="grid gap-4 sm:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </section>
    </div>
  );
}
