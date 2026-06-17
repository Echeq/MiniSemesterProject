import ThemeToggle from './ThemeToggle'
import ProfileMenu from './ProfileMenu'

export default function Topbar({
  title,
  archived,
  taskCount,
  theme,
  onToggleTheme,
  showInsights,
  onToggleInsights,
  onNewTask,
  session,
  profile,
  isAdmin,
  onOpenAccount,
  onOpenAdmin,
}) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-[var(--glass-border)] bg-[var(--glass)] px-4 py-3 backdrop-blur-xl backdrop-saturate-150 sm:px-6">
      <div className="flex min-w-0 items-center gap-2.5">
        <h1 className="truncate text-base font-semibold">{title}</h1>
        {archived && (
          <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--fg-muted)]">archived</span>
        )}
        <span className="rounded-full bg-[var(--surface-hover)] px-2 py-0.5 text-xs font-medium text-[var(--fg-muted)]">
          {taskCount}
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onToggleInsights}
          title={showInsights ? 'Hide insights' : 'Show insights'}
          aria-label="Toggle insights"
          className={`btn btn-default !px-2 hidden xl:inline-flex ${showInsights ? '!text-[var(--accent)] !border-[var(--accent)]' : ''}`}
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 1.75a.75.75 0 0 0-1.5 0v11.5c0 .414.336.75.75.75h13.5a.75.75 0 0 0 0-1.5H1.5ZM4 9.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 4 9.5Zm3-2.75v5a.75.75 0 0 1-1.5 0v-5a.75.75 0 0 1 1.5 0Zm2.75-2a.75.75 0 0 1 .75.75v6.25a.75.75 0 0 1-1.5 0V5.5a.75.75 0 0 1 .75-.75Zm3.75-1a.75.75 0 0 0-1.5 0v8.5a.75.75 0 0 0 1.5 0v-8.5Z" /></svg>
        </button>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <button type="button" onClick={onNewTask} className="btn btn-primary">
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z" /></svg>
          <span className="hidden sm:inline">New task</span>
        </button>
        <ProfileMenu
          profile={profile}
          email={session.user.email}
          isAdmin={isAdmin}
          onOpenAccount={onOpenAccount}
          onOpenAdmin={onOpenAdmin}
        />
      </div>
    </header>
  )
}
