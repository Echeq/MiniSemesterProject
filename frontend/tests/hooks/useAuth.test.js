import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { createMockSupabase } from '../mockSupabase'

const mockSupabase = createMockSupabase()

vi.mock('../../src/api/supabaseClient', () => ({ supabase: mockSupabase }))

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts with loading=true and session=null', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    const { useAuth } = await import('../../src/hooks/useAuth')
    const { result } = renderHook(() => useAuth())
    expect(result.current.loading).toBe(true)
    expect(result.current.session).toBeNull()
  })

  it('sets session from getSession', async () => {
    const fakeSession = { user: { id: 'u1', email: 'a@b.com' }, access_token: 'tok' }
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null })
    const { useAuth } = await import('../../src/hooks/useAuth')
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.session).toEqual(fakeSession)
  })

  it('subscribes to onAuthStateChange', async () => {
    const { useAuth } = await import('../../src/hooks/useAuth')
    renderHook(() => useAuth())
    expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalledTimes(1)
  })

  it('unsubscribes on unmount', async () => {
    const sub = { subscription: { unsubscribe: vi.fn() } }
    mockSupabase.auth.onAuthStateChange.mockReturnValue({ data: sub })
    const { useAuth } = await import('../../src/hooks/useAuth')
    const { unmount } = renderHook(() => useAuth())
    unmount()
    expect(sub.subscription.unsubscribe).toHaveBeenCalledTimes(1)
  })

  it('updates session on auth state change', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    let changeHandler
    mockSupabase.auth.onAuthStateChange.mockImplementation((handler) => {
      changeHandler = handler
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })
    const { useAuth } = await import('../../src/hooks/useAuth')
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const newSession = { user: { id: 'u2' } }
    act(() => { changeHandler('SIGNED_IN', newSession) })
    expect(result.current.session).toEqual(newSession)
  })
})
