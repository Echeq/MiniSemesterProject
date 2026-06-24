import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMockSupabase } from '../mockSupabase'

const mockSupabase = createMockSupabase()

vi.mock('../../src/api/supabaseClient', () => ({ supabase: mockSupabase }))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => ({
      'auth.signIn': 'Sign in',
      'auth.signUp': 'Sign up',
      'auth.signOut': 'Sign out',
      'auth.displayName': 'Display name',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.signInToBoard': 'Sign in to your board',
      'auth.createAccount': 'Create your account',
      'auth.noAccount': "Don't have an account? Sign up",
      'auth.hasAccount': 'Already have an account? Sign in',
      'auth.checkEmail': 'Check your email to confirm your account, then sign in.',
    }[key] || key),
  }),
}))

describe('AuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders sign in mode by default', async () => {
    const AuthForm = (await import('../../src/components/AuthForm')).default
    render(<AuthForm />)
    expect(screen.getByText('Sign in to your board')).toBeInTheDocument()
    expect(screen.getByText('Sign in')).toBeInTheDocument()
    expect(screen.queryByText('Display name')).not.toBeInTheDocument()
  })

  it('toggles to sign up mode', async () => {
    const AuthForm = (await import('../../src/components/AuthForm')).default
    render(<AuthForm />)
    await userEvent.click(screen.getByText("Don't have an account? Sign up"))
    expect(screen.getByText('Create your account')).toBeInTheDocument()
    expect(screen.getByText('Sign up')).toBeInTheDocument()
    expect(screen.getByText('Display name')).toBeInTheDocument()
  })

  it('toggles back to sign in', async () => {
    const AuthForm = (await import('../../src/components/AuthForm')).default
    render(<AuthForm />)
    await userEvent.click(screen.getByText("Don't have an account? Sign up"))
    await userEvent.click(screen.getByText('Already have an account? Sign in'))
    expect(screen.getByText('Sign in to your board')).toBeInTheDocument()
  })

  it('calls signInWithPassword on sign in submit', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: { session: {} }, error: null })
    const AuthForm = (await import('../../src/components/AuthForm')).default
    render(<AuthForm />)
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.com')
    await userEvent.type(screen.getByLabelText('Password'), 'pass123')
    await userEvent.click(screen.getByText('Sign in'))
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
    await userEvent.click(screen.getByText("Don't have an account? Sign up"))
    await userEvent.type(screen.getByLabelText('Display name'), 'Alice')
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.com')
    await userEvent.type(screen.getByLabelText('Password'), 'pass123')
    await userEvent.click(screen.getByText('Sign up'))
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
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.com')
    await userEvent.type(screen.getByLabelText('Password'), 'wrong')
    await userEvent.click(screen.getByText('Sign in'))
    await waitFor(() => {
      expect(screen.getByText('Invalid login')).toBeInTheDocument()
    })
  })

  it('displays success message on sign up', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({ data: { user: { id: 'new' } }, error: null })
    const AuthForm = (await import('../../src/components/AuthForm')).default
    render(<AuthForm />)
    await userEvent.click(screen.getByText("Don't have an account? Sign up"))
    await userEvent.type(screen.getByLabelText('Display name'), 'Alice')
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.com')
    await userEvent.type(screen.getByLabelText('Password'), 'pass123')
    await userEvent.click(screen.getByText('Sign up'))
    await waitFor(() => {
      expect(screen.getByText('Check your email to confirm your account, then sign in.')).toBeInTheDocument()
    })
  })

  it('disables button while busy', async () => {
    mockSupabase.auth.signInWithPassword.mockImplementation(() => new Promise(() => {}))
    const AuthForm = (await import('../../src/components/AuthForm')).default
    render(<AuthForm />)
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.com')
    await userEvent.type(screen.getByLabelText('Password'), 'pass123')
    await userEvent.click(screen.getByText('Sign in'))
    expect(screen.getByText('Please wait…')).toBeDisabled()
  })

  it('clears error on mode toggle', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: {}, error: { message: 'Bad' } })
    const AuthForm = (await import('../../src/components/AuthForm')).default
    render(<AuthForm />)
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.com')
    await userEvent.type(screen.getByLabelText('Password'), 'x')
    await userEvent.click(screen.getByText('Sign in'))
    await waitFor(() => expect(screen.getByText('Bad')).toBeInTheDocument())
    await userEvent.click(screen.getByText("Don't have an account? Sign up"))
    expect(screen.queryByText('Bad')).not.toBeInTheDocument()
  })
})
