import { useEffect, useRef, useState } from 'react'
import { supabase } from '../api/supabaseClient'
import Modal from './Modal'
import Avatar from './Avatar'

const STATUS = {
  todo: { label: 'To Do', color: 'var(--todo)' },
  doing: { label: 'Doing', color: 'var(--doing)' },
  done: { label: 'Done', color: 'var(--done)' },
}

export default function ProfileModal({ session, profile, stats = [], onSaved, onGoToMyTasks, onClose }) {
  const [tab, setTab] = useState('overview')
  const name = profile?.display_name || session.user.email

  return (
    <Modal title={name} subtitle={session.user.email} onClose={onClose} maxWidth="max-w-lg">
      <div className="mb-4 flex gap-1 rounded-lg border border-[var(--glass-border)] bg-[var(--glass)] p-1">
        <Tab active={tab === 'overview'} onClick={() => setTab('overview')}>Overview</Tab>
        <Tab active={tab === 'settings'} onClick={() => setTab('settings')}>Settings</Tab>
      </div>
      {tab === 'overview' ? (
        <Overview session={session} profile={profile} stats={stats} onGoToMyTasks={onGoToMyTasks} onClose={onClose} />
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

function Overview({ session, profile, stats, onGoToMyTasks, onClose }) {
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
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Your progress</h3>
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
        <Stat label="Assigned" value={total} />
        <Stat label="Overdue" value={overdue} color="var(--danger)" />
        <Stat label="Due ≤7d" value={dueSoon} color="var(--doing)" />
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Active work</h3>
        {loading ? (
          <p className="py-3 text-center text-sm text-[var(--fg-muted)]">Loading…</p>
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

function Settings({ session, profile, onSaved }) {
  const userId = session.user.id
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? null)
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [error, setError] = useState(null)
  const fileRef = useRef(null)

  function flash(setter, text) {
    setter(text)
    setTimeout(() => setter(null), 4000)
  }

  async function saveProfile(e) {
    e.preventDefault()
    setBusy(true); setError(null)
    try {
      const { error } = await supabase.from('profiles').update({ display_name: displayName }).eq('id', userId)
      if (error) throw error
      await onSaved()
      flash(setMsg, 'Profile saved.')
    } catch (err) {
      flash(setError, err.message)
    } finally {
      setBusy(false)
    }
  }

  async function uploadAvatar(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setError(null)
    try {
      const ext = file.name.split('.').pop()
      const path = `${userId}/avatar.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = `${data.publicUrl}?t=${Date.now()}`
      const { error: dbErr } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', userId)
      if (dbErr) throw dbErr
      setAvatarUrl(url)
      await onSaved()
      flash(setMsg, 'Avatar updated.')
    } catch (err) {
      flash(setError, err.message)
    } finally {
      setUploading(false)
    }
  }

  async function changePassword(e) {
    e.preventDefault()
    if (password.length < 6) return flash(setError, 'Password must be at least 6 characters.')
    setBusy(true); setError(null)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setPassword('')
      flash(setMsg, 'Password changed.')
    } catch (err) {
      flash(setError, err.message)
    } finally {
      setBusy(false)
    }
  }

  async function deleteAccount() {
    if (!window.confirm('Delete your account permanently? This removes your profile and everything you own. This cannot be undone.')) return
    setBusy(true); setError(null)
    try {
      const { error } = await supabase.rpc('delete_own_account')
      if (error) throw error
      await supabase.auth.signOut()
    } catch (err) {
      flash(setError, err.message)
      setBusy(false)
    }
  }

  const labelCls = 'mb-1.5 block text-sm font-medium text-[var(--fg)]'

  return (
    <div>
      {msg && <p className="mb-3 rounded-md border px-3 py-2 text-sm" style={{ color: 'var(--done)', borderColor: 'var(--done)' }}>{msg}</p>}
      {error && <p className="mb-3 rounded-md border px-3 py-2 text-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', background: 'var(--danger-soft)' }}>{error}</p>}

      <div className="mb-5 flex items-center gap-4">
        <Avatar name={displayName} url={avatarUrl} size="lg" ring />
        <div>
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn btn-default">
            {uploading ? 'Uploading…' : 'Change avatar'}
          </button>
          <p className="mt-1 text-xs text-[var(--fg-subtle)]">PNG or JPG.</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
        </div>
      </div>

      <form onSubmit={saveProfile} className="mb-5">
        <label className="block">
          <span className={labelCls}>Display name</span>
          <div className="flex gap-2">
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={100} className="input" />
            <button disabled={busy} className="btn btn-primary">Save</button>
          </div>
        </label>
      </form>

      <form onSubmit={changePassword} className="mb-6">
        <label className="block">
          <span className={labelCls}>New password</span>
          <div className="flex gap-2">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} placeholder="••••••••" className="input" />
            <button disabled={busy || !password} className="btn btn-default">Update</button>
          </div>
        </label>
      </form>

      <div className="rounded-md border p-4" style={{ borderColor: 'var(--danger)', background: 'var(--danger-soft)' }}>
        <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>Danger zone</p>
        <p className="mt-1 text-xs text-[var(--fg-muted)]">Permanently delete your account and all data you own. Blocked if you're the only admin.</p>
        <button type="button" onClick={deleteAccount} disabled={busy} className="btn btn-danger mt-3">Delete my account</button>
      </div>
    </div>
  )
}
