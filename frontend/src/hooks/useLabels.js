import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../api/supabaseClient'

export function useLabels(projectId) {
  const [labels, setLabels] = useState([])
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('labels').select('*')
    if (projectId) query = query.eq('project_id', projectId)
    else query = query.is('project_id', null)
    const { data } = await query.order('created_at', { ascending: true })
    setLabels(data ?? [])
    setLoading(false)
  }, [projectId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { labels, loading, refetch }
}
