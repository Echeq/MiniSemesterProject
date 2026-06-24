import { useMemo, useState, useEffect } from 'react'
import Avatar from './Avatar'

const STATUS_LABEL = { todo: 'To Do', doing: 'Doing', done: 'Done' }
const PRIORITY_LABEL = { P0: 'Critical', P1: 'High', P2: 'Medium', P3: 'Low' }
const PRIORITY_COLOR = { P0: '#ef4444', P1: '#f59e0b', P2: '#eab308', P3: '#10b981' }
const PRIORITY_ORDER = { P0: 0, P1: 1, P2: 2, P3: 3, '': 4 }
const STATUS_ORDER = { todo: 0, doing: 1, done: 2 }
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

export default function ListView({ tasks, onTaskClick, members = [], labels = [] }) {
  const prefs = useMemo(loadPrefs, [])
  const [sort, setSort] = useState({ col: prefs.sortCol || 'title', dir: prefs.sortDir || 'asc' })
  const [compact, setCompact] = useState(prefs.compact ?? false)
  const [showFilters, setShowFilters] = useState(false)
  const [fStatus, setFStatus] = useState(prefs.fStatus || [])
  const [fAssignee, setFAssignee] = useState(prefs.fAssignee || '')
  const [fDueFrom, setFDueFrom] = useState(prefs.fDueFrom || '')
  const [fDueTo, setFDueTo] = useState(prefs.fDueTo || '')

  useEffect(() => {
    savePrefs({ sortCol: sort.col, sortDir: sort.dir, compact, fStatus, fAssignee, fDueFrom, fDueTo })
  }, [sort, compact, fStatus, fAssignee, fDueFrom, fDueTo])

  function toggleSort(col) {
    setSort((prev) => prev.col === col ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })
  }

  function toggleStatusFilter(s) {
    setFStatus((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])
  }

  const activeFilterCount = fStatus.length + (fAssignee ? 1 : 0) + (fDueFrom || fDueTo ? 1 : 0)

  const displayed = useMemo(() => {
    let result = [...tasks]
    if (fStatus.length > 0) result = result.filter((t) => fStatus.includes(t.status))
    if (fAssignee) result = result.filter((t) => t.assignee === fAssignee)
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
  }, [tasks, sort, fStatus, fAssignee, fDueFrom, fDueTo])

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
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
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
          Compact
        </button>
        {activeFilterCount > 0 && (
          <button onClick={() => { setFStatus([]); setFAssignee(''); setFDueFrom(''); setFDueTo('') }}
            className="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] transition">
            Clear filters
          </button>
        )}
        <span className="ml-auto text-xs text-[var(--fg-subtle)]">{displayed.length} task{displayed.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="flex flex-wrap items-end gap-4 border-b border-[var(--border-muted)] bg-[var(--surface-hover)] px-4 py-3 sm:px-6">
          <div>
            <p className="mb-1.5 text-xs font-medium text-[var(--fg-muted)]">Status</p>
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
          {members.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-[var(--fg-muted)]">Assignee</p>
              <select value={fAssignee} onChange={(e) => setFAssignee(e.target.value)} className="input !py-1 !text-xs">
                <option value="">Anyone</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.display_name}</option>)}
              </select>
            </div>
          )}
          <div>
            <p className="mb-1.5 text-xs font-medium text-[var(--fg-muted)]">Due date range</p>
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
              <th className={th} onClick={() => toggleSort('title')}>Title <SortIcon active={sort.col === 'title'} dir={sort.dir} /></th>
              <th className={th} onClick={() => toggleSort('status')}>Status <SortIcon active={sort.col === 'status'} dir={sort.dir} /></th>
              <th className={th} onClick={() => toggleSort('priority')}>Priority <SortIcon active={sort.col === 'priority'} dir={sort.dir} /></th>
              <th className={th} onClick={() => toggleSort('assignee')}>Assignee <SortIcon active={sort.col === 'assignee'} dir={sort.dir} /></th>
              <th className={th} onClick={() => toggleSort('due_date')}>Due date <SortIcon active={sort.col === 'due_date'} dir={sort.dir} /></th>
              {!compact && <th className="py-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Labels</th>}
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 && (
              <tr><td colSpan={compact ? 5 : 6} className="py-12 text-center text-sm text-[var(--fg-muted)]">No tasks match this view.</td></tr>
            )}
            {displayed.map((task) => {
              const isOverdue = task.due_date && task.status !== 'done' && task.due_date < new Date().toISOString().slice(0, 10)
              return (
                <tr key={task.id} onClick={() => onTaskClick?.(task)}
                  className="cursor-pointer border-b border-[var(--border-muted)] transition hover:bg-[var(--surface-hover)]"
                >
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
