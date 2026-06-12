import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../api/supabaseClient'

export function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (!error) setProfile(data)
        setLoading(false)
      })
  }, [userId])

  const updateProfile = useCallback(
    async (fields) => {
      const { error } = await supabase
        .from('profiles')
        .update(fields)
        .eq('id', userId)
      if (error) throw error
      setProfile((prev) => ({ ...prev, ...fields }))
    },
    [userId],
  )

  return { profile, loading, updateProfile }
}
