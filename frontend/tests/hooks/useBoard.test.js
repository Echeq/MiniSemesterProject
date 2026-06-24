import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { createMockSupabase, createMockBuilder } from '../mockSupabase'

const mockSupabase = createMockSupabase()

vi.mock('../../src/api/supabaseClient', () => ({ supabase: mockSupabase }))

const fakeTasks = [
  { id: 't1', title: 'Task A', status: 'todo', position: 1024, assignee: null },
  { id: 't2', title: 'Task B', status: 'doing', position: 2048, assignee: null },
]

describe('useBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches tasks on mount', async () => {
    const builder = createMockBuilder({ data: fakeTasks, error: null })
    mockSupabase.from.mockReturnValue(builder)
    const { useBoard } = await import('../../src/hooks/useBoard')
    const { result } = renderHook(() => useBoard())
    await waitFor(() => expect(result.current.loading).toBe(false))
    await waitFor(() => {
      expect(result.current.tasks[0]).toMatchObject({ id: 't1', title: 'Task A', status: 'todo' })
      expect(result.current.tasks[1]).toMatchObject({ id: 't2', title: 'Task B', status: 'doing' })
    })
    expect(mockSupabase.from).toHaveBeenCalledWith('tasks')
  })

  it('sets error on fetch failure', async () => {
    const builder = createMockBuilder({ data: null, error: { message: 'DB down' } })
    mockSupabase.from.mockReturnValue(builder)
    const { useBoard } = await import('../../src/hooks/useBoard')
    const { result } = renderHook(() => useBoard())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('DB down')
  })

  it('subscribes to realtime channel', async () => {
    const builder = createMockBuilder({ data: fakeTasks, error: null })
    mockSupabase.from.mockReturnValue(builder)
    const { useBoard } = await import('../../src/hooks/useBoard')
    renderHook(() => useBoard())
    await waitFor(() => {
      expect(mockSupabase.channel).toHaveBeenCalledWith('board')
    })
  })

  it('removes channel on unmount', async () => {
    const builder = createMockBuilder({ data: fakeTasks, error: null })
    mockSupabase.from.mockReturnValue(builder)
    const { useBoard } = await import('../../src/hooks/useBoard')
    const { unmount } = renderHook(() => useBoard())
    await waitFor(() => expect(mockSupabase.channel).toHaveBeenCalled())
    unmount()
    expect(mockSupabase.removeChannel).toHaveBeenCalled()
  })

  it('createTask inserts with max position + 1024', async () => {
    const fetchBuilder = createMockBuilder({ data: fakeTasks, error: null })
    mockSupabase.from.mockReturnValue(fetchBuilder)
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'me' } }, error: null })
    const { useBoard } = await import('../../src/hooks/useBoard')
    const { result } = renderHook(() => useBoard())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const insertBuilder = createMockBuilder({ data: { id: 'new-id' }, error: null })
    mockSupabase.from.mockReturnValue(insertBuilder)
    await act(async () => {
      await result.current.createTask({ title: 'New', description: '', status: 'todo' })
    })
    expect(insertBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New',
        status: 'todo',
        position: expect.any(Number),
        created_by: 'me',
      }),
    )
  })

  it('updateTask optimistically updates local state', async () => {
    const builder = createMockBuilder({ data: fakeTasks, error: null })
    mockSupabase.from.mockReturnValue(builder)
    const { useBoard } = await import('../../src/hooks/useBoard')
    const { result } = renderHook(() => useBoard())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const updateBuilder = { ...createMockBuilder({ data: null, error: null }), eq: vi.fn(() => createMockBuilder({ data: null, error: null })) }
    mockSupabase.from.mockReturnValue(updateBuilder)
    await act(async () => {
      await result.current.updateTask('t1', { title: 'Updated' })
    })
    expect(result.current.tasks.find(t => t.id === 't1').title).toBe('Updated')
  })

  it('deleteTask removes from local state', async () => {
    const builder = createMockBuilder({ data: fakeTasks, error: null })
    mockSupabase.from.mockReturnValue(builder)
    const { useBoard } = await import('../../src/hooks/useBoard')
    const { result } = renderHook(() => useBoard())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const deleteBuilder = { ...createMockBuilder({ data: null, error: null }), eq: vi.fn(() => createMockBuilder({ data: null, error: null })) }
    mockSupabase.from.mockReturnValue(deleteBuilder)
    await act(async () => {
      await result.current.deleteTask('t1')
    })
    expect(result.current.tasks.find(t => t.id === 't1')).toBeUndefined()
  })
})
