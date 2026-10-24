export default function VisitsLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="h-7 w-24 animate-pulse rounded bg-surface" />
        <div className="h-9 w-28 animate-pulse rounded-xl bg-surface" />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex flex-wrap gap-3">
        <div className="h-9 w-56 animate-pulse rounded-xl bg-surface" />
        <div className="h-9 w-40 animate-pulse rounded-xl bg-surface" />
        <div className="h-9 w-36 animate-pulse rounded-xl bg-surface" />
        <div className="h-9 w-40 animate-pulse rounded-xl bg-surface" />
        <div className="h-9 w-32 animate-pulse rounded-xl bg-surface" />
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* Header */}
        <div className="flex gap-4 border-b border-border bg-surface px-4 py-3">
          {[16, 16, 24, 20, 24, 20, 16, 16].map((w, i) => (
            <div key={i} className={`h-4 w-${w} rounded bg-border/50`} style={{ width: `${w * 4}px` }} />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-t border-border px-4 py-3.5 animate-pulse"
          >
            <div className="h-4 w-28 rounded bg-surface" />
            <div className="h-4 w-28 rounded bg-surface" />
            <div className="h-4 w-32 rounded bg-surface" />
            <div className="h-4 w-20 rounded bg-surface" />
            <div className="h-4 w-28 rounded bg-surface" />
            <div className="h-4 w-24 rounded bg-surface" />
            <div className="h-5 w-16 rounded-full bg-surface" />
            <div className="h-4 w-16 rounded bg-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
