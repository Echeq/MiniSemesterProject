import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../api/supabaseClient'

// Admin-only invitations (RLS enforces this server-side).
export function useInvitations() {
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    const { data } = await supabase
      .from('invitations')
      .select('*')
      .order('created_at', { ascending: false })
    setInvitations(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const invite = useCallback(async ({ email, role = 'member' }) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('invitations')
      .insert({ email, role, invited_by: user.id })
    if (error) throw error
    await refetch()
  }, [refetch])

  const revoke = useCallback(async (id) => {
    const { error } = await supabase
      .from('invitations')
      .update({ status: 'revoked' })
      .eq('id', id)
    if (error) throw error
    await refetch()
  }, [refetch])

  return { invitations, loading, refetch, invite, revoke }
}
