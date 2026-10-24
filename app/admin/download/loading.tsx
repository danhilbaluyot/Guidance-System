export default function DownloadLoading() {
  return (
    <div className="space-y-5">
      <div className="h-8 w-52 animate-pulse rounded-lg bg-border" />
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <div className="h-4 w-48 animate-pulse rounded bg-border" />
            <div className="h-3 w-72 animate-pulse rounded bg-border" />
          </div>
          <div className="ml-auto flex gap-3">
            <div className="h-10 w-40 animate-pulse rounded-xl bg-border" />
            <div className="h-10 w-40 animate-pulse rounded-xl bg-border" />
            <div className="h-10 w-36 animate-pulse rounded-xl bg-border" />
          </div>
        </div>
      </div>
    </div>
  );
}
