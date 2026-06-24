import { useEffect, useRef } from 'react'
import Gantt from 'frappe-gantt'
import '../gantt.css'
import EmptyState from './EmptyState'

const ZOOM_MODES = ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month']

function toGanttDate(iso) {
  return iso.replace(/-/g, '/')
}

export default function GanttView({ tasks, onTaskClick }) {
  const containerRef = useRef(null)
  const ganttRef = useRef(null)
  const zoomRef = useRef('Week')

  const ganttTasks = tasks
    .filter((t) => t.due_date)
    .map((t) => {
      const end = t.due_date
      const startDate = new Date(end)
      startDate.setDate(startDate.getDate() - 3)
      const start = startDate.toISOString().slice(0, 10)
      return {
        id: t.id,
        name: t.title,
        start: toGanttDate(start),
        end: toGanttDate(end),
        progress: t.status === 'done' ? 100 : t.status === 'doing' ? 50 : 0,
        custom_class: t.status === 'done' ? 'gantt-done' : t.status === 'doing' ? 'gantt-doing' : '',
      }
    })

  useEffect(() => {
    if (!containerRef.current || ganttTasks.length === 0) return

    ganttRef.current = new Gantt(containerRef.current, ganttTasks, {
      view_mode: zoomRef.current,
      date_format: 'YYYY/MM/DD',
      on_click: (ganttTask) => {
        const orig = tasks.find((t) => t.id === ganttTask.id)
        if (orig) onTaskClick?.(orig)
      },
      on_date_change: () => {},
      on_progress_change: () => {},
      on_view_change: (mode) => { zoomRef.current = mode },
    })

    return () => { ganttRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ganttTasks.length])

  if (ganttTasks.length === 0) {
    return (
      <EmptyState
        icon="calendar"
        title="No tasks with due dates"
        description="Assign due dates to tasks to see them on the Gantt chart."
      />
    )
  }

  function setZoom(mode) {
    zoomRef.current = mode
    ganttRef.current?.change_view_mode(mode)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Zoom controls */}
      <div className="flex items-center gap-1.5 border-b border-[var(--border-muted)] px-4 py-2 sm:px-6">
        <span className="text-xs font-medium text-[var(--fg-muted)]">Zoom:</span>
        {ZOOM_MODES.map((m) => (
          <button key={m} onClick={() => setZoom(m)}
            className="rounded-full px-2 py-0.5 text-xs font-medium text-[var(--fg-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--fg)] transition">
            {m}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div ref={containerRef} className="gantt-wrapper" />
      </div>
    </div>
  )
}
