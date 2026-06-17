import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../api/supabaseClient'

// `*` keeps the raw `assignee` uuid column (used for the "My tasks" filter);
// the joined profile is aliased separately so it doesn't shadow that column.
const TASK_SELECT =
  '*, assignee_profile:profiles!tasks_assignee_fkey(display_name, avatar_url)'

export const STATUSES = ['todo', 'doing', 'done']

export function positionBetween(above, below) {
  if (above != null && below != null) return (above + below) / 2
  if (above != null) return above + 1024
  if (below != null) return below - 1024
  return 1024
}

// projectId: a project's id to scope the board to it, or null for the shared
// board (tasks with no project_id), or 'all' to show every task.
export function useBoard(projectId = 'all') {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const matchesScope = useCallback(
    (task) => {
      if (projectId === 'all') return true
      if (projectId === null) return task.project_id == null
      return task.project_id === projectId
    },
    [projectId],
  )

  const refetch = useCallback(() => {
    setLoading(true)
    let query = supabase.from('tasks').select(TASK_SELECT)
    if (projectId === null) query = query.is('project_id', null)
    else if (projectId !== 'all') query = query.eq('project_id', projectId)
    query
      .order('position', { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setTasks(data)
        setLoading(false)
      })
  }, [projectId])

  useEffect(() => {
    refetch()
    const channel = supabase
      .channel('board')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id))
            return
          }
          // INSERT/UPDATE payloads lack the joined assignee profile, so
          // refetch the single row with the join before merging it in.
          supabase
            .from('tasks')
            .select(TASK_SELECT)
            .eq('id', payload.new.id)
            .single()
            .then(({ data }) => {
              if (!data) return
              setTasks((prev) => {
                const rest = prev.filter((t) => t.id !== data.id)
                // Respect the active project scope so cards don't leak across
                // boards when their project_id changes via realtime.
                if (!matchesScope(data)) return rest
                return [...rest, data].sort((a, b) => a.position - b.position)
              })
            })
        },
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [refetch, matchesScope])

  const createTask = useCallback(
    async ({ title, description, due_date, status = 'todo', assignee = null, project_id = null }) => {
      const { data: { user } } = await supabase.auth.getUser()
      const inColumn = tasks.filter((t) => t.status === status)
      const maxPosition = inColumn.length
        ? Math.max(...inColumn.map((t) => t.position))
        : 0
      const { error } = await supabase.from('tasks').insert({
        title,
        description,
        due_date: due_date || null,
        status,
        position: maxPosition + 1024,
        created_by: user.id,
        assignee: assignee || null,
        project_id: project_id || null,
      })
      if (error) throw error
    },
    [tasks],
  )

  const updateTask = useCallback(async (id, fields) => {
    setTasks((prev) =>
      prev
        .map((t) => (t.id === id ? { ...t, ...fields } : t))
        .sort((a, b) => a.position - b.position),
    )
    const { error } = await supabase.from('tasks').update(fields).eq('id', id)
    if (error) throw error
  }, [])

  const deleteTask = useCallback(async (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
  }, [])

  return { tasks, loading, error, createTask, updateTask, deleteTask }
}
