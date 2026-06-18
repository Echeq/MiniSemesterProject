import { describe, it, expect, beforeEach, vi } from 'vitest'

beforeEach(() => {
  localStorage.clear()
  vi.resetModules()
})

describe('i18n initialization', () => {
  it('defaults to English when no language is saved', async () => {
    const i18n = (await import('../src/i18n')).default
    expect(i18n.language).toBe('en')
  })

  it('loads saved language from localStorage', async () => {
    localStorage.setItem('lang', 'es')
    const i18n = (await import('../src/i18n')).default
    expect(i18n.language).toBe('es')
  })

  it('falls back to English for unsupported language', async () => {
    localStorage.setItem('lang', 'fr')
    const i18n = (await import('../src/i18n')).default
    expect(i18n.resolvedLanguage).toBe('en')
    expect(localStorage.getItem('lang')).toBeNull()
  })

  it('has all four locales loaded', async () => {
    const i18n = (await import('../src/i18n')).default
    expect(i18n.options.resources).toHaveProperty('en')
    expect(i18n.options.resources).toHaveProperty('es')
    expect(i18n.options.resources).toHaveProperty('zh')
    expect(i18n.options.resources).toHaveProperty('id')
  })

  it('has fallbackLng set to en', async () => {
    const i18n = (await import('../src/i18n')).default
    expect(i18n.options.fallbackLng).toEqual(['en'])
  })
})
