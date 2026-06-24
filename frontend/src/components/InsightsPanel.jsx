import { memo, useMemo } from 'react'
import Avatar from './Avatar'

const R = 54
const STROKE = 13
const C = 2 * Math.PI * R
const SEG = [
  { key: 'done', label: 'Done', color: 'var(--done)' },
  { key: 'doing', label: 'Doing', color: 'var(--doing)' },
  { key: 'todo', label: 'To Do', color: 'var(--todo)' },
 ]

function daysFromToday(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr + 'T00:00:00')
  return Math.round((d - today) / 86400000)
}

function InsightsPanel({ tasks, scopeLabel }) {
  const stats = useMemo(() => {
    const counts = { todo: 0, doing: 0, done: 0 }
    let overdue = 0
    let dueSoon = 0
    const contrib = new Map()

    for (const t of tasks) {
      counts[t.status] = (counts[t.status] ?? 0) + 1
      if (t.due_date && t.status !== 'done') {
        const d = daysFromToday(t.due_date)
        if (d < 0) overdue++
        else if (d <= 7) dueSoon++
      }
      const name = t.assignee_profile?.display_name ?? 'Unassigned'
      const prev = contrib.get(name) ?? { name, url: t.assignee_profile?.avatar_url ?? null, count: 0 }
      prev.count++
      contrib.set(name, prev)
    }

    const total = tasks.length
    const pctDone = total ? Math.round((counts.done / total) * 100) : 0
    const contributors = [...contrib.values()].sort((a, b) => b.count - a.count)
    const maxContrib = contributors[0]?.count ?? 1
    return { counts, total, pctDone, overdue, dueSoon, contributors, maxContrib }
  }, [tasks])

  const arcs = useMemo(() => {
    let acc = 0
    return SEG.map((s) => {
      const value = stats.counts[s.key]
      const frac = stats.total ? value / stats.total : 0
      const arc = {
        ...s,
        value,
        dasharray: `${frac * C} ${C - frac * C}`,
        dashoffset: -acc * C,
      }
      acc += frac
      return arc
    })
  }, [stats])

  return (
    <aside className="glass hidden w-80 flex-shrink-0 flex-col overflow-y-auto border-l border-[var(--glass-border)] xl:flex">
      <div className="border-b border-[var(--glass-border)] px-5 py-4">
        <h2 className="text-sm font-semibold">Insights</h2>
        <p className="mt-0.5 truncate text-xs text-[var(--fg-muted)]">{scopeLabel}</p>
      </div>

      {stats.total === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--card)] text-[var(--fg-subtle)]">
            <svg className="h-6 w-6" viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 1.75a.75.75 0 0 1 1.5 0V13.5h11.75a.75.75 0 0 1 0 1.5H2.25a.75.75 0 0 1-.75-.75Zm12.78 3.03-3.25 3.25a.75.75 0 0 1-1.06 0L8.5 6.06 5.78 8.78a.75.75 0 0 1-1.06-1.06l3.25-3.25a.75.75 0 0 1 1.06 0L11 6.44l2.72-2.72a.75.75 0 1 1 1.06 1.06Z" /></svg>
          </div>
          <p className="text-sm font-medium">No data yet</p>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">Add tasks to see progress and contributors here.</p>
        </div>
      ) : (
        <div className="space-y-6 p-5">
          {/* Progress ring */}
          <section className="flex flex-col items-center">
            <div className="relative">
              <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90">
                <circle cx="75" cy="75" r={R} fill="none" stroke="var(--glass-border)" strokeWidth={STROKE} />
                {arcs.map((a) => (
                  <circle
                    key={a.key}
                    cx="75"
                    cy="75"
                    r={R}
                    fill="none"
                    stroke={a.color}
                    strokeWidth={STROKE}
                    strokeLinecap="round"
                    strokeDasharray={a.dasharray}
                    strokeDashoffset={a.dashoffset}
                    style={{ transition: 'stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease' }}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold leading-none">{stats.pctDone}%</span>
                <span className="mt-1 text-xs text-[var(--fg-muted)]">complete</span>
              </div>
            </div>
            <div className="mt-4 grid w-full grid-cols-3 gap-2">
              {SEG.map((s) => (
                <div key={s.key} className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-xs text-[var(--fg-muted)]">{s.label}</span>
                  </div>
                  <p className="mt-0.5 text-sm font-semibold">{stats.counts[s.key]}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Attributes */}
          <section className="grid grid-cols-3 gap-2">
            <Stat label="Total" value={stats.total} />
            <Stat label="Overdue" value={stats.overdue} color="var(--danger)" />
            <Stat label="Due ≤7d" value={stats.dueSoon} color="var(--doing)" />
          </section>

          {/* Contributors */}
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Contributors</h3>
            <div className="space-y-2.5">
              {stats.contributors.map((c) => (
                <div key={c.name} className="flex items-center gap-2.5">
                  {c.name === 'Unassigned' ? (
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--glass-border)] text-[var(--fg-subtle)]">
                      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M10.561 8.073a6 6 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6 6 0 0 1 3.431-5.142 4 4 0 1 1 5.123 0ZM8 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" /></svg>
                    </span>
                  ) : (
                    <Avatar name={c.name} url={c.url} size="sm" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-medium">{c.name}</span>
                      <span className="text-xs text-[var(--fg-muted)]">{c.count}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--glass-border)]">
                      <div
                        className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                        style={{ width: `${(c.count / stats.maxContrib) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </aside>
  )
}

export default memo(InsightsPanel)

function Stat({ label, value, color }) {
  return (
    <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--card)] p-2.5 text-center">
      <p className="text-xl font-bold" style={color ? { color } : undefined}>{value}</p>
      <p className="mt-0.5 text-[11px] text-[var(--fg-muted)]">{label}</p>
    </div>
  )
}
