import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../api/supabaseClient'

// Tracks which tasks are currently being edited by other users
// via Supabase Realtime Presence. Returns a Map<taskId, displayName[]>.
export function useTaskEditing(userId, displayName) {
  const [editors, setEditors] = useState(new Map())
  const channelRef = useRef(null)
  const editingRef = useRef(null)

  useEffect(() => {
    if (!userId) return

    const channel = supabase.channel('editing-tasks', {
      config: { presence: { key: userId } },
    })

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const map = new Map()
      for (const [uid, presences] of Object.entries(state)) {
        if (uid === userId) continue
        for (const p of presences) {
          if (p.taskId) {
            const editors = map.get(p.taskId) || []
            editors.push(p.displayName || uid)
            map.set(p.taskId, editors)
          }
        }
      }
      setEditors(map)
    })

    channel.subscribe((status) => {
      channelRef.current = channel
      if (status === 'SUBSCRIBED' && editingRef.current) {
        channel.track({ taskId: editingRef.current, displayName })
      }
    })

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [userId, displayName])

  const startEditing = useCallback((taskId) => {
    editingRef.current = taskId
    try { channelRef.current?.track({ taskId, displayName }) } catch {}
  }, [displayName])

  const stopEditing = useCallback(() => {
    editingRef.current = null
    try { channelRef.current?.track({ taskId: null }) } catch {}
  }, [])

  return { editors, startEditing, stopEditing }
}
