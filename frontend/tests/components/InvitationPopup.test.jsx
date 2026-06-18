import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMockSupabase, createMockBuilder } from '../mockSupabase'

const mockSupabase = createMockSupabase()

vi.mock('../../src/api/supabaseClient', () => ({ supabase: mockSupabase }))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}))

describe('InvitationPopup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the form', async () => {
    const InvitationPopup = (await import('../../src/components/InvitationPopup')).default
    render(<InvitationPopup userId="uid" onClose={vi.fn()} />)
    expect(screen.getByText('invitation.title')).toBeInTheDocument()
    expect(screen.getByText('invitation.requestAccess')).toBeInTheDocument()
    expect(screen.getByLabelText('invitation.adminEmail')).toBeInTheDocument()
  })

  it('submits a join request', async () => {
    const insertBuilder = createMockBuilder({ data: null, error: null })
    mockSupabase.from.mockReturnValue(insertBuilder)
    const InvitationPopup = (await import('../../src/components/InvitationPopup')).default
    render(<InvitationPopup userId="uid" onClose={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('invitation.adminEmail'), 'admin@example.com')
    await userEvent.click(screen.getByText('invitation.requestAccess'))
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('join_requests')
      expect(insertBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({ requester_id: 'uid', admin_email: 'admin@example.com' }),
      )
    })
  })

  it('shows success message after submission', async () => {
    const insertBuilder = createMockBuilder({ data: null, error: null })
    mockSupabase.from.mockReturnValue(insertBuilder)
    const InvitationPopup = (await import('../../src/components/InvitationPopup')).default
    render(<InvitationPopup userId="uid" onClose={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('invitation.adminEmail'), 'admin@example.com')
    await userEvent.click(screen.getByText('invitation.requestAccess'))
    await waitFor(() => {
      expect(screen.getByText('invitation.sent')).toBeInTheDocument()
      expect(screen.getByText('invitation.gotIt')).toBeInTheDocument()
    })
  })

  it('displays error on failure', async () => {
    const insertBuilder = createMockBuilder({ data: null, error: { message: 'DB error' } })
    mockSupabase.from.mockReturnValue(insertBuilder)
    const InvitationPopup = (await import('../../src/components/InvitationPopup')).default
    render(<InvitationPopup userId="uid" onClose={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('invitation.adminEmail'), 'admin@example.com')
    await userEvent.click(screen.getByText('invitation.requestAccess'))
    await waitFor(() => {
      expect(screen.getByText('DB error')).toBeInTheDocument()
    })
  })

  it('calls onClose when "Got it" clicked', async () => {
    const onClose = vi.fn()
    const insertBuilder = createMockBuilder({ data: null, error: null })
    mockSupabase.from.mockReturnValue(insertBuilder)
    const InvitationPopup = (await import('../../src/components/InvitationPopup')).default
    render(<InvitationPopup userId="uid" onClose={onClose} />)
    await userEvent.type(screen.getByLabelText('invitation.adminEmail'), 'admin@example.com')
    await userEvent.click(screen.getByText('invitation.requestAccess'))
    await waitFor(() => expect(screen.getByText('invitation.gotIt')).toBeInTheDocument())
    await userEvent.click(screen.getByText('invitation.gotIt'))
    expect(onClose).toHaveBeenCalled()
  })
})
