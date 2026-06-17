import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function dueBadge(due_date, status) {
  if (!due_date) return null
  const today = new Date().toISOString().slice(0, 10)
  const overdue = status !== 'done' && due_date < today
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
        overdue
          ? 'bg-red-100 text-red-700'
          : 'bg-slate-100 text-slate-600'
      }`}
    >
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      {due_date}
    </span>
  )
}

export default function TaskCard({ task, onClick, overlay = false, mobile = false, role }) {
  const canDrag = role === 'admin' && !overlay

  if (mobile) {
    return (
      <div
        onClick={onClick}
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md active:shadow-sm active:scale-[0.98] transition-all"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-slate-800 leading-snug">{task.title}</p>
          {task.assignee?.display_name && (
            <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600">
              {task.assignee.display_name[0]?.toUpperCase()}
            </span>
          )}
        </div>
        {task.description && (
          <p className="mt-1.5 line-clamp-2 text-xs text-slate-500 leading-relaxed">
            {task.description}
          </p>
        )}
        {task.due_date && (
          <div className="mt-2.5 flex items-center justify-between">
            {dueBadge(task.due_date, task.status)}
          </div>
        )}
      </div>
    )
  }

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, disabled: !canDrag })

  const style = overlay
    ? undefined
    : { transform: CSS.Transform.toString(transform), transition }

  const cursorClass = canDrag
    ? 'cursor-grab active:cursor-grabbing'
    : 'cursor-pointer'

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      {...(canDrag ? { ...attributes, ...listeners } : {})}
      onClick={() => onClick?.(task)}
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all ${
        isDragging ? 'opacity-40' : ''
      } ${overlay ? 'rotate-2 shadow-lg' : ''} ${cursorClass}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800 leading-snug">{task.title}</p>
        {task.assignee?.display_name && (
          <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600">
            {task.assignee.display_name[0]?.toUpperCase()}
          </span>
        )}
      </div>
      {task.description && (
        <p className="mt-1.5 line-clamp-2 text-xs text-slate-500 leading-relaxed">
          {task.description}
        </p>
      )}
      <div className="mt-2.5 flex items-center justify-between">
        {dueBadge(task.due_date, task.status)}
        {task.assignee?.display_name && (
          <span className="ml-auto text-xs text-slate-400">
            {task.assignee.display_name}
          </span>
        )}
      </div>
    </div>
  )
}
