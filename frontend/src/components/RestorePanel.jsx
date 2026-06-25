import { useState } from 'react'
import { supabase } from '../api/supabaseClient'

export default function RestorePanel() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  async function handleRestore(e) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const file = e.target.file.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const { error } = await supabase.rpc('restore_from_backup', { data })
      if (error) throw error
      setSuccess(true)
      e.target.reset()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--fg-muted)]">
        Upload a previously exported backup (.json) to restore projects, tasks, and labels.
        Existing records are skipped — no data is overwritten.
      </p>

      <form onSubmit={handleRestore} className="space-y-3">
        <input type="file" name="file" accept=".json" required className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:px-3 file:py-1.5 file:text-sm file:font-medium file:bg-[var(--surface-hover)] file:text-[var(--fg)] hover:file:bg-[var(--card-hover)]" />
        <button type="submit" disabled={busy} className="btn btn-primary w-full justify-center">
          {busy ? 'Restoring…' : 'Restore from backup'}
        </button>
      </form>

      {success && (
        <p className="rounded-md border px-3 py-2 text-sm" style={{ color: 'var(--done)', borderColor: 'var(--done)' }}>
          Backup restored successfully.
        </p>
      )}

      {error && (
        <p className="rounded-md border px-3 py-2 text-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', background: 'var(--danger-soft)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
