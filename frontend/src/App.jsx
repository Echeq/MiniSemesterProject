import { useState } from 'react'
import { supabase } from './api/supabaseClient'
import { useAuth } from './hooks/useAuth'
import { useBoard } from './hooks/useBoard'
import AuthForm from './components/AuthForm'
import Header from './components/Header'
import Board from './components/Board'
import TaskModal from './components/TaskModal'

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

function BoardPage({ session }) {
  const { tasks, loading, error, createTask, updateTask, deleteTask } =
    useBoard()
  const [modal, setModal] = useState(null) // null | 'new' | task object

  return (
    <div className="flex h-full flex-col bg-slate-100">
      <Header session={session} onNewTask={() => setModal('new')} />
      {error && (
        <p className="px-6 py-2 text-sm text-red-600">Error: {error}</p>
      )}
      {loading ? (
        <p className="p-6 text-sm text-slate-500">Loading board…</p>
      ) : (
        <Board
          tasks={tasks}
          updateTask={updateTask}
          onTaskClick={(task) => setModal(task)}
        />
      )}
      {modal && (
        <TaskModal
          task={modal === 'new' ? null : modal}
          onCreate={createTask}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onClose={() => setModal(null)}
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
