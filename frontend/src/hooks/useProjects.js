import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../api/supabaseClient'

// Lists projects (any signed-in user can read/create) and exposes admin-only
// archive/delete via the set_project_status RPC and a plain delete.
export function useProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) setError(error.message)
    else setProjects(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const createProject = useCallback(async ({ name, description = '', color, icon }) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('projects')
      .insert({ name, description, color, icon, created_by: user.id })
    if (error) throw error
    await refetch()
  }, [refetch])

  const updateProject = useCallback(async (id, fields) => {
    const { error } = await supabase
      .from('projects')
      .update(fields)
      .eq('id', id)
    if (error) throw error
    await refetch()
  }, [refetch])

  const setStatus = useCallback(async (id, status) => {
    const { error } = await supabase.rpc('set_project_status', {
      target_project: id,
      new_status: status,
    })
    if (error) throw error
    await refetch()
  }, [refetch])

  const deleteProject = useCallback(async (id) => {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw error
    await refetch()
  }, [refetch])

  return { projects, loading, error, refetch, createProject, updateProject, setStatus, deleteProject }
}
