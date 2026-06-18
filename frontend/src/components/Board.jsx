import { useState } from 'react'
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

export default function Board({ tasks, updateTask, onTaskClick, hideEmptyColumns = false, banner = null }) {
  const [activeTask, setActiveTask] = useState(null)

  // Distance/delay activation keeps plain clicks (open modal) and touch
  // scrolling working alongside drag.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    }),
  )

  const byStatus = Object.fromEntries(
    STATUSES.map((s) => [s, tasks.filter((t) => t.status === s)]),
  )

  // Smart views only render columns that actually contain matching tasks.
  const visibleStatuses = hideEmptyColumns
    ? STATUSES.filter((s) => byStatus[s].length > 0)
    : STATUSES

  function handleDragEnd({ active, over }) {
    setActiveTask(null)
    if (!over) return

    const task = tasks.find((t) => t.id === active.id)
    if (!task) return

    // over.id is either a column status (empty area) or another task's id
    const overTask = tasks.find((t) => t.id === over.id)
    const targetStatus = overTask ? overTask.status : over.id
    if (!STATUSES.includes(targetStatus)) return

    const column = byStatus[targetStatus].filter((t) => t.id !== active.id)
    let index = overTask
      ? column.findIndex((t) => t.id === overTask.id)
      : column.length
    if (index === -1) index = column.length

    const above = index > 0 ? column[index - 1].position : null
    const below = index < column.length ? column[index].position : null
    const position = positionBetween(above, below)

    if (targetStatus === task.status && position === task.position) return
    updateTask(task.id, { status: targetStatus, position }).catch(() => {})
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={({ active }) =>
        setActiveTask(tasks.find((t) => t.id === active.id) ?? null)
      }
      onDragCancel={() => setActiveTask(null)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {visibleStatuses.length === 0 ? (
          banner ? (
            // Due soon / Overdue with no matches: the message replaces the board.
            <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
              <div className="w-full max-w-lg">{banner}</div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--card)] text-[var(--fg-subtle)]">
                <svg className="h-6 w-6" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" /></svg>
              </div>
              <p className="text-sm font-medium">Nothing here</p>
              <p className="mt-1 text-sm text-[var(--fg-muted)]">No tasks match this view.</p>
            </div>
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
