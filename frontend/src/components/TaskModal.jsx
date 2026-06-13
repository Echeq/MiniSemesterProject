import { useState } from 'react'
import { STATUSES } from '../hooks/useBoard'

const LABELS = { todo: 'To Do', doing: 'In progress', done: 'Done' }

export default function TaskModal({ task, onCreate, onUpdate, onDelete, onClose }) {
  const editing = Boolean(task)
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [dueDate, setDueDate] = useState(task?.due_date ?? '')
  const [status, setStatus] = useState(task?.status ?? 'todo')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (editing) {
        await onUpdate(task.id, {
          title,
          description,
          due_date: dueDate || null,
          status,
        })
      } else {
        await onCreate({ title, description, due_date: dueDate, status })
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 className="mb-4 text-lg font-bold text-slate-800">
          {editing ? 'Edit task' : 'New task'}
        </h2>

        <label className="mb-3 block">
          <span className="mb-1 block text-sm font-medium text-slate-600">
            Title
          </span>
          <input
            type="text"
            required
            maxLength={200}
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </label>

        <label className="mb-3 block">
          <span className="mb-1 block text-sm font-medium text-slate-600">
            Description
          </span>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </label>

        <div className="mb-5 flex gap-3">
          <label className="flex-1">
            <span className="mb-1 block text-sm font-medium text-slate-600">
              Due date
            </span>
            <input
              type="date"
              value={dueDate ?? ''}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </label>
          <label className="flex-1">
            <span className="mb-1 block text-sm font-medium text-slate-600">
              Status
            </span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {LABELS[s]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between">
          {editing ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
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
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {editing ? 'Save' : 'Create'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
