import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

let listenerFn = null
const addListener = vi.fn((_, fn) => { listenerFn = fn })
const removeListener = vi.fn()

function setMatchMedia(matches) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: addListener,
    removeEventListener: removeListener,
    dispatchEvent: vi.fn(),
  }))
}

describe('useIsMobile', () => {
  beforeEach(() => {
    listenerFn = null
    addListener.mockClear()
    removeListener.mockClear()
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('returns false on desktop', async () => {
    setMatchMedia(false)
    const { useIsMobile } = await import('../src/hooks/useIsMobile')
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('returns true on mobile', async () => {
    setMatchMedia(true)
    const { useIsMobile } = await import('../src/hooks/useIsMobile')
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('adds change listener on mount', async () => {
    setMatchMedia(false)
    const { useIsMobile } = await import('../src/hooks/useIsMobile')
    renderHook(() => useIsMobile())
    expect(addListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('removes listener on unmount', async () => {
    setMatchMedia(false)
    const { useIsMobile } = await import('../src/hooks/useIsMobile')
    const { unmount } = renderHook(() => useIsMobile())
    unmount()
    expect(removeListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('updates value when match changes', async () => {
    setMatchMedia(true)
    const { useIsMobile } = await import('../src/hooks/useIsMobile')
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)

    act(() => { listenerFn({ matches: false }) })
    expect(result.current).toBe(false)
  })
})
