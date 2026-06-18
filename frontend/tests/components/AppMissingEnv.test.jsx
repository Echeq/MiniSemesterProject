import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('../../src/api/supabaseClient', () => ({ supabase: null }))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}))

describe('App — Missing env vars', () => {
  it('renders setup hint when supabase is null', async () => {
    const App = (await import('../../src/App')).default
    const { container } = render(<App />)
    expect(container.textContent).toContain('VITE_SUPABASE_URL')
  })
})
