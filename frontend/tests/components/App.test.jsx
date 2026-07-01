import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { createMockSupabase, createMockBuilder } from '../mockSupabase'

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
      'auth.createAccount': 'Create an account',
      'auth.noAccount': "Don't have an account? Sign up",
      'auth.hasAccount': 'Already have an account? Sign in',
      'auth.checkEmail': 'Check your email to confirm your account, then sign in.',
      'lang.switcher': 'Language',
      'sidebar.allTasks': 'All tasks',
      'sidebar.sharedBoard': 'Shared board',
      'sidebar.myTasks': 'My tasks',
      'sidebar.dueSoon': 'Due soon',
      'sidebar.overdue': 'Overdue',
    }[key] || key),
  }),
}))

vi.mock('../../src/i18n', () => ({
  default: { language: 'en', changeLanguage: vi.fn() },
  changeLanguage: vi.fn(),
}))

vi.mock('../../src/hooks/useIsMobile', () => ({
  default: () => false,
  useIsMobile: () => false,
}))

vi.mock('../../src/hooks/useBoard', () => ({
  STATUSES: ['todo', 'doing', 'done'],
  positionBetween: (a, b) => {
    if (a != null && b != null) return (a + b) / 2
    if (a != null) return a + 1024
    if (b != null) return b - 1024
    return 1024
  },
  useBoard: () => ({
    tasks: [],
    loading: false,
    error: null,
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  }),
}))

const mockUseProfile = vi.fn()
mockUseProfile.mockReturnValue({
  profile: null,
  loading: true,
  updateProfile: vi.fn(),
  uploadAvatar: vi.fn(),
  changePassword: vi.fn(),
  updateEmail: vi.fn(),
  deleteAccount: vi.fn(),
})
vi.mock('../../src/hooks/useProfile', () => ({
  useProfile: mockUseProfile,
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', async () => {
    mockSupabase.auth.getSession.mockReturnValue(new Promise(() => {}))
    const { default: App } = await import('../../src/App')
    render(<App />)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('renders AuthForm when no session', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
    mockUseProfile.mockReturnValue({
      profile: null,
      loading: false,
    })
    const { default: App } = await import('../../src/App')
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('Sign in to your board')).toBeInTheDocument()
    })
  })

  it('renders board when user is signed in as admin', async () => {
    const fakeSession = { user: { id: 'uid', email: 'admin@test.com', user_metadata: { display_name: 'Admin' } } }
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null })
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
    mockUseProfile.mockReturnValue({
      profile: { id: 'uid', display_name: 'Admin', role: 'admin', avatar_url: null },
      loading: false,
      isAdmin: true,
    })
    const { default: App } = await import('../../src/App')
    render(<App />)
    await waitFor(() => {
      expect(screen.getAllByText('All tasks').length).toBeGreaterThanOrEqual(1)
    })
  })
})
