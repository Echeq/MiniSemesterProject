import { useRef, useState } from 'react'
import { supabase } from '../api/supabaseClient'
import Modal from './Modal'
import Avatar from './Avatar'

export default function AccountModal({ session, profile, onSaved, onClose }) {
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
    setBusy(true)
    setError(null)
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
    setUploading(true)
    setError(null)
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
    setBusy(true)
    setError(null)
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
    setBusy(true)
    setError(null)
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
    <Modal title="Account settings" subtitle={session.user.email} onClose={onClose}>
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
    </Modal>
  )
}
