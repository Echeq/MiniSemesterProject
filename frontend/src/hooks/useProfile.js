import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../api/supabaseClient'

// Loads the signed-in user's own profile row (display name, avatar, role).
export function useProfile(session) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    const userId = session?.user?.id
    if (!userId) return
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, role')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }, [session?.user?.id])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { profile, loading, refetch, isAdmin: profile?.role === 'admin' }
}
