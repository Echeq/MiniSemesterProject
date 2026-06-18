import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../api/supabaseClient'

// All profiles are readable by any signed-in user; used both for the assignee
// picker and the admin member-management panel.
export function useMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, role, created_at')
      .order('created_at', { ascending: true })
    setMembers(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const setRole = useCallback(async (userId, role) => {
    const { error } = await supabase.rpc('admin_set_role', {
      target_user: userId,
      new_role: role,
    })
    if (error) throw error
    await refetch()
  }, [refetch])

  return { members, loading, refetch, setRole }
}
