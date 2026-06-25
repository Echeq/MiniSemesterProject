import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockSupabase = { auth: { signOut: vi.fn().mockResolvedValue({ error: null }) } }
vi.mock('../../src/api/supabaseClient', () => ({ supabase: mockSupabase }))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => ({ 'auth.signOut': 'Sign out', 'auth.signIn': 'Sign in' }[key] || key), i18n: { language: 'en', changeLanguage: vi.fn() } }),
}))

vi.mock('../../src/i18n', () => ({
  default: { language: 'en', changeLanguage: vi.fn() },
  changeLanguage: vi.fn(),
}))

describe('ProfileMenu', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders avatar button', async () => {
    const ProfileMenu = (await import('../../src/components/ProfileMenu')).default
    render(<ProfileMenu profile={{ display_name: 'Alice' }} email="alice@test.com" isAdmin={false} onOpenAccount={vi.fn()} onOpenAdmin={vi.fn()} />)
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('shows menu on avatar click', async () => {
    const ProfileMenu = (await import('../../src/components/ProfileMenu')).default
    render(<ProfileMenu profile={{ display_name: 'Alice' }} email="alice@test.com" isAdmin={false} onOpenAccount={vi.fn()} onOpenAdmin={vi.fn()} />)
    await userEvent.click(screen.getByText('A'))
    expect(screen.getByText('Account settings')).toBeInTheDocument()
  })

  it('calls onOpenAccount when Account settings clicked', async () => {
    const onOpenAccount = vi.fn()
    const ProfileMenu = (await import('../../src/components/ProfileMenu')).default
    render(<ProfileMenu profile={{ display_name: 'Alice' }} email="alice@test.com" isAdmin={false} onOpenAccount={onOpenAccount} onOpenAdmin={vi.fn()} />)
    await userEvent.click(screen.getByText('A'))
    await userEvent.click(screen.getByText('Account settings'))
    expect(onOpenAccount).toHaveBeenCalled()
  })

  it('shows Admin panel button when isAdmin', async () => {
    const ProfileMenu = (await import('../../src/components/ProfileMenu')).default
    render(<ProfileMenu profile={{ display_name: 'Alice' }} email="alice@test.com" isAdmin={true} onOpenAccount={vi.fn()} onOpenAdmin={vi.fn()} />)
    await userEvent.click(screen.getByText('A'))
    expect(screen.getByText('Admin panel')).toBeInTheDocument()
  })

  it('calls signOut when Sign out clicked', async () => {
    const ProfileMenu = (await import('../../src/components/ProfileMenu')).default
    render(<ProfileMenu profile={{ display_name: 'Alice' }} email="alice@test.com" isAdmin={false} onOpenAccount={vi.fn()} onOpenAdmin={vi.fn()} />)
    await userEvent.click(screen.getByText('A'))
    await userEvent.click(screen.getByText('Sign out'))
    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
  })

  it('shows language selector with English option', async () => {
    const ProfileMenu = (await import('../../src/components/ProfileMenu')).default
    render(<ProfileMenu profile={{ display_name: 'Alice' }} email="alice@test.com" isAdmin={false} onOpenAccount={vi.fn()} onOpenAdmin={vi.fn()} />)
    await userEvent.click(screen.getByText('A'))
    expect(screen.getByText('🇬🇧 English')).toBeInTheDocument()
  })
})
