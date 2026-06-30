import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Avatar from './Avatar'

const CARD = 'rounded-lg border border-[var(--glass-border)] bg-[var(--card)] p-4'

function StatCard({ icon, label, value, color }) {
  return (
    <div className={CARD}>
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${color}18` }}>
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill={color}>
            <path d={icon} />
          </svg>
        </span>
        <div>
          <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          <p className="text-xs text-[var(--fg-muted)]">{label}</p>
        </div>
      </div>
    </div>
  )
}

function ProgressRing({ pct, size = 80, stroke = 6 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--glass-border)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent)" strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  )
}

const ICONS = {
  inbox: 'M2.8 2.06A1.75 1.75 0 0 1 4.41 1h7.18c.7 0 1.333.417 1.61 1.06l2.74 6.395c.04.093.06.194.06.295v4.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25v-4.5c0-.101.02-.202.06-.295Zm1.61.44a.25.25 0 0 0-.23.152L1.887 8H4.75a.75.75 0 0 1 .6.3L6.625 10h2.75l1.275-1.7a.75.75 0 0 1 .6-.3h2.863L11.82 2.652a.25.25 0 0 0-.23-.152Z',
  check: 'M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z',
  doing: 'M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13m.75 3.25v3.19l2.03 2.03a.75.75 0 1 1-1.06 1.06L7.22 9.78a.75.75 0 0 1-.22-.53V4.75a.75.75 0 0 1 1.5 0',
  alert: 'M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0M9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0',
  person: 'M10.561 8.073a6 6 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6 6 0 0 1 3.431-5.142 4 4 0 1 1 5.123 0ZM8 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  project: 'M1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0M1.5 1.75v12.5c0 .138.112.25.25.25h2.875V1.5H1.75a.25.25 0 0 0-.25.25m4.625-.25v13h2.875v-13zm4.375 0v13h2.875a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25Z',
}

export default function Dashboard({ tasks, projects, members, onlineIds, stats, onToggleMobileSidebar }) {
  const { t } = useTranslation()
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const counts = useMemo(() => {
    let todo = 0, doing = 0, done = 0
    for (const t of tasks) {
      if (t.status === 'todo') todo++
      else if (t.status === 'doing') doing++
      else if (t.status === 'done') done++
    }
    const total = tasks.length
    const overdue = tasks.filter((t) => t.due_date && t.status !== 'done' && t.due_date < today).length
    return { todo, doing, done, total, overdue, pct: total ? Math.round((done / total) * 100) : 0 }
  }, [tasks, today])

  const onlineCount = useMemo(() => onlineIds?.size ?? 0, [onlineIds])
  const activeProjects = useMemo(() => projects?.filter((p) => p.status === 'active') ?? [], [projects])

  const topContributors = useMemo(() => {
    const map = {}
    for (const t of stats) {
      if (t.assignee) {
        const id = t.assignee
        if (!map[id]) map[id] = { count: 0, done: 0, name: '' }
        map[id].count++
        if (t.status === 'done') map[id].done++
      }
    }
    const memberMap = {}
    for (const m of members) memberMap[m.id] = m.display_name || m.email
    return Object.entries(map)
      .map(([id, v]) => ({ id, ...v, name: memberMap[id] || id.slice(0, 8) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [stats, members])

  const recentTasks = useMemo(() =>
    [...tasks].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 6),
  [tasks])

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      {/* Title */}
      <div className="flex items-center gap-3">
        <button onClick={onToggleMobileSidebar} className="btn btn-default !px-2 md:!hidden">
          <span aria-hidden="true">☰</span>
        </button>
        <div>
          <h1 className="text-lg font-bold">Dashboard</h1>
          <p className="text-xs text-[var(--fg-muted)]">Overview of your workspace</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={ICONS.inbox} label="Total tasks" value={counts.total} color="var(--fg)" />
        <StatCard icon={ICONS.check} label="Completed" value={counts.done} color="var(--done)" />
        <StatCard icon={ICONS.doing} label="In progress" value={counts.doing} color="var(--doing)" />
        <StatCard icon={ICONS.alert} label="Overdue" value={counts.overdue} color="var(--danger)" />
      </div>

      {/* Progress + Team */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Progress ring */}
        <div className={CARD}>
          <p className="mb-3 text-sm font-semibold">Completion</p>
          <div className="flex items-center gap-5">
            <ProgressRing pct={counts.pct} />
            <div className="space-y-1.5 text-xs text-[var(--fg-muted)]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: 'var(--todo)' }} />
                To Do <strong className="text-[var(--fg)]">{counts.todo}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: 'var(--doing)' }} />
                In Progress <strong className="text-[var(--fg)]">{counts.doing}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: 'var(--done)' }} />
                Done <strong className="text-[var(--fg)]">{counts.done}</strong>
              </div>
              <div className="pt-1 text-xs font-semibold text-[var(--accent)]">{counts.pct}% complete</div>
            </div>
          </div>
        </div>

        {/* Online team */}
        <div className={CARD}>
          <p className="mb-3 text-sm font-semibold">Team</p>
          <div className="flex items-center gap-2 text-xs text-[var(--fg-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--done)]" />
            {onlineCount} online · {members?.length ?? 0} total members
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {members?.slice(0, 8).map((m) => (
              <div key={m.id} className="relative">
                <Avatar name={m.display_name} url={m.avatar_url} size="sm" />
                {onlineIds?.has(m.id) && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--card)] bg-[var(--done)]" />
                )}
              </div>
            ))}
            {(members?.length ?? 0) > 8 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface-hover)] text-[10px] font-medium text-[var(--fg-muted)]">
                +{members.length - 8}
              </div>
            )}
          </div>
          <p className="mt-3 text-xs font-semibold text-[var(--fg)]">Active projects: {activeProjects.length}</p>
        </div>
      </div>

      {/* Top contributors */}
      {topContributors.length > 0 && (
        <div className={CARD}>
          <p className="mb-3 text-sm font-semibold">Top contributors</p>
          <div className="space-y-2">
            {topContributors.map((c) => {
              const barPct = counts.total ? (c.count / counts.total) * 100 : 0
              return (
                <div key={c.id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--fg)]">{c.name}</span>
                    <span className="text-[var(--fg-muted)]">{c.done}/{c.count} done</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--glass-border)]">
                    <div className="h-full rounded-full transition-all" style={{ width: `${barPct}%`, background: 'var(--accent)' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent tasks */}
      {recentTasks.length > 0 && (
        <div className={CARD}>
          <p className="mb-3 text-sm font-semibold">Recently created</p>
          <div className="space-y-1.5">
            {recentTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-md bg-[var(--surface-hover)] px-3 py-2 text-xs">
                <span className="h-2 w-2 rounded-full" style={{ background: `var(--${t.status})` }} />
                <span className="min-w-0 flex-1 truncate text-[var(--fg)]">{t.title}</span>
                <span className="text-[var(--fg-subtle)]">
                  {t.due_date || '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom padding */}
      <div className="h-4" />
    </div>
  )
}
