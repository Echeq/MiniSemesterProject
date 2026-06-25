import { useTranslation } from 'react-i18next'

const PRIORITIES = ['P0', 'P1', 'P2', 'P3']
const PRIORITY_COLOR = { P0: '#ef4444', P1: '#f59e0b', P2: '#eab308', P3: '#10b981' }

export default function FilterPanel({ filters, onChange, members = [], labels = [] }) {
  const { t } = useTranslation()
  const PRIORITY_LABEL = { P0: t('filter.p0'), P1: t('filter.p1'), P2: t('filter.p2'), P3: t('filter.p3') }

  const { status = [], priority = [], assignee = '', labelIds = [], dueFrom = '', dueTo = '' } = filters

  function toggleMulti(key, value) {
    const prev = filters[key] || []
    onChange({ ...filters, [key]: prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value] })
  }

  const activeCount = status.length + priority.length + (assignee ? 1 : 0) + labelIds.length + (dueFrom || dueTo ? 1 : 0)

  const STATUS_CONFIG = [
    { value: 'todo', label: t('board.todo'), var: 'var(--todo)' },
    { value: 'doing', label: t('board.inProgress'), var: 'var(--doing)' },
    { value: 'done', label: t('board.done'), var: 'var(--done)' },
  ]

  return (
    <div className="flex flex-wrap items-end gap-4 border-b border-[var(--border-muted)] bg-[var(--surface-hover)] px-4 py-3 sm:px-6">
      {/* Status */}
      <div>
        <p className="mb-1.5 text-xs font-medium text-[var(--fg-muted)]">{t('filter.status')}</p>
        <div className="flex gap-1.5">
          {STATUS_CONFIG.map((s) => (
            <button
              key={s.value}
              onClick={() => toggleMulti('status', s.value)}
              className="rounded-full px-2 py-0.5 text-xs font-medium transition"
              style={status.includes(s.value)
                ? { background: s.var, color: '#fff' }
                : { border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div>
        <p className="mb-1.5 text-xs font-medium text-[var(--fg-muted)]">{t('filter.priority')}</p>
        <div className="flex gap-1.5">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => toggleMulti('priority', p)}
              className="rounded-full px-2 py-0.5 text-xs font-medium transition"
              style={priority.includes(p)
                ? { background: PRIORITY_COLOR[p], color: '#fff' }
                : { border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
            >
              {PRIORITY_LABEL[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Assignee */}
      {members.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-[var(--fg-muted)]">{t('filter.assignee')}</p>
          <select
            value={assignee}
            onChange={(e) => onChange({ ...filters, assignee: e.target.value })}
            className="input !py-1 !text-xs"
          >
            <option value="">{t('filter.anyAssignee')}</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.display_name}</option>)}
          </select>
        </div>
      )}

      {/* Labels (multi-select chips) */}
      {labels.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-[var(--fg-muted)]">{t('filter.label')}</p>
          <div className="flex flex-wrap gap-1.5">
            {labels.map((l) => (
              <button
                key={l.id}
                onClick={() => toggleMulti('labelIds', l.id)}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition"
                style={labelIds.includes(l.id)
                  ? { background: l.color || 'var(--accent)', color: '#fff' }
                  : { border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: l.color || 'var(--accent)' }} />
                {l.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Due date range */}
      <div>
        <p className="mb-1.5 text-xs font-medium text-[var(--fg-muted)]">{t('filter.dueDateRange')}</p>
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={dueFrom}
            onChange={(e) => onChange({ ...filters, dueFrom: e.target.value })}
            className="input !py-1 !text-xs"
          />
          <span className="text-xs text-[var(--fg-muted)]">–</span>
          <input
            type="date"
            value={dueTo}
            onChange={(e) => onChange({ ...filters, dueTo: e.target.value })}
            className="input !py-1 !text-xs"
          />
        </div>
      </div>

      {/* Clear */}
      {activeCount > 0 && (
        <button
          onClick={() => onChange({ status: [], priority: [], assignee: '', labelIds: [], dueFrom: '', dueTo: '' })}
          className="self-end text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] transition"
        >
          {t('filter.clearFilters')} ({activeCount})
        </button>
      )}
    </div>
  )
}
