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
import { useIsMobile } from '../hooks/useIsMobile'
import Column from './Column'
import TaskCard from './TaskCard'

export default function Board({
  tasks,
  role,
  updateTask,
  onTaskClick,
  onMobileAction,
  onInvitationClick,
}) {
  const [activeTask, setActiveTask] = useState(null)
  const isMobile = useIsMobile()
  const isAdmin = role === 'admin'

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    }),
  )

  const byStatus = Object.fromEntries(
    STATUSES.map((s) => [s, tasks.filter((t) => t.status === s)]),
  )

  function handleDragStart({ active }) {
    if (!isAdmin) return
    setActiveTask(tasks.find((t) => t.id === active.id) ?? null)
  }

  function handleDragEnd({ active, over }) {
    setActiveTask(null)
    if (!over || !isAdmin) return

    const task = tasks.find((t) => t.id === active.id)
    if (!task) return

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

  if (isMobile) {
    return (
      <div className="flex w-full flex-col gap-4 px-2 py-4 overflow-y-auto overflow-x-hidden">
        {STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={byStatus[status]}
            role={role}
            onTaskClick={onTaskClick}
            onInvitationClick={onInvitationClick}
            onMobileAction={onMobileAction}
            mobile
          />
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragCancel={() => setActiveTask(null)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-1 gap-5 overflow-x-auto overscroll-x-contain p-3 sm:p-6 sm:px-8">
        {STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={byStatus[status]}
            role={role}
            onTaskClick={onTaskClick}
            onInvitationClick={onInvitationClick}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} overlay role={role} />}
      </DragOverlay>
    </DndContext>
  )
}
