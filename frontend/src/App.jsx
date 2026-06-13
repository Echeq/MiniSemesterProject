import { useState } from 'react'
import { supabase } from './api/supabaseClient'
import { useAuth } from './hooks/useAuth'
import { useProfile } from './hooks/useProfile'
import { useBoard } from './hooks/useBoard'
import AuthForm from './components/AuthForm'
import Header from './components/Header'
import Board from './components/Board'
import TaskModal from './components/TaskModal'
import ProfileSettings from './components/ProfileSettings'

function MissingEnv() {
  return (
    <div className="flex min-h-full items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-2 text-xl font-bold text-slate-800">
          Supabase not configured
        </h1>
        <p className="text-sm text-slate-600">
          Create <code className="rounded bg-slate-100 px-1">frontend/.env</code>{' '}
          with <code className="rounded bg-slate-100 px-1">VITE_SUPABASE_URL</code>{' '}
          and{' '}
          <code className="rounded bg-slate-100 px-1">VITE_SUPABASE_ANON_KEY</code>,
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
      className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full bg-white pl-1 pr-3 py-1 shadow-md hover:shadow-lg transition-shadow active:scale-95"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="h-9 w-9 rounded-full object-cover"
        />
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
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
  const { tasks, loading, error, createTask, updateTask, deleteTask } =
    useBoard()
  const { profile, updateProfile, uploadAvatar, changePassword } =
    useProfile(session)
  const [taskModal, setTaskModal] = useState(null)
  const [profileModal, setProfileModal] = useState(false)

  const displayName =
    profile?.display_name ||
    session.user.user_metadata?.display_name ||
    session.user.email

  const displayAvatar = profile?.avatar_url || null

  return (
    <div className="flex h-full flex-col bg-slate-100 pb-20 sm:pb-16">
      <Header displayName={displayName} onNewTask={() => setTaskModal('new')} />
      {error && (
        <p className="px-6 py-2 text-sm text-red-600">Error: {error}</p>
      )}
      <div className="relative flex min-h-0 flex-1">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading board…</p>
        ) : (
          <Board
            tasks={tasks}
            updateTask={updateTask}
            onTaskClick={(task) => setTaskModal(task)}
          />
        )}
      </div>
      {taskModal && (
        <TaskModal
          task={taskModal === 'new' ? null : taskModal}
          onCreate={createTask}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onClose={() => setTaskModal(null)}
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
          userId={session.user.id}
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
  const { session, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    )
  }
  if (!session) return <AuthForm />
  return <BoardPage session={session} />
}
