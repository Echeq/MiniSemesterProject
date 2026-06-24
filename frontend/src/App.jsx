import { useCallback, useMemo, useState } from 'react'
import { supabase } from './api/supabaseClient'
import { useAuth } from './hooks/useAuth'
import { useBoard } from './hooks/useBoard'
import { useProfile } from './hooks/useProfile'
import { useProjects } from './hooks/useProjects'
import { useMembers } from './hooks/useMembers'
import { useTheme } from './hooks/useTheme'
import { useTaskStats } from './hooks/useTaskStats'
import { usePresence } from './hooks/usePresence'
import { useLabels } from './hooks/useLabels'
import AuthForm from './components/AuthForm'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Board from './components/Board'
import TaskModal from './components/TaskModal'
import ProfileModal from './components/ProfileModal'
import AdminModal from './components/AdminModal'
import InsightsPanel from './components/InsightsPanel'
import ErrorBoundary from './components/ErrorBoundary'
import LabelManager from './components/LabelManager'

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

const VIEW_LABELS = { 'view:mine': 'My tasks', 'view:due': 'Due soon', 'view:overdue': 'Overdue' }

// Contextual message shown only on the Due soon / Overdue tabs.
function ViewBanner({ scope, count }) {
  if (scope !== 'view:due' && scope !== 'view:overdue') return null
  const overdue = scope === 'view:overdue'
  const has = count > 0
  const plural = count === 1 ? 'task' : 'tasks'

  let color, title, msg, icon
  if (overdue) {
    color = has ? 'var(--danger)' : 'var(--done)'
    title = has ? `${count} overdue ${plural}` : "You're all caught up"
    msg = has
      ? 'These tasks are past their due date — reschedule them or mark them done.'
      : 'Nothing is overdue right now. Great work! 🎉'
    icon = has
      ? 'M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0M9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0'
      : 'M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z'
  } else {
    color = has ? 'var(--doing)' : 'var(--fg-muted)'
    title = has ? `${count} ${plural} due soon` : 'Nothing due soon'
    msg = has
      ? 'Due within the next 7 days — plan ahead to stay on track.'
      : 'No tasks are due in the next 7 days.'
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
  const userId = session.user.id
  const { profile, refetch: refetchProfile, isAdmin } = useProfile(session)
  const { projects, loading: projectsLoading, createProject, updateProject, setStatus, deleteProject } = useProjects()
  const { members } = useMembers()
  const stats = useTaskStats()
  const onlineIds = usePresence(session, profile)

  const [scope, setScope] = useState('all')
  const isProject = scope !== null && typeof scope === 'object'
  const isView = typeof scope === 'string' && scope.startsWith('view:')
  const projectId = isProject ? scope.id : scope === null ? null : 'all'

  const { tasks, loading, error, createTask, updateTask, deleteTask, addLabel, removeLabel, addDependency, removeDependency } = useBoard(projectId)
  const [modal, setModal] = useState(null)
  const [panel, setPanel] = useState(null)
  const [showInsights, setShowInsights] = useState(true)
  const [showListView, setShowListView] = useState(false)
  const [showLabelManager, setShowLabelManager] = useState(false)

  const { labels } = useLabels(isProject ? scope.id : null)

  const handleTaskClick = useCallback((task) => setModal(task), [])

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
    if (v === 'overdue') return tasks.filter((t) => t.due_date && t.status !== 'done' && t.due_date < today)
    if (v === 'due') return tasks.filter((t) => t.due_date && t.status !== 'done' && t.due_date >= today && t.due_date <= in7)
    return tasks
  }, [tasks, isView, scope, userId])

  const memoBanner = useMemo(
    () => <ViewBanner scope={scope} count={viewTasks.length} />,
    [scope, viewTasks.length],
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

  const defaultProjectId = isProject ? scope.id : null
  const scopeLabel = isProject
    ? liveScope.name
    : scope === null
      ? 'Shared board'
      : scope === 'all'
        ? 'All tasks'
        : VIEW_LABELS[scope]

  return (
    <div className="flex h-full overflow-hidden">
      <ErrorBoundary>
        <Sidebar
          projects={projects}
          scope={liveScope}
          onSelectScope={setScope}
          projectActions={projectActions}
          isAdmin={isAdmin}
          onOpenAdmin={() => setPanel('admin')}
          members={members}
          onlineIds={onlineIds}
          stats={stats}
          currentUserId={userId}
          loadingProjects={projectsLoading}
        />
      </ErrorBoundary>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={scopeLabel}
          archived={isProject && liveScope.status === 'archived'}
          taskCount={viewTasks.length}
          tasks={viewTasks}
          theme={theme}
          onToggleTheme={toggleTheme}
          showInsights={showInsights}
          onToggleInsights={() => setShowInsights((s) => !s)}
          showListView={showListView}
          onToggleView={() => setShowListView((s) => !s)}
          onNewTask={() => setModal('new')}
          onOpenLabelManager={isProject ? () => setShowLabelManager(true) : null}
          session={session}
          profile={profile}
          isAdmin={isAdmin}
          onOpenAccount={() => setPanel('account')}
          onOpenAdmin={() => setPanel('admin')}
        />

        {error && <p className="px-6 py-2 text-sm" style={{ color: 'var(--danger)' }}>Error: {error}</p>}

        <ErrorBoundary>
          <Board
            tasks={viewTasks}
            updateTask={updateTask}
            onTaskClick={handleTaskClick}
            hideEmptyColumns={isView}
            banner={memoBanner}
            showListView={showListView}
            loading={loading}
          />
        </ErrorBoundary>
      </div>

      {showInsights && !loading && <InsightsPanel tasks={viewTasks} scopeLabel={scopeLabel} />}

      {modal && (
        <TaskModal
          task={modal === 'new' ? null : modal}
          members={members}
          projects={projects}
          defaultProjectId={defaultProjectId}
          labels={labels}
          allTasks={tasks}
          onCreate={createTask}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onAddLabels={addLabel}
          onRemoveLabel={removeLabel}
          onAddDependency={addDependency}
          onRemoveDependency={removeDependency}
          onClose={() => setModal(null)}
        />
      )}

      {showLabelManager && isProject && (
        <LabelManager
          projectId={scope.id}
          onClose={() => setShowLabelManager(false)}
        />
      )}

      {panel === 'account' && (
        <ProfileModal
          session={session}
          profile={profile}
          stats={stats}
          onSaved={refetchProfile}
          onGoToMyTasks={() => setScope('view:mine')}
          onClose={() => setPanel(null)}
        />
      )}

      {panel === 'admin' && isAdmin && (
        <AdminModal session={session} onClose={() => setPanel(null)} />
      )}
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
  return (
    <>
      <Backdrop />
      {!supabase ? <MissingEnv /> : <AuthGate theme={theme} toggleTheme={toggle} />}
    </>
  )
}

function AuthGate({ theme, toggleTheme }) {
  const { session, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <p className="text-sm text-[var(--fg-muted)]">Loading…</p>
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
