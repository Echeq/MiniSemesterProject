import Avatar from './Avatar'

const STATUS_LABEL = { todo: 'To Do', doing: 'Doing', done: 'Done' }
const PRIORITY_LABEL = { P0: 'P0', P1: 'P1', P2: 'P2', P3: 'P3' }
const PRIORITY_COLOR = { P0: '#ef4444', P1: '#f59e0b', P2: '#eab308', P3: '#10b981' }

export default function ListView({ tasks, onTaskClick }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto p-4 sm:p-6">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--border-muted)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
            <th className="py-2 pr-3">Title</th>
            <th className="py-2 pr-3">Status</th>
            <th className="py-2 pr-3">Priority</th>
            <th className="py-2 pr-3">Assignee</th>
            <th className="py-2 pr-3">Due date</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 && (
            <tr>
              <td colSpan={5} className="py-12 text-center text-sm text-[var(--fg-muted)]">No tasks match this view.</td>
            </tr>
          )}
          {tasks.map((task) => (
            <tr key={task.id} onClick={() => onTaskClick?.(task)}
              className="cursor-pointer border-b border-[var(--border-muted)] transition hover:bg-[var(--surface-hover)]"
            >
              <td className="py-2.5 pr-3 font-medium">{task.title}</td>
              <td className="py-2.5 pr-3">
                <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: `var(--${task.status})`, border: `1px solid color-mix(in srgb, var(--${task.status}) 45%, transparent)` }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: `var(--${task.status})` }} />
                  {STATUS_LABEL[task.status]}
                </span>
              </td>
              <td className="py-2.5 pr-3">
                {task.priority ? (
                  <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{ color: PRIORITY_COLOR[task.priority], background: `color-mix(in srgb, ${PRIORITY_COLOR[task.priority]} 16%, transparent)` }}
                  >
                    {PRIORITY_LABEL[task.priority]}
                  </span>
                ) : (
                  <span className="text-[var(--fg-subtle)]">—</span>
                )}
              </td>
              <td className="py-2.5 pr-3">
                {task.assignee_profile?.display_name ? (
                  <div className="flex items-center gap-1.5">
                    <Avatar name={task.assignee_profile.display_name} url={task.assignee_profile.avatar_url} size="xs" />
                    <span className="text-xs">{task.assignee_profile.display_name}</span>
                  </div>
                ) : (
                  <span className="text-[var(--fg-subtle)]">—</span>
                )}
              </td>
              <td className="py-2.5 text-xs text-[var(--fg-muted)]">{task.due_date || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
