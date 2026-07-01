import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ThemeToggle from './ThemeToggle'
import ProfileMenu from './ProfileMenu'
import ExportMenu from './ExportMenu'
import NotificationBell from './NotificationBell'
import ProjectMenu from './ProjectMenu'
import ProjectInfoModal from './ProjectInfoModal'

const VIEWS = [
  {
    id: 'kanban',
    labelKey: 'kanban',
    icon: 'M0 1.75A.75.75 0 0 1 .75 1h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75H.75A.75.75 0 0 1 0 6.25Zm0 8A.75.75 0 0 1 .75 9h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75H.75a.75.75 0 0 1-.75-.75Zm6-8A.75.75 0 0 1 6.75 1h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 6 1.75Zm0 8a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1-.75-.75Z',
  },
  {
    id: 'list',
    labelKey: 'list',
    icon: 'M1 2.75A.75.75 0 0 1 1.75 2h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 2.75m0 5A.75.75 0 0 1 1.75 7h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 7.75m0 5a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1-.75-.75',
  },
  {
    id: 'gantt',
    labelKey: 'gantt',
    icon: 'M1.5 1.75A.75.75 0 0 0 0 1.75v11.5c0 .414.336.75.75.75h13.5a.75.75 0 0 0 0-1.5H1.5ZM4 9.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 4 9.5Zm3-2.75v5a.75.75 0 0 1-1.5 0v-5a.75.75 0 0 1 1.5 0Zm2.75-2a.75.75 0 0 1 .75.75v6.25a.75.75 0 0 1-1.5 0V5.5a.75.75 0 0 1 .75-.75Zm3.75-1a.75.75 0 0 0-1.5 0v8.5a.75.75 0 0 0 1.5 0v-8.5Z',
  },
  {
    id: 'sphere',
    labelKey: 'view3d',
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
  onMenuOpen,
  project,
  onEditProject,
  onAddMember,
}) {
  const { t } = useTranslation()
  const [showMenu, setShowMenu] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  return (
    <>
      <header className="relative flex items-center justify-between gap-3 border-b border-[var(--glass-border)] bg-[var(--glass)] px-4 py-3 backdrop-blur-xl backdrop-saturate-150 sm:px-6">
      <div className="flex min-w-0 items-center gap-2.5">
        <h1
          className={`truncate text-base font-semibold max-sm:hidden ${project ? 'cursor-pointer rounded-lg px-1.5 py-0.5 transition hover:bg-[var(--surface-hover)]' : ''}`}
          onClick={project ? () => (isAdmin ? setShowMenu((s) => !s) : setShowInfo(true)) : undefined}
          role={project ? 'button' : undefined}
          tabIndex={project ? 0 : undefined}
          onKeyDown={project ? (e) => e.key === 'Enter' && (isAdmin ? setShowMenu((s) => !s) : setShowInfo(true)) : undefined}
        >{title}</h1>
        {showMenu && project && isAdmin && (
          <ProjectMenu
            project={project}
            isAdmin={isAdmin}
            onEditProject={onEditProject}
            onAddMember={onAddMember}
            onClose={() => setShowMenu(false)}
          />
        )}
        {archived && (
          <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--fg-muted)] max-sm:hidden">{t('header.archived')}</span>
        )}
        <span className="rounded-full bg-[var(--surface-hover)] px-2 py-0.5 text-xs font-medium text-[var(--fg-muted)] max-sm:hidden">
          {taskCount}
        </span>
        <button
          type="button"
          aria-label={t('header.openSidebar')}
          title={t('header.sidebar')}
          onClick={onToggleMobileSidebar}
          className="btn btn-default !px-2 sidebar-toggle"
        >
          <span aria-hidden="true">☰</span>
        </button>
      </div>

      <div className="flex items-center gap-2.5">

        {/* View switcher (desktop only) */}
        <div className="hidden items-center rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] p-0.5 sm:flex">


          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onSetView?.(v.id)}
              title={`${t('header.' + v.labelKey)} ${t('header.viewSuffix')}`}
              aria-label={`${t('header.' + v.labelKey)} ${t('header.viewSuffix')}`}
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
          title={showInsights ? t('header.hideInsights') : t('header.showInsights')}
          aria-label={t('header.toggleInsights')}
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
            <ExportMenu tasks={tasks} onOpen={onMenuOpen} />
          </div>
        )}



        {onOpenLabelManager && (
          <button type="button" onClick={onOpenLabelManager} className="btn btn-default !px-2 hidden sm:inline-flex" title={t('header.manageLabels')}>

            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 2.75A.75.75 0 0 1 1.75 2h5.586c.464 0 .909.184 1.237.513l5.914 5.914a1.75 1.75 0 0 1 0 2.474l-4.586 4.586a1.75 1.75 0 0 1-2.474 0L1.513 9.573A1.75 1.75 0 0 1 1 8.336V2.75m2 .75v4.836l5.586 5.586 4.586-4.586L7.836 3.5H3Z" />
            </svg>
          </button>
        )}

        <NotificationBell userId={session?.user?.id} onOpen={onMenuOpen} />

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
          onOpen={onMenuOpen}
        />
      </div>
    </header>
    {showInfo && project && !isAdmin && (
      <ProjectInfoModal project={project} onClose={() => setShowInfo(false)} />
    )}
    </>
  )
})

export default Topbar
