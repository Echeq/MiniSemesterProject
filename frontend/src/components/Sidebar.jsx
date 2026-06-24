import { useState } from 'react'
import Avatar from './Avatar'
import EmptyState from './EmptyState'
import CreateProjectModal from './CreateProjectModal'
import ProjectSettingsModal from './ProjectSettingsModal'
import { SidebarStatsSkeleton } from './Skeleton'

function Icon({ path, className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d={path} />
    </svg>
  )
}

const ICONS = {
  inbox: 'M2.8 2.06A1.75 1.75 0 0 1 4.41 1h7.18c.7 0 1.333.417 1.61 1.06l2.74 6.395c.04.093.06.194.06.295v4.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25v-4.5c0-.101.02-.202.06-.295Zm1.61.44a.25.25 0 0 0-.23.152L1.887 8H4.75a.75.75 0 0 1 .6.3L6.625 10h2.75l1.275-1.7a.75.75 0 0 1 .6-.3h2.863L11.82 2.652a.25.25 0 0 0-.23-.152Z',
  globe: 'M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM5.78 8.75a9.6 9.6 0 0 0 .653 3.013c.305.756.652 1.32.998 1.69q.524.563.998.563.475 0 1-.563c.345-.37.692-.934.997-1.69a9.6 9.6 0 0 0 .653-3.013Zm4.292-1.5a9.6 9.6 0 0 0-.653-3.013c-.305-.756-.652-1.32-.998-1.69Q8.187 1.984 8 1.984q-.474 0-.998.563c-.346.37-.693.934-.998 1.69A9.6 9.6 0 0 0 5.78 7.25Zm-5.795 1.5H1.543a6.5 6.5 0 0 0 4.71 5.642 9.6 9.6 0 0 1-.5-1.291 11 11 0 0 1-.483-2.85ZM1.543 7.25h2.733a11 11 0 0 1 .483-2.85c.13-.45.297-.883.5-1.29A6.5 6.5 0 0 0 1.543 7.25Zm12.914 1.5h-2.733a11 11 0 0 1-.483 2.85c-.13.45-.297.883-.5 1.291a6.5 6.5 0 0 0 3.716-4.141Zm0-1.5a6.5 6.5 0 0 0-3.716-4.141c.203.408.37.84.5 1.29a11 11 0 0 1 .483 2.85Z',
  project: 'M1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0M1.5 1.75v12.5c0 .138.112.25.25.25h2.875V1.5H1.75a.25.25 0 0 0-.25.25m4.625-.25v13h2.875v-13zm4.375 0v13h2.875a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25Z',
  archive: 'M0 2.75A.75.75 0 0 1 .75 2h14.5a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-.75.75H.75A.75.75 0 0 1 0 5.25Zm1.5.75v1h13v-1Zm.5 3.25h12v6.5A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25Zm4 1.5a.75.75 0 0 0 0 1.5h4a.75.75 0 0 0 0-1.5Z',
  trash: 'M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75M4.5 5.5l.5 8.25A1.75 1.75 0 0 0 6.75 15.5h2.5a1.75 1.75 0 0 0 1.75-1.75L11.5 5.5Z',
  restore: 'M8 2.5a5.5 5.5 0 1 0 5.478 5.957.75.75 0 0 1 1.494.122A7 7 0 1 1 8 1v1.5Zm3 .5h3v3l-3-3Z',
  shield: 'M7.467.133a1.75 1.75 0 0 1 1.066 0l5.25 1.68A1.75 1.75 0 0 1 15 3.48V7c0 1.566-.32 3.182-1.303 4.682-.983 1.498-2.585 2.813-5.032 3.855a1.7 1.7 0 0 1-1.33 0c-2.447-1.042-4.049-2.357-5.032-3.855C1.32 10.182 1 8.566 1 7V3.48a1.75 1.75 0 0 1 1.217-1.667Z',
  plus: 'M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z',
  person: 'M10.561 8.073a6 6 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6 6 0 0 1 3.431-5.142 4 4 0 1 1 5.123 0ZM8 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  clock: 'M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13m.75 3.25v3.19l2.03 2.03a.75.75 0 1 1-1.06 1.06L7.22 9.78a.75.75 0 0 1-.22-.53V4.75a.75.75 0 0 1 1.5 0',
  alert: 'M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0M9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0',
  gear: 'M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5 8a3 3 0 1 1 6 0 3 3 0 0 1-6 0m5.21-5.72-.664-.248-.412-1.344A1 1 0 0 0 8.19 0H7.81a1 1 0 0 0-.944.688l-.412 1.344-.664.248-1.362-.701a1 1 0 0 0-1.236.435l-.19.33a1 1 0 0 0 .16 1.22l.957.998-.006.712-.957.998a1 1 0 0 0-.16 1.22l.19.33a1 1 0 0 0 1.236.434l1.362-.7.664.247.412 1.345a1 1 0 0 0 .944.688h.38a1 1 0 0 0 .944-.688l.412-1.344.664-.248 1.362.701a1 1 0 0 0 1.236-.435l.19-.33a1 1 0 0 0-.16-1.22l-.957-.998v-.712l.957-.998A1 1 0 0 0 13.58 2.6l-.19-.33a1 1 0 0 0-1.236-.435Z',
}

