import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { createMockSupabase } from '../mockSupabase'

const mockSupabase = createMockSupabase()

vi.mock('../../src/api/supabaseClient', () => ({ supabase: mockSupabase }))

const fakeProjects = [
  { id: 'p1', name: 'Project A', status: 'active', color: '#6366f1', icon: 'project' },
  { id: 'p2', name: 'Project B', status: 'archived', color: '#10b981', icon: 'globe' },
]

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'me' } }, error: null })
  })

  it('fetches projects on mount', async () => {
    const builder = { data: fakeProjects, error: null, select: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: fakeProjects, error: null })) })) }
    mockSupabase.from.mockReturnValue(builder)
    const { useProjects } = await import('../../src/hooks/useProjects')
    const { result } = renderHook(() => useProjects())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.projects).toHaveLength(2)
  })

  it('creates a project', async () => {
    const builder = { data: fakeProjects, error: null, select: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: fakeProjects, error: null })) })), insert: vi.fn(() => Promise.resolve({ error: null })) }
    mockSupabase.from.mockReturnValue(builder)
    const { useProjects } = await import('../../src/hooks/useProjects')
    const { result } = renderHook(() => useProjects())
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => {
      await result.current.createProject({ name: 'New', color: '#f00', icon: 'star' })
    })
    expect(result.current.projects).toHaveLength(2)
  })

  it('updates a project', async () => {
    const builder = { data: fakeProjects, error: null, select: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: fakeProjects, error: null })) })), update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })) }
    mockSupabase.from.mockReturnValue(builder)
    const { useProjects } = await import('../../src/hooks/useProjects')
    const { result } = renderHook(() => useProjects())
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => {
      await result.current.updateProject('p1', { name: 'Updated' })
    })
    expect(result.current.projects).toHaveLength(2)
  })

  it('deletes a project', async () => {
    const builder = { data: fakeProjects, error: null, select: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: fakeProjects, error: null })) })), delete: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })) }
    mockSupabase.from.mockReturnValue(builder)
    const { useProjects } = await import('../../src/hooks/useProjects')
    const { result } = renderHook(() => useProjects())
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => {
      await result.current.deleteProject('p1')
    })
    expect(result.current.projects).toHaveLength(2)
  })
})
