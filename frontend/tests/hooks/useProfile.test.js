import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createMockSupabase, createMockBuilder } from '../mockSupabase'

const mockSupabase = createMockSupabase()

vi.mock('../../src/api/supabaseClient', () => ({ supabase: mockSupabase }))

const fakeProfile = {
  id: 'uid',
  display_name: 'Alice',
  role: 'admin',
  avatar_url: null,
}

const fakeSession = { user: { id: 'uid', email: 'alice@test.com' } }

describe('useProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches profile on mount when session exists', async () => {
    const builder = createMockBuilder({ data: fakeProfile, error: null })
    mockSupabase.from.mockReturnValue(builder)
    const { useProfile } = await import('../../src/hooks/useProfile')
    const { result } = renderHook(() => useProfile(fakeSession))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.profile).toEqual(fakeProfile)
    expect(result.current.isAdmin).toBe(true)
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
  })

  it('does not fetch when session is null', async () => {
    const builder = createMockBuilder({ data: null, error: null })
    mockSupabase.from.mockReturnValue(builder)
    const { useProfile } = await import('../../src/hooks/useProfile')
    const { result } = renderHook(() => useProfile(null))
    expect(result.current.loading).toBe(true)
    expect(result.current.profile).toBeNull()
    expect(result.current.isAdmin).toBe(false)
  })

  it('refetches profile on refetch call', async () => {
    const updatedProfile = { ...fakeProfile, display_name: 'Bob' }
    const builder = createMockBuilder({ data: fakeProfile, error: null })
    mockSupabase.from.mockReturnValue(builder)
    const { useProfile } = await import('../../src/hooks/useProfile')
    const { result } = renderHook(() => useProfile(fakeSession))
    await waitFor(() => expect(result.current.loading).toBe(false))
    const refetchBuilder = createMockBuilder({ data: updatedProfile, error: null })
    mockSupabase.from.mockReturnValue(refetchBuilder)
    await act(async () => {
      await result.current.refetch()
    })
    await waitFor(() => {
      expect(result.current.profile).toEqual(updatedProfile)
    })
  })
})
