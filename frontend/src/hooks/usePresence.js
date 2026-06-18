import { useEffect, useState } from 'react'
import { supabase } from '../api/supabaseClient'

// Tracks who currently has the app open via Supabase Realtime Presence.
// Returns a Set of online user ids (the presence key is the user's id).
export function usePresence(session, profile) {
  const [online, setOnline] = useState(() => new Set())

  const userId = session?.user?.id
  const name = profile?.display_name

  useEffect(() => {
    if (!userId) return
    const channel = supabase.channel('online-users', {
      config: { presence: { key: userId } },
    })

    channel.on('presence', { event: 'sync' }, () => {
      setOnline(new Set(Object.keys(channel.presenceState())))
    })

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.track({ name, online_at: new Date().toISOString() })
      }
    })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, name])

  return online
}
