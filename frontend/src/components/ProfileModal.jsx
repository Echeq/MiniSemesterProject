import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../api/supabaseClient'
import Modal from './Modal'
import Avatar from './Avatar'

function Spinner() {
  return (
    <div className="flex items-center justify-center py-6">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
    </div>
  )
}

export default function ProfileModal({ session, profile, stats = [], onSaved, onGoToMyTasks, onClose }) {
  const { t } = useTranslation()
  const [tab, setTab] = useState('overview')
  const name = profile?.display_name || session.user.email

  const STATUS = {
    todo: { label: t('board.todo'), color: 'var(--todo)' },
    doing: { label: t('board.inProgress'), color: 'var(--doing)' },
    done: { label: t('board.done'), color: 'var(--done)' },
  }

  return (
    <Modal title={name} subtitle={session.user.email} onClose={onClose} maxWidth="max-w-lg">
      <div className="mb-4 flex gap-1 rounded-lg border border-[var(--glass-border)] bg-[var(--glass)] p-1">
        <Tab active={tab === 'overview'} onClick={() => setTab('overview')}>{t('profile.overview')}</Tab>
        <Tab active={tab === 'settings'} onClick={() => setTab('settings')}>{t('profile.settings')}</Tab>
      </div>
      {tab === 'overview' ? (
        <Overview session={session} profile={profile} stats={stats} status={STATUS} onGoToMyTasks={onGoToMyTasks} onClose={onClose} />
      ) : (
        <Settings session={session} profile={profile} onSaved={onSaved} />
      )}
    </Modal>
  )
}

