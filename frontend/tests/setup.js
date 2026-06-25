import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})

// In-memory localStorage / sessionStorage so tests that import i18n.js
// (which calls localStorage.getItem at module init) don't crash.
function makeFakeStorage() {
  let store = {}
  return {
    getItem: (k) => Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null,
    setItem: (k, v) => { store[k] = String(v) },
    removeItem: (k) => { delete store[k] },
    clear: () => { store = {} },
    key: (i) => Object.keys(store)[i] ?? null,
    get length() { return Object.keys(store).length },
  }
}
Object.defineProperty(window, 'localStorage', { value: makeFakeStorage(), writable: true })
Object.defineProperty(window, 'sessionStorage', { value: makeFakeStorage(), writable: true })

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
})
