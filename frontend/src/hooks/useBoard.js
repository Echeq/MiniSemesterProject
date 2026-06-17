import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../api/supabaseClient'

const TASK_SELECT =
  '*, assignee_id:assignee, assignee:profiles!tasks_assignee_fkey(display_name, avatar_url)'

export const STATUSES = ['todo', 'doing', 'done']

export function positionBetween(above, below) {
  if (above != null && below != null) return (above + below) / 2
  if (above != null) return above + 1024
  if (below != null) return below - 1024
  return 1024
}

export function useBoard() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(() => {
    supabase
      .from('tasks')
      .select(TASK_SELECT)
      .order('position', { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setTasks(data)
        setLoading(false)
      })
  }, [])

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
                return [...rest, data].sort((a, b) => a.position - b.position)
              })
            })
        },
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [refetch])

  const createTask = useCallback(
    async ({ title, description, due_date, status = 'todo', assignee }) => {
      const { data: { user } } = await supabase.auth.getUser()
      const inColumn = tasks.filter((t) => t.status === status)
      const maxPosition = inColumn.length
        ? Math.max(...inColumn.map((t) => t.position))
        : 0
      const payload = {
        title,
        description,
        due_date: due_date || null,
        status,
        position: maxPosition + 1024,
        created_by: user.id,
      }
      if (assignee) payload.assignee = assignee
      const { error } = await supabase.from('tasks').insert(payload)
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
