export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="h-7 w-36 animate-pulse rounded bg-surface" />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-5">
            <div className="h-3 w-20 rounded bg-surface" />
            <div className="mt-2 h-8 w-12 rounded bg-surface" />
          </div>
        ))}
      </div>

      <div className="animate-pulse rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="h-5 w-28 rounded bg-surface" />
          <div className="h-4 w-32 rounded bg-surface" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex gap-2">
                <div className="h-4 w-28 rounded bg-surface" />
                <div className="h-4 w-20 rounded bg-surface" />
              </div>
              <div className="h-4 w-12 rounded bg-surface" />
            </div>
          ))}
        </div>
      </div>

      <div className="animate-pulse rounded-2xl border border-border bg-card p-6">
        <div className="mb-5 h-5 w-56 rounded bg-surface" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-48 rounded bg-surface" />
              <div className="h-5 flex-1 rounded-full bg-surface" />
              <div className="h-4 w-6 rounded bg-surface" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
