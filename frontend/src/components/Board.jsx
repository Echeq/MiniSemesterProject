import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

const PRIORITIES = ['P0', 'P1', 'P2', 'P3']
const PRIORITY_LABEL = { P0: 'Critical', P1: 'High', P2: 'Medium', P3: 'Low' }
const PRIORITY_COLOR = { P0: '#ef4444', P1: '#f59e0b', P2: '#eab308', P3: '#10b981' }
const COL_DOT = { todo: 'var(--todo)', doing: 'var(--doing)', done: 'var(--done)' }

export default function Board({
  tasks,
  allViewTasks,
  updateTask,
  onTaskClick,
  onAddTask,
  labels = [],
  priorityFilter = '',
  setPriorityFilter,
  labelFilter = null,
  setLabelFilter,
  hideEmptyColumns = false,
  banner = null,
  activeView = 'kanban',
  loading = false,
  members = [],
  editors,
}) {
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

  useEffect(() => {
    if (labelFilter && setLabelFilter && !labels.some((l) => l.id === labelFilter)) {
      setLabelFilter(null)
    }
  }, [labels, labelFilter, setLabelFilter])

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

  const hasActiveFilter = priorityFilter || labelFilter

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
              <span className="text-xs font-medium text-[var(--fg-muted)]">Columns:</span>
              {STATUSES.map((s) => {
                const active = visibleCols.includes(s)
                return (
                  <button key={s} onClick={() => toggleCol(s)}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition ${
                      active ? 'bg-[var(--surface-hover)] text-[var(--fg)]' : 'text-[var(--fg-subtle)]'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: COL_DOT[s] }} />
                    {s === 'todo' ? 'To Do' : s === 'doing' ? 'Doing' : 'Done'}
                    <span className="text-[var(--fg-subtle)]">({rawByStatus[s].length})</span>
                  </button>
                )
              })}
            </div>

            {setPriorityFilter && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-[var(--fg-muted)]">Priority:</span>
                <button
                  onClick={() => setPriorityFilter('')}
                  className={`rounded-full px-2 py-0.5 text-xs font-medium transition ${
                    !priorityFilter ? 'bg-[var(--surface-hover)] text-[var(--fg)]' : 'text-[var(--fg-subtle)]'
                  }`}
                >
                  All
                </button>
                {PRIORITIES.map((p) => (
                  <button key={p}
                    onClick={() => setPriorityFilter((prev) => prev === p ? '' : p)}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition"
                    style={priorityFilter === p
                      ? { background: `color-mix(in srgb, ${PRIORITY_COLOR[p]} 20%, transparent)`, color: PRIORITY_COLOR[p] }
                      : { color: 'var(--fg-subtle)' }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: PRIORITY_COLOR[p] }} />
                    {PRIORITY_LABEL[p]}
                  </button>
                ))}
              </div>
            )}

            {setLabelFilter && labels.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-[var(--fg-muted)]">Label:</span>
                <button
                  onClick={() => setLabelFilter(null)}
                  className={`rounded-full px-2 py-0.5 text-xs font-medium transition ${
                    !labelFilter ? 'bg-[var(--surface-hover)] text-[var(--fg)]' : 'text-[var(--fg-subtle)]'
                  }`}
                >All</button>
                {labels.map((l) => (
                  <button key={l.id}
                    onClick={() => setLabelFilter((prev) => prev === l.id ? null : l.id)}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition"
                    style={labelFilter === l.id ? { background: l.color, color: '#fff' } : { color: 'var(--fg-subtle)' }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: l.color }} />
                    {l.name}
                  </button>
                ))}
              </div>
            )}

            {hasActiveFilter && (
              <button
                onClick={() => { setPriorityFilter?.(''); setLabelFilter?.(null) }}
                className="ml-auto text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] transition"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
        {visibleStatuses.length === 0 ? (
          banner ? (
            <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
              <div className="w-full max-w-lg">{banner}</div>
            </div>
          ) : (
            <EmptyState icon="search" title="No tasks found" description="No tasks match this view. Try a different filter or create a new task." />
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
