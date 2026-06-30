import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../api/supabaseClient'
import Avatar from './Avatar'
import i18n, { changeLanguage } from '../i18n'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
]

export default function ProfileMenu({ profile, email, isAdmin, onOpenAccount, onOpenAdmin, onOpen }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const name = profile?.display_name || email
  const { t } = useTranslation()

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => { if (!open) onOpen?.(); setOpen((o) => !o) }} className="flex items-center rounded-full transition hover:ring-2 hover:ring-[var(--border)]">
        <Avatar name={name} url={profile?.avatar_url} size="md" />
      </button>

      {open && (
        <div className="menu absolute end-0 z-50 mt-2 w-64 p-2 animate-pop-in">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar name={name} url={profile?.avatar_url} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="truncate text-xs text-[var(--fg-muted)]">{email}</p>
            </div>
          </div>
          {isAdmin && (
            <span className="mx-2 mb-1 inline-block rounded-full border border-[var(--accent)] px-2 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
              Admin
            </span>
          )}

          <div className="divider my-1" />

          <button onClick={() => { setOpen(false); onOpenAccount() }} className="nav-item text-sm">
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M10.561 8.073a6 6 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6 6 0 0 1 3.431-5.142 3.999 3.999 0 1 1 5.123 0ZM10.5 5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z" /></svg>
            {t('profile.accountSettings')}
          </button>
          {isAdmin && (
            <button onClick={() => { setOpen(false); onOpenAdmin() }} className="nav-item text-sm">
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M7.467.133a1.75 1.75 0 0 1 1.066 0l5.25 1.68A1.75 1.75 0 0 1 15 3.48V7c0 1.566-.32 3.182-1.303 4.682-.983 1.498-2.585 2.813-5.032 3.855a1.7 1.7 0 0 1-1.33 0c-2.447-1.042-4.049-2.357-5.032-3.855C1.32 10.182 1 8.566 1 7V3.48a1.75 1.75 0 0 1 1.217-1.667Z" /></svg>
              {t('profile.adminPanel')}
            </button>
          )}

          <div className="divider my-1" />

          <div className="px-2 py-1.5">
            <label className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--fg-muted)]">{t('lang.switcher')}</label>
            <select
              value={i18n.language}
              onChange={(e) => { changeLanguage(e.target.value) }}
              className="input !py-1.5 text-sm"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="divider my-1" />

          <button onClick={() => supabase.auth.signOut()} className="nav-item text-sm" style={{ color: 'var(--danger)' }}>
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.75C2 1.784 2.784 1 3.75 1h2.5a.75.75 0 0 1 0 1.5h-2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h2.5a.75.75 0 0 1 0 1.5h-2.5A1.75 1.75 0 0 1 2 13.25Zm10.44 4.5-1.97-1.97a.749.749 0 0 1 1.06-1.06l3.25 3.25a.749.749 0 0 1 0 1.06l-3.25 3.25a.749.749 0 1 1-1.06-1.06l1.97-1.97H6.75a.75.75 0 0 1 0-1.5Z" /></svg>
            {t('auth.signOut') || 'Sign out'}
          </button>
        </div>
      )}
    </div>
  )
}
