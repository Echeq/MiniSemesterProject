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
const STATUS_LABEL_KEYS = { todo: 'board.todo', doing: 'board.inProgress', done: 'board.done' }

export default function Board({
  tasks,
  allViewTasks,
  updateTask,
  isAdmin = false,
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640)
  const [mobileMenuTask, setMobileMenuTask] = useState(null)
  const [colIndex, setColIndex] = useState(0)
  const touchStartX = useRef(null)

  useEffect(() => {
    function handleResize() { setIsMobile(window.innerWidth < 640) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
  )

  const byStatus = useMemo(() => {
    const grouped = { todo: [], doing: [], done: [] }
    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i]
      if (grouped[t.status]) grouped[t.status].push(t)
    }
    return grouped
  }, [tasks])

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

  useEffect(() => {
    if (colIndex >= visibleStatuses.length) setColIndex(0)
  }, [visibleStatuses, colIndex])

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
    updateTask(task.id, { status: targetStatus, position }).catch(() => {})
  }, [updateTask])

  const handleTaskTap = useCallback((task) => {
    if (isMobile) {
      setMobileMenuTask(task)
    } else {
      onTaskClick(task)
    }
  }, [isMobile, onTaskClick])

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((e) => {
    const startX = touchStartX.current
    if (startX == null) return
    const diff = startX - e.changedTouches[0].clientX
    touchStartX.current = null
    if (Math.abs(diff) < 50) return
    if (diff > 0 && colIndex < visibleStatuses.length - 1) {
      setColIndex((i) => i + 1)
    } else if (diff < 0 && colIndex > 0) {
      setColIndex((i) => i - 1)
    }
  }, [colIndex, visibleStatuses.length])

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
        ) : isMobile ? (
          <>
            {banner}
            <div className="flex min-h-0 flex-1 touch-pan-y p-4"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div className="flex w-full justify-center">
                <div className="w-full max-w-sm">
                  <Column
                    status={visibleStatuses[colIndex]}
                    tasks={byStatus[visibleStatuses[colIndex]]}
                    onTaskClick={handleTaskTap}
                    onAddTask={onAddTask}
                    editors={editors}
                    isMobile={isMobile}
                  />
                </div>
              </div>
            </div>
            {visibleStatuses.length > 1 && (
              <div className="flex justify-center gap-2 pb-3">
                {visibleStatuses.map((s, i) => (
                  <button key={s} type="button" onClick={() => setColIndex(i)}
                    className={`h-2 w-2 rounded-full transition ${
                      i === colIndex ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                    }`}
                    aria-label={`Switch to ${t(STATUS_LABEL_KEYS[s])}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {banner}
            <div className="flex min-h-0 flex-1 overflow-x-auto p-4 sm:p-6">
              <div className="flex gap-4 sm:gap-4">
                {visibleStatuses.map((status) => (
                  <div key={status} className="w-full max-w-[19rem] flex-shrink-0 sm:w-80">
                    <Column
                      status={status}
                      tasks={byStatus[status]}
                      onTaskClick={onTaskClick}
                      onAddTask={onAddTask}
                      editors={editors}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      {!isMobile && (
        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} overlay />}
        </DragOverlay>
      )}

      {mobileMenuTask && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:hidden" onClick={() => setMobileMenuTask(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full max-w-sm rounded-t-2xl bg-[var(--surface)] p-4 shadow-[var(--shadow-lg)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--border)]" />
            <p className="mb-3 text-sm font-semibold truncate">{mobileMenuTask.title}</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => { onTaskClick(mobileMenuTask); setMobileMenuTask(null) }}
                className="btn btn-primary w-full justify-center"
              >
                {isAdmin ? t('task.edit') : t('task.view')}
              </button>
              {STATUSES.filter((s) => s !== mobileMenuTask.status).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={async () => {
                    const statusTasks = byStatusRef.current[s]
                    const maxPos = statusTasks.length > 0
                      ? Math.max(...statusTasks.map((c) => c.position))
                      : 0
                    await updateTask(mobileMenuTask.id, { status: s, position: maxPos + 1024 }).catch(() => {})
                    setMobileMenuTask(null)
                  }}
                  className="btn btn-default w-full justify-center"
                >
                  {t('board.moveTo')} {t(STATUS_LABEL_KEYS[s])}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setMobileMenuTask(null)}
                className="btn btn-default w-full justify-center text-[var(--fg-muted)]"
              >
                {t('task.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  )
}
