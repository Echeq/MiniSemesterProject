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
        setMessage('Check your email to confirm your account, then sign in.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg sm:rounded-xl sm:shadow-md"
      >
        <div className="mb-6 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-slate-800 sm:text-2xl">TaskFlow</h1>
          <p className="mt-1 text-sm text-slate-500">
            {mode === 'signin' ? 'Sign in to your board' : 'Create an account'}
          </p>
        </div>

        {mode === 'signup' && (
          <label className="mb-4 block sm:mb-3">
            <span className="mb-1.5 block text-sm font-semibold text-slate-600 sm:font-medium">
              Display name
            </span>
            <input
              type="text"
              required
              maxLength={100}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:rounded-lg sm:px-3 sm:py-2"
            />
          </label>
        )}

        <label className="mb-4 block sm:mb-3">
          <span className="mb-1.5 block text-sm font-semibold text-slate-600 sm:font-medium">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:rounded-lg sm:px-3 sm:py-2"
          />
        </label>

        <label className="mb-6 block sm:mb-5">
          <span className="mb-1.5 block text-sm font-semibold text-slate-600 sm:font-medium">
            Password
          </span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:rounded-lg sm:px-3 sm:py-2"
          />
        </label>

        {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 sm:rounded-lg sm:px-3 sm:py-2">{error}</p>}
        {message && <p className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 sm:rounded-lg sm:px-3 sm:py-2">{message}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 sm:rounded-lg sm:py-2.5 transition-colors"
        >
          {mode === 'signin' ? 'Sign in' : 'Sign up'}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setError(null)
            setMessage(null)
          }}
          className="mt-4 w-full text-center text-sm text-indigo-600 hover:underline py-2"
        >
          {mode === 'signin'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  )
}
