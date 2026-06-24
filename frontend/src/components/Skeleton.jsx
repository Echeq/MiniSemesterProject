export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-[var(--glass-border)] bg-[var(--card)] p-3 shadow-[var(--shadow-sm)]">
      <div className="mb-2 h-3 w-16 rounded bg-[var(--surface-hover)]" />
      <div className="mb-2 h-4 w-full rounded bg-[var(--surface-hover)]" />
      <div className="mb-1 h-3 w-3/4 rounded bg-[var(--surface-hover)]" />
      <div className="mt-2.5 flex items-center gap-2 border-t border-[var(--border-muted)] pt-2.5">
        <div className="h-5 w-16 rounded-full bg-[var(--surface-hover)]" />
        <div className="ml-auto h-6 w-6 rounded-full bg-[var(--surface-hover)]" />
      </div>
    </div>
  )
}

export function SidebarStatsSkeleton() {
  return (
    <div className="animate-pulse space-y-1 p-3">
      <div className="mb-1 h-3 w-12 rounded bg-[var(--surface-hover)]" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
          <div className="h-4 w-4 rounded bg-[var(--surface-hover)]" />
          <div className="h-3 flex-1 rounded bg-[var(--surface-hover)]" />
        </div>
      ))}
      <div className="mb-1 mt-3 h-3 w-16 rounded bg-[var(--surface-hover)]" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
          <div className="h-3 w-3 rounded bg-[var(--surface-hover)]" />
          <div className="h-3 flex-1 rounded bg-[var(--surface-hover)]" />
        </div>
      ))}
    </div>
  )
}
