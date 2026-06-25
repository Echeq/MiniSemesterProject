import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockSupabase = { auth: { signOut: vi.fn().mockResolvedValue({ error: null }) } }
vi.mock('../../src/api/supabaseClient', () => ({ supabase: mockSupabase }))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => ({ 'profile.accountSettings': 'Account settings', 'profile.adminPanel': 'Admin panel', 'auth.signOut': 'Sign out', 'lang.switcher': 'Language' }[key] || key), i18n: { language: 'en', changeLanguage: vi.fn() } }),
}))

vi.mock('../../src/i18n', () => ({
  default: { language: 'en', changeLanguage: vi.fn() },
  changeLanguage: vi.fn(),
}))

describe('ProfileMenu', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders avatar with initial', async () => {
    const ProfileMenu = (await import('../../src/components/ProfileMenu')).default
    render(<ProfileMenu profile={{ display_name: 'Alice' }} email="alice@test.com" isAdmin={false} onOpenAccount={vi.fn()} onOpenAdmin={vi.fn()} />)
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('opens menu on avatar click', async () => {
    const ProfileMenu = (await import('../../src/components/ProfileMenu')).default
    render(<ProfileMenu profile={{ display_name: 'Alice' }} email="alice@test.com" isAdmin={false} onOpenAccount={vi.fn()} onOpenAdmin={vi.fn()} />)
    await userEvent.click(screen.getByText('A'))
    expect(screen.getByText('Account settings')).toBeInTheDocument()
  })

  it('calls onOpenAccount when clicking Account settings', async () => {
    const onOpenAccount = vi.fn()
    const ProfileMenu = (await import('../../src/components/ProfileMenu')).default
    render(<ProfileMenu profile={{ display_name: 'Alice' }} email="alice@test.com" isAdmin={false} onOpenAccount={onOpenAccount} onOpenAdmin={vi.fn()} />)
    await userEvent.click(screen.getByText('A'))
    await userEvent.click(screen.getByText('Account settings'))
    expect(onOpenAccount).toHaveBeenCalled()
  })

  it('shows Admin panel button for admins', async () => {
    const ProfileMenu = (await import('../../src/components/ProfileMenu')).default
    render(<ProfileMenu profile={{ display_name: 'Alice' }} email="alice@test.com" isAdmin={true} onOpenAccount={vi.fn()} onOpenAdmin={vi.fn()} />)
    await userEvent.click(screen.getByText('A'))
    expect(screen.getByText('Admin panel')).toBeInTheDocument()
  })

  it('calls signOut on Sign out click', async () => {
    const ProfileMenu = (await import('../../src/components/ProfileMenu')).default
    render(<ProfileMenu profile={{ display_name: 'Alice' }} email="alice@test.com" isAdmin={false} onOpenAccount={vi.fn()} onOpenAdmin={vi.fn()} />)
    await userEvent.click(screen.getByText('A'))
    await userEvent.click(screen.getByText('Sign out'))
    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
  })
})
