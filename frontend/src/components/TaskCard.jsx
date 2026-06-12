import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function dueBadge(due_date, status) {
  if (!due_date) return null
  const today = new Date().toISOString().slice(0, 10)
  const overdue = status !== 'done' && due_date < today
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-xs font-medium ${
        overdue ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
      }`}
    >
      {due_date}
    </span>
  )
}

export default function TaskCard({ task, onClick, overlay = false }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, disabled: overlay })

  const style = overlay
    ? undefined
    : { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(task)}
      className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:border-indigo-300 active:cursor-grabbing ${
        isDragging ? 'opacity-40' : ''
      } ${overlay ? 'rotate-2 shadow-lg' : ''}`}
    >
      <p className="text-sm font-medium text-slate-800">{task.title}</p>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
          {task.description}
        </p>
      )}
      <div className="mt-2 flex items-center justify-between">
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
