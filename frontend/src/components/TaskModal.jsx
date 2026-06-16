import { useEffect, useState } from 'react'
import { supabase } from '../api/supabaseClient'
import { STATUSES } from '../hooks/useBoard'

const LABELS = { todo: 'To Do', doing: 'In progress', done: 'Done' }

export default function TaskModal({ task, role, session, onCreate, onUpdate, onDelete, onClose }) {
  const editing = Boolean(task)
  const isAdmin = role === 'admin'
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [dueDate, setDueDate] = useState(task?.due_date ?? '')
  const [status, setStatus] = useState(task?.status ?? 'todo')
  const [assigneeId, setAssigneeId] = useState(task?.assignee_id ?? '')
  const [profiles, setProfiles] = useState([])
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!isAdmin) return
    supabase
      .from('profiles')
      .select('id, display_name, role')
      .neq('id', session?.user?.id)
      .in('role', ['member', 'admin'])
      .then(({ data }) => {
        if (data) setProfiles(data)
      })
  }, [isAdmin, session])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const fields = {
        title,
        description,
        due_date: dueDate || null,
        status,
      }
      if (isAdmin && assigneeId) {
        fields.assignee = assigneeId
      } else if (isAdmin && !assigneeId) {
        fields.assignee = null
      }
      if (editing) {
        await onUpdate(task.id, fields)
      } else {
        await onCreate(fields)
      }
      onClose()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this task?')) return
    setBusy(true)
    try {
      await onDelete(task.id)
      onClose()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  function MemberView() {
    return (
      <div className="flex h-full flex-col sm:block">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:border-none sm:px-0 sm:mb-4">
          <h2 className="text-lg font-bold text-slate-800">Task details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 sm:hidden"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-0 sm:py-0">
          <div className="mb-4">
            <span className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</span>
            <p className="text-sm font-semibold text-slate-800">{task.title}</p>
          </div>
          {task.description && (
            <div className="mb-4">
              <span className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</span>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}
          <div className="mb-4 flex gap-4">
            <div>
              <span className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</span>
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {LABELS[task.status]}
              </span>
            </div>
            {task.due_date && (
              <div>
                <span className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Due date</span>
                <p className="text-sm text-slate-600">{task.due_date}</p>
              </div>
            )}
          </div>
          {task.assignee?.display_name && (
            <div>
              <span className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Assignee</span>
              <p className="text-sm text-slate-600">{task.assignee.display_name}</p>
            </div>
          )}
        </div>
        <div className="border-t border-slate-200 px-5 py-4 sm:border-none sm:px-0 sm:pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors sm:rounded-lg sm:py-2.5"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  if (!isAdmin && editing) {
    return (
      <div
        className="fixed inset-0 z-50 modal-overlay sm:flex sm:items-center sm:justify-center sm:bg-black/40 sm:px-4"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="sheet-panel sm:sheet-panel-none flex h-full flex-col bg-white sm:h-auto sm:w-full sm:max-w-md sm:rounded-xl sm:shadow-xl sm:p-6"
        >
          <MemberView />
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 modal-overlay sm:flex sm:items-center sm:justify-center sm:bg-black/40 sm:px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="sheet-panel sm:sheet-panel-none flex h-full flex-col bg-white sm:h-auto sm:w-full sm:max-w-md sm:rounded-xl sm:shadow-xl sm:p-6 sm:mx-0"
      >
        <form
          onSubmit={handleSubmit}
          className="flex h-full flex-col sm:block"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:border-none sm:px-0 sm:py-0 sm:mb-4">
            <h2 className="text-lg font-bold text-slate-800">
              {editing ? 'Edit task' : 'New task'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 sm:hidden"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-0 sm:py-0">
            <label className="mb-4 block sm:mb-3">
              <span className="mb-1.5 block text-sm font-semibold text-slate-600">
                Title
              </span>
              <input
                type="text"
                required
                maxLength={200}
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:rounded-lg sm:px-3 sm:py-2"
              />
            </label>

            <label className="mb-4 block sm:mb-3">
              <span className="mb-1.5 block text-sm font-semibold text-slate-600">
                Description
              </span>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:rounded-lg sm:px-3 sm:py-2"
              />
            </label>

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:gap-3">
              <label className="flex-1">
                <span className="mb-1.5 block text-sm font-semibold text-slate-600">
                  Due date
                </span>
                <input
                  type="date"
                  value={dueDate ?? ''}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:rounded-lg sm:px-3 sm:py-2"
                />
              </label>
              <label className="flex-1">
                <span className="mb-1.5 block text-sm font-semibold text-slate-600">
                  Status
                </span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:rounded-lg sm:px-3 sm:py-2"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {LABELS[s]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {isAdmin && (
              <label className="mb-4 block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-600">
                  Assign to
                </span>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:rounded-lg sm:px-3 sm:py-2"
                >
                  <option value="">— Unassigned —</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.display_name} ({p.role})
                    </option>
                  ))}
                </select>
              </label>
            )}

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
          </div>

          <div className="safe-bottom border-t border-slate-200 px-5 py-4 sm:border-none sm:px-0 sm:pt-2">
            <div className="flex items-center justify-between">
              {editing ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={busy}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 active:bg-red-100 disabled:opacity-50 sm:rounded-lg sm:px-3 sm:py-2 transition-colors"
                >
                  Delete
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 active:bg-slate-100 sm:rounded-lg sm:px-4 sm:py-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 sm:rounded-lg sm:px-4 sm:py-2 transition-colors"
                >
                  {editing ? 'Save' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
