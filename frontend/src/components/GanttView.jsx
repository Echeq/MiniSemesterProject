import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../api/supabaseClient'
import EmptyState from './EmptyState'

const TASK_COL = 220
const ROW_H = 44
const BAR_H = 22
const BAR_Y = (ROW_H - BAR_H) / 2
const HEADER_UPPER_H = 26
const HEADER_LOWER_H = 34
const HEADER_H = HEADER_UPPER_H + HEADER_LOWER_H

const PX_PER_DAY = { Day: 52, Week: 22, Month: 7 }
const PADDING_DAYS = { Day: 3, Week: 10, Month: 25 }

const BAR_STYLE = {
  done:  { bg: '#10b981', text: '#fff' },
  doing: { bg: '#f59e0b', text: '#fff' },
  todo:  { bg: null, border: true, text: null },
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfWeek(date) {
  const d = startOfDay(date)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1)) // Monday
  return d
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function nextMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1)
}

function daysBetween(a, b) {
  return Math.round((b - a) / 86400000)
}

function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function buildHeaderCells(zoom, rangeStart, rangeEnd, xOf, lang) {
  const upper = []
  const lower = []

  if (zoom === 'Day') {
    let cur = startOfMonth(rangeStart)
    while (cur < rangeEnd) {
      const next = nextMonth(cur)
      const left = Math.max(0, xOf(cur))
      const right = xOf(next)
      upper.push({ label: new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric' }).format(cur), left, width: right - left })
      cur = next
    }
    let d = startOfDay(rangeStart)
    while (d < rangeEnd) {
      const isWeekend = d.getDay() === 0 || d.getDay() === 6
      lower.push({
        label: new Intl.DateTimeFormat(lang, { weekday: 'short', day: 'numeric' }).format(d),
        left: xOf(d),
        width: PX_PER_DAY.Day,
        isWeekend,
      })
      d = addDays(d, 1)
    }
  } else if (zoom === 'Week') {
    let cur = startOfMonth(rangeStart)
    while (cur < rangeEnd) {
      const next = nextMonth(cur)
      const left = Math.max(0, xOf(cur))
      const right = xOf(next)
      upper.push({ label: new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric' }).format(cur), left, width: right - left })
      cur = next
    }
    let w = startOfWeek(rangeStart)
    while (w < rangeEnd) {
      const next = addDays(w, 7)
      lower.push({
        label: new Intl.DateTimeFormat(lang, { month: 'short', day: 'numeric' }).format(w),
        left: xOf(w),
        width: xOf(next) - xOf(w),
      })
      w = next
    }
  } else {
    let yr = rangeStart.getFullYear()
    while (yr <= rangeEnd.getFullYear()) {
      const ys = new Date(yr, 0, 1)
      const ye = new Date(yr + 1, 0, 1)
      const left = Math.max(0, xOf(ys))
      const right = Math.min(xOf(rangeEnd), xOf(ye))
      if (right > left) upper.push({ label: String(yr), left, width: right - left })
      yr++
    }
    let cur = startOfMonth(rangeStart)
    while (cur < rangeEnd) {
      const next = nextMonth(cur)
      lower.push({
        label: new Intl.DateTimeFormat(lang, { month: 'short' }).format(cur),
        left: xOf(cur),
        width: xOf(next) - xOf(cur),
      })
      cur = next
    }
  }

  return { upper, lower }
}

// Orthogonal finish-to-start connector path between two bars.
function depPath(x1, y1, x2, y2) {
  const stub = 9
  if (x2 > x1 + stub + 6) {
    return `M${x1},${y1} L${x1 + stub},${y1} L${x1 + stub},${y2} L${x2},${y2}`
  }
  // Successor starts before predecessor ends — route around through the row gap.
  const backY = y2 + (y2 > y1 ? -ROW_H / 2 : ROW_H / 2)
  return `M${x1},${y1} L${x1 + stub},${y1} L${x1 + stub},${backY} L${x2 - stub},${backY} L${x2 - stub},${y2} L${x2},${y2}`
}

export default function GanttView({ tasks, onTaskClick, updateTask, onAddDependency, onRemoveDependency }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [zoom, setZoom] = useState('Week')
  const bodyRef = useRef(null)
  const contentRef = useRef(null)
  const pxPerDay = PX_PER_DAY[zoom]
  const pad = PADDING_DAYS[zoom]

  // Dependency edges: { task_id (successor), depends_on_id (predecessor) }.
  const [deps, setDeps] = useState([])
  // Active drag-to-link state.
  const [linkFrom, setLinkFrom] = useState(null) // predecessor task id
  const [linkPos, setLinkPos] = useState(null)   // { x, y } in content coords
  const [linkTarget, setLinkTarget] = useState(null) // hovered successor task id

  const ganttTasks = useMemo(() => tasks
    .filter((task) => task.due_date)
    .map((task) => {
      const end = startOfDay(new Date(task.due_date + 'T12:00:00'))
      const start = addDays(end, -3)
      return { ...task, _start: start, _end: end }
    })
    .sort((a, b) => a._start - b._start),
    [tasks])

  const taskIdsKey = useMemo(
    () => ganttTasks.map((t) => t.id).slice().sort().join(','),
    [ganttTasks],
  )

  // Fetch dependency edges for the visible tasks.
  useEffect(() => {
    if (!taskIdsKey) { setDeps([]); return }
    const ids = taskIdsKey.split(',')
    let cancelled = false
    supabase
      .from('task_dependencies')
      .select('task_id, depends_on_id')
      .in('task_id', ids)
      .then(({ data }) => { if (!cancelled && data) setDeps(data) })
    return () => { cancelled = true }
  }, [taskIdsKey])

  const pointerToContent = useCallback((e) => {
    const el = contentRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  const startLink = useCallback((e, taskId) => {
    e.stopPropagation()
    e.preventDefault()
    const pos = pointerToContent(e)
    setLinkFrom(taskId)
    setLinkPos(pos)
    setLinkTarget(null)
  }, [pointerToContent])

  // Window-level move/up handlers while a link is being dragged.
  const nRows = ganttTasks.length
  useEffect(() => {
    if (linkFrom == null) return

    function targetIdAt(pos) {
      if (!pos || pos.x <= TASK_COL) return null
      const idx = Math.floor((pos.y - HEADER_H) / ROW_H)
      if (idx < 0 || idx >= nRows) return null
      return ganttTasks[idx].id
    }

    function onMove(e) {
      const pos = pointerToContent(e)
      setLinkPos(pos)
      const tid = targetIdAt(pos)
      setLinkTarget(tid && tid !== linkFrom ? tid : null)
    }

    function onUp(e) {
      const pos = pointerToContent(e)
      const targetId = targetIdAt(pos)
      const source = linkFrom
      setLinkFrom(null)
      setLinkPos(null)
      setLinkTarget(null)
      if (!targetId || targetId === source) return
      // Skip if the edge (or its reverse) already exists.
      const exists = deps.some((d) => d.task_id === targetId && d.depends_on_id === source)
      const reverse = deps.some((d) => d.task_id === source && d.depends_on_id === targetId)
      if (exists || reverse) return
      const edge = { task_id: targetId, depends_on_id: source }
      setDeps((prev) => [...prev, edge])
      onAddDependency?.(targetId, source).catch(() => {
        setDeps((prev) => prev.filter((d) => !(d.task_id === edge.task_id && d.depends_on_id === edge.depends_on_id)))
      })
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [linkFrom, deps, ganttTasks, nRows, pointerToContent, onAddDependency])

  const removeDep = useCallback((successorId, predecessorId) => {
    setDeps((prev) => prev.filter((d) => !(d.task_id === successorId && d.depends_on_id === predecessorId)))
    onRemoveDependency?.(successorId, predecessorId).catch(() => {})
  }, [onRemoveDependency])

  // Drag a bar horizontally to shift its due date.
  const dateDragRef = useRef(null) // { startX, moved, task }
  const [dragId, setDragId] = useState(null)
  const [dragDx, setDragDx] = useState(0)

  const startDateDrag = useCallback((e, task) => {
    if (e.button !== 0) return
    e.preventDefault()
    dateDragRef.current = { startX: e.clientX, moved: false, task }
    setDragId(task.id)
    setDragDx(0)
  }, [])

  useEffect(() => {
    if (dragId == null) return
    const onMove = (e) => {
      const d = dateDragRef.current
      if (!d) return
      const dx = e.clientX - d.startX
      if (Math.abs(dx) > 3) d.moved = true
      setDragDx(dx)
    }
    const onUp = (e) => {
      const d = dateDragRef.current
      dateDragRef.current = null
      setDragId(null)
      setDragDx(0)
      if (!d) return
      if (!d.moved) { onTaskClick?.(d.task); return } // a click, not a drag
      const days = Math.round((e.clientX - d.startX) / pxPerDay)
      if (days === 0) return
      const next = addDays(new Date(d.task.due_date + 'T12:00:00'), days)
      updateTask?.(d.task.id, { due_date: toISODate(next) }).catch(() => {})
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragId, pxPerDay, onTaskClick, updateTask])

  if (ganttTasks.length === 0) {
    return (
      <EmptyState
        icon="calendar"
        title={t('gantt.noTasks')}
        description={t('gantt.noTasksDesc')}
      />
    )
  }

  const minDate = new Date(Math.min(...ganttTasks.map((t) => t._start)))
  const maxDate = new Date(Math.max(...ganttTasks.map((t) => t._end)))
  const rangeStart = startOfDay(addDays(minDate, -pad))
  const rangeEnd = startOfDay(addDays(maxDate, pad))
  const totalDays = daysBetween(rangeStart, rangeEnd)
  const timelineW = totalDays * pxPerDay
  const contentW = TASK_COL + timelineW
  const contentH = HEADER_H + ganttTasks.length * ROW_H

  function xOf(date) {
    return daysBetween(rangeStart, date) * pxPerDay
  }

  // Per-task geometry, keyed by id, in content coordinates.
  const layout = new Map()
  ganttTasks.forEach((task, i) => {
    const barLeft = xOf(task._start)
    const barRight = xOf(task._end)
    const barW = Math.max(barRight - barLeft, pxPerDay)
    layout.set(task.id, {
      leftX: TASK_COL + barLeft,
      rightX: TASK_COL + barLeft + barW,
      centerY: HEADER_H + i * ROW_H + ROW_H / 2,
      barLeft,
      barW,
    })
  })

  const { upper, lower } = buildHeaderCells(zoom, rangeStart, rangeEnd, xOf, lang)

  const today = startOfDay(new Date())
  const todayX = xOf(today)
  const showToday = todayX >= 0 && todayX <= timelineW

  function scrollToToday() {
    if (!bodyRef.current) return
    bodyRef.current.scrollLeft = Math.max(0, todayX - TASK_COL - 200)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-[var(--border-muted)] px-4 py-2">
        <span className="mr-1 text-xs font-medium text-[var(--fg-muted)]">{t('gantt.zoom')}:</span>
        {['Day', 'Week', 'Month'].map((m) => (
          <button
            key={m}
            onClick={() => setZoom(m)}
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
              zoom === m
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--fg-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--fg)]'
            }`}
          >
            {t(`gantt.${m.toLowerCase()}`)}
          </button>
        ))}
        <button
          onClick={scrollToToday}
          className="ml-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-[var(--fg-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--fg)] transition"
        >
          {t('gantt.today')}
        </button>
        {/* Legend */}
        <div className="ml-auto flex items-center gap-3 text-[10px] text-[var(--fg-muted)]">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-3 rounded-sm" style={{ background: '#10b981' }} />
            {t('board.done')}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-3 rounded-sm" style={{ background: '#f59e0b' }} />
            {t('board.inProgress')}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-3 rounded-sm border border-[var(--fg-subtle)]" style={{ background: 'transparent' }} />
            {t('board.todo')}
          </span>
          <span className="flex items-center gap-1">
            <svg width="18" height="8" className="overflow-visible">
              <line x1="0" y1="4" x2="14" y2="4" stroke="var(--accent)" strokeWidth="1.5" />
              <path d="M14,1 L18,4 L14,7 Z" fill="var(--accent)" />
            </svg>
            {t('gantt.dependencies')}
          </span>
        </div>
      </div>

      {/* Main scrollable grid */}
      <div ref={bodyRef} className="min-h-0 flex-1 overflow-auto">
        <div
          ref={contentRef}
          className="relative"
          style={{ minWidth: contentW, width: contentW, userSelect: (linkFrom != null || dragId != null) ? 'none' : undefined }}
        >

          {/* Sticky header row */}
          <div className="sticky top-0 z-20 flex" style={{ height: HEADER_H }}>
            {/* Task col header */}
            <div
              className="sticky left-0 z-30 shrink-0 flex items-end border-b border-r border-[var(--border-muted)] bg-[var(--surface)]"
              style={{ width: TASK_COL, minWidth: TASK_COL, paddingBottom: 8, paddingLeft: 16 }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                {t('task.title')}
              </span>
            </div>

            {/* Timeline header */}
            <div
              className="relative shrink-0 border-b border-[var(--border-muted)] bg-[var(--surface)]"
              style={{ width: timelineW, height: HEADER_H }}
            >
              {/* Upper row — months / years */}
              {upper.map((cell, i) => (
                <div
                  key={i}
                  className="absolute flex items-center overflow-hidden border-r border-[var(--border-muted)]"
                  style={{ left: cell.left, top: 0, width: cell.width, height: HEADER_UPPER_H }}
                >
                  <span className="truncate px-2 text-[10px] font-semibold text-[var(--fg-muted)]">{cell.label}</span>
                </div>
              ))}
              {/* Lower row — weeks / days / months */}
              {lower.map((cell, i) => (
                <div
                  key={i}
                  className="absolute flex items-center justify-center overflow-hidden border-r border-[var(--border-muted)]"
                  style={{
                    left: cell.left,
                    top: HEADER_UPPER_H,
                    width: cell.width,
                    height: HEADER_LOWER_H,
                    background: cell.isWeekend ? 'var(--glass)' : undefined,
                  }}
                >
                  <span className="truncate px-1 text-[10px] text-[var(--fg-muted)]">{cell.label}</span>
                </div>
              ))}
              {/* Today marker in header */}
              {showToday && (
                <div
                  className="absolute z-10"
                  style={{ left: todayX - 1, top: 0, width: 2, height: HEADER_H, background: 'var(--accent)' }}
                />
              )}
            </div>
          </div>

          {/* Task rows */}
          {ganttTasks.map((task) => {
            const barLeft = xOf(task._start)
            const barRight = xOf(task._end)
            const barW = Math.max(barRight - barLeft, pxPerDay)
            const st = BAR_STYLE[task.status] ?? BAR_STYLE.todo
            const isLinkTarget = linkTarget === task.id

            return (
              <div key={task.id} className="group/row flex" style={{ height: ROW_H }}>
                {/* Task name — sticky left */}
                <div
                  className="sticky left-0 z-10 shrink-0 flex cursor-pointer items-center border-b border-r border-[var(--border-muted)] bg-[var(--bg)] px-4 hover:bg-[var(--surface-hover)] transition-colors"
                  style={{ width: TASK_COL, minWidth: TASK_COL }}
                  onClick={() => onTaskClick?.(task)}
                >
                  <span className="truncate text-sm text-[var(--fg)]">{task.title}</span>
                </div>

                {/* Bar row */}
                <div
                  className="relative shrink-0 border-b border-[var(--border-muted)]"
                  style={{
                    width: timelineW,
                    height: ROW_H,
                    background: isLinkTarget ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : undefined,
                  }}
                >
                  {/* Weekend shading (Day zoom only) */}
                  {zoom === 'Day' && lower.filter((c) => c.isWeekend).map((c, j) => (
                    <div
                      key={j}
                      className="pointer-events-none absolute"
                      style={{ left: c.left, top: 0, width: c.width, height: ROW_H, background: 'var(--glass)' }}
                    />
                  ))}
                  {/* Vertical grid lines */}
                  {lower.map((c, j) => (
                    <div
                      key={j}
                      className="pointer-events-none absolute"
                      style={{ left: c.left, top: 0, width: 1, height: ROW_H, background: 'var(--border-muted)' }}
                    />
                  ))}
                  {/* Today line */}
                  {showToday && (
                    <div
                      className="pointer-events-none absolute z-10"
                      style={{ left: todayX - 1, top: 0, width: 2, height: ROW_H, background: 'var(--accent)', opacity: 0.35 }}
                    />
                  )}
                  {/* Task bar — drag horizontally to change due date, click to open */}
                  <div
                    className="absolute transition-opacity hover:opacity-80"
                    style={{
                      left: barLeft,
                      top: BAR_Y,
                      width: barW,
                      height: BAR_H,
                      borderRadius: 5,
                      background: st.bg ?? 'transparent',
                      border: st.border ? '1.5px solid var(--fg-subtle)' : 'none',
                      boxShadow: st.bg ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
                      overflow: 'hidden',
                      cursor: dragId === task.id ? 'grabbing' : 'ew-resize',
                      transform: dragId === task.id ? `translateX(${dragDx}px)` : undefined,
                      opacity: dragId === task.id ? 0.85 : undefined,
                      zIndex: dragId === task.id ? 30 : undefined,
                    }}
                    onMouseDown={(e) => startDateDrag(e, task)}
                  >
                    {barW > 50 && (
                      <span
                        className="pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-nowrap"
                        style={{ paddingLeft: 7, fontSize: 10, fontWeight: 500, color: st.text ?? 'var(--fg-muted)' }}
                      >
                        {task.title}
                      </span>
                    )}
                  </div>
                  {/* Dependency link handle — appears on row hover, drag to another bar */}
                  <div
                    title={t('gantt.linkHint')}
                    onMouseDown={(e) => startLink(e, task.id)}
                    className="absolute z-20 flex items-center justify-center rounded-full border border-[var(--accent)] bg-[var(--surface)] opacity-0 transition-opacity group-hover/row:opacity-100"
                    style={{
                      left: barLeft + barW - 5,
                      top: ROW_H / 2 - 6,
                      width: 12,
                      height: 12,
                      cursor: 'crosshair',
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  </div>
                </div>
              </div>
            )
          })}

          {/* Dependency arrows + active link overlay */}
          <svg
            className="pointer-events-none absolute left-0 top-0"
            width={contentW}
            height={contentH}
            style={{ overflow: 'visible' }}
          >
            <defs>
              <marker id="gantt-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="userSpaceOnUse">
                <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent)" />
              </marker>
            </defs>
            {deps.map((d, i) => {
              const p = layout.get(d.depends_on_id) // predecessor
              const s = layout.get(d.task_id)        // successor
              if (!p || !s) return null
              const path = depPath(p.rightX, p.centerY, s.leftX, s.centerY)
              return (
                <g key={`${d.depends_on_id}-${d.task_id}-${i}`}>
                  <path d={path} fill="none" stroke="var(--accent)" strokeWidth="1.5" markerEnd="url(#gantt-arrow)" opacity="0.85" />
                  {/* Wider invisible hit area to click-remove */}
                  <path
                    d={path}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="12"
                    style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                    onClick={() => removeDep(d.task_id, d.depends_on_id)}
                  >
                    <title>{t('gantt.removeDep')}</title>
                  </path>
                </g>
              )
            })}
            {/* Active drag line */}
            {linkFrom != null && linkPos && layout.get(linkFrom) && (
              <line
                x1={layout.get(linkFrom).rightX}
                y1={layout.get(linkFrom).centerY}
                x2={linkPos.x}
                y2={linkPos.y}
                stroke="var(--accent)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                markerEnd="url(#gantt-arrow)"
              />
            )}
          </svg>

          {/* Bottom padding */}
          <div style={{ height: 32 }} />
        </div>
      </div>
    </div>
  )
}
