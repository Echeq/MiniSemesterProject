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

export function DashboardSkeleton() {
  const card = 'rounded-lg border border-[var(--glass-border)] bg-[var(--card)] p-4'
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4 sm:p-6 animate-pulse">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={card}>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[var(--surface-hover)]" />
              <div className="flex flex-col gap-1.5">
                <div className="h-6 w-12 rounded bg-[var(--surface-hover)]" />
                <div className="h-3 w-16 rounded bg-[var(--surface-hover)]" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={card}>
          <div className="mb-3 h-4 w-24 rounded bg-[var(--surface-hover)]" />
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-full border-[6px] border-[var(--glass-border)]" />
            <div className="space-y-1.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-3 w-28 rounded bg-[var(--surface-hover)]" />
              ))}
              <div className="h-3 w-20 rounded bg-[var(--surface-hover)]" />
            </div>
          </div>
        </div>
        <div className={card}>
          <div className="mb-3 h-4 w-16 rounded bg-[var(--surface-hover)]" />
          <div className="h-3 w-48 rounded bg-[var(--surface-hover)]" />
          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-7 w-7 rounded-full bg-[var(--surface-hover)]" />
            ))}
          </div>
          <div className="mt-3 h-3 w-36 rounded bg-[var(--surface-hover)]" />
        </div>
      </div>
      <div className="h-4" />
    </div>
  )
}
