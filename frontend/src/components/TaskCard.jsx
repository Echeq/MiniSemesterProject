import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Avatar from './Avatar'

const STATUS_VAR = { todo: 'var(--todo)', doing: 'var(--doing)', done: 'var(--done)' }
const PRIORITY_COLOR = { P0: '#ef4444', P1: '#f59e0b', P2: '#eab308', P3: '#10b981' }

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function DueBadge({ due_date, status }) {
  if (!due_date) return null
  const today = new Date().toISOString().slice(0, 10)
  const overdue = status !== 'done' && due_date < today
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium"
      style={
        overdue
          ? { color: 'var(--danger)', borderColor: 'var(--danger)', background: 'var(--danger-soft)' }
          : { color: 'var(--fg-muted)', borderColor: 'var(--border)' }
      }
    >
      <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4.75 0a.75.75 0 0 1 .75.75V2h5V.75a.75.75 0 0 1 1.5 0V2h1.25c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 13.25 16H2.75A1.75 1.75 0 0 1 1 14.25V3.75C1 2.784 1.784 2 2.75 2H4V.75A.75.75 0 0 1 4.75 0M2.5 6v8.25c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V6Z" /></svg>
      {formatDate(due_date)}
    </span>
  )
}

const BLOCKED_ICON = 'M4 4a4 4 0 0 1 8 0v2h.25A1.75 1.75 0 0 1 14 7.75v5.5A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25v-5.5C2 6.784 2.784 6 3.75 6H4zm1.5 2h5V4a2.5 2.5 0 0 0-5 0z'

function TaskCard({ task, onClick, overlay = false, editors }) {
  const { t } = useTranslation()
  const STATUS_LABEL = { todo: t('board.todo'), doing: t('board.inProgress'), done: t('board.done') }
  const PRIORITY_LABEL = { P0: t('filter.p0'), P1: t('filter.p1'), P2: t('filter.p2'), P3: t('filter.p3') }

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: overlay,
  })
  const style = overlay ? undefined : { transform: CSS.Transform.toString(transform), transition }
  const hasLabels = task.labels && task.labels.length > 0
  const blockedCount = task.blocked_by || 0
  const editingNames = editors?.get(task.id)

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(task)}
      className={`group cursor-grab rounded-lg border border-[var(--glass-border)] bg-[var(--card)] p-3 shadow-[var(--shadow-sm)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[var(--fg-subtle)] hover:bg-[var(--card-hover)] hover:shadow-[var(--shadow-md)] active:cursor-grabbing ${
        isDragging ? 'opacity-40' : ''
      } ${overlay ? 'rotate-2 shadow-[var(--shadow-md)]' : ''} ${
        task.due_date && task.status !== 'done' && task.due_date < new Date().toISOString().slice(0, 10)
          ? 'border-l-4 border-l-[var(--danger)]'
          : ''
      }`}

    >
      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
        {task.priority && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
            style={{ color: PRIORITY_COLOR[task.priority], background: `color-mix(in srgb, ${PRIORITY_COLOR[task.priority]} 16%, transparent)` }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: PRIORITY_COLOR[task.priority] }} />
            {PRIORITY_LABEL[task.priority]}
          </span>
        )}
        <span
          className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{ color: STATUS_VAR[task.status], border: `1px solid color-mix(in srgb, ${STATUS_VAR[task.status]} 45%, transparent)` }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_VAR[task.status] }} />
          {STATUS_LABEL[task.status]}
        </span>
      </div>
      <p className="text-sm font-semibold leading-snug">{task.title}</p>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--fg-muted)]">{task.description}</p>
      )}
      {hasLabels && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {task.labels.map((l) => (
            <span key={l.id} className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
              style={{ background: l.color || '#6366f1' }}
            >
              {l.name}
            </span>
          ))}
        </div>
      )}
      {(task.due_date || task.assignee || blockedCount > 0 || editingNames) && (
        <div className="mt-2.5 flex items-center gap-2 border-t border-[var(--border-muted)] pt-2.5">
          <DueBadge due_date={task.due_date} status={task.status} />
          {blockedCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: 'var(--danger)' }}>
              <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor"><path d={BLOCKED_ICON} /></svg>
              {t('task.blockedByCount', { count: blockedCount })}
            </span>
          )}
          {editingNames && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
              {t('task.editing')}
            </span>
          )}
          {task.assignee_profile?.display_name && (
            <span className="ml-auto" title={task.assignee_profile.display_name}>
              <Avatar name={task.assignee_profile.display_name} url={task.assignee_profile.avatar_url} size="xs" />
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default memo(TaskCard)
