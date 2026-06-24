import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../api/supabaseClient'

const TASK_SELECT =
  '*, assignee_profile:profiles!tasks_assignee_fkey(display_name, avatar_url)'

export const STATUSES = ['todo', 'doing', 'done']

export function positionBetween(above, below) {
  if (above != null && below != null) return (above + below) / 2
  if (above != null) return above + 1024
  if (below != null) return below - 1024
  return 1024
}

function insertTask(tasks, task) {
  for (let i = 0; i < tasks.length; i++) {
    if (task.position < tasks[i].position) {
      return [...tasks.slice(0, i), task, ...tasks.slice(i)]
    }
  }
  return [...tasks, task]
}

export function useBoard(projectId = 'all') {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const maxPositions = useRef({ todo: 0, doing: 0, done: 0 })

  const matchesScope = useCallback(
    (task) => {
      if (projectId === 'all') return true
      if (projectId === null) return task.project_id == null
      return task.project_id === projectId
    },
    [projectId],
  )

  // Skip enrichment queries when the task set hasn't changed
  const lastTaskIdsRef = useRef([])

  function enrichTasksData(tasksArray) {
    if (!tasksArray || tasksArray.length === 0) return tasksArray
    const ids = tasksArray.map((t) => t.id)
    const prev = lastTaskIdsRef.current
    if (ids.length === prev.length && ids.every((id, i) => id === prev[i])) {
      return tasksArray
    }
    lastTaskIdsRef.current = ids

    Promise.all([
      supabase.from('task_labels').select('task_id, label_id, label:labels(*)').in('task_id', ids),
      supabase.from('task_dependencies').select('task_id, depends_on_id').in('task_id', ids),
    ]).then(([labelsRes, depsRes]) => {
      const labelMap = {}
      ;(labelsRes.data || []).forEach((tl) => {
        if (!labelMap[tl.task_id]) labelMap[tl.task_id] = []
        labelMap[tl.task_id].push(tl.label)
      })
      const depCountMap = {}
      ;(depsRes.data || []).forEach((td) => {
        depCountMap[td.task_id] = (depCountMap[td.task_id] || 0) + 1
      })
      setTasks((prev) =>
        prev.map((t) => ({
          ...t,
          labels: labelMap[t.id] || [],
          blocked_by: depCountMap[t.id] || 0,
        })),
      )
    }).catch(() => {})
    return tasksArray
  }

  const refetch = useCallback(() => {
    setLoading(true)
    let query = supabase.from('tasks').select(TASK_SELECT)
    if (projectId === null) query = query.is('project_id', null)
    else if (projectId !== 'all') query = query.eq('project_id', projectId)
    query
      .order('position', { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else {
          const ids = data.map((t) => t.id)
          lastTaskIdsRef.current = ids
          setTasks(data)
          // Batch enrich: labels and dependency counts
          Promise.all([
            supabase.from('task_labels').select('task_id, label_id, label:labels(*)').in('task_id', ids),
            supabase.from('task_dependencies').select('task_id, depends_on_id').in('task_id', ids),
          ]).then(([labelsRes, depsRes]) => {
            if (!labelsRes.data && !depsRes.data) return
            const labelMap = {}
            ;(labelsRes.data || []).forEach((tl) => {
              if (!labelMap[tl.task_id]) labelMap[tl.task_id] = []
              labelMap[tl.task_id].push(tl.label)
            })
            const depCountMap = {}
            ;(depsRes.data || []).forEach((td) => {
              depCountMap[td.task_id] = (depCountMap[td.task_id] || 0) + 1
            })
            setTasks((prev) =>
              prev.map((t) => ({
                ...t,
                labels: labelMap[t.id] || [],
                blocked_by: depCountMap[t.id] || 0,
              })),
            )
          }).catch(() => {})
          for (const s of STATUSES) {
            const col = data.filter((t) => t.status === s)
            maxPositions.current[s] = col.length ? col[col.length - 1].position : 0
          }
        }
        setLoading(false)
      })
  }, [projectId])

  useEffect(() => {
    refetch()
    const pending = []
    let rafId = null

    function flush() {
      rafId = null
      if (pending.length === 0) return
      const batch = pending.splice(0)
      const latest = new Map()
      for (const p of batch) {
        const id = p.eventType === 'DELETE' ? p.old.id : p.new.id
        latest.set(id, p)
      }
      for (const [, p] of latest) {
        if (p.eventType === 'DELETE') {
          setTasks((prev) => prev.filter((t) => t.id !== p.old.id))
          continue
        }
        const taskProjectId = p.new.project_id ?? null
        const inScope =
          projectId === 'all' ? true
          : projectId === null ? taskProjectId == null
          : taskProjectId === projectId
        if (!inScope) {
          setTasks((prev) => prev.filter((t) => t.id !== p.new.id))
          continue
        }
        supabase
          .from('tasks')
          .select(TASK_SELECT)
          .eq('id', p.new.id)
          .single()
          .then(({ data }) => {
            if (!data) return
            setTasks((prev) => {
              const rest = prev.filter((t) => t.id !== data.id)
              if (!matchesScope(data)) return rest
              return insertTask(rest, data)
            })
            if (p.eventType === 'INSERT') {
              const s = data.status
              if (data.position > maxPositions.current[s]) {
                maxPositions.current[s] = data.position
              }
            }
          })
      }
    }

    const channel = supabase
      .channel('board')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          pending.push(payload)
          if (!rafId) rafId = requestAnimationFrame(flush)
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [refetch, matchesScope, projectId])

  const logActivity = useCallback(async (action, targetType, targetId, metadata) => {
    try {
      await supabase.rpc('log_activity', { p_action: action, p_target_type: targetType, p_target_id: targetId, p_metadata: metadata || {} })
    } catch {}
  }, [])

  const createTask = useCallback(
    async ({ title, description, due_date, status = 'todo', priority = null, assignee = null, project_id = null }) => {
      const { data: { user } } = await supabase.auth.getUser()
      const position = maxPositions.current[status] + 1024
      const { data, error } = await supabase.from('tasks').insert({
        title,
        description,
        due_date: due_date || null,
        status,
        priority,
        position,
        created_by: user.id,
        assignee: assignee || null,
        project_id: project_id || null,
      }).select('id').single()
      if (error) throw error
      if (data) logActivity('task_created', 'tasks', data.id, { title, status, priority, project_id })
      return data?.id
    },
    [logActivity],
  )

  const updateTask = useCallback(async (id, fields) => {
    setTasks((prev) => {
      const needsSort = 'position' in fields || 'status' in fields
      const next = prev.map((t) => (t.id === id ? { ...t, ...fields } : t))
      return needsSort ? next.sort((a, b) => a.position - b.position) : next
    })
    const { error } = await supabase.from('tasks').update(fields).eq('id', id)
    if (error) throw error
    logActivity('task_updated', 'tasks', id, fields)
  }, [logActivity])

  const deleteTask = useCallback(async (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
    logActivity('task_deleted', 'tasks', id, {})
  }, [logActivity])

  const addLabel = useCallback(async (taskId, labelId) => {
    const { error } = await supabase.from('task_labels').insert({ task_id: taskId, label_id: labelId })
    if (error) throw error
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t
        const newLabel = { id: labelId }
        return { ...t, labels: [...(t.labels || []), newLabel] }
      }),
    )
  }, [])

  const removeLabel = useCallback(async (taskId, labelId) => {
    const { error } = await supabase.from('task_labels').delete().match({ task_id: taskId, label_id: labelId })
    if (error) throw error
    setTasks((prev) =>
      prev.map((t) => (t.id !== taskId ? t : { ...t, labels: (t.labels || []).filter((l) => l.id !== labelId) })),
    )
  }, [])

  const addDependency = useCallback(async (taskId, dependsOnId) => {
    const { error } = await supabase.rpc('add_task_dependency', {
      p_task_id: taskId,
      p_depends_on_id: dependsOnId,
    })
    if (error) throw error
    setTasks((prev) =>
      prev.map((t) => (t.id !== taskId ? t : { ...t, blocked_by: (t.blocked_by || 0) + 1 })),
    )
  }, [])

  const removeDependency = useCallback(async (taskId, dependsOnId) => {
    const { error } = await supabase
      .from('task_dependencies')
      .delete()
      .match({ task_id: taskId, depends_on_id: dependsOnId })
    if (error) throw error
    setTasks((prev) =>
      prev.map((t) =>
        t.id !== taskId ? t : { ...t, blocked_by: Math.max(0, (t.blocked_by || 0) - 1) },
      ),
    )
  }, [])

  return { tasks, loading, error, createTask, updateTask, deleteTask, addLabel, removeLabel, addDependency, removeDependency }
}
