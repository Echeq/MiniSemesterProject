import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { createMockSupabase } from '../mockSupabase'

const mockSupabase = createMockSupabase()
vi.mock('../../src/api/supabaseClient', () => ({ supabase: mockSupabase }))

const fakeProjects = [
  { id: 'p1', name: 'Project A', status: 'active', color: '#6366f1', icon: 'project' },
  { id: 'p2', name: 'Project B', status: 'archived', color: '#10b981', icon: 'globe' },
]

function mockProjectsBuilder() {
  return {
    data: fakeProjects, error: null,
    select: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: fakeProjects, error: null })) })),
    insert: vi.fn(() => Promise.resolve({ error: null })),
    update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
    delete: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
    eq: vi.fn(() => Promise.resolve({ error: null })),
  }
}

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'me' } }, error: null })
  })

  it('fetches projects on mount', async () => {
    mockSupabase.from.mockReturnValue(mockProjectsBuilder())
    const { useProjects } = await import('../../src/hooks/useProjects')
    const { result } = renderHook(() => useProjects())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.projects).toHaveLength(2)
    expect(mockSupabase.from).toHaveBeenCalledWith('projects')
  })

  it('exposes project CRUD functions', async () => {
    mockSupabase.from.mockReturnValue(mockProjectsBuilder())
    const { useProjects } = await import('../../src/hooks/useProjects')
    const { result } = renderHook(() => useProjects())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(typeof result.current.createProject).toBe('function')
    expect(typeof result.current.updateProject).toBe('function')
    expect(typeof result.current.setStatus).toBe('function')
    expect(typeof result.current.deleteProject).toBe('function')
  })

  it('creates a project', async () => {
    mockSupabase.from.mockReturnValue(mockProjectsBuilder())
    const { useProjects } = await import('../../src/hooks/useProjects')
    const { result } = renderHook(() => useProjects())
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => {
      await result.current.createProject({ name: 'New Project', color: '#f00', icon: 'star' })
    })
    expect(mockSupabase.from).toHaveBeenCalledWith('projects')
  })
})
