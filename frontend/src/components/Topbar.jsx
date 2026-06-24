import { memo } from 'react'
import ThemeToggle from './ThemeToggle'
import ProfileMenu from './ProfileMenu'
import ExportMenu from './ExportMenu'

const Topbar = memo(function Topbar({
  title,
  archived,
  taskCount,
  tasks = [],
  theme,
  onToggleTheme,
  showInsights,
  onToggleInsights,
  showListView,
  onToggleView,
  onNewTask,
  onOpenLabelManager,
  session,
  profile,
  isAdmin,
  onOpenAccount,
  onOpenAdmin,
}) {
  return (
    <header className="relative z-10 flex items-center justify-between gap-3 border-b border-[var(--glass-border)] bg-[var(--glass)] px-4 py-3 backdrop-blur-xl backdrop-saturate-150 sm:px-6">
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
          onClick={onToggleView}
          title={showListView ? 'Kanban view' : 'List view'}
          aria-label="Toggle view"
          className={`btn btn-default !px-2 hidden sm:inline-flex ${showListView ? '!text-[var(--accent)] !border-[var(--accent)]' : ''}`}
        >
          {showListView ? (
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 2.75A.75.75 0 0 1 1.75 2h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 2.75m0 5A.75.75 0 0 1 1.75 7h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 7.75m0 5a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1-.75-.75" />
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M0 1.75A.75.75 0 0 1 .75 1h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75H.75A.75.75 0 0 1 0 6.25Zm0 8A.75.75 0 0 1 .75 9h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75H.75a.75.75 0 0 1-.75-.75Zm6-8A.75.75 0 0 1 6.75 1h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 6 1.75Zm0 8a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1-.75-.75Z" />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={onToggleInsights}
          title={showInsights ? 'Hide insights' : 'Show insights'}
          aria-label="Toggle insights"
          className={`btn btn-default !px-2 hidden xl:inline-flex ${showInsights ? '!text-[var(--accent)] !border-[var(--accent)]' : ''}`}
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 1.75a.75.75 0 0 0-1.5 0v11.5c0 .414.336.75.75.75h13.5a.75.75 0 0 0 0-1.5H1.5ZM4 9.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 4 9.5Zm3-2.75v5a.75.75 0 0 1-1.5 0v-5a.75.75 0 0 1 1.5 0Zm2.75-2a.75.75 0 0 1 .75.75v6.25a.75.75 0 0 1-1.5 0V5.5a.75.75 0 0 1 .75-.75Zm3.75-1a.75.75 0 0 0-1.5 0v8.5a.75.75 0 0 0 1.5 0v-8.5Z" /></svg>
        </button>
        {tasks.length > 0 && <ExportMenu tasks={tasks} />}
        {onOpenLabelManager && (
          <button type="button" onClick={onOpenLabelManager} className="btn btn-default !px-2" title="Manage labels">
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 2.75A.75.75 0 0 1 1.75 2h5.586c.464 0 .909.184 1.237.513l5.914 5.914a1.75 1.75 0 0 1 0 2.474l-4.586 4.586a1.75 1.75 0 0 1-2.474 0L1.513 9.573A1.75 1.75 0 0 1 1 8.336V2.75m2 .75v4.836l5.586 5.586 4.586-4.586L7.836 3.5H3Z" />
            </svg>
          </button>
        )}
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
})

export default Topbar
