import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../api/supabaseClient'

export default function BackupPanel() {
  const { t } = useTranslation()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function handleExport() {
    setBusy(true)
    setError(null)
    try {
      const { data, error } = await supabase.rpc('export_all_data')
      if (error) throw error

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `taskflow-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--fg-muted)]">{t('backup.description')}</p>

      <button onClick={handleExport} disabled={busy} className="btn btn-primary w-full justify-center">
        {busy ? t('backup.exporting') : t('backup.download')}
      </button>

      {error && (
        <p className="rounded-md border px-3 py-2 text-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', background: 'var(--danger-soft)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
