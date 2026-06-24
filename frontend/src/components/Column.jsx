import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from './TaskCard'

const DOT = { todo: 'var(--todo)', doing: 'var(--doing)', done: 'var(--done)' }

function Column({ status, tasks, onTaskClick, onAddTask, editors }) {
  const { t } = useTranslation()
  const LABELS = { todo: t('board.todo'), doing: t('board.inProgress'), done: t('board.done') }

  const { setNodeRef, isOver } = useDroppable({ id: status })
  const sortableIds = useMemo(() => tasks.map((task) => task.id), [tasks])

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
        {onAddTask && (
          <button
            onClick={() => onAddTask(status)}
            title={`Add task to ${LABELS[status]}`}
            className="rounded p-1 text-[var(--fg-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--fg)] transition"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z" />
            </svg>
          </button>
        )}
      </div>
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-2.5">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} editors={editors} />
          ))}
          {tasks.length === 0 && (
            <div className="rounded-md border border-dashed border-[var(--border)] px-4 py-8 text-center text-xs text-[var(--fg-subtle)]">
              {t('board.noTasks')}
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export default memo(Column)
