import { useMemo, useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import Avatar from './Avatar'

const PRIORITY_COLOR = { P0: '#ef4444', P1: '#f59e0b', P2: '#eab308', P3: '#10b981' }
const PRIORITY_ORDER = { P0: 0, P1: 1, P2: 2, P3: 3, '': 4 }
const STATUS_ORDER = { todo: 0, doing: 1, done: 2 }
const PRIORITIES = ['P0', 'P1', 'P2', 'P3']
const LS_KEY = 'taskflow:listview:prefs'

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} }
}
function savePrefs(p) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(p)) } catch {}
}

function SortIcon({ active, dir }) {
  if (!active) return <span className="ml-1 opacity-30">↕</span>
  return <span className="ml-1">{dir === 'asc' ? '↑' : '↓'}</span>
}

export default function ListView({ tasks, onTaskClick, members = [], labels = [], updateTask, onDeleteTask }) {
  const { t } = useTranslation()

  const STATUS_LABEL = { todo: t('board.todo'), doing: t('board.inProgress'), done: t('board.done') }
  const PRIORITY_LABEL = { P0: t('filter.p0'), P1: t('filter.p1'), P2: t('filter.p2'), P3: t('filter.p3') }

  const prefs = useMemo(loadPrefs, [])
  const [sort, setSort] = useState({ col: prefs.sortCol || 'title', dir: prefs.sortDir || 'asc' })
  const [compact, setCompact] = useState(prefs.compact ?? false)
  const [showFilters, setShowFilters] = useState(false)
  const [fStatus, setFStatus] = useState(prefs.fStatus || [])
  const [fPriority, setFPriority] = useState(prefs.fPriority || [])
  const [fAssignee, setFAssignee] = useState(prefs.fAssignee || '')
  const [fLabel, setFLabel] = useState(prefs.fLabel || '')
  const [fDueFrom, setFDueFrom] = useState(prefs.fDueFrom || '')
  const [fDueTo, setFDueTo] = useState(prefs.fDueTo || '')

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState(/** @type {Set<string>} */ (new Set()))

  useEffect(() => {
    savePrefs({ sortCol: sort.col, sortDir: sort.dir, compact, fStatus, fPriority, fAssignee, fLabel, fDueFrom, fDueTo })
  }, [sort, compact, fStatus, fPriority, fAssignee, fLabel, fDueFrom, fDueTo])

  useEffect(() => { setSelectedIds(new Set()) }, [fStatus, fPriority, fAssignee, fLabel, fDueFrom, fDueTo])

  function toggleSort(col) {
    setSort((prev) => prev.col === col ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })
  }

  function toggleStatusFilter(s) {
    setFStatus((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])
  }

  function togglePriorityFilter(p) {
    setFPriority((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])
  }

  const activeFilterCount = fStatus.length + fPriority.length + (fAssignee ? 1 : 0) + (fLabel ? 1 : 0) + (fDueFrom || fDueTo ? 1 : 0)

  const displayed = useMemo(() => {
    let result = [...tasks]
    if (fStatus.length > 0) result = result.filter((t) => fStatus.includes(t.status))
    if (fPriority.length > 0) result = result.filter((t) => fPriority.includes(t.priority || ''))
    if (fAssignee) result = result.filter((t) => t.assignee === fAssignee)
    if (fLabel) result = result.filter((t) => (t.labels || []).some((l) => l.id === fLabel))
    if (fDueFrom) result = result.filter((t) => t.due_date && t.due_date >= fDueFrom)
    if (fDueTo) result = result.filter((t) => t.due_date && t.due_date <= fDueTo)
    result.sort((a, b) => {
      let va, vb
      if (sort.col === 'title') { va = a.title?.toLowerCase() ?? ''; vb = b.title?.toLowerCase() ?? '' }
      else if (sort.col === 'status') { va = STATUS_ORDER[a.status] ?? 0; vb = STATUS_ORDER[b.status] ?? 0 }
      else if (sort.col === 'priority') { va = PRIORITY_ORDER[a.priority ?? '']; vb = PRIORITY_ORDER[b.priority ?? ''] }
      else if (sort.col === 'due_date') { va = a.due_date ?? '9999'; vb = b.due_date ?? '9999' }
      else if (sort.col === 'assignee') { va = a.assignee_profile?.display_name?.toLowerCase() ?? ''; vb = b.assignee_profile?.display_name?.toLowerCase() ?? '' }
      if (va < vb) return sort.dir === 'asc' ? -1 : 1
      if (va > vb) return sort.dir === 'asc' ? 1 : -1
      return 0
    })
    return result
  }, [tasks, sort, fStatus, fPriority, fAssignee, fLabel, fDueFrom, fDueTo])

  const displayedIds = useMemo(() => new Set(displayed.map((t) => t.id)), [displayed])
  const allSelected = displayed.length > 0 && displayed.every((t) => selectedIds.has(t.id))
  const someSelected = displayed.some((t) => selectedIds.has(t.id))
  const selectedCount = displayed.filter((t) => selectedIds.has(t.id)).length

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        for (const id of displayedIds) next.delete(id)
        return next
      })
    } else {
      setSelectedIds((prev) => { const n = new Set(prev); for (const id of displayedIds) n.add(id); return n })
    }
  }

  function clearSelection() { setSelectedIds(new Set()) }

  const handleBulkStatus = useCallback(async (status) => {
    const ids = displayed.filter((t) => selectedIds.has(t.id)).map((t) => t.id)
    for (const id of ids) { await updateTask(id, { status }).catch(() => {}) }
    clearSelection()
  }, [displayed, selectedIds, updateTask])

  const handleBulkPriority = useCallback(async (priority) => {
    const ids = displayed.filter((t) => selectedIds.has(t.id)).map((t) => t.id)
    for (const id of ids) { await updateTask(id, { priority: priority || null }).catch(() => {}) }
    clearSelection()
  }, [displayed, selectedIds, updateTask])

  const handleBulkDelete = useCallback(() => {
    const ids = displayed.filter((t) => selectedIds.has(t.id)).map((t) => t.id)
    if (!window.confirm(t('task.bulkDeleteConfirm', { count: ids.length }))) return
    ids.forEach((id) => onDeleteTask?.(id)?.catch(() => {}))
    clearSelection()
  }, [displayed, selectedIds, onDeleteTask, t])

  const th = 'cursor-pointer select-none py-2 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)] hover:text-[var(--fg)] transition whitespace-nowrap'

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-[var(--border-muted)] px-4 py-2 sm:px-6">
        <button
          onClick={() => setShowFilters((s) => !s)}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition ${
            showFilters || activeFilterCount > 0
              ? 'bg-[var(--accent)] text-white'
              : 'bg-[var(--surface-hover)] text-[var(--fg-muted)] hover:text-[var(--fg)]'
          }`}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
            <path d="M.75 3h14.5a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1 0-1.5ZM3 7.75A.75.75 0 0 1 3.75 7h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 3 7.75m2.75 3.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5Z" />
          </svg>
          {t('filter.filters')}{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>
        <button
          onClick={() => setCompact((s) => !s)}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition ${
            compact ? 'bg-[var(--surface-hover)] text-[var(--fg)]' : 'text-[var(--fg-subtle)]'
          }`}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1 2.75A.75.75 0 0 1 1.75 2h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 2.75m0 5A.75.75 0 0 1 1.75 7h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 7.75m0 5a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1-.75-.75" />
          </svg>
          {t('filter.compact')}
        </button>
        {activeFilterCount > 0 && (
          <button onClick={() => { setFStatus([]); setFPriority([]); setFAssignee(''); setFLabel(''); setFDueFrom(''); setFDueTo('') }}
            className="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] transition">
            {t('filter.clearFilters')}
          </button>
        )}
        <span className="ml-auto text-xs text-[var(--fg-subtle)]">{t('filter.taskCount', { count: displayed.length })}</span>
      </div>

      {/* Selection toolbar */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-3 border-b border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] px-4 py-2 sm:px-6 text-sm">
          <span className="text-xs font-medium text-[var(--accent)]">{t('task.bulkSelected', { count: selectedCount })}</span>
          <span className="h-4 w-px bg-[var(--border)]" />
          <select
            onChange={(e) => { const s = e.target.value; if (s) handleBulkStatus(s) }}
            className="input !py-1 !text-xs"
            defaultValue=""
          >
            <option value="">{t('task.status')}…</option>
            <option value="todo">{t('board.todo')}</option>
            <option value="doing">{t('board.inProgress')}</option>
            <option value="done">{t('board.done')}</option>
          </select>
          <select
            onChange={(e) => { const p = e.target.value; if (p !== '') handleBulkPriority(p) }}
            className="input !py-1 !text-xs"
            defaultValue=""
          >
            <option value="">{t('task.priority')}…</option>
            <option value="P0">P0 {t('filter.p0')}</option>
            <option value="P1">P1 {t('filter.p1')}</option>
            <option value="P2">P2 {t('filter.p2')}</option>
            <option value="P3">P3 {t('filter.p3')}</option>
          </select>
          {onDeleteTask && (
            <button type="button" onClick={handleBulkDelete} className="btn btn-danger !py-1 !text-xs">
              {t('task.delete')}
            </button>
          )}
          <button type="button" onClick={clearSelection} className="ml-auto text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] transition">
            {t('task.cancel')}
          </button>
        </div>
      )}

      {/* Filter panel */}
      {showFilters && (
        <div className="flex flex-wrap items-end gap-4 border-b border-[var(--border-muted)] bg-[var(--surface-hover)] px-4 py-3 sm:px-6">
          <div>
            <p className="mb-1.5 text-xs font-medium text-[var(--fg-muted)]">{t('filter.status')}</p>
            <div className="flex gap-1.5">
              {['todo', 'doing', 'done'].map((s) => (
                <button key={s} onClick={() => toggleStatusFilter(s)}
                  className={`rounded-full px-2 py-0.5 text-xs font-medium transition ${
                    fStatus.includes(s) ? 'text-white' : 'border border-[var(--border)] text-[var(--fg-muted)]'
                  }`}
                  style={fStatus.includes(s) ? { background: `var(--${s})` } : {}}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-[var(--fg-muted)]">{t('filter.priority')}</p>
            <div className="flex gap-1.5">
              {PRIORITIES.map((p) => (
                <button key={p} onClick={() => togglePriorityFilter(p)}
                  className="rounded-full px-2 py-0.5 text-xs font-medium transition"
                  style={fPriority.includes(p)
                    ? { background: PRIORITY_COLOR[p], color: '#fff' }
                    : { border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
                >
                  {PRIORITY_LABEL[p]}
                </button>
              ))}
            </div>
          </div>
          {labels.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-[var(--fg-muted)]">{t('filter.label')}</p>
              <select value={fLabel} onChange={(e) => setFLabel(e.target.value)} className="input !py-1 !text-xs">
                <option value="">{t('filter.anyLabel')}</option>
                {labels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          )}
          {members.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-[var(--fg-muted)]">{t('filter.assignee')}</p>
              <select value={fAssignee} onChange={(e) => setFAssignee(e.target.value)} className="input !py-1 !text-xs">
                <option value="">{t('filter.anyAssignee')}</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.display_name}</option>)}
              </select>
            </div>
          )}
          <div>
            <p className="mb-1.5 text-xs font-medium text-[var(--fg-muted)]">{t('filter.dueDateRange')}</p>
            <div className="flex items-center gap-1.5">
              <input type="date" value={fDueFrom} onChange={(e) => setFDueFrom(e.target.value)} className="input !py-1 !text-xs" />
              <span className="text-xs text-[var(--fg-muted)]">–</span>
              <input type="date" value={fDueTo} onChange={(e) => setFDueTo(e.target.value)} className="input !py-1 !text-xs" />
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--border-muted)]">
              <th className="w-8 py-2 pl-2 pr-0">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected }}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-[var(--border)] accent-[var(--accent)]"
                />
              </th>
              <th className={th} onClick={() => toggleSort('title')}>{t('task.title')} <SortIcon active={sort.col === 'title'} dir={sort.dir} /></th>
              <th className={th} onClick={() => toggleSort('status')}>{t('task.status')} <SortIcon active={sort.col === 'status'} dir={sort.dir} /></th>
              <th className={th} onClick={() => toggleSort('priority')}>{t('task.priority')} <SortIcon active={sort.col === 'priority'} dir={sort.dir} /></th>
              <th className={th} onClick={() => toggleSort('assignee')}>{t('task.assignee')} <SortIcon active={sort.col === 'assignee'} dir={sort.dir} /></th>
              <th className={th} onClick={() => toggleSort('due_date')}>{t('task.dueDate')} <SortIcon active={sort.col === 'due_date'} dir={sort.dir} /></th>
              {!compact && <th className="py-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">{t('task.labels')}</th>}
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 && (
              <tr><td colSpan={compact ? 6 : 7} className="py-12 text-center text-sm text-[var(--fg-muted)]">{t('filter.noMatch')}</td></tr>
            )}
            {displayed.map((task) => {
              const isOverdue = task.due_date && task.status !== 'done' && task.due_date < new Date().toISOString().slice(0, 10)
              const selected = selectedIds.has(task.id)
              return (
                <tr key={task.id}
                  onClick={() => onTaskClick?.(task)}
                  className="cursor-pointer border-b border-[var(--border-muted)] transition hover:bg-[var(--surface-hover)]"
                >
                  <td className={`w-8 py-2.5 pl-2 pr-0 ${compact ? 'py-1.5' : 'py-2.5'}`} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleSelect(task.id)}
                      className="h-4 w-4 rounded border-[var(--border)] accent-[var(--accent)]"
                    />
                  </td>
                  <td className={`pr-3 font-medium ${compact ? 'py-1.5' : 'py-2.5'}`}>{task.title}</td>
                  <td className={`pr-3 ${compact ? 'py-1.5' : 'py-2.5'}`}>
                    <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: `var(--${task.status})`, border: `1px solid color-mix(in srgb, var(--${task.status}) 45%, transparent)` }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: `var(--${task.status})` }} />
                      {STATUS_LABEL[task.status]}
                    </span>
                  </td>
                  <td className={`pr-3 ${compact ? 'py-1.5' : 'py-2.5'}`}>
                    {task.priority
                      ? <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                          style={{ color: PRIORITY_COLOR[task.priority], background: `color-mix(in srgb, ${PRIORITY_COLOR[task.priority]} 16%, transparent)` }}>
                          {PRIORITY_LABEL[task.priority]}
                        </span>
                      : <span className="text-[var(--fg-subtle)]">—</span>}
                  </td>
                  <td className={`pr-3 ${compact ? 'py-1.5' : 'py-2.5'}`}>
                    {task.assignee_profile?.display_name
                      ? <div className="flex items-center gap-1.5">
                          <Avatar name={task.assignee_profile.display_name} url={task.assignee_profile.avatar_url} size="xs" />
                          {!compact && <span className="text-xs">{task.assignee_profile.display_name}</span>}
                        </div>
                      : <span className="text-[var(--fg-subtle)]">—</span>}
                  </td>
                  <td className={`pr-3 text-xs ${compact ? 'py-1.5' : 'py-2.5'}`}
                    style={isOverdue ? { color: 'var(--danger)' } : { color: 'var(--fg-muted)' }}>
                    {task.due_date || '—'}
                  </td>
                  {!compact && (
                    <td className="py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {(task.labels || []).map((l) => (
                          <span key={l.id} className="rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white"
                            style={{ background: l.color || 'var(--accent)' }}>
                            {l.name}
                          </span>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
