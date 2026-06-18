import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMockSupabase } from '../mockSupabase'

const mockSupabase = createMockSupabase()

vi.mock('../../src/api/supabaseClient', () => ({ supabase: mockSupabase }))

const mockChangeLanguage = vi.fn()
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}))

vi.mock('../../src/i18n', () => ({
  default: { language: 'en', changeLanguage: vi.fn() },
}))

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders display name and role for admin', async () => {
    const Header = (await import('../../src/components/Header')).default
    render(<Header displayName="Alice" role="admin" onNewTask={vi.fn()} onInvite={vi.fn()} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('header.newTask')).toBeInTheDocument()
    expect(screen.getByText('header.invite')).toBeInTheDocument()
  })

  it('shows member label for member role', async () => {
    const Header = (await import('../../src/components/Header')).default
    render(<Header displayName="Bob" role="member" onNewTask={vi.fn()} onInvite={vi.fn()} />)
    expect(screen.getByText('header.member')).toBeInTheDocument()
  })

  it('shows guest label for unknown role', async () => {
    const Header = (await import('../../src/components/Header')).default
    render(<Header displayName="Charlie" role="unknown" onNewTask={vi.fn()} onInvite={vi.fn()} />)
    expect(screen.getByText('header.guest')).toBeInTheDocument()
  })

  it('calls onNewTask when new task button clicked', async () => {
    const onNewTask = vi.fn()
    const Header = (await import('../../src/components/Header')).default
    render(<Header displayName="Alice" role="admin" onNewTask={onNewTask} onInvite={vi.fn()} />)
    await userEvent.click(screen.getByText('header.newTask'))
    expect(onNewTask).toHaveBeenCalledTimes(1)
  })

  it('calls onInvite when invite button clicked', async () => {
    const onInvite = vi.fn()
    const Header = (await import('../../src/components/Header')).default
    render(<Header displayName="Alice" role="admin" onNewTask={vi.fn()} onInvite={onInvite} />)
    await userEvent.click(screen.getByText('header.invite'))
    expect(onInvite).toHaveBeenCalledTimes(1)
  })

  it('calls supabase.auth.signOut on sign out click', async () => {
    const Header = (await import('../../src/components/Header')).default
    render(<Header displayName="Alice" role="admin" onNewTask={vi.fn()} onInvite={vi.fn()} />)
    await userEvent.click(screen.getByText('auth.signOut'))
    expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1)
  })

  it('does not show invite/new task for non-admin', async () => {
    const Header = (await import('../../src/components/Header')).default
    render(<Header displayName="Bob" role="member" onNewTask={vi.fn()} onInvite={vi.fn()} />)
    expect(screen.queryByText('header.newTask')).not.toBeInTheDocument()
    expect(screen.queryByText('header.invite')).not.toBeInTheDocument()
  })

  it('renders language selector', async () => {
    const Header = (await import('../../src/components/Header')).default
    render(<Header displayName="Alice" role="admin" onNewTask={vi.fn()} onInvite={vi.fn()} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})
