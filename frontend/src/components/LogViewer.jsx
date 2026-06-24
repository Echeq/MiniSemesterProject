import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../api/supabaseClient'

const ACTION_LABELS = {
  task_created: 'Created task',
  task_updated: 'Updated task',
  task_deleted: 'Deleted task',
  project_created: 'Created project',
  project_archived: 'Archived project',
  project_restored: 'Restored project',
  project_deleted: 'Deleted project',
  test_action: 'Test action',
}

export default function LogViewer() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const actions = Object.keys(ACTION_LABELS)

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

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="input flex-1">
          <option value="">All actions</option>
          {actions.map((a) => <option key={a} value={a}>{ACTION_LABELS[a] || a}</option>)}
        </select>
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="input w-40" title="Filter by date" />
      </div>

      {loading ? (
        <p className="py-6 text-center text-sm text-[var(--fg-muted)]">Loading…</p>
      ) : logs.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--fg-muted)]">No logs found.</p>
      ) : (
        <div className="max-h-80 space-y-1.5 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="rounded-lg border border-[var(--glass-border)] bg-[var(--card)] p-2.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full bg-[var(--surface-hover)] px-1.5 py-0.5 font-medium">
                  {ACTION_LABELS[log.action] || log.action}
                </span>
                <span className="text-[var(--fg-subtle)]">{log.target_type}</span>
                <span className="ml-auto text-[var(--fg-muted)]">
                  {log.created_at ? new Date(log.created_at).toLocaleString() : ''}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                {log.user_display_name && (
                  <span className="text-xs text-[var(--fg-muted)]">
                    by {log.user_display_name}
                  </span>
                )}
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <span className="text-xs text-[var(--fg-subtle)]">
                    {JSON.stringify(log.metadata).slice(0, 60)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
