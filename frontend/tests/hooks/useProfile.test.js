import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { createMockSupabase, createMockBuilder } from '../mockSupabase'

const mockSupabase = createMockSupabase()

vi.mock('../../src/api/supabaseClient', () => ({ supabase: mockSupabase }))

const fakeProfile = {
  id: 'uid',
  display_name: 'Alice',
  role: 'admin',
  avatar_url: null,
  email: 'alice@test.com',
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
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
  })

  it('does not fetch when session is null', async () => {
    const builder = createMockBuilder({ data: null, error: null })
    mockSupabase.from.mockReturnValue(builder)
    const { useProfile } = await import('../../src/hooks/useProfile')
    const { result } = renderHook(() => useProfile(null))
    expect(result.current.loading).toBe(true)
    expect(result.current.profile).toBeNull()
  })

  it('updateProfile updates profile and user metadata', async () => {
    const builder = createMockBuilder({ data: fakeProfile, error: null })
    mockSupabase.from.mockReturnValue(builder)
    const { useProfile } = await import('../../src/hooks/useProfile')
    const { result } = renderHook(() => useProfile(fakeSession))
    await waitFor(() => expect(result.current.loading).toBe(false))
    const updateBuilder = { ...createMockBuilder({ data: null, error: null }), eq: vi.fn(() => createMockBuilder({ data: null, error: null })) }
    mockSupabase.from.mockReturnValue(updateBuilder)
    await act(async () => {
      await result.current.updateProfile({ display_name: 'Bob' })
    })
    expect(result.current.profile.display_name).toBe('Bob')
    expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
      data: { display_name: 'Bob' },
    })
  })

  it('uploadAvatar uploads to storage and updates profile', async () => {
    const builder = createMockBuilder({ data: fakeProfile, error: null })
    mockSupabase.from.mockReturnValue(builder)
    const storageBuilder = {
      upload: vi.fn().mockResolvedValue({ error: null }),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/avatar.jpg' } })),
    }
    mockSupabase.storage.from.mockReturnValue(storageBuilder)
    const { useProfile } = await import('../../src/hooks/useProfile')
    const { result } = renderHook(() => useProfile(fakeSession))
    await waitFor(() => expect(result.current.loading).toBe(false))
    const file = new File([''], 'avatar.png', { type: 'image/png' })
    Object.defineProperty(file, 'size', { value: 1024 })
    const updateBuilder = { ...createMockBuilder({ data: null, error: null }), eq: vi.fn(() => createMockBuilder({ data: null, error: null })) }
    mockSupabase.from.mockReturnValue(updateBuilder)
    await act(async () => { await result.current.uploadAvatar(file) })
    expect(mockSupabase.storage.from).toHaveBeenCalledWith('avatars')
    expect(storageBuilder.upload).toHaveBeenCalled()
  })

  it('uploadAvatar rejects files over 2MB', async () => {
    const builder = createMockBuilder({ data: fakeProfile, error: null })
    mockSupabase.from.mockReturnValue(builder)
    const { useProfile } = await import('../../src/hooks/useProfile')
    const { result } = renderHook(() => useProfile(fakeSession))
    await waitFor(() => expect(result.current.loading).toBe(false))
    const bigFile = new File([''], 'big.png', { type: 'image/png' })
    Object.defineProperty(bigFile, 'size', { value: 3 * 1024 * 1024 })
    await expect(result.current.uploadAvatar(bigFile)).rejects.toThrow('2MB or less')
  })

  it('changePassword re-authenticates then updates', async () => {
    const builder = createMockBuilder({ data: fakeProfile, error: null })
    mockSupabase.from.mockReturnValue(builder)
    const { useProfile } = await import('../../src/hooks/useProfile')
    const { result } = renderHook(() => useProfile(fakeSession))
    await waitFor(() => expect(result.current.loading).toBe(false))
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: {}, error: null })
    mockSupabase.auth.updateUser.mockResolvedValue({ data: {}, error: null })
    await act(async () => {
      await result.current.changePassword('oldPass', 'newPass')
    })
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'alice@test.com',
      password: 'oldPass',
    })
    expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({ password: 'newPass' })
  })

  it('updateEmail re-authenticates then updates', async () => {
    const builder = createMockBuilder({ data: fakeProfile, error: null })
    mockSupabase.from.mockReturnValue(builder)
    const { useProfile } = await import('../../src/hooks/useProfile')
    const { result } = renderHook(() => useProfile(fakeSession))
    await waitFor(() => expect(result.current.loading).toBe(false))
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: {}, error: null })
    mockSupabase.auth.updateUser.mockResolvedValue({ data: {}, error: null })
    await act(async () => {
      await result.current.updateEmail('new@test.com', 'pass')
    })
    expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({ email: 'new@test.com' })
  })

  it('deleteAccount re-authenticates, calls rpc, and signs out', async () => {
    const builder = createMockBuilder({ data: fakeProfile, error: null })
    mockSupabase.from.mockReturnValue(builder)
    const { useProfile } = await import('../../src/hooks/useProfile')
    const { result } = renderHook(() => useProfile(fakeSession))
    await waitFor(() => expect(result.current.loading).toBe(false))
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: {}, error: null })
    mockSupabase.rpc.mockResolvedValue({ error: null })
    await act(async () => {
      await result.current.deleteAccount('pass')
    })
    expect(mockSupabase.rpc).toHaveBeenCalledWith('delete_account')
    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
  })
})
