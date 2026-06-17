import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Avatar from './Avatar'

const STATUS_LABEL = { todo: 'To Do', doing: 'Doing', done: 'Done' }
const STATUS_VAR = { todo: 'var(--todo)', doing: 'var(--doing)', done: 'var(--done)' }

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

export default function TaskCard({ task, onClick, overlay = false }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: overlay,
  })
  const style = overlay ? undefined : { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(task)}
      className={`group cursor-grab rounded-lg border border-[var(--glass-border)] bg-[var(--card)] p-3 shadow-[var(--shadow-sm)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[var(--fg-subtle)] hover:bg-[var(--card-hover)] hover:shadow-[var(--shadow-md)] active:cursor-grabbing ${
        isDragging ? 'opacity-40' : ''
      } ${overlay ? 'rotate-2 shadow-[var(--shadow-md)]' : ''}`}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
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
      {(task.due_date || task.assignee) && (
        <div className="mt-2.5 flex items-center gap-2 border-t border-[var(--border-muted)] pt-2.5">
          <DueBadge due_date={task.due_date} status={task.status} />
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
