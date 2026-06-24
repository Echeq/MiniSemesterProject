import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../api/supabaseClient'
import Modal from './Modal'

const PRESET_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#ef4444', '#ec4899']

export default function LabelManager({ projectId, onClose }) {
  const [labels, setLabels] = useState([])
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    const { data } = await supabase
      .from('labels')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
    setLabels(data ?? [])
  }, [projectId])

  useEffect(() => { refetch() }, [refetch])

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    setError(null)
    try {
      const { error } = await supabase
        .from('labels')
        .insert({ name: name.trim(), color, project_id: projectId })
      if (error) throw error
      setName('')
      setColor('#6366f1')
      await refetch()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleUpdate(id, fields) {
    const { error } = await supabase.from('labels').update(fields).eq('id', id)
    if (error) throw error
    setEditing(null)
    await refetch()
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this label? It will be removed from all tasks.')) return
    const { error } = await supabase.from('labels').delete().eq('id', id)
    if (error) throw error
    await refetch()
  }

  return (
    <Modal title="Manage labels" subtitle="Create, edit, or delete labels for this project" onClose={onClose}>
      <div className="mb-4 space-y-2">
        {labels.length === 0 && (
          <p className="text-sm text-[var(--fg-muted)]">No labels yet. Create one below.</p>
        )}
        {labels.map((l) => (
          <div key={l.id} className="flex items-center gap-2 rounded-md border border-[var(--border-muted)] px-3 py-2">
            {editing === l.id ? (
              <div className="flex flex-1 items-center gap-2">
                <input value={editing} onChange={(e) => setEditing(e.target.value)} className="input flex-1 !py-1 text-sm" />
                <div className="flex gap-1">
                  {PRESET_COLORS.slice(0, 4).map((c) => (
                    <button key={c} type="button" onClick={() => handleUpdate(l.id, { ...l, color: c, name: l.name })}
                      className="h-5 w-5 rounded-full border" style={{ background: c, borderColor: c === l.color ? 'var(--fg)' : 'transparent' }}
                    />
                  ))}
                </div>
                <button onClick={() => { handleUpdate(l.id, { name: editing === true ? l.name : editing }); setEditing(null) }}
                  className="text-xs font-medium text-[var(--accent)]">Save</button>
              </div>
            ) : (
              <>
                <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: l.color }} />
                <span className="flex-1 text-sm">{l.name}</span>
                <button onClick={() => setEditing(l.id)} className="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)]">Edit</button>
                <button onClick={() => handleDelete(l.id)} className="text-xs text-[var(--fg-muted)] hover:text-[var(--danger)]">Delete</button>
              </>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleCreate} className="space-y-3">
        <div className="flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={50} placeholder="Label name" className="input flex-1" />
          <select value={color} onChange={(e) => setColor(e.target.value)} className="input w-20">
            {PRESET_COLORS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}
        <button type="submit" disabled={busy || !name.trim()} className="btn btn-primary w-full">Add label</button>
      </form>
    </Modal>
  )
}
