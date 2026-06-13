import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import TaskCard from './TaskCard'

const LABELS = { todo: 'To Do', doing: 'In progress', done: 'Done' }
const ICONS = {
  todo: (
    <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  doing: (
    <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  done: (
    <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}
const ACCENTS = {
  todo: 'border-t-slate-300',
  doing: 'border-t-amber-400',
  done: 'border-t-green-500',
}
const MOBILE_BG = {
  todo: 'bg-slate-100/80',
  doing: 'bg-amber-50/80',
  done: 'bg-green-50/80',
}
const DESKTOP_BG = {
  todo: 'bg-slate-100/60',
  doing: 'bg-amber-50/60',
  done: 'bg-green-50/60',
}

export default function Column({ status, tasks, onTaskClick, onMobileAction, mobile }) {
  const { setNodeRef } = useDroppable({ id: status })

  if (mobile) {
    return (
      <div className={`w-full rounded-2xl border-t-4 ${MOBILE_BG[status]} ${ACCENTS[status]} shadow-sm`}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            {ICONS[status]}
            <h2 className="text-sm font-bold text-slate-700">
              {LABELS[status]}
            </h2>
          </div>
          <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-semibold text-slate-500 shadow-xs">
            {tasks.length}
          </span>
        </div>
        <div className="flex flex-col gap-2.5 px-4 pb-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onMobileAction?.(task)}
              mobile
            />
          ))}
          {tasks.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-5 text-center text-xs text-slate-400">
              No tasks yet
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex min-w-0 flex-1 flex-col rounded-2xl border-t-4 shadow-sm ${DESKTOP_BG[status]} ${ACCENTS[status]}`}
    >
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-2">
          {ICONS[status]}
          <h2 className="text-sm font-bold text-slate-700">
            {LABELS[status]}
          </h2>
        </div>
        <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-semibold text-slate-500 shadow-xs">
          {tasks.length}
        </span>
      </div>
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="flex flex-1 flex-col gap-2.5 px-4 pb-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick?.(task)} />
          ))}
          {tasks.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-5 text-center text-sm text-slate-400">
              No tasks yet
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}
