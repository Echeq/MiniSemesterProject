import { useState } from 'react'
import { supabase } from '../api/supabaseClient'

export default function InviteDialog({ adminId, onClose }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setBusy(true)
    try {
      const { error } = await supabase.from('invitations').insert({
        admin_id: adminId,
        invited_email: email,
      })
      if (error) throw error
      setSuccess(`${email} has been invited. They will become a member when they sign up.`)
      setEmail('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 modal-overlay flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl sm:rounded-xl"
      >
        <h2 className="mb-4 text-lg font-bold text-slate-800">Invite member</h2>

        <form onSubmit={handleSubmit}>
          <label className="mb-4 block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-600">
              Email address
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:rounded-lg sm:px-3 sm:py-2"
            />
          </label>

          {error && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
          {success && (
            <p className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-colors sm:rounded-lg sm:py-2.5"
            >
              Done
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition-colors sm:rounded-lg sm:py-2.5"
            >
              {busy ? 'Inviting…' : 'Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
