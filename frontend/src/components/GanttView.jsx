import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Gantt from 'frappe-gantt'
import '../gantt.css'
import EmptyState from './EmptyState'

const ZOOM_MODES = [
  { key: 'Quarter Day', tKey: 'gantt.quarterDay' },
  { key: 'Half Day',    tKey: 'gantt.halfDay' },
  { key: 'Day',        tKey: 'gantt.day' },
  { key: 'Week',       tKey: 'gantt.week' },
  { key: 'Month',      tKey: 'gantt.month' },
]

function toGanttDate(iso) {
  return iso.replace(/-/g, '/')
}

function toISODate(ganttDate) {
  return String(ganttDate).slice(0, 10)
}

export default function GanttView({ tasks, onTaskClick, updateTask }) {
  const { t, i18n } = useTranslation()
  const containerRef = useRef(null)
  const ganttRef = useRef(null)
  const [zoom, setZoom] = useState('Week')
  const zoomRef = useRef('Week')
  const tasksRef = useRef(tasks)
  const prevLangRef = useRef(i18n.language)

  useEffect(() => { tasksRef.current = tasks }, [tasks])

  const ganttTasks = useMemo(() => tasks
    .filter((task) => task.due_date)
    .map((task) => {
      const end = task.due_date
      const startDate = new Date(end)
      startDate.setDate(startDate.getDate() - 3)
      const start = startDate.toISOString().slice(0, 10)
      return {
        id: task.id,
        name: task.title,
        start: toGanttDate(start),
        end: toGanttDate(end),
        progress: task.status === 'done' ? 100 : task.status === 'doing' ? 50 : 0,
        custom_class: task.status === 'done' ? 'gantt-done' : task.status === 'doing' ? 'gantt-doing' : '',
      }
    }), [tasks])

  useEffect(() => {
    if (!containerRef.current || ganttTasks.length === 0) return

    const langChanged = prevLangRef.current !== i18n.language
    prevLangRef.current = i18n.language

    if (ganttRef.current && !langChanged) {
      ganttRef.current.refresh(ganttTasks)
      return
    }

    containerRef.current.innerHTML = ''
    ganttRef.current = new Gantt(containerRef.current, ganttTasks, {
      view_mode: zoomRef.current,
      date_format: 'YYYY/MM/DD',
      today_button: false,
      language: i18n.language,
      on_click: (ganttTask) => {
        const orig = tasksRef.current.find((task) => task.id === ganttTask.id)
        if (orig) onTaskClick?.(orig)
      },
      on_date_change: (ganttTask, start, end) => {
        const newDueDate = toISODate(end)
        if (updateTask) updateTask(ganttTask.id, { due_date: newDueDate }).catch(() => {})
      },
      on_progress_change: () => {},
      on_view_change: (mode) => {
        const name = mode?.name ?? mode
        setZoom(name)
        zoomRef.current = name
      },
    })

    return () => { ganttRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ganttTasks, i18n.language])

  if (ganttTasks.length === 0) {
    return (
      <EmptyState
        icon="calendar"
        title={t('gantt.noTasks')}
        description={t('gantt.noTasksDesc')}
      />
    )
  }

  function changeZoom(mode) {
    setZoom(mode)
    zoomRef.current = mode
    ganttRef.current?.change_view_mode(mode)
  }

  function scrollToToday() {
    ganttRef.current?.scroll_current()
  }

  function exportPNG() {
    const svg = containerRef.current?.querySelector('svg')
    if (!svg) return
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svg)
    const { width, height } = svg.getBoundingClientRect()
    const canvas = document.createElement('canvas')
    canvas.width = width * window.devicePixelRatio
    canvas.height = height * window.devicePixelRatio
    const ctx = canvas.getContext('2d')
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    const img = new Image()
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    img.onload = () => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = 'gantt-chart.png'
      a.click()
    }
    img.src = url
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-1.5 border-b border-[var(--border-muted)] px-4 py-2 sm:px-6">
        <span className="text-xs font-medium text-[var(--fg-muted)]">{t('gantt.zoom')}:</span>
        {ZOOM_MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => changeZoom(m.key)}
            className={`rounded-full px-2 py-0.5 text-xs font-medium transition ${
              zoom === m.key
                ? 'bg-[var(--accent)] !text-white'
                : 'text-[var(--fg-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--fg)]'
            }`}
          >
            {t(m.tKey)}
          </button>
        ))}
        <button
          onClick={scrollToToday}
          className="rounded-full px-2 py-0.5 text-xs font-medium text-[var(--fg-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--fg)] transition"
        >
          {t('gantt.today')}
        </button>
        <button
          onClick={exportPNG}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-[var(--fg-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--fg)] transition"
          title={t('gantt.exportPng')}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z" />
            <path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.97a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06Z" />
          </svg>
          {t('gantt.exportPng')}
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div ref={containerRef} className="gantt-wrapper" />
      </div>
    </div>
  )
}
