export default function SearchLoading() {
  return (
    <div className="space-y-5">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-border" />
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="h-4 w-56 animate-pulse rounded bg-border" />
        <div className="mt-4 flex flex-wrap gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-40 animate-pulse rounded-xl bg-border" />
          ))}
        </div>
      </div>
    </div>
  );
}
