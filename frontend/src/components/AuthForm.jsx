import { useState } from 'react'
import { supabase } from '../api/supabaseClient'

export default function AuthForm() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setBusy(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } },
        })
        if (error) throw error
        setMessage('Account created. If email confirmation is on, check your inbox — otherwise just sign in.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const labelCls = 'mb-1.5 block text-sm font-medium text-[var(--fg)]'

  return (
    <div className="flex min-h-full items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--fg)] text-[var(--bg)]">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M4 7h6v13H4zM14 7h6v8h-6z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">TaskFlow</h1>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            {mode === 'signin' ? 'Sign in to your board' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-6">
          {mode === 'signup' && (
            <label className="mb-3 block">
              <span className={labelCls}>Display name</span>
              <input type="text" required maxLength={100} value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input" placeholder="Jane Doe" />
            </label>
          )}

          <label className="mb-3 block">
            <span className={labelCls}>Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
          </label>

          <label className="mb-5 block">
            <span className={labelCls}>Password</span>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" />
          </label>

          {error && <p className="mb-3 rounded-md border px-3 py-2 text-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', background: 'var(--danger-soft)' }}>{error}</p>}
          {message && <p className="mb-3 rounded-md border px-3 py-2 text-sm" style={{ color: 'var(--done)', borderColor: 'var(--done)' }}>{message}</p>}

          <button type="submit" disabled={busy} className="btn btn-primary w-full">
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
          </button>

          <button
            type="button"
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setMessage(null) }}
            className="mt-4 w-full text-center text-sm text-[var(--accent)] hover:underline"
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