function Tab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
        active ? 'bg-[var(--card-hover)] text-[var(--fg)] shadow-[var(--shadow-sm)]' : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
      }`}
    >
      {children}
    </button>
  )
}

function Overview({ session, profile, stats, status: STATUS, onGoToMyTasks, onClose }) {
  const { t } = useTranslation()
  const userId = session.user.id
  const [joined, setJoined] = useState(null)
  const [active, setActive] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    Promise.all([
      supabase.from('profiles').select('created_at').eq('id', userId).single(),
      supabase
        .from('tasks')
        .select('id, title, status, due_date')
        .eq('assignee', userId)
        .neq('status', 'done')
        .order('due_date', { ascending: true, nullsFirst: false })
        .limit(6),
    ]).then(([p, t]) => {
      if (!alive) return
      setJoined(p.data?.created_at ?? null)
      setActive(t.data ?? [])
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [userId])

  const today = new Date().toISOString().slice(0, 10)
  const in7 = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  const mine = stats.filter((t) => t.assignee === userId)
  const counts = { todo: 0, doing: 0, done: 0 }
  let overdue = 0
  let dueSoon = 0
  for (const t of mine) {
    counts[t.status] = (counts[t.status] ?? 0) + 1
    if (t.due_date && t.status !== 'done') {
      if (t.due_date < today) overdue++
      else if (t.due_date <= in7) dueSoon++
    }
  }
  const total = mine.length
  const pct = total ? Math.round((counts.done / total) * 100) : 0

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Avatar name={profile?.display_name} url={profile?.avatar_url} size="lg" ring />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">{profile?.display_name}</p>
          <p className="truncate text-sm text-[var(--fg-muted)]">{session.user.email}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span
              className="rounded-full border px-2 py-0.5 text-[11px] font-semibold"
              style={profile?.role === 'admin' ? { color: 'var(--accent)', borderColor: 'var(--accent)' } : { color: 'var(--fg-muted)', borderColor: 'var(--border)' }}
            >
              {profile?.role ?? 'member'}
            </span>
            {joined && (
              <span className="text-xs text-[var(--fg-subtle)]">
                Joined {new Date(joined).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>

      <section>
        <div className="mb-2 flex items-end justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">{t('profile.yourProgress')}</h3>
          <span className="text-sm text-[var(--fg-muted)]">{counts.done}/{total} complete</span>
        </div>
        <div className="mb-1 flex items-baseline gap-2">
          <span className="text-2xl font-bold">{pct}%</span>
        </div>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--glass-border)]">
          {['done', 'doing', 'todo'].map((s) =>
            counts[s] ? (
              <div key={s} style={{ width: `${(counts[s] / total) * 100}%`, background: STATUS[s].color }} className="h-full first:rounded-l-full last:rounded-r-full" />
            ) : null,
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {Object.entries(STATUS).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1.5 text-xs text-[var(--fg-muted)]">
              <span className="h-2 w-2 rounded-full" style={{ background: v.color }} /> {v.label} {counts[k]}
            </span>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2">
        <Stat label={t('profile.assigned')} value={total} />
        <Stat label={t('profile.overdue')} value={overdue} color="var(--danger)" />
        <Stat label={t('profile.dueWeek')} value={dueSoon} color="var(--doing)" />
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">{t('profile.activeWork')}</h3>
        {loading ? (
          <Spinner />
        ) : active.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--glass-border)] py-4 text-center text-sm text-[var(--fg-muted)]">
            No open tasks assigned to you. 🎉
          </p>
        ) : (
          <div className="space-y-1.5">
            {active.map((t) => (
              <div key={t.id} className="flex items-center gap-2.5 rounded-lg border border-[var(--glass-border)] bg-[var(--card)] px-3 py-2">
                <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: STATUS[t.status].color }} />
                <span className="min-w-0 flex-1 truncate text-sm">{t.title}</span>
                {t.due_date && (
                  <span className="flex-shrink-0 text-xs" style={{ color: t.due_date < today ? 'var(--danger)' : 'var(--fg-muted)' }}>
                    {new Date(t.due_date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => { onGoToMyTasks?.(); onClose() }}
          className="mt-2.5 w-full rounded-lg border border-[var(--glass-border)] py-2 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--surface-hover)]"
        >
          View all my tasks →
        </button>
      </section>
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--card)] p-2.5 text-center">
      <p className="text-xl font-bold" style={color ? { color } : undefined}>{value}</p>
      <p className="mt-0.5 text-[11px] text-[var(--fg-muted)]">{label}</p>
    </div>
  )
}

function SectionCard({ title, desc, children, accent }) {
  const borderColor = accent || 'var(--glass-border)'
  return (
    <div className="mb-4 rounded-lg border p-4" style={{ borderColor, background: 'var(--card)' }}>
      {title && <p className="mb-1 text-sm font-semibold text-[var(--fg)]">{title}</p>}
      {desc && <p className="mb-3 text-xs text-[var(--fg-muted)]">{desc}</p>}
      {children}
    </div>
  )
}

function Settings({ session, profile, onSaved }) {
  const { t } = useTranslation()
  const userId = session.user.id
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? null)
  const [password, setPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [error, setError] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [avatarPassword, setAvatarPassword] = useState('')
  const [avatarConfirm, setAvatarConfirm] = useState(false)
  const [pendingAvatarFile, setPendingAvatarFile] = useState(null)
  const [emailBusy, setEmailBusy] = useState(null)
  const [passBusy, setPassBusy] = useState(null)
  const [passPassword, setPassPassword] = useState('')
  const fileRef = useRef(null)

  function flash(setter, text) {
    setter(text)
    setTimeout(() => setter(null), 4000)
  }

  async function saveProfile() {
    const { error } = await supabase.from('profiles').update({ display_name: displayName }).eq('id', userId)
    if (error) throw error
    await onSaved()
    flash(setMsg, 'Profile saved.')
  }

  function handleAvatarSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingAvatarFile(file)
    setAvatarConfirm(true)
    setAvatarPassword('')
    setError(null)
  }

  async function confirmAvatarUpload() {
    if (!pendingAvatarFile || !avatarPassword) return
    setUploading(true); setError(null)
    try {
      const { error: authErr } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: avatarPassword,
      })
      if (authErr) throw new Error('Current password is incorrect.')
      const file = pendingAvatarFile
      const ext = file.name.split('.').pop()
      const path = `${userId}/avatar.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = `${data.publicUrl}?t=${Date.now()}`
      const { error: dbErr } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', userId)
      if (dbErr) throw dbErr
      setAvatarUrl(url); setPendingAvatarFile(null); setAvatarConfirm(false)
      await onSaved()
      flash(setMsg, 'Avatar updated.')
    } catch (err) {
      flash(setError, err.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleChangeEmail() {
    if (!newEmail) return
    setEmailBusy(true)
    setError(null); setMsg(null)
    try {
      const { error: rErr } = await supabase.rpc('submit_email_change', { new_email: newEmail })
      if (rErr) throw rErr
      setNewEmail(''); setEmailBusy(null)
      flash(setMsg, 'Change request submitted. An admin will review it.')
    } catch (err) {
      flash(setError, err.message)
      setEmailBusy(false)
    }
  }

  async function handleChangePassword() {
    if (password.length < 6) { flash(setError, 'Password must be at least 6 characters.'); return }
    if (!passPassword) return
    setPassBusy(true)
    setError(null); setMsg(null)
    try {
      const { error: authErr } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: passPassword,
      })
      if (authErr) throw new Error('Current password is incorrect.')
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setPassword(''); setPassPassword(''); setPassBusy(null)
      flash(setMsg, 'Password changed.')
    } catch (err) {
      flash(setError, err.message)
      setPassBusy(false)
    }
  }

  async function handleDelete() {
    if (!deletePassword) return
    setBusy(true); setError(null)
    try {
      const { error: authErr } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: deletePassword,
      })
      if (authErr) throw new Error('Current password is incorrect.')
      const { error } = await supabase.rpc('delete_own_account')
      if (error) throw error
      await supabase.auth.signOut()
    } catch (err) {
      flash(setError, err.message)
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      {msg && <p className="mb-3 rounded-md border px-3 py-2 text-sm" style={{ color: 'var(--done)', borderColor: 'var(--done)', background: 'color-mix(in srgb, var(--done) 12%, transparent)' }}>{msg}</p>}
      {error && <p className="mb-3 rounded-md border px-3 py-2 text-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', background: 'var(--danger-soft)' }}>{error}</p>}

      {/* Avatar */}
      <SectionCard>
        <div className="flex items-center gap-4">
          <Avatar name={displayName} url={avatarUrl} size="lg" ring />
          <div>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn btn-default">
              {uploading ? t('profile.uploading') : t('profile.changeAvatar')}
            </button>
            <p className="mt-1 text-xs text-[var(--fg-subtle)]">PNG or JPG.</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
          </div>
        </div>
        {avatarConfirm && (
          <div className="mt-3 rounded-md border p-3" style={{ borderColor: 'var(--doing)', background: 'var(--surface-hover)' }}>
            <p className="mb-2 text-xs font-medium">Enter your current password to confirm avatar change.</p>
            <div className="flex gap-2">
              <input type="password" value={avatarPassword} onChange={(e) => setAvatarPassword(e.target.value)} placeholder="Current password" className="input flex-1" />
              <button disabled={uploading || !avatarPassword} onClick={confirmAvatarUpload} className="btn btn-primary">
                {uploading ? 'Uploading…' : 'Confirm'}
              </button>
              <button disabled={uploading} onClick={() => { setAvatarConfirm(false); setPendingAvatarFile(null); setAvatarPassword('') }} className="btn btn-default">Cancel</button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Display name */}
      <SectionCard title="Display name" desc="How your name appears across the board.">
        <div className="flex gap-2">
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={100} className="input flex-1" />
          <button disabled={busy} onClick={async () => { try { await saveProfile() } catch (e) { flash(setError, e.message) } }} className="btn btn-primary">
            {t('profile.save')}
          </button>
        </div>
      </SectionCard>

      {/* Email */}
      <SectionCard title={t('profile.newEmail')} desc="Change your login email. A verification link will be sent to the new address.">
        {emailBusy !== null ? (
          <div className="flex gap-2">
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="new@example.com" className="input flex-1" disabled={emailBusy === true} />
            <button disabled={emailBusy === true || !newEmail} onClick={handleChangeEmail} className="btn btn-primary">
              {emailBusy === true ? 'Submitting…' : 'Confirm'}
            </button>
            <button disabled={emailBusy === true} onClick={() => { setEmailBusy(null); setNewEmail('') }} className="btn btn-default">{t('profile.cancel')}</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="new@example.com" className="input flex-1" />
            <button disabled={!newEmail} onClick={() => setEmailBusy('ready')} className="btn btn-default">
              Request email change
            </button>
          </div>
        )}
      </SectionCard>

      {/* Password */}
      <SectionCard title={t('profile.newPassword')} desc="Must be at least 6 characters.">
        {passBusy !== null ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} placeholder="••••••••" className="input flex-1" disabled={passBusy === true} />
            </div>
            <div className="flex gap-2">
              <input type="password" value={passPassword} onChange={(e) => setPassPassword(e.target.value)} placeholder="Current password to confirm" className="input flex-1" disabled={passBusy === true} />
              <button disabled={passBusy === true || !password || !passPassword} onClick={handleChangePassword} className="btn btn-primary">
                {passBusy === true ? 'Updating…' : t('profile.changePassword')}
              </button>
              <button disabled={passBusy === true} onClick={() => { setPassBusy(null); setPassword(''); setPassPassword('') }} className="btn btn-default">{t('profile.cancel')}</button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} placeholder="••••••••" className="input flex-1" />
            <button disabled={!password} onClick={() => setPassBusy('ready')} className="btn btn-default">
              {t('profile.changePassword')}
            </button>
          </div>
        )}
      </SectionCard>

      {/* Danger zone */}
      <div className="rounded-lg border p-4" style={{ borderColor: 'var(--danger)', background: 'color-mix(in srgb, var(--danger) 8%, transparent)' }}>
        <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>{t('profile.dangerZone')}</p>
        <p className="mt-1 text-xs text-[var(--fg-muted)]">{t('profile.dangerWarning')}</p>
        {deleteConfirm ? (
          <div className="mt-3 space-y-2">
            <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>{t('profile.deleteWarning')}</p>
            <div className="flex gap-2">
              <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Current password to confirm" className="input flex-1" disabled={busy} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setDeleteConfirm(false); setDeletePassword('') }} disabled={busy} className="btn btn-default">{t('profile.cancel')}</button>
              <button onClick={handleDelete} disabled={busy || !deletePassword} className="btn btn-danger">{busy ? t('profile.deleting') : t('profile.deleteConfirmAction')}</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setDeleteConfirm(true)} className="btn btn-danger mt-3">{t('profile.deleteAccount')}</button>
        )}
      </div>
    </div>
  )
}
