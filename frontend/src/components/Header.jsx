import { supabase } from '../api/supabaseClient'

export default function Header({ displayName, role, onNewTask, onInvite }) {
  return (
    <header className="safe-top flex items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 py-3 sm:px-8 sm:shadow-sm">
      <h1 className="text-lg font-bold text-slate-800 sm:text-xl">TaskFlow</h1>
      <div className="flex items-center gap-1.5 sm:gap-3">
        {role === 'admin' && (
          <>
            <button
              type="button"
              onClick={onInvite}
              className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 active:bg-slate-100 active:scale-95 transition-all"
              title="Invite member"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Invite
            </button>
            <button
              type="button"
              onClick={onNewTask}
              className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800 active:scale-95 transition-all"
            >
              <svg className="h-4 w-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">+ New task</span>
              <span className="sm:hidden">New</span>
            </button>
          </>
        )}
        {role === 'member' && (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600 border border-amber-200">
            Member
          </span>
        )}
        {role === 'unknown' && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 border border-slate-200">
            Guest
          </span>
        )}
        <span className="hidden max-w-28 truncate text-sm text-slate-500 sm:inline">
          {displayName}
        </span>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 active:bg-slate-100 active:scale-95 transition-all"
          title="Sign out"
        >
          <svg className="h-4 w-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  )
}
