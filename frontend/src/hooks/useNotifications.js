import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../api/supabaseClient'

// Loads the signed-in user's notifications (RLS scopes rows to them) and keeps
// them live. The notifications table, its RLS, and the due/assignment triggers
// already exist in the backend — this just surfaces them.
export function useNotifications(userId) {
  const [items, setItems] = useState([])

  const refetch = useCallback(() => {
    if (!userId) return
    supabase
      .from('notifications')
      .select('id, type, message, task_id, read, created_at')
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => { if (data) setItems(data) })
  }, [userId])

  useEffect(() => {
    if (!userId) return
    refetch()
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        () => refetch(),
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId, refetch])

  const unreadCount = items.reduce((n, x) => n + (x.read ? 0 : 1), 0)

  const markRead = useCallback(async (id) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, read: true } : x)))
    await supabase.from('notifications').update({ read: true }).eq('id', id)
  }, [])

  const markAllRead = useCallback(async () => {
    if (!userId) return
    setItems((prev) => prev.map((x) => ({ ...x, read: true })))
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
  }, [userId])

  return { items, unreadCount, markRead, markAllRead, refetch }
}
