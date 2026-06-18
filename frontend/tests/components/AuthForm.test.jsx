import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMockSupabase } from '../mockSupabase'

const mockSupabase = createMockSupabase()

vi.mock('../../src/api/supabaseClient', () => ({ supabase: mockSupabase }))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}))

describe('AuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders sign in mode by default', async () => {
    const AuthForm = (await import('../../src/components/AuthForm')).default
    render(<AuthForm />)
    expect(screen.getByText('auth.signInToBoard')).toBeInTheDocument()
    expect(screen.getByText('auth.signIn')).toBeInTheDocument()
    expect(screen.queryByText('auth.displayName')).not.toBeInTheDocument()
  })

  it('toggles to sign up mode', async () => {
    const AuthForm = (await import('../../src/components/AuthForm')).default
    render(<AuthForm />)
    await userEvent.click(screen.getByText('auth.noAccount'))
    expect(screen.getByText('auth.createAccount')).toBeInTheDocument()
    expect(screen.getByText('auth.signUp')).toBeInTheDocument()
    expect(screen.getByText('auth.displayName')).toBeInTheDocument()
  })

  it('toggles back to sign in', async () => {
    const AuthForm = (await import('../../src/components/AuthForm')).default
    render(<AuthForm />)
    await userEvent.click(screen.getByText('auth.noAccount'))
    await userEvent.click(screen.getByText('auth.hasAccount'))
    expect(screen.getByText('auth.signInToBoard')).toBeInTheDocument()
  })

  it('calls signInWithPassword on sign in submit', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: { session: {} }, error: null })
    const AuthForm = (await import('../../src/components/AuthForm')).default
    render(<AuthForm />)
    await userEvent.type(screen.getByLabelText('auth.email'), 'a@b.com')
    await userEvent.type(screen.getByLabelText('auth.password'), 'pass123')
    await userEvent.click(screen.getByText('auth.signIn'))
    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'a@b.com',
        password: 'pass123',
      })
    })
  })

  it('calls signUp on sign up submit with display name', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({ data: { user: { id: 'new' } }, error: null })
    const AuthForm = (await import('../../src/components/AuthForm')).default
    render(<AuthForm />)
    await userEvent.click(screen.getByText('auth.noAccount'))
    await userEvent.type(screen.getByLabelText('auth.displayName'), 'Alice')
    await userEvent.type(screen.getByLabelText('auth.email'), 'a@b.com')
    await userEvent.type(screen.getByLabelText('auth.password'), 'pass123')
    await userEvent.click(screen.getByText('auth.signUp'))
    await waitFor(() => {
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'a@b.com',
        password: 'pass123',
        options: { data: { display_name: 'Alice' } },
      })
    })
  })

  it('displays error message on failure', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: {}, error: { message: 'Invalid login' } })
    const AuthForm = (await import('../../src/components/AuthForm')).default
    render(<AuthForm />)
    await userEvent.type(screen.getByLabelText('auth.email'), 'a@b.com')
    await userEvent.type(screen.getByLabelText('auth.password'), 'wrong')
    await userEvent.click(screen.getByText('auth.signIn'))
    await waitFor(() => {
      expect(screen.getByText('Invalid login')).toBeInTheDocument()
    })
  })

  it('displays success message on sign up', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({ data: { user: { id: 'new' } }, error: null })
    const AuthForm = (await import('../../src/components/AuthForm')).default
    render(<AuthForm />)
    await userEvent.click(screen.getByText('auth.noAccount'))
    await userEvent.type(screen.getByLabelText('auth.displayName'), 'Alice')
    await userEvent.type(screen.getByLabelText('auth.email'), 'a@b.com')
    await userEvent.type(screen.getByLabelText('auth.password'), 'pass123')
    await userEvent.click(screen.getByText('auth.signUp'))
    await waitFor(() => {
      expect(screen.getByText('auth.checkEmail')).toBeInTheDocument()
    })
  })

  it('disables button while busy', async () => {
    mockSupabase.auth.signInWithPassword.mockImplementation(() => new Promise(() => {}))
    const AuthForm = (await import('../../src/components/AuthForm')).default
    render(<AuthForm />)
    await userEvent.type(screen.getByLabelText('auth.email'), 'a@b.com')
    await userEvent.type(screen.getByLabelText('auth.password'), 'pass123')
    await userEvent.click(screen.getByText('auth.signIn'))
    expect(screen.getByText('auth.signIn')).toBeDisabled()
  })

  it('clears error on mode toggle', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: {}, error: { message: 'Bad' } })
    const AuthForm = (await import('../../src/components/AuthForm')).default
    render(<AuthForm />)
    await userEvent.type(screen.getByLabelText('auth.email'), 'a@b.com')
    await userEvent.type(screen.getByLabelText('auth.password'), 'x')
    await userEvent.click(screen.getByText('auth.signIn'))
    await waitFor(() => expect(screen.getByText('Bad')).toBeInTheDocument())
    await userEvent.click(screen.getByText('auth.noAccount'))
    expect(screen.queryByText('Bad')).not.toBeInTheDocument()
  })
})
