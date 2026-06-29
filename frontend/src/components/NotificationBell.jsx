import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNotifications } from '../hooks/useNotifications'

const TYPE_STYLE = {
  due_soon:   { color: '#f59e0b', icon: 'M8 3.5a.75.75 0 0 1 .75.75v3.5h2.5a.75.75 0 0 1 0 1.5h-3.25A.75.75 0 0 1 7.25 8V4.25A.75.75 0 0 1 8 3.5Z' },
  overdue:    { color: '#ef4444', icon: 'M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM7.25 4.75a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0Zm.75 6.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z' },
  assignment: { color: '#6366f1', icon: 'M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5 6a5 5 0 0 1 10 0Z' },
  mention:    { color: '#10b981', icon: 'M8 1a7 7 0 1 0 3.5 13.06.75.75 0 0 0-.75-1.3A5.5 5.5 0 1 1 13.5 8c0 .77-.2 1.25-.46 1.5-.25.25-.6.36-.94.3-.66-.12-.85-.78-.85-1.3V5.25a.75.75 0 0 0-1.5 0v.1A3 3 0 1 0 8 11a3 3 0 0 0 2.02-.78c.45.6 1.13 1 1.92 1 .73 0 1.45-.27 1.99-.8C14.6 9.8 15 8.8 15 8a7 7 0 0 0-7-7Zm0 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z' },
}

function timeAgo(iso, t) {
  const diff = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return t('notif.justNow')
  if (diff < 3600) return t('notif.minutesAgo', { count: Math.floor(diff / 60) })
  if (diff < 86400) return t('notif.hoursAgo', { count: Math.floor(diff / 3600) })
  return t('notif.daysAgo', { count: Math.floor(diff / 86400) })
}

export default function NotificationBell({ userId, onOpen }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { items, unreadCount, markRead, markAllRead } = useNotifications(userId)

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { if (!open) onOpen?.(); setOpen((o) => !o) }}
        className="btn btn-default relative !px-2"
        title={t('notif.title')}
        aria-label={t('notif.title')}
      >
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1.5A4.5 4.5 0 0 0 3.5 6v2.764l-1.06 2.12A.75.75 0 0 0 3.11 12h9.78a.75.75 0 0 0 .67-1.116l-1.06-2.12V6A4.5 4.5 0 0 0 8 1.5ZM6.25 13a1.75 1.75 0 0 0 3.5 0Z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="menu absolute end-0 z-50 mt-2 w-80 p-1 animate-pop-in">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-sm font-semibold">{t('notif.title')}</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-medium text-[var(--accent)] hover:underline">
                {t('notif.markAll')}
              </button>
            )}
          </div>
          <div className="divider my-1" />

          {items.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-[var(--fg-muted)]">{t('notif.empty')}</p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {items.map((n) => {
                const st = TYPE_STYLE[n.type] ?? TYPE_STYLE.assignment
                return (
                  <button
                    key={n.id}
                    onClick={() => !n.read && markRead(n.id)}
                    className="flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left transition hover:bg-[var(--surface-hover)]"
                  >
                    <span
                      className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ color: st.color, background: `color-mix(in srgb, ${st.color} 16%, transparent)` }}
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor"><path d={st.icon} /></svg>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm leading-snug text-[var(--fg)]">{n.message}</span>
                      <span className="mt-0.5 block text-[11px] text-[var(--fg-subtle)]">{timeAgo(n.created_at, t)}</span>
                    </span>
                    {!n.read && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--accent)]" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
