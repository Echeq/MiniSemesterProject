import { lazy, Suspense, useCallback, useMemo, useState, useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import { supabase } from './api/supabaseClient'
import { useAuth } from './hooks/useAuth'
import { useBoard } from './hooks/useBoard'
import { useProfile } from './hooks/useProfile'
import { useProjects } from './hooks/useProjects'
import { useMembers } from './hooks/useMembers'
import { useTheme } from './hooks/useTheme'
import { useTaskStats } from './hooks/useTaskStats'
import { usePresence } from './hooks/usePresence'
import { useTaskEditing } from './hooks/useTaskEditing'
import { useLabels } from './hooks/useLabels'
import AuthForm from './components/AuthForm'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Board from './components/Board'
import FilterPanel from './components/FilterPanel'
import InsightsPanel from './components/InsightsPanel'
import ErrorBoundary from './components/ErrorBoundary'
import Dashboard from './components/Dashboard'
import DashboardTopbar from './components/DashboardTopbar'

const TaskModal = lazy(() => import('./components/TaskModal'))
const ProfileModal = lazy(() => import('./components/ProfileModal'))
const AdminModal = lazy(() => import('./components/AdminModal'))
const LabelManager = lazy(() => import('./components/LabelManager'))
const GanttView = lazy(() => import('./components/GanttView'))
const DataSphere = lazy(() => import('./components/DataSphere'))
const ProjectSettingsModal = lazy(() => import('./components/ProjectSettingsModal'))

function MissingEnv() {
  return (
    <div className="flex min-h-full items-center justify-center px-4">
      <div className="surface max-w-md rounded-xl p-8 shadow-[var(--shadow-md)]">
        <h1 className="mb-2 text-xl font-semibold">Supabase not configured</h1>
        <p className="text-sm text-[var(--fg-muted)]">
          Create <code className="rounded bg-[var(--surface-hover)] px-1">frontend/.env</code> with{' '}
          <code className="rounded bg-[var(--surface-hover)] px-1">VITE_SUPABASE_URL</code> and{' '}
          <code className="rounded bg-[var(--surface-hover)] px-1">VITE_SUPABASE_ANON_KEY</code>, then restart the dev server.
        </p>
      </div>
    </div>
  )
}


// Contextual message shown only on the Due soon / Overdue tabs.
function ViewBanner({ scope, count }) {
  const { t } = useTranslation()
  if (scope !== 'view:due' && scope !== 'view:overdue') return null
  const overdue = scope === 'view:overdue'
  const has = count > 0

  let color, title, msg, icon
  if (overdue) {
    color = has ? 'var(--danger)' : 'var(--done)'
    title = has ? (count === 1 ? t('view.overdueTask', { count }) : t('view.overdueTaskPlural', { count })) : t('view.allCaughtUp')
    msg = has ? t('view.overdueDesc') : t('view.nothingOverdue')
    icon = has
      ? 'M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0M9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0'
      : 'M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z'
  } else {
    color = has ? 'var(--doing)' : 'var(--fg-muted)'
    title = has ? (count === 1 ? t('view.dueSoonTask', { count }) : t('view.dueSoonTaskPlural', { count })) : t('view.nothingDueSoon')
    msg = has ? t('view.dueSoonDesc') : t('view.nothingDueSoonDesc')
    icon = 'M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13m.75 3.25v3.19l2.03 2.03a.75.75 0 1 1-1.06 1.06L7.22 9.78a.75.75 0 0 1-.22-.53V4.75a.75.75 0 0 1 1.5 0'
  }

  return (
    <div className="px-4 pt-4 sm:px-6">
      <div className="glass flex items-start gap-3 rounded-xl border p-3.5" style={{ borderColor: color }}>
        <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full" style={{ color, background: `color-mix(in srgb, ${color} 16%, transparent)` }}>
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d={icon} /></svg>
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold" style={{ color }}>{title}</p>
          <p className="text-xs text-[var(--fg-muted)]">{msg}</p>
        </div>
      </div>
    </div>
  )
}

function BoardPage({ session, theme, toggleTheme }) {
  const { t } = useTranslation()
  const userId = session.user.id
  const { profile, refetch: refetchProfile, isAdmin } = useProfile(session)
  const { projects, loading: projectsLoading, createProject, updateProject, setStatus, deleteProject } = useProjects()
  const { members } = useMembers()
  const stats = useTaskStats()
  const onlineIds = usePresence(session, profile)
  const profileName = profile?.display_name || session.user.email
  const { editors, startEditing, stopEditing } = useTaskEditing(userId, profileName)

  const [scope, setScope] = useState('_dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)

  const isProject = scope !== null && typeof scope === 'object'
  const isView = typeof scope === 'string' && scope.startsWith('view:')
  const projectId = isProject ? scope.id : scope === null ? null : 'all'

  const { tasks, loading, error, createTask, updateTask, deleteTask, addLabel, removeLabel, addDependency, removeDependency } = useBoard(projectId)
  const [modal, setModal] = useState(null)
  const [panel, setPanel] = useState(null)
  const [showInsights, setShowInsights] = useState(true)
  const [activeView, setActiveView] = useState('kanban')
  const [showLabelManager, setShowLabelManager] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ status: [], priority: [], assignee: '', labelIds: [], dueFrom: '', dueTo: '' })

  const { labels } = useLabels(isProject ? scope.id : null)

  const [settingsProject, setSettingsProject] = useState(null)
  const [settingsProjectTab, setSettingsProjectTab] = useState('settings')

  const [projectMembers, setProjectMembers] = useState(members)
  useEffect(() => {
    if (isProject && projectId !== 'all') {
      supabase
        .from('project_members')
        .select('user_id, role, profile:profiles!project_members_user_id_fkey(id, display_name, avatar_url)')
        .eq('project_id', projectId)
        .then(({ data }) => {
          setProjectMembers((data || []).map((m) => ({
            id: m.profile?.id || m.user_id,
            display_name: m.profile?.display_name || 'Unknown',
            avatar_url: m.profile?.avatar_url,
          })))
        })
    } else {
      setProjectMembers(members)
    }
  }, [isProject, projectId, members])

  // Redirect members away from global views they shouldn't access
  useEffect(() => {
    if (!isAdmin && (scope === 'all' || scope === null)) {
      setScope('view:mine')
    }
  }, [isAdmin, scope])

  const handleTaskClick = useCallback((task) => { setModal(task); startEditing(task.id) }, [startEditing])

  const handleNewTask = useCallback(() => setModal('new'), [])

  // Insights and the filter panel are mutually exclusive — opening one closes the other.
  const handleToggleInsights = useCallback(() => {
    if (!showInsights) setShowFilters(false)
    setShowInsights((s) => !s)
  }, [showInsights])

  const handleToggleFilters = useCallback(() => {
    if (!showFilters) setShowInsights(false)
    setShowFilters((s) => !s)
  }, [showFilters])

  // Opening a header dropdown (profile / export) closes the panels so nothing overlaps.
  const handleMenuOpen = useCallback(() => {
    setShowFilters(false)
    setShowInsights(false)
  }, [])

  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = (e.target?.tagName || '').toUpperCase()
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return

      const key = e.key.toLowerCase()
      const isMac = /mac/i.test(navigator.platform)
      const mod = isMac ? e.metaKey : e.ctrlKey

      if (mod && key === 'n') {
        e.preventDefault()
        handleNewTask()
      }

      if (mod && key === 'f') {
        e.preventDefault()
        document.getElementById('filter-input')?.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleNewTask])

  const handleOpenLabelManager = useCallback(() => setShowLabelManager(true), [])


  const handleCloseLabelManager = useCallback(() => setShowLabelManager(false), [])

  const handleEditProject = useCallback((project) => {
    setSettingsProjectTab('settings')
    setSettingsProject(project)
  }, [])

  const handleAddMember = useCallback((project) => {
    setSettingsProjectTab('members')
    setSettingsProject(project)
  }, [])
  const handleOpenAccount = useCallback(() => setPanel('account'), [])
  const handleOpenAdmin = useCallback(() => setPanel('admin'), [])
  const handleCloseModal = useCallback(() => { setModal(null); stopEditing() }, [stopEditing])
  const handleClosePanel = useCallback(() => setPanel(null), [])

  const logActivity = useMemo(() => ({
    log: async (action, targetType, targetId, metadata) => {
      try { await supabase.rpc('log_activity', { p_action: action, p_target_type: targetType, p_target_id: targetId, p_metadata: metadata || {} }) } catch {}
    }
  }), [])

  const viewTasks = useMemo(() => {
    if (!isView) return tasks
    const today = new Date().toISOString().slice(0, 10)
    const in7 = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
    const v = scope.slice(5)
    if (v === 'mine') return tasks.filter((t) => t.assignee === userId)
    if (v === 'overdue') return tasks.filter((t) => t.due_date && t.status !== 'done' && t.due_date < today && t.assignee === userId)
    if (v === 'due') return tasks.filter((t) => t.due_date && t.status !== 'done' && t.due_date >= today && t.due_date <= in7 && t.assignee === userId)
    return tasks
  }, [tasks, isView, scope, userId])

  const filteredViewTasks = useMemo(() => {
    let result = viewTasks
    const { status, priority, assignee, labelIds, dueFrom, dueTo } = filters
    if (status.length > 0) result = result.filter((t) => status.includes(t.status))
    if (priority.length > 0) result = result.filter((t) => priority.includes(t.priority || ''))
    if (assignee) result = result.filter((t) => t.assignee === assignee)
    if (labelIds.length > 0) result = result.filter((t) => labelIds.some((id) => t.labels?.some((l) => l.id === id)))
    if (dueFrom) result = result.filter((t) => t.due_date && t.due_date >= dueFrom)
    if (dueTo) result = result.filter((t) => t.due_date && t.due_date <= dueTo)
    return result
  }, [viewTasks, filters])

  const memoBanner = useMemo(
    () => <ViewBanner scope={scope} count={filteredViewTasks.length} />,
    [scope, filteredViewTasks.length],
  )

  const projectActions = useMemo(
    () => ({
      create: async (fields) => {
        await createProject(fields)
        logActivity.log('project_created', 'projects', null, fields)
      },
      update: updateProject,
      setStatus: async (id, status) => {
        await setStatus(id, status)
        logActivity.log(status === 'archived' ? 'project_archived' : 'project_restored', 'projects', id, {})
      },
      delete: async (id) => {
        await deleteProject(id)
        logActivity.log('project_deleted', 'projects', id, {})
      },
    }),
    [createProject, updateProject, setStatus, deleteProject, logActivity],
  )

  const validScope = isProject && !projects.some((p) => p.id === scope.id) ? 'all' : scope
  if (validScope !== scope) setScope(validScope)
  const liveScope = isProject ? projects.find((p) => p.id === scope.id) ?? scope : scope
  const currentProject = isProject ? liveScope : null

  const defaultProjectId = isProject ? scope.id : null
  const VIEW_LABELS = { 'view:mine': t('sidebar.myTasks'), 'view:due': t('sidebar.dueSoon'), 'view:overdue': t('sidebar.overdue') }
  const dashboardCounts = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return {
      taskCount: tasks.filter((t) => t.assignee === userId).length,
      overdueCount: stats.filter((t) => t.assignee === userId && t.due_date && t.status !== 'done' && t.due_date < today).length,
    }
  }, [tasks, stats, userId])

  const scopeLabel = isProject
    ? liveScope.name
    : scope === null
      ? t('sidebar.sharedBoard')
      : scope === 'all'
        ? t('sidebar.allTasks')
        : VIEW_LABELS[scope]

  return (
    <div className="flex h-full overflow-hidden">
      <ErrorBoundary>
        <Sidebar
          projects={projects}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}

          scope={liveScope}
          onSelectScope={setScope}
          projectActions={projectActions}
          isAdmin={isAdmin}
          onOpenAdmin={() => setPanel('admin')}
          members={members}
          onlineIds={onlineIds}
          editors={editors}
          stats={stats}
          currentUserId={userId}
          loadingProjects={projectsLoading}
        />
      </ErrorBoundary>

      <div className="flex min-w-0 flex-1 flex-col">
        {scope !== '_dashboard' && (
        <div className="relative z-10">
          <Topbar
            onToggleMobileSidebar={() => setMobileOpen((o) => !o)}
            title={scopeLabel}
            archived={isProject && liveScope.status === 'archived'}
            taskCount={filteredViewTasks.length}
            tasks={filteredViewTasks}
            theme={theme}
            onToggleTheme={toggleTheme}
            showInsights={showInsights}
            onToggleInsights={handleToggleInsights}
            activeView={activeView}
            onSetView={setActiveView}
            onNewTask={handleNewTask}
            onOpenLabelManager={isProject ? handleOpenLabelManager : null}
            showFilters={showFilters}
            onToggleFilters={handleToggleFilters}
            filterCount={filters.status.length + filters.priority.length + (filters.assignee ? 1 : 0) + filters.labelIds.length + (filters.dueFrom || filters.dueTo ? 1 : 0)}
            session={session}
            profile={profile}
            isAdmin={isAdmin}
            onOpenAccount={handleOpenAccount}
            onOpenAdmin={handleOpenAdmin}
            onMenuOpen={handleMenuOpen}
            project={currentProject}
            onEditProject={handleEditProject}
            onAddMember={handleAddMember}
          />

          {showFilters && (
            <div className="absolute left-0 right-0 z-20">
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                members={members}
                labels={labels}
              />
            </div>
          )}
        </div>
        )}

        {scope === '_dashboard' ? (
          <>
            <div className="relative z-10">
              <DashboardTopbar
                session={session}
                profile={profile}
                isAdmin={isAdmin}
                theme={theme}
                onToggleTheme={toggleTheme}
                onToggleMobileSidebar={() => setMobileOpen((o) => !o)}
                onOpenAccount={handleOpenAccount}
                onOpenAdmin={handleOpenAdmin}
                onMenuOpen={handleMenuOpen}
                taskCount={dashboardCounts.taskCount}
                overdueCount={dashboardCounts.overdueCount}
              />
            </div>
            <Dashboard tasks={tasks} projects={projects} members={members} onlineIds={onlineIds} stats={stats} userId={userId} />
          </>
        ) : (
          <>
            {error && <p className="px-6 py-2 text-sm" style={{ color: 'var(--danger)' }}>Error: {error}</p>}
            <div className="relative z-0 flex min-h-0 flex-1 flex-col">
              <div className={`flex min-h-0 flex-1 flex-col transition-[padding] duration-200 ease-out ${showInsights && !loading ? 'xl:pe-80' : ''}`}>
                <ErrorBoundary>
                  {activeView === 'gantt' ? (
                    <Suspense fallback={null}><GanttView tasks={filteredViewTasks} onTaskClick={handleTaskClick} updateTask={updateTask} onAddDependency={addDependency} onRemoveDependency={removeDependency} /></Suspense>
                  ) : activeView === 'sphere' ? (
                    <Suspense fallback={null}><DataSphere tasks={filteredViewTasks} /></Suspense>
                  ) : (
                    <Board
                      tasks={filteredViewTasks}
                      allViewTasks={viewTasks}
                      updateTask={updateTask}
                      isAdmin={isAdmin}
                      onTaskClick={handleTaskClick}
                      onAddTask={isAdmin ? (status) => setModal({ defaultStatus: status }) : null}
                      labels={labels}
                      hideEmptyColumns={isView}
                      banner={memoBanner}
                      activeView={activeView}
                      loading={loading}
                      members={members}
                      editors={editors}
                    />
                  )}
                </ErrorBoundary>
              </div>

              {showInsights && !loading && <InsightsPanel tasks={filteredViewTasks} scopeLabel={scopeLabel} onClose={handleToggleInsights} />}
            </div>
          </>
        )}
      </div>


      <Suspense fallback={null}>
        {modal && (
          <TaskModal
            task={modal === 'new' || modal?.defaultStatus ? null : modal}
            defaultStatus={modal?.defaultStatus}
            members={projectMembers}
            allMembers={members}
            projects={projects}
            defaultProjectId={defaultProjectId}
            labels={labels}
            allTasks={tasks}
            isAdmin={isAdmin}
            onCreate={createTask}
            onUpdate={updateTask}
            onDelete={deleteTask}
            onAddLabels={addLabel}
            onRemoveLabel={removeLabel}
            onAddDependency={addDependency}
            onRemoveDependency={removeDependency}
            onClose={handleCloseModal}
          />
        )}

        {showLabelManager && isProject && (
          <LabelManager
            projectId={scope.id}
            onClose={handleCloseLabelManager}
          />
        )}

        {panel === 'account' && (
          <ProfileModal
            session={session}
            profile={profile}
            stats={stats}
            onSaved={refetchProfile}
            onGoToMyTasks={() => setScope('view:mine')}
            onClose={handleClosePanel}
          />
        )}

        {panel === 'admin' && isAdmin && (
          <AdminModal session={session} onClose={handleClosePanel} />
        )}

        {settingsProject && (
          <ProjectSettingsModal
            project={settingsProject}
            initialTab={settingsProjectTab}
            onUpdate={(id, fields) => updateProject(id, fields)}
            onClose={() => setSettingsProject(null)}
          />
        )}
      </Suspense>
    </div>
  )
}