const todayStr = () => new Date().toISOString().slice(0, 10)
const in7Str = () => new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)

export default function Sidebar({
  projects,
  scope,
  onSelectScope,
  projectActions,
  isAdmin,
  onOpenAdmin,
  members = [],
  onlineIds,
  stats = [],
  currentUserId,
  loadingProjects = false,
}) {
  const [showCreate, setShowCreate] = useState(false)
  const [settingsProject, setSettingsProject] = useState(null)

  const active = projects.filter((p) => p.status === 'active')
  const archived = projects.filter((p) => p.status === 'archived')

  const today = todayStr()
  const in7 = in7Str()
  const mineCount = stats.filter((t) => t.assignee === currentUserId).length
  const overdueCount = stats.filter((t) => t.due_date && t.status !== 'done' && t.due_date < today).length
  const dueSoonCount = stats.filter((t) => t.due_date && t.status !== 'done' && t.due_date >= today && t.due_date <= in7).length

  function projProgress(id) {
    const rows = stats.filter((t) => t.project_id === id)
    const total = rows.length
    const done = rows.filter((r) => r.status === 'done').length
    return { total, pct: total ? Math.round((done / total) * 100) : 0 }
  }

  const onlineMembers = members
    .map((m) => ({ ...m, online: onlineIds?.has(m.id) }))
    .sort((a, b) => Number(b.online) - Number(a.online))
  const onlineCount = onlineMembers.filter((m) => m.online).length

  return (
    <aside className="glass hidden w-64 flex-shrink-0 flex-col border-r border-[var(--glass-border)] backdrop-blur-xl backdrop-saturate-150 sm:flex">
      <div className="flex items-center gap-2.5 px-4 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--fg)] text-[var(--bg)]">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M4 7h6v13H4zM14 7h6v8h-6z" />
          </svg>
        </div>
        <span className="text-base font-bold">TaskFlow</span>
      </div>

      <div className="divider mx-3" />

      {loadingProjects ? <SidebarStatsSkeleton /> : (
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          <SectionLabel>Boards</SectionLabel>
          <button onClick={() => onSelectScope('all')} className={`nav-item ${scope === 'all' ? 'active' : ''}`}>
            <Icon path={ICONS.inbox} /> All tasks
          </button>
          <button onClick={() => onSelectScope(null)} className={`nav-item ${scope === null ? 'active' : ''}`}>
            <Icon path={ICONS.globe} /> Shared board
          </button>

          <SectionLabel>Views</SectionLabel>
          <ViewItem icon={ICONS.person} label="My tasks" count={mineCount} active={scope === 'view:mine'} onClick={() => onSelectScope('view:mine')} />
          <ViewItem icon={ICONS.clock} label="Due soon" count={dueSoonCount} accent="var(--doing)" active={scope === 'view:due'} onClick={() => onSelectScope('view:due')} />
          <ViewItem icon={ICONS.alert} label="Overdue" count={overdueCount} accent="var(--danger)" active={scope === 'view:overdue'} onClick={() => onSelectScope('view:overdue')} />

          <div className="flex items-center justify-between px-2 pb-1 pt-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Projects</span>
            <button onClick={() => setShowCreate(true)} title="New project" className="rounded p-0.5 text-[var(--fg-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--fg)]">
              <Icon path={ICONS.plus} className="h-3.5 w-3.5" />
            </button>
          </div>

          {active.length === 0 && !loadingProjects && (
            <div className="px-1 py-2">
              <EmptyState icon="project" title="No projects" description="Create one to start organizing tasks." />
            </div>
          )}

          {active.map((p) => {
            const prog = projProgress(p.id)
            return (
              <div key={p.id} className="rounded-md">
                <div className="group flex items-center">
                  <button onClick={() => onSelectScope(p)} className={`nav-item min-w-0 flex-1 ${scope?.id === p.id ? 'active' : ''}`}>
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: p.color || '#6366f1' }} />
                      <span className="truncate">{p.name}</span>
                    </span>
                  </button>
                  <div className="flex flex-shrink-0 opacity-0 transition group-hover:opacity-100">
                    <button title="Settings" onClick={() => setSettingsProject(p)} className="rounded p-1 text-[var(--fg-muted)] hover:text-[var(--fg)]">
                      <Icon path={ICONS.gear} className="h-3.5 w-3.5" />
                    </button>
                    {isAdmin && (
                      <>
                        <button title="Archive" onClick={() => projectActions.setStatus(p.id, 'archived').catch((e) => alert(e.message))} className="rounded p-1 text-[var(--fg-muted)] hover:text-[var(--doing)]">
                          <Icon path={ICONS.archive} className="h-3.5 w-3.5" />
                        </button>
                        <button title="Delete" onClick={() => window.confirm(`Delete "${p.name}"? Its tasks are deleted too.`) && projectActions.delete(p.id).catch((e) => alert(e.message))} className="rounded p-1 text-[var(--fg-muted)] hover:text-[var(--danger)]">
                          <Icon path={ICONS.trash} className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {prog.total > 0 && (
                  <div className="flex items-center gap-2 px-2.5 pb-1.5 pt-0.5">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--glass-border)]">
                      <div className="h-full rounded-full bg-[var(--done)] transition-all duration-500" style={{ width: `${prog.pct}%` }} />
                    </div>
                    <span className="w-7 text-right text-[10px] tabular-nums text-[var(--fg-muted)]">{prog.pct}%</span>
                  </div>
                )}
              </div>
            )
          })}

          {archived.length > 0 && (
            <>
              <SectionLabel>Archived</SectionLabel>
              {archived.map((p) => (
                <div key={p.id} className="group flex items-center">
                  <button onClick={() => onSelectScope(p)} className={`nav-item min-w-0 flex-1 text-[var(--fg-muted)] ${scope?.id === p.id ? 'active' : ''}`}>
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: p.color || '#6366f1' }} />
                      <span className="truncate line-through">{p.name}</span>
                    </span>
                  </button>
                  {isAdmin && (
                    <button title="Restore" onClick={() => projectActions.setStatus(p.id, 'active').catch((e) => alert(e.message))} className="rounded p-1 text-[var(--fg-muted)] opacity-0 transition hover:text-[var(--done)] group-hover:opacity-100">
                      <Icon path={ICONS.restore} className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </>
          )}

          {members.length > 0 && (
            <>
              <div className="flex items-center justify-between px-2 pb-1 pt-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Team</span>
                {onlineCount > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-[var(--done)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--done)]" /> {onlineCount} online
                  </span>
                )}
              </div>
              {onlineMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
                  <span className="relative flex-shrink-0">
                    <Avatar name={m.display_name} url={m.avatar_url} size="sm" />
                    <span
                      className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--bg)]"
                      style={{ background: m.online ? 'var(--done)' : 'var(--fg-subtle)' }}
                      title={m.online ? 'Online' : 'Offline'}
                    />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {m.display_name}
                    {m.id === currentUserId && <span className="text-xs text-[var(--fg-subtle)]"> (you)</span>}
                  </span>
                  {m.role === 'admin' && <span className="text-[10px] font-semibold text-[var(--accent)]">admin</span>}
                </div>
              ))}
            </>
          )}
        </nav>
      )}

      {isAdmin && (
        <>
          <div className="divider mx-3" />
          <div className="p-3">
            <button onClick={onOpenAdmin} className="nav-item">
              <Icon path={ICONS.shield} /> Admin panel
            </button>
          </div>
        </>
      )}

      {showCreate && (
        <CreateProjectModal
          onCreate={(fields) => projectActions.create(fields)}
          onClose={() => setShowCreate(false)}
        />
      )}
      {settingsProject && (
        <ProjectSettingsModal
          project={settingsProject}
          onUpdate={(id, fields) => projectActions.update(id, fields)}
          onClose={() => setSettingsProject(null)}
        />
      )}
    </aside>
  )
}

function SectionLabel({ children }) {
  return <p className="px-2 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">{children}</p>
}

function ViewItem({ icon, label, count, accent, active, onClick }) {
  return (
    <button onClick={onClick} className={`nav-item ${active ? 'active' : ''}`}>
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d={icon} /></svg>
      <span className="flex-1 text-left">{label}</span>
      {count > 0 && (
        <span
          className="rounded-full px-1.5 text-[11px] font-semibold tabular-nums"
          style={accent ? { color: accent, background: `color-mix(in srgb, ${accent} 16%, transparent)` } : { color: 'var(--fg-muted)', background: 'var(--glass-border)' }}
        >
          {count}
        </span>
      )}
    </button>
  )
}
