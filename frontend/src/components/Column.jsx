import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from './TaskCard'

const LABELS = { todo: 'To Do', doing: 'Doing', done: 'Done' }
const DOT = { todo: 'var(--todo)', doing: 'var(--doing)', done: 'var(--done)' }

export default function Column({ status, tasks, onTaskClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      className={`glass flex max-h-full w-[19rem] flex-shrink-0 flex-col rounded-xl shadow-[var(--shadow-md)] transition sm:w-80 ${
        isOver ? '!border-[var(--accent)] ring-1 ring-[var(--accent)]' : ''
      }`}
    >
      <div className="flex items-center justify-between border-b border-[var(--glass-border)] px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: DOT[status] }} />
          <h2 className="text-sm font-semibold">{LABELS[status]}</h2>
          <span className="rounded-full bg-[var(--surface-hover)] px-1.5 text-xs font-medium text-[var(--fg-muted)]">
            {tasks.length}
          </span>
        </div>
      </div>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-2.5">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
          {tasks.length === 0 && (
            <div className="rounded-md border border-dashed border-[var(--border)] px-4 py-8 text-center text-xs text-[var(--fg-subtle)]">
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}
