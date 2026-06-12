import { supabase } from '../api/supabaseClient'

export default function Header({ displayName, onNewTask }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
      <h1 className="text-lg font-bold text-slate-800">TaskFlow</h1>
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onNewTask}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + New task
        </button>
        <span className="hidden max-w-32 truncate text-sm text-slate-500 sm:inline">
          {displayName}
        </span>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 active:bg-slate-100"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
