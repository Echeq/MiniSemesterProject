import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../api/supabaseClient'

const ACTION_CONFIG = {
  task_created:    { label: 'log.taskCreated',    color: '#10b981', icon: 'M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z' },
  task_updated:    { label: 'log.taskUpdated',    color: '#f59e0b', icon: 'M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z' },
  task_deleted:    { label: 'log.taskDeleted',    color: '#ef4444', icon: 'M2 4h12M5.5 4V2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5V4M3 4h10l-.833 9.167A1.5 1.5 0 0 1 10.67 14.5H5.33a1.5 1.5 0 0 1-1.497-1.333Z' },
  project_created: { label: 'log.projectCreated', color: '#6366f1', icon: 'M1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0M1.5 1.75v12.5c0 .138.112.25.25.25h2.875V1.5H1.75a.25.25 0 0 0-.25.25m4.625-.25v13h2.875v-13zm4.375 0v13h2.875a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25z' },
  project_archived:{ label: 'log.projectArchived',color: '#8b5cf6', icon: 'M0 2.75A.75.75 0 0 1 .75 2h14.5a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-.75.75H.75A.75.75 0 0 1 0 5.25Zm1.5.75v1h13v-1Zm.5 3.25h12v6.5A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25Zm4 1.5a.75.75 0 0 0 0 1.5h4a.75.75 0 0 0 0-1.5Z' },
  project_restored:{ label: 'log.projectRestored',color: '#10b981', icon: 'M8 2.5a5.5 5.5 0 1 0 5.478 5.957.75.75 0 0 1 1.494.122A7 7 0 1 1 8 1v1.5Zm3 .5h3v3l-3-3Z' },
  project_deleted: { label: 'log.projectDeleted', color: '#ef4444', icon: 'M6.5 1.75a.25.25 0 0 1 .25-.25h2.5a.25.25 0 0 1 .25.25V3h-3V1.75Zm4.5 0V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.748 1.748 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15Z' },
}

const ACTION_ORDER = ['task_created', 'task_updated', 'task_deleted', 'project_created', 'project_archived', 'project_restored', 'project_deleted']

export default function LogViewer() {
  const { t } = useTranslation()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('get_logs', {
      p_action: actionFilter || null,
      p_date_from: dateFilter ? dateFilter + 'T00:00:00Z' : null,
      p_date_to: dateFilter ? dateFilter + 'T23:59:59Z' : null,
    })
    if (!error) setLogs(data ?? [])
    setLoading(false)
  }, [actionFilter, dateFilter])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const counts = useMemo(() => {
    const map = {}
    for (const l of logs) {
      map[l.action] = (map[l.action] || 0) + 1
    }
    return map
  }, [logs])

  return (
    <div className="space-y-4">
      {/* Summary chips */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setActionFilter('')}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
            !actionFilter ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-hover)] text-[var(--fg-muted)] hover:text-[var(--fg)]'
          }`}
        >
          All {logs.length}
        </button>
        {ACTION_ORDER.map((a) => {
          const cfg = ACTION_CONFIG[a]
          const count = counts[a] || 0
          if (count === 0 && actionFilter !== a) return null
          return (
            <button
              key={a}
              onClick={() => setActionFilter(actionFilter === a ? '' : a)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                actionFilter === a ? 'text-white' : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
              style={actionFilter === a ? { background: cfg.color } : { background: 'var(--surface-hover)' }}
            >
              {t(cfg.label)} {count}
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="input flex-1" />
        {dateFilter && (
          <button onClick={() => setDateFilter('')} className="btn btn-default !py-1 !text-xs">Clear</button>
        )}
      </div>

      {/* Log list */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--glass-border)] py-10 text-center">
          <p className="text-sm text-[var(--fg-muted)]">No activity logs found.</p>
          <p className="mt-1 text-xs text-[var(--fg-subtle)]">Try changing the filters or check back after performing some actions.</p>
        </div>
      ) : (
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {logs.map((log) => {
            const cfg = ACTION_CONFIG[log.action]
            return (
              <div key={log.id} className="flex items-start gap-3 rounded-lg border border-[var(--glass-border)] bg-[var(--card)] p-2.5">
                <span
                  className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ background: cfg ? `${cfg.color}1a` : 'var(--surface-hover)' }}
                >
                  <svg className="h-3 w-3" viewBox="0 0 16 16" fill={cfg?.color || 'var(--fg-muted)'}>
                    <path d={cfg?.icon || 'M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1'} />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="truncate font-medium">
                      {cfg ? t(cfg.label) : log.action}
                    </span>
                    <span className="text-[var(--fg-subtle)]">·</span>
                    <span className="text-[var(--fg-subtle)]">{log.target_type}</span>
                    <span className="ml-auto whitespace-nowrap text-[var(--fg-subtle)]">
                      {log.created_at ? new Date(log.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  {log.display_name && (
                    <p className="mt-0.5 text-xs text-[var(--fg-muted)]">by {log.display_name}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
