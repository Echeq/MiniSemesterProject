import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { STATUSES, positionBetween } from '../hooks/useBoard'
import Column from './Column'
import TaskCard from './TaskCard'
import EmptyState from './EmptyState'
import ListView from './ListView'
import { CardSkeleton } from './Skeleton'

const COL_DOT = { todo: 'var(--todo)', doing: 'var(--doing)', done: 'var(--done)' }

export default function Board({
  tasks,
  allViewTasks,
  updateTask,
  onTaskClick,
  onAddTask,
  labels = [],
  hideEmptyColumns = false,
  banner = null,
  activeView = 'kanban',
  loading = false,
  members = [],
  editors,
}) {
  const { t } = useTranslation()
  const [activeTask, setActiveTask] = useState(null)
  const [visibleCols, setVisibleCols] = useState(STATUSES)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
  )

  const byStatus = useMemo(
    () => Object.fromEntries(STATUSES.map((s) => [s, tasks.filter((t) => t.status === s)])),
    [tasks],
  )

  const rawByStatus = useMemo(
    () => Object.fromEntries(STATUSES.map((s) => [s, (allViewTasks ?? tasks).filter((t) => t.status === s)])),
    [allViewTasks, tasks],
  )

  const visibleStatuses = useMemo(
    () => hideEmptyColumns
      ? STATUSES.filter((s) => byStatus[s].length > 0)
      : STATUSES.filter((s) => visibleCols.includes(s)),
    [hideEmptyColumns, byStatus, visibleCols],
  )

  const toggleCol = useCallback((status) => {
    setVisibleCols((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    )
  }, [])

  const tasksRef = useRef(tasks)
  useEffect(() => { tasksRef.current = tasks }, [tasks])
  const byStatusRef = useRef(byStatus)
  useEffect(() => { byStatusRef.current = byStatus }, [byStatus])

  const handleDragStart = useCallback(({ active }) => {
    setActiveTask(tasksRef.current.find((t) => t.id === active.id) ?? null)
  }, [])

  const handleDragCancel = useCallback(() => setActiveTask(null), [])

  const handleDragEnd = useCallback(({ active, over }) => {
    setActiveTask(null)
    if (!over) return
    const currentTasks = tasksRef.current
    const currentByStatus = byStatusRef.current

    const task = currentTasks.find((t) => t.id === active.id)
    if (!task) return

    const overTask = currentTasks.find((t) => t.id === over.id)
    const targetStatus = overTask ? overTask.status : over.id
    if (!STATUSES.includes(targetStatus)) return

    const column = currentByStatus[targetStatus].filter((t) => t.id !== active.id)
    let index = overTask
      ? column.findIndex((t) => t.id === overTask.id)
      : column.length
    if (index === -1) index = column.length

    const above = index > 0 ? column[index - 1].position : null
    const below = index < column.length ? column[index].position : null
    const position = positionBetween(above, below)

    if (targetStatus === task.status && position === task.position) return
    if (targetStatus === 'done' && (task.blocked_by || 0) > 0) return
    updateTask(task.id, { status: targetStatus, position }).catch(() => {})
  }, [updateTask])

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto p-4 sm:p-6">
        {STATUSES.map((s) => (
          <div key={s} className="flex w-[19rem] flex-shrink-0 flex-col gap-2.5 sm:w-80">
            <div className="mb-1 h-5 w-20 rounded bg-[var(--surface-hover)] animate-pulse" />
            {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
          </div>
        ))}
      </div>
    )
  }

  if (activeView === 'list') {
    return <ListView tasks={tasks} onTaskClick={onTaskClick} members={members} labels={labels} />
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {!hideEmptyColumns && !banner && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-[var(--border-muted)] px-4 py-2 sm:px-6">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-[var(--fg-muted)]">{t('filter.columns')}:</span>
              {STATUSES.map((s) => {
                const active = visibleCols.includes(s)
                return (
                  <button key={s} onClick={() => toggleCol(s)}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition ${
                      active ? 'bg-[var(--surface-hover)] text-[var(--fg)]' : 'text-[var(--fg-subtle)]'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: COL_DOT[s] }} />
                    {s === 'todo' ? t('board.todo') : s === 'doing' ? t('board.inProgress') : t('board.done')}
                    <span className="text-[var(--fg-subtle)]">({rawByStatus[s].length})</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
        {visibleStatuses.length === 0 ? (
          banner ? (
            <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
              <div className="w-full max-w-lg">{banner}</div>
            </div>
          ) : (
            <EmptyState icon="search" title={t('filter.noTasksFound')} description={t('filter.noTasksDesc')} />
          )
        ) : (
          <>
            {banner}
            <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto p-4 sm:p-6">
              {visibleStatuses.map((status) => (
                <Column
                  key={status}
                  status={status}
                  tasks={byStatus[status]}
                  onTaskClick={onTaskClick}
                  onAddTask={onAddTask}
                  editors={editors}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} overlay />}
      </DragOverlay>
    </DndContext>
  )
}
