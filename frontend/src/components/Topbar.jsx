import { memo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import ThemeToggle from './ThemeToggle'
import ProfileMenu from './ProfileMenu'
import ExportMenu from './ExportMenu'
import ProjectSettingsModal from './ProjectSettingsModal'

const VIEWS = [
  {
    id: 'kanban',
    label: 'Kanban',
    icon: 'M0 1.75A.75.75 0 0 1 .75 1h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75H.75A.75.75 0 0 1 0 6.25Zm0 8A.75.75 0 0 1 .75 9h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75H.75a.75.75 0 0 1-.75-.75Zm6-8A.75.75 0 0 1 6.75 1h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 6 1.75Zm0 8a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1-.75-.75Z',
  },
  {
    id: 'list',
    label: 'List',
    icon: 'M1 2.75A.75.75 0 0 1 1.75 2h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 2.75m0 5A.75.75 0 0 1 1.75 7h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 7.75m0 5a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1-.75-.75',
  },
  {
    id: 'gantt',
    label: 'Gantt',
    icon: 'M1.5 1.75A.75.75 0 0 0 0 1.75v11.5c0 .414.336.75.75.75h13.5a.75.75 0 0 0 0-1.5H1.5ZM4 9.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 4 9.5Zm3-2.75v5a.75.75 0 0 1-1.5 0v-5a.75.75 0 0 1 1.5 0Zm2.75-2a.75.75 0 0 1 .75.75v6.25a.75.75 0 0 1-1.5 0V5.5a.75.75 0 0 1 .75-.75Zm3.75-1a.75.75 0 0 0-1.5 0v8.5a.75.75 0 0 0 1.5 0v-8.5Z',
  },
  {
    id: 'sphere',
    label: '3D',
    icon: 'M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0M1.522 5.35a6.506 6.506 0 0 1 3.357-3.026A12.5 12.5 0 0 0 3.834 5.35Zm1.264 7.225A6.5 6.5 0 0 1 1.5 8.5a6.44 6.44 0 0 1 .069-.95q.463.083.934.145A12.6 12.6 0 0 0 2.44 10.5a12.5 12.5 0 0 0 .347 2.075ZM8 14.5a12.5 12.5 0 0 1-2.626-.278 12.5 12.5 0 0 1-1.113-3.584A12.7 12.7 0 0 0 8 10.91a12.7 12.7 0 0 0 3.74-.272 12.5 12.5 0 0 1-1.114 3.584A12.5 12.5 0 0 1 8 14.5m5.213-1.925a12.5 12.5 0 0 0 .347-2.075 12.6 12.6 0 0 0-.003-2.955q.471-.061.934-.145a6.44 6.44 0 0 1 .009.95 6.5 6.5 0 0 1-1.287 4.225M8 1.5a12.5 12.5 0 0 1 2.626.278 12.5 12.5 0 0 1 1.208 3.572c-1.23.178-2.468.268-3.707.268a25 25 0 0 1-3.707-.268A12.5 12.5 0 0 1 5.374 1.778 12.5 12.5 0 0 1 8 1.5',
  },
]

const Topbar = memo(function Topbar({
  title,
  archived,
  taskCount,
  tasks = [],
  theme,
  onToggleTheme,
  showInsights,
  onToggleInsights,
  activeView = 'kanban',
  onSetView,
  onNewTask,
  onOpenLabelManager,
  showFilters,
  onToggleFilters,
  filterCount = 0,
  session,
  profile,
  isAdmin,
  onOpenAccount,
  onOpenAdmin,
  onToggleMobileSidebar,
  project,
  onUpdateProject,
}) {
  const { t } = useTranslation()
  const [showProjectMenu, setShowProjectMenu] = useState(false)
  const [projectMenuTab, setProjectMenuTab] = useState(null)

  if (projectMenuTab) {
    return (
      <ProjectSettingsModal
        project={project}
        initialTab={projectMenuTab}
        onUpdate={async (id, fields) => { await onUpdateProject?.(id, fields); setProjectMenuTab(null) }}
        onClose={() => setProjectMenuTab(null)}
      />
    )
  }

  return (
    <header className="relative z-10 flex items-center justify-between gap-3 border-b border-[var(--glass-border)] bg-[var(--glass)] px-4 py-3 backdrop-blur-xl backdrop-saturate-150 sm:px-6">
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          type="button"
          aria-label="Open sidebar"
          title="Sidebar"
          onClick={onToggleMobileSidebar}
          className="btn btn-default !px-2 sidebar-toggle"
        >
          <span aria-hidden="true">☰</span>
        </button>
        {project ? (
          <div className="relative">
            <button onClick={() => setShowProjectMenu((s) => !s)} className="flex items-center gap-1.5 truncate rounded-lg border border-[var(--glass-border)] px-2.5 py-1.5 text-base font-semibold transition hover:bg-[var(--surface-hover)]">
              <span className="truncate">{title}</span>
              <svg className="h-3.5 w-3.5 flex-shrink-0 text-[var(--fg-subtle)]" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.427 7.427l3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427" />
              </svg>
            </button>
            {showProjectMenu && (
              <>
                <div className="fixed inset-0 z-30 sm:hidden" onClick={() => setShowProjectMenu(false)} />

                {/* Desktop: dropdown below button */}
                <div className="hidden sm:block absolute left-0 top-full z-40 mt-1.5 w-52 animate-pop-in rounded-xl border border-[var(--glass-border)] bg-[var(--bg)] p-2 shadow-xl">
                  <p className="mb-2 truncate px-1 text-sm font-semibold">{project.name}</p>
                  <button onClick={() => { setShowProjectMenu(false); setProjectMenuTab('settings') }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--fg)] transition hover:bg-[var(--surface-hover)]">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--surface-hover)]">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5 8a3 3 0 1 1 6 0 3 3 0 0 1-6 0m5.21-5.72-.664-.248-.412-1.344A1 1 0 0 0 8.19 0H7.81a1 1 0 0 0-.944.688l-.412 1.344-.664.248-1.362-.701a1 1 0 0 0-1.236.435l-.19.33a1 1 0 0 0 .16 1.22l.957.998-.006.712-.957.998a1 1 0 0 0-.16 1.22l.19.33a1 1 0 0 0 1.236.434l1.362-.7.664.247.412 1.345a1 1 0 0 0 .944.688h.38a1 1 0 0 0 .944-.688l.412-1.344.664-.248 1.362.701a1 1 0 0 0 1.236-.435l.19-.33a1 1 0 0 0-.16-1.22l-.957-.998v-.712l.957-.998A1 1 0 0 0 13.58 2.6l-.19-.33a1 1 0 0 0-1.236-.435Z" /></svg>
                    </span>
                    Edit Project
                  </button>
                  <button onClick={() => { setShowProjectMenu(false); setProjectMenuTab('members') }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--fg)] transition hover:bg-[var(--surface-hover)]">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--surface-hover)]">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M10.561 8.073a6 6 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6 6 0 0 1 3.431-5.142 4 4 0 1 1 5.123 0ZM8 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12.25 3a.75.75 0 0 1 .75.75V5h1.25a.75.75 0 0 1 0 1.5H13v1.25a.75.75 0 0 1-1.5 0V6.5h-1.25a.75.75 0 0 1 0-1.5H11.5V3.75a.75.75 0 0 1 .75-.75Z" /></svg>
                    </span>
                    Add Member
                  </button>
                </div>

                {/* Mobile: bottom sheet — portaled to body to avoid stacking context */}
                {createPortal(
                  <div className="block sm:hidden fixed inset-x-4 bottom-6 z-50 animate-slide-up rounded-2xl bg-[var(--bg)] p-5 shadow-xl">
                  <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--glass-border)]" />
                  <p className="mb-4 text-center text-sm font-semibold">{project.name}</p>
                  <button onClick={() => { setShowProjectMenu(false); setProjectMenuTab('settings') }} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[var(--fg)] transition hover:bg-[var(--surface-hover)]">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--surface-hover)]">
                      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5 8a3 3 0 1 1 6 0 3 3 0 0 1-6 0m5.21-5.72-.664-.248-.412-1.344A1 1 0 0 0 8.19 0H7.81a1 1 0 0 0-.944.688l-.412 1.344-.664.248-1.362-.701a1 1 0 0 0-1.236.435l-.19.33a1 1 0 0 0 .16 1.22l.957.998-.006.712-.957.998a1 1 0 0 0-.16 1.22l.19.33a1 1 0 0 0 1.236.434l1.362-.7.664.247.412 1.345a1 1 0 0 0 .944.688h.38a1 1 0 0 0 .944-.688l.412-1.344.664-.248 1.362.701a1 1 0 0 0 1.236-.435l.19-.33a1 1 0 0 0-.16-1.22l-.957-.998v-.712l.957-.998A1 1 0 0 0 13.58 2.6l-.19-.33a1 1 0 0 0-1.236-.435Z" /></svg>
                    </span>
                    Edit Project
                  </button>
                  <button onClick={() => { setShowProjectMenu(false); setProjectMenuTab('members') }} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[var(--fg)] transition hover:bg-[var(--surface-hover)]">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--surface-hover)]">
                      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M10.561 8.073a6 6 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6 6 0 0 1 3.431-5.142 4 4 0 1 1 5.123 0ZM8 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12.25 3a.75.75 0 0 1 .75.75V5h1.25a.75.75 0 0 1 0 1.5H13v1.25a.75.75 0 0 1-1.5 0V6.5h-1.25a.75.75 0 0 1 0-1.5H11.5V3.75a.75.75 0 0 1 .75-.75Z" /></svg>
                    </span>
                    Add Member
                  </button>
                  <button onClick={() => setShowProjectMenu(false)} className="btn btn-default mt-4 w-full justify-center">
                    Cancel
                  </button>
                  </div>,
                  document.body
                )}
              </>
            )}
          </div>
        ) : (
          <h1 className="truncate text-base font-semibold">{title}</h1>
        )}
        {archived && (
          <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--fg-muted)] max-sm:hidden">archived</span>
        )}
        <span className="rounded-full bg-[var(--surface-hover)] px-2 py-0.5 text-xs font-medium text-[var(--fg-muted)] max-sm:hidden">
          {taskCount}
        </span>
      </div>

      <div className="flex items-center gap-2.5">

        {/* View switcher (desktop only) */}
        <div className="hidden items-center rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] p-0.5 sm:flex">


          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onSetView?.(v.id)}
              title={`${v.label} view`}
              aria-label={`${v.label} view`}
              className={`rounded-md px-2 py-1 transition ${
                activeView === v.id
                  ? 'bg-[var(--surface)] text-[var(--accent)] shadow-sm'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                <path d={v.icon} />
              </svg>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onToggleInsights}
          title={showInsights ? 'Hide insights' : 'Show insights'}
          aria-label="Toggle insights"
          className={`btn btn-default !px-2 hidden xl:inline-flex ${showInsights ? '!text-[var(--accent)] !border-[var(--accent)]' : ''}`}
        >

          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 1.75a.75.75 0 0 0-1.5 0v11.5c0 .414.336.75.75.75h13.5a.75.75 0 0 0 0-1.5H1.5ZM4 9.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 4 9.5Zm3-2.75v5a.75.75 0 0 1-1.5 0v-5a.75.75 0 0 1 1.5 0Zm2.75-2a.75.75 0 0 1 .75.75v6.25a.75.75 0 0 1-1.5 0V5.5a.75.75 0 0 1 .75-.75Zm3.75-1a.75.75 0 0 0-1.5 0v8.5a.75.75 0 0 0 1.5 0v-8.5Z" /></svg>
        </button>

        {onToggleFilters && (
          <button
            type="button"
            onClick={onToggleFilters}
            title={t('filter.columns')}
            className={`btn btn-default !px-2 hidden sm:inline-flex ${showFilters || filterCount > 0 ? '!text-[var(--accent)] !border-[var(--accent)]' : ''}`}
          >

            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M.75 3h14.5a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1 0-1.5ZM3 7.75A.75.75 0 0 1 3.75 7h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 3 7.75m2.75 3.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5Z" />
            </svg>
            {filterCount > 0 && <span className="ml-1 text-xs">{filterCount}</span>}
          </button>
        )}

        {tasks.length > 0 && (
          <div className="hidden sm:block">
            <ExportMenu tasks={tasks} />
          </div>
        )}



        {onOpenLabelManager && (
          <button type="button" onClick={onOpenLabelManager} className="btn btn-default !px-2 hidden sm:inline-flex" title="Manage labels">

            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 2.75A.75.75 0 0 1 1.75 2h5.586c.464 0 .909.184 1.237.513l5.914 5.914a1.75 1.75 0 0 1 0 2.474l-4.586 4.586a1.75 1.75 0 0 1-2.474 0L1.513 9.573A1.75 1.75 0 0 1 1 8.336V2.75m2 .75v4.836l5.586 5.586 4.586-4.586L7.836 3.5H3Z" />
            </svg>
          </button>
        )}

        <ThemeToggle theme={theme} onToggle={onToggleTheme} />

        {isAdmin && (
          <button
            type="button"
            onClick={onNewTask}
            className="btn btn-primary"
            title={t('header.newTaskShort')}
            aria-label={t('header.newTaskShort')}
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z" /></svg>
            <span className="hidden sm:inline">{t('header.newTaskShort')}</span>
          </button>
        )}



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
