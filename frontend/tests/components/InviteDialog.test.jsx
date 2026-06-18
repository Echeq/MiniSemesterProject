import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMockSupabase, createMockBuilder } from '../mockSupabase'

const mockSupabase = createMockSupabase()

vi.mock('../../src/api/supabaseClient', () => ({ supabase: mockSupabase }))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}))

describe('InviteDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the invite form', async () => {
    const InviteDialog = (await import('../../src/components/InviteDialog')).default
    render(<InviteDialog adminId="admin-id" onClose={vi.fn()} />)
    expect(screen.getByText('invite.title')).toBeInTheDocument()
    expect(screen.getByText('invite.invite')).toBeInTheDocument()
  })

  it('submits an invitation', async () => {
    const insertBuilder = { ...createMockBuilder({ data: null, error: null }), select: vi.fn(() => createMockBuilder({ data: null, error: null })) }
    mockSupabase.from.mockReturnValue(insertBuilder)
    const InviteDialog = (await import('../../src/components/InviteDialog')).default
    render(<InviteDialog adminId="admin-id" onClose={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('invite.emailAddress'), 'member@example.com')
    await userEvent.click(screen.getByText('invite.invite'))
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('invitations')
    })
  })

  it('shows success message after invite', async () => {
    const insertBuilder = { ...createMockBuilder({ data: null, error: null }), select: vi.fn(() => createMockBuilder({ data: { email: 'member@example.com' }, error: null })) }
    mockSupabase.from.mockReturnValue(insertBuilder)
    const InviteDialog = (await import('../../src/components/InviteDialog')).default
    render(<InviteDialog adminId="admin-id" onClose={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('invite.emailAddress'), 'member@example.com')
    await userEvent.click(screen.getByText('invite.invite'))
    await waitFor(() => {
      expect(screen.getByText('invite.done')).toBeInTheDocument()
    })
  })

  it('displays error on failure', async () => {
    const insertBuilder = createMockBuilder({ data: null, error: { message: 'Duplicate' } })
    mockSupabase.from.mockReturnValue(insertBuilder)
    const InviteDialog = (await import('../../src/components/InviteDialog')).default
    render(<InviteDialog adminId="admin-id" onClose={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('invite.emailAddress'), 'member@example.com')
    await userEvent.click(screen.getByText('invite.invite'))
    await waitFor(() => {
      expect(screen.getByText('Duplicate')).toBeInTheDocument()
    })
  })

  it('calls onClose on cancel', async () => {
    const onClose = vi.fn()
    const InviteDialog = (await import('../../src/components/InviteDialog')).default
    render(<InviteDialog adminId="admin-id" onClose={onClose} />)
    await userEvent.click(screen.getByText('invite.done'))
    expect(onClose).toHaveBeenCalled()
  })
})
