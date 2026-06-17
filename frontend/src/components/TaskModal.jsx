import { useState } from 'react'
import { STATUSES } from '../hooks/useBoard'
import Modal from './Modal'

const LABELS = { todo: 'To Do', doing: 'Doing', done: 'Done' }

export default function TaskModal({
  task,
  members = [],
  projects = [],
  defaultProjectId = null,
  onCreate,
  onUpdate,
  onDelete,
  onClose,
}) {
  const editing = Boolean(task)
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [dueDate, setDueDate] = useState(task?.due_date ?? '')
  const [status, setStatus] = useState(task?.status ?? 'todo')
  const [assignee, setAssignee] = useState(task?.assignee ?? '')
  const [projectId, setProjectId] = useState(task?.project_id ?? defaultProjectId ?? '')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

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
        assignee: assignee || null,
        project_id: projectId || null,
      }
      if (editing) await onUpdate(task.id, fields)
      else await onCreate(fields)
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

  const labelCls = 'mb-1.5 block text-sm font-medium text-[var(--fg)]'

  return (
    <Modal title={editing ? 'Edit task' : 'New task'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label className="mb-3 block">
          <span className={labelCls}>Title</span>
          <input type="text" required maxLength={200} autoFocus value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="What needs doing?" />
        </label>

        <label className="mb-3 block">
          <span className={labelCls}>Description</span>
          <textarea rows={3} maxLength={5000} value={description} onChange={(e) => setDescription(e.target.value)} className="input resize-none" placeholder="Add more detail…" />
        </label>

        <div className="mb-3 flex gap-3">
          <label className="flex-1">
            <span className={labelCls}>Due date</span>
            <input type="date" value={dueDate ?? ''} onChange={(e) => setDueDate(e.target.value)} className="input" />
          </label>
          <label className="flex-1">
            <span className={labelCls}>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
              {STATUSES.map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}
            </select>
          </label>
        </div>

        <div className="mb-5 flex gap-3">
          <label className="flex-1">
            <span className={labelCls}>Assignee</span>
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="input">
              <option value="">Unassigned</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.display_name}</option>)}
            </select>
          </label>
          <label className="flex-1">
            <span className={labelCls}>Project</span>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="input">
              <option value="">Shared board</option>
              {projects.filter((p) => p.status === 'active').map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
        </div>

        {error && <p className="mb-3 rounded-md border px-3 py-2 text-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', background: 'var(--danger-soft)' }}>{error}</p>}

        <div className="flex items-center justify-between">
          {editing ? (
            <button type="button" onClick={handleDelete} disabled={busy} className="btn btn-danger">Delete</button>
          ) : <span />}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn btn-default">Cancel</button>
            <button type="submit" disabled={busy} className="btn btn-primary">{editing ? 'Save' : 'Create'}</button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
