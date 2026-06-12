import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import TaskCard from './TaskCard'

const LABELS = { todo: 'To Do', doing: 'Doing', done: 'Done' }
const ACCENTS = {
  todo: 'border-t-slate-400',
  doing: 'border-t-amber-400',
  done: 'border-t-green-500',
}

export default function Column({ status, tasks, onTaskClick }) {
  const { setNodeRef } = useDroppable({ id: status })

  return (
    <div
      className={`flex min-w-[260px] flex-1 flex-col rounded-xl border-t-4 bg-slate-50 sm:min-w-72 sm:flex-none sm:w-80 ${ACCENTS[status]}`}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <h2 className="text-sm font-semibold text-slate-700">
          {LABELS[status]}
        </h2>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
          {tasks.length}
        </span>
      </div>
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="flex flex-1 flex-col gap-2 p-2 pt-0">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
          {tasks.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs text-slate-400">
              No tasks
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}
