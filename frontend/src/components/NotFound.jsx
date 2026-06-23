const ICON =
  'M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0m7.25-1.75v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0M9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0'

export default function NotFound() {
  return (
    <div className="flex min-h-full items-center justify-center px-4">
      <div className="glass-strong w-full max-w-md rounded-2xl p-8 text-center shadow-[var(--shadow-md)]">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ color: 'var(--fg-muted)', background: 'var(--glass-border)' }}>
          <svg className="h-6 w-6" viewBox="0 0 16 16" fill="currentColor"><path d={ICON} /></svg>
        </span>
        <h1 className="mt-3 text-5xl font-bold text-[var(--fg)]">404</h1>
        <p className="mt-2 text-sm text-[var(--fg-muted)]">This page doesn&apos;t exist or has been moved.</p>
        <a
          href="/"
          className="mt-5 inline-block rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          style={{ background: 'var(--accent)' }}
        >
          Back to home
        </a>
      </div>
    </div>
  )
}
