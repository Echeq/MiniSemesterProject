import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../api/supabaseClient'

export function useProfile(session) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const userId = session?.user?.id

  useEffect(() => {
    if (!userId) return
    setLoading(true)
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
      if (!userId) return
      const { error } = await supabase
        .from('profiles')
        .update(fields)
        .eq('id', userId)
      if (error) throw error
      setProfile((prev) => ({ ...prev, ...fields }))
      if (fields.display_name) {
        const { error: metaError } = await supabase.auth.updateUser({
          data: { display_name: fields.display_name },
        })
        if (metaError) throw metaError
      }
    },
    [userId],
  )

  const uploadAvatar = useCallback(
    async (file) => {
      if (!userId) return
      if (file.size > 2 * 1024 * 1024) throw new Error('File must be 2MB or less')
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${userId}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)
      await updateProfile({ avatar_url: publicUrl })
      return publicUrl
    },
    [userId, updateProfile],
  )

  const changePassword = useCallback(
    async (oldPassword, newPassword) => {
      const email = session?.user?.email
      if (!email) throw new Error('No user email found')
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: oldPassword,
      })
      if (signInError) throw new Error('Current password is incorrect')
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (updateError) throw updateError
    },
    [session],
  )

  return { profile, loading, updateProfile, uploadAvatar, changePassword }
}
