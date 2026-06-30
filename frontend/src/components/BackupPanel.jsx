import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../api/supabaseClient'

export default function BackupPanel() {
  const { t } = useTranslation()
  const [step, setStep] = useState('idle')
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState(null)

  async function handleExport() {
    setStep('generating'); setError(null)
    try {
      const { data, error } = await supabase.rpc('export_all_data')
      if (error) throw error

      const counts = {
        projects: data?.projects?.length ?? 0,
        tasks: data?.tasks?.length ?? 0,
        labels: data?.labels?.length ?? 0,
        members: data?.members?.length ?? 0,
      }
      setSummary(counts)

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `taskflow-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setStep('done')
    } catch (err) {
      setError(err.message); setStep('idle')
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--fg-muted)]">
        Download all your data as a JSON file. Use it to migrate or restore later.
      </p>

      <button onClick={handleExport} disabled={step === 'generating'} className="btn btn-primary w-full justify-center">
        {step === 'generating' ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Generating…
          </span>
        ) : (
          'Download backup'
        )}
      </button>

      {summary && (
        <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--card)] p-3 text-xs text-[var(--fg-muted)]">
          <p className="mb-1.5 text-xs font-semibold text-[var(--fg)]">Exported:</p>
          <div className="grid grid-cols-2 gap-1">
            <span>Projects: <strong>{summary.projects}</strong></span>
            <span>Tasks: <strong>{summary.tasks}</strong></span>
            <span>Labels: <strong>{summary.labels}</strong></span>
            <span>Members: <strong>{summary.members}</strong></span>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-md border px-3 py-2 text-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', background: 'var(--danger-soft)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
