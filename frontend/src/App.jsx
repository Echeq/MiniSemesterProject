import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from './api/supabaseClient'
import { useAuth } from './hooks/useAuth'
import { useProfile } from './hooks/useProfile'
import { useBoard } from './hooks/useBoard'
import AuthForm from './components/AuthForm'
import Header from './components/Header'
import Board from './components/Board'
import TaskModal from './components/TaskModal'
import ProfileSettings from './components/ProfileSettings'
import TaskActionSheet from './components/TaskActionSheet'
import InvitationPopup from './components/InvitationPopup'
import InviteDialog from './components/InviteDialog'

function MissingEnv() {
  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 px-4">
      <div className="max-w-md rounded-2xl bg-white p-8 shadow-lg sm:rounded-xl sm:shadow-md">
        <h1 className="mb-2 text-xl font-bold text-slate-800">
          Supabase not configured
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Create <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-mono">frontend/.env</code>{' '}
          with <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-mono">VITE_SUPABASE_URL</code>{' '}
          and{' '}
          <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-mono">VITE_SUPABASE_ANON_KEY</code>,
          then restart the dev server.
        </p>
      </div>
    </div>
  )
}

function ProfileMenu({ displayName, avatarUrl, onClick }) {
  const initial = (displayName ?? '?')[0]?.toUpperCase() || '?'

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full bg-white pl-1 pr-3 py-1 shadow-lg hover:shadow-xl transition-all active:scale-90"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
        />
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-sm font-bold text-white ring-2 ring-white">
          {initial}
        </span>
      )}
      <span className="hidden text-sm font-medium text-slate-700 sm:inline">
        {displayName}
      </span>
    </button>
  )
}

function BoardPage({ session }) {
  const { t } = useTranslation()
  const { tasks, loading, error, createTask, updateTask, deleteTask } =
    useBoard()
  const { profile, updateProfile, uploadAvatar, changePassword } =
    useProfile(session)
  const [taskModal, setTaskModal] = useState(null)
  const [profileModal, setProfileModal] = useState(false)
  const [actionTask, setActionTask] = useState(null)
  const [invitationPopup, setInvitationPopup] = useState(false)
  const [inviteDialog, setInviteDialog] = useState(false)

  const role = profile?.role ?? 'unknown'

  const displayName =
    profile?.display_name ||
    session.user.user_metadata?.display_name ||
    session.user.email

  const displayAvatar = profile?.avatar_url || null

  const filteredTasks = role === 'member'
    ? tasks.filter((t) => t.assignee_id === session.user.id)
    : role === 'unknown'
      ? []
      : tasks

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-50 to-white sm:bg-gradient-to-br sm:from-slate-50 sm:to-slate-100/50 sm:pb-16">
      <Header
        displayName={displayName}
        role={role}
        onNewTask={() => setTaskModal('new')}
        onInvite={() => setInviteDialog(true)}
      />
      {error && (
        <p className="px-6 py-2 text-sm text-red-600">Error: {error}</p>
      )}
      <div className="relative flex min-h-0 flex-1">
        {loading ? (
          <div className="flex w-full items-center justify-center gap-2 p-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            <p className="text-sm text-slate-500">{t('board.loading')}</p>
          </div>
        ) : (
          <Board
            tasks={filteredTasks}
            role={role}
            updateTask={updateTask}
            onTaskClick={(task) => setTaskModal(task)}
            onMobileAction={setActionTask}
            onInvitationClick={() => setInvitationPopup(true)}
          />
        )}
      </div>
      {actionTask && (
        <TaskActionSheet
          task={actionTask}
          role={role}
          onEdit={(task) => setTaskModal(task)}
          onMove={updateTask}
          onDelete={deleteTask}
          onClose={() => setActionTask(null)}
        />
      )}
      {taskModal && (
        <TaskModal
          task={taskModal === 'new' ? null : taskModal}
          role={role}
          session={session}
          onCreate={createTask}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onClose={() => setTaskModal(null)}
        />
      )}
      {invitationPopup && (
        <InvitationPopup
          userId={session.user.id}
          onClose={() => setInvitationPopup(false)}
        />
      )}
      {inviteDialog && (
        <InviteDialog
          adminId={session.user.id}
          onClose={() => setInviteDialog(false)}
        />
      )}
      <ProfileMenu
        displayName={displayName}
        avatarUrl={displayAvatar}
        onClick={() => setProfileModal(true)}
      />
      {profileModal && (
        <ProfileSettings
          profile={profile}
          email={session.user.email}
          onUpdate={updateProfile}
          onUploadAvatar={uploadAvatar}
          onChangePassword={changePassword}
          onClose={() => setProfileModal(false)}
        />
      )}
    </div>
  )
}

export default function App() {
  if (!supabase) return <MissingEnv />
  return <AuthGate />
}

function AuthGate() {
  const { t } = useTranslation()
  const { session, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p className="text-sm text-slate-500">{t('board.loading')}</p>
        </div>
      </div>
    )
  }
  if (!session) return <AuthForm />
  return <BoardPage session={session} />
}
