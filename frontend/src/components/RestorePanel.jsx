import { useState } from 'react'
import { supabase } from '../api/supabaseClient'

export default function RestorePanel() {
  const [step, setStep] = useState('idle')
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null)
  const [fileName, setFileName] = useState('')

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) { setPreview(null); setFileName(''); return }
    setFileName(file.name); setError(null)

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (!data || typeof data !== 'object') throw new Error('Invalid JSON: expected an object')
        setPreview({
          projects: data.projects?.length ?? 0,
          tasks: data.tasks?.length ?? 0,
          labels: data.labels?.length ?? 0,
        })
        setStep('preview')
      } catch (err) {
        setError('Invalid backup file: ' + err.message)
        setPreview(null); setStep('idle')
      }
    }
    reader.readAsText(file)
  }

  async function handleRestore() {
    const fileInput = document.getElementById('restore-file')
    const file = fileInput?.files?.[0]
    if (!file) return
    setStep('restoring'); setError(null)

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const { error } = await supabase.rpc('restore_from_backup', { data })
      if (error) throw error
      setStep('done')
      fileInput.value = ''
    } catch (err) {
      setError(err.message)
      setStep('preview')
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--fg-muted)]">
        Upload a backup JSON file to restore projects, tasks, and labels.
        Existing records are <strong>skipped</strong> — no data is overwritten.
      </p>

      <div className="space-y-3">
        <input
          id="restore-file"
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:px-3 file:py-1.5 file:text-sm file:font-medium file:bg-[var(--surface-hover)] file:text-[var(--fg)] hover:file:bg-[var(--card-hover)]"
        />
      </div>

      {preview && step === 'preview' && (
        <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--card)] p-3 text-xs text-[var(--fg-muted)]">
          <p className="mb-1.5 text-xs font-semibold text-[var(--fg)]">
            Found in <span className="font-mono">{fileName}</span>:
          </p>
          <div className="grid grid-cols-3 gap-1">
            <span>Projects: <strong>{preview.projects}</strong></span>
            <span>Tasks: <strong>{preview.tasks}</strong></span>
            <span>Labels: <strong>{preview.labels}</strong></span>
          </div>
          <button onClick={handleRestore} disabled={step === 'restoring'} className="btn btn-primary mt-3 w-full justify-center">
            {step === 'restoring' ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Restoring…
              </span>
            ) : (
              'Restore from backup'
            )}
          </button>
        </div>
      )}

      {step === 'done' && (
        <p className="rounded-md border px-3 py-2 text-sm" style={{ color: 'var(--done)', borderColor: 'var(--done)', background: 'color-mix(in srgb, var(--done) 12%, transparent)' }}>
          Backup restored successfully. Existing records were skipped.
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