function Backdrop() {
  return (
    <div className="app-backdrop" aria-hidden="true">
      <span /><span /><span />
    </div>
  )
}

export default function App() {
  const { theme, toggle } = useTheme()
  const { session, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading } = useProfile(session)

  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    )
  }

  if (session && profile?.role === 'unknown') {
    return <UnknownGate session={session} />
  }

  return (
    <>
      <Backdrop />
      {!supabase ? <MissingEnv /> : <AuthGate theme={theme} toggleTheme={toggle} />}
    </>
  )
}

function UnknownGate({ session }) {
  const [state, setState] = useState('loading')

  useEffect(() => {
    supabase
      .from('join_requests')
      .select('id', { count: 'exact', head: true })
      .eq('requester_id', session.user.id)
      .neq('status', 'resolved')
      .then(({ count }) => setState(count > 0 ? 'sent' : 'idle'))
  }, [session.user.id])

  async function requestAccess() {
    const { error } = await supabase.from('join_requests').insert({
      requester_id: session.user.id,
      admin_email: session.user.email,
      status: 'pending',
    })
    if (!error) setState('sent')
  }

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0f1117', color: '#e1e4e8', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', position: 'relative'
    }}>
      <button onClick={() => supabase.auth.signOut()}
        style={{
          position: 'absolute', top: 16, right: 16, padding: '6px 14px', fontSize: 13,
          border: '1px solid #30363d', borderRadius: 6, cursor: 'pointer',
          background: '#1c1f26', color: '#e1e4e8'
        }}>
        Sign out
      </button>
      <div style={{ maxWidth: 400, textAlign: 'center', padding: 32 }}>
        <div style={{
          width: 64, height: 64, margin: '0 auto', borderRadius: '50%',
          background: '#1c1f26', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <svg width={32} height={32} viewBox="0 0 16 16" fill="#6366f1">
            <path d="M7.467.133a1.75 1.75 0 0 1 1.066 0l5.25 1.68A1.75 1.75 0 0 1 15 3.48V7c0 1.566-.32 3.182-1.303 4.682-.983 1.498-2.813-5.032 3.855a1.7 1.7 0 0 1-1.33 0c-2.447-1.042-4.049-2.357-5.032-3.855C1.32 10.182 1 8.566 1 7V3.48a1.75 1.75 0 0 1 1.217-1.667Z" />
          </svg>
        </div>
        <h1 style={{ fontSize: 20, marginTop: 20, marginBottom: 8 }}>Welcome to PivotPoint! 🎉</h1>
        <p style={{ fontSize: 14, color: '#8b949e', margin: 0, lineHeight: 1.5 }}>
          Your account is currently under review. Please contact the administrator to start using the platform.
        </p>
        {state === 'sent' ? (
          <p style={{ fontSize: 14, color: '#3fb950', marginTop: 20, fontWeight: 500 }}>
            Request sent! An admin will review it shortly.
          </p>
        ) : (
          <button onClick={requestAccess} style={{
            marginTop: 20, padding: '8px 20px', fontSize: 14, fontWeight: 500,
            border: 'none', borderRadius: 8, cursor: 'pointer', background: '#6366f1', color: '#fff'
          }}>
            Request Access
          </button>
        )}
      </div>
    </div>
  )
}

function AuthGate({ theme, toggleTheme }) {
  const { session, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading } = useProfile(session)
  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    )
  }
  if (!session) return <AuthForm />
  return (
    <ErrorBoundary>
      <BoardPage session={session} theme={theme} toggleTheme={toggleTheme} />
    </ErrorBoundary>
  )
}

