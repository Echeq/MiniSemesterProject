import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { STATUSES } from '../hooks/useBoard'
import Modal from './Modal'

const PRIORITIES = [
  { value: '', label: 'None', color: null },
  { value: 'P0', label: 'P0 Critical', color: '#ef4444' },
  { value: 'P1', label: 'P1 High', color: '#f59e0b' },
  { value: 'P2', label: 'P2 Medium', color: '#eab308' },
  { value: 'P3', label: 'P3 Low', color: '#10b981' },
]

export default function TaskModal({
  task,
  members = [],
  projects = [],
  defaultProjectId = null,
  defaultStatus = 'todo',
  labels = [],
  allTasks = [],
  onCreate,
  onUpdate,
  onDelete,
  onAddLabels,
  onRemoveLabel,
  onAddDependency,
  onRemoveDependency,
  onClose,
}) {
  const { t } = useTranslation()
  const STATUS_LABELS = { todo: t('board.todo'), doing: t('board.inProgress'), done: t('board.done') }

  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [dueDate, setDueDate] = useState(task?.due_date ?? '')
  const [status, setStatus] = useState(task?.status ?? defaultStatus)
  const [priority, setPriority] = useState(task?.priority ?? '')
  const [assignee, setAssignee] = useState(task?.assignee ?? '')
  const [projectId, setProjectId] = useState(task?.project_id ?? defaultProjectId ?? '')
  const [selectedLabels, setSelectedLabels] = useState(task?.labels?.map((l) => l.id) ?? [])
  const [blockedBy, setBlockedBy] = useState(task?.depends_on?.map((d) => d.id) ?? [])
  const [error, setError] = useState(null)
  const [blockerError, setBlockerError] = useState(null)
  const [busy, setBusy] = useState(false)
  const editing = Boolean(task)

  const availableLabels = labels.filter((l) => l.project_id === projectId || (!projectId && !l.project_id))
  const projectTasks = allTasks.filter((t) => t.id !== task?.id && (t.project_id === projectId || (!projectId && !t.project_id)))

  function toggleLabel(labelId) {
    setSelectedLabels((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId],
    )
  }

  function toggleDependency(taskId) {
    setBlockedBy((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId],
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setBlockerError(null)
    setBusy(true)
    try {
      const fields = {
        title,
        description,
        due_date: dueDate || null,
        status,
        priority: priority || null,
        assignee: assignee || null,
        project_id: projectId || null,
      }
      if (editing) {
        await onUpdate(task.id, fields)
        // Sync labels
        const existingIds = (task.labels || []).map((l) => l.id)
        for (const id of existingIds) {
          if (!selectedLabels.includes(id)) await onRemoveLabel(task.id, id)
        }
        for (const id of selectedLabels) {
          if (!existingIds.includes(id)) await onAddLabels(task.id, id)
        }
        // Sync dependencies
        const existingDeps = (task.depends_on || []).map((d) => d.id)
        for (const id of existingDeps) {
          if (!blockedBy.includes(id)) await onRemoveDependency(task.id, id)
        }
        for (const id of blockedBy) {
          if (!existingDeps.includes(id)) await onAddDependency(task.id, id)
        }
      } else {
        const newId = await onCreate(fields)
        if (newId) {
          for (const id of selectedLabels) await onAddLabels(newId, id)
        }
      }
      onClose()
    } catch (err) {
      if (err.message.startsWith('Blocked by')) {
        setBlockerError(err.message)
      } else {
        setError(err.message)
      }
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
    <Modal title={editing ? t('task.edit') : t('task.new')} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label className="mb-3 block">
          <span className={labelCls}>{t('task.title')}</span>
          <input type="text" required maxLength={200} autoFocus value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder={t('task.title')} />
        </label>

        <label className="mb-3 block">
          <span className={labelCls}>{t('task.description')}</span>
          <textarea rows={3} maxLength={5000} value={description} onChange={(e) => setDescription(e.target.value)} className="input resize-none" placeholder={t('task.description')} />
        </label>

        <div className="mb-3 flex gap-3">
          <label className="flex-1">
            <span className={labelCls}>{t('task.dueDate')}</span>
            <input type="date" value={dueDate ?? ''} onChange={(e) => setDueDate(e.target.value)} className="input" />
          </label>
          <label className="flex-1">
            <span className={labelCls}>{t('task.status')}</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
              {STATUSES.map((s) => (
                <option key={s} value={s} disabled={s === 'done' && (task?.blocked_by || 0) > 0}>
                  {STATUS_LABELS[s]}{s === 'done' && (task?.blocked_by || 0) > 0 ? ' (blocked)' : ''}
                </option>
              ))}
            </select>
            {editing && (task?.blocked_by || 0) > 0 && !blockerError && (
              <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>
                {t('task.blockedBy')} {task.blocked_by} incomplete task{task.blocked_by !== 1 ? 's' : ''} — resolve dependencies first.
              </p>
            )}
            {blockerError && (
              <p className="mt-1 rounded-md border px-2.5 py-1.5 text-xs" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', background: 'var(--danger-soft)' }}>
                {blockerError}
              </p>
            )}
          </label>
        </div>

        <div className="mb-3 flex gap-3">
          <label className="flex-1">
            <span className={labelCls}>{t('task.priority')}</span>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input">
              {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </label>
          <label className="flex-1">
            <span className={labelCls}>{t('task.assignee')}</span>
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="input">
              <option value="">{t('task.unassigned')}</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.display_name}</option>)}
            </select>
          </label>
        </div>

        <div className="mb-5 flex gap-3">
          <label className="flex-1">
            <span className={labelCls}>{t('task.project')}</span>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="input">
              <option value="">{t('task.sharedBoard')}</option>
              {projects.filter((p) => p.status === 'active').map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
        </div>

        {availableLabels.length > 0 && (
          <div className="mb-4">
            <span className={labelCls}>{t('task.labels')}</span>
            <div className="flex flex-wrap gap-1.5">
              {availableLabels.map((l) => (
                <button key={l.id} type="button" onClick={() => toggleLabel(l.id)}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition hover:scale-105"
                  style={{
                    background: selectedLabels.includes(l.id) ? l.color : 'transparent',
                    color: selectedLabels.includes(l.id) ? '#fff' : 'var(--fg)',
                    border: `1px solid ${l.color}`,
                  }}
                >
                  {selectedLabels.includes(l.id) && (
                    <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" /></svg>
                  )}
                  {l.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {editing && projectTasks.length > 0 && (
          <div className="mb-4">
            <span className={labelCls}>{t('task.blockedBy')}</span>
            <div className="flex flex-wrap gap-1.5">
              {projectTasks.map((t) => (
                <button key={t.id} type="button" onClick={() => toggleDependency(t.id)}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition hover:scale-105"
                  style={{
                    background: blockedBy.includes(t.id) ? 'var(--danger)' : 'transparent',
                    color: blockedBy.includes(t.id) ? '#fff' : 'var(--fg)',
                    border: blockedBy.includes(t.id) ? '1px solid var(--danger)' : '1px solid var(--border)',
                  }}
                >
                  {t.title.slice(0, 30)}{t.title.length > 30 ? '…' : ''}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="mb-3 rounded-md border px-3 py-2 text-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', background: 'var(--danger-soft)' }}>{error}</p>}

        <div className="flex items-center justify-between">
          {editing ? (
            <button type="button" onClick={handleDelete} disabled={busy} className="btn btn-danger">{t('task.delete')}</button>
          ) : <span />}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn btn-default">{t('task.cancel')}</button>
            <button type="submit" disabled={busy} className="btn btn-primary">{editing ? t('task.save') : t('task.create')}</button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
