import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from './Modal'

const PRESET_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4']
const PRESET_ICONS = [
  { key: 'project', path: 'M1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0M1.5 1.75v12.5c0 .138.112.25.25.25h2.875V1.5H1.75a.25.25 0 0 0-.25.25m4.625-.25v13h2.875v-13zm4.375 0v13h2.875a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25z' },
  { key: 'globe', path: 'M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM5.78 8.75a9.6 9.6 0 0 0 .653 3.013c.305.756.652 1.32.998 1.69q.524.563.998.563.475 0 1-.563c.345-.37.692-.934.997-1.69a9.6 9.6 0 0 0 .653-3.013Zm4.292-1.5a9.6 9.6 0 0 0-.653-3.013c-.305-.756-.652-1.32-.998-1.69Q8.187 1.984 8 1.984q-.474 0-.998.563c-.346.37-.693.934-.998 1.69A9.6 9.6 0 0 0 5.78 7.25Zm-5.795 1.5H1.543a6.5 6.5 0 0 0 4.71 5.642 9.6 9.6 0 0 1-.5-1.291 11 11 0 0 1-.483-2.85ZM1.543 7.25h2.733a11 11 0 0 1 .483-2.85c.13-.45.297-.883.5-1.29A6.5 6.5 0 0 0 1.543 7.25Zm12.914 1.5h-2.733a11 11 0 0 1-.483 2.85c-.13.45-.297.883-.5 1.291a6.5 6.5 0 0 0 3.716-4.141Zm0-1.5a6.5 6.5 0 0 0-3.716-4.141c.203.408.37.84.5 1.29a11 11 0 0 1 .483 2.85Z' },
  { key: 'heart', path: 'M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314' },
  { key: 'star', path: 'M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25' },
  { key: 'rocket', path: 'M14.064 0h.186C15.216 0 16 .784 16 1.75v.186a8.75 8.75 0 0 1-1.538 4.95l-.286.408a8.75 8.75 0 0 1-3.696 2.77l-1.766.655-.353 1.06a.75.75 0 0 1-1.01.453l-1.74-.87-.87-1.74a.75.75 0 0 1 .454-1.01l1.059-.353.655-1.766A8.75 8.75 0 0 1 8.704 1.32l.408-.286A8.75 8.75 0 0 1 14.064 0M3 12a1 1 0 1 1 0 2 1 1 0 0 1 0-2m-2.5.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0' },
  { key: 'bookmark', path: 'M4 0h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 12.583l-5.223 3.333A.5.5 0 0 1 2 15.5V2a2 2 0 0 1 2-2' },
]

export default function ProjectSettingsModal({ project, onUpdate, onClose }) {
  const { t } = useTranslation()
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description || '')
  const [color, setColor] = useState(project.color || '#6366f1')
  const [icon, setIcon] = useState(project.icon || 'project')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setError(null)
    setBusy(true)
    try {
      await onUpdate(project.id, { name: name.trim(), description, color, icon })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={t('project.settingsTitle')} subtitle={project.name} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label className="mb-3 block">
          <span className="mb-1.5 block text-sm font-medium text-[var(--fg)]">{t('project.name')}</span>
          <input type="text" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} className="input" />
        </label>

        <label className="mb-3 block">
          <span className="mb-1.5 block text-sm font-medium text-[var(--fg)]">{t('project.description')}</span>
          <textarea rows={2} maxLength={2000} value={description} onChange={(e) => setDescription(e.target.value)} className="input resize-none" />
        </label>

        <div className="mb-3">
          <span className="mb-1.5 block text-sm font-medium text-[var(--fg)]">{t('project.color')}</span>
          <div className="flex gap-2">
            {PRESET_COLORS.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className="h-7 w-7 rounded-full border-2 transition hover:scale-110"
                style={{ background: c, borderColor: color === c ? 'var(--fg)' : 'transparent' }}
              />
            ))}
          </div>
        </div>

        <div className="mb-4">
          <span className="mb-1.5 block text-sm font-medium text-[var(--fg)]">{t('project.icon')}</span>
          <div className="flex flex-wrap gap-2">
            {PRESET_ICONS.map((icn) => (
              <button key={icn.key} type="button" onClick={() => setIcon(icn.key)}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:scale-110"
                style={{ background: icon === icn.key ? 'var(--surface-hover)' : 'transparent', color: 'var(--fg)' }}
              >
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d={icn.path} /></svg>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="mb-3 rounded-md border px-3 py-2 text-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', background: 'var(--danger-soft)' }}>{error}</p>}

        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-default">{t('project.cancel')}</button>
          <button type="submit" disabled={busy} className="btn btn-primary">{t('project.save')}</button>
        </div>
      </form>
    </Modal>
  )
}

export { PRESET_COLORS, PRESET_ICONS }
