import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../api/supabaseClient'

// Lightweight, board-wide task rows (every project + shared) used to power the
// sidebar's smart-view counts and per-project progress bars. Kept tiny (a few
// columns) and refetched on any realtime change so the sidebar stays live.
export function useTaskStats() {
  const [rows, setRows] = useState([])

  const refetch = useCallback(() => {
    supabase
      .from('tasks')
      .select('id, status, project_id, assignee, due_date')
      .then(({ data }) => {
        if (data) setRows(data)
      })
  }, [])

  useEffect(() => {
    refetch()
    const channel = supabase
      .channel('task-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => refetch())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [refetch])

  return rows
}
