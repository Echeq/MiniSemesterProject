import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMockSupabase } from '../mockSupabase'

const mockSupabase = createMockSupabase()

vi.mock('../../src/api/supabaseClient', () => ({ supabase: mockSupabase }))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}))

const fakeProfile = {
  id: 'uid',
  display_name: 'Alice',
  role: 'admin',
  avatar_url: null,
}

const allPasswords = () => screen.getAllByLabelText('profile.currentPassword')

describe('ProfileSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders profile section with display name', async () => {
    const ProfileSettings = (await import('../../src/components/ProfileSettings')).default
    render(<ProfileSettings profile={fakeProfile} email="alice@test.com" onUpdate={vi.fn()} onUploadAvatar={vi.fn()} onChangePassword={vi.fn()} onUpdateEmail={vi.fn()} onDeleteAccount={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('profile.title')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument()
  })

  it('calls onUpdate with new display name', async () => {
    const onUpdate = vi.fn()
    const ProfileSettings = (await import('../../src/components/ProfileSettings')).default
    render(<ProfileSettings profile={fakeProfile} email="alice@test.com" onUpdate={onUpdate} onUploadAvatar={vi.fn()} onChangePassword={vi.fn()} onUpdateEmail={vi.fn()} onDeleteAccount={vi.fn()} onClose={vi.fn()} />)
    const input = screen.getByLabelText('profile.displayName')
    await userEvent.clear(input)
    await userEvent.type(input, 'Alice Updated')
    await userEvent.click(screen.getByText('profile.save'))
    await waitFor(() => expect(onUpdate).toHaveBeenCalledWith({ display_name: 'Alice Updated' }))
  })

  it('calls onChangePassword with old and new passwords', async () => {
    const onChangePassword = vi.fn()
    const ProfileSettings = (await import('../../src/components/ProfileSettings')).default
    render(<ProfileSettings profile={fakeProfile} email="alice@test.com" onUpdate={vi.fn()} onUploadAvatar={vi.fn()} onChangePassword={onChangePassword} onUpdateEmail={vi.fn()} onDeleteAccount={vi.fn()} onClose={vi.fn()} />)
    const [pwCurrent] = allPasswords()
    await userEvent.type(pwCurrent, 'oldPass')
    await userEvent.type(screen.getByLabelText('profile.newPassword'), 'newPass123')
    await userEvent.type(screen.getByLabelText('profile.confirmPassword'), 'newPass123')
    const [, changePwBtn] = screen.getAllByText('profile.changePassword')
    await userEvent.click(changePwBtn)
    await waitFor(() => expect(onChangePassword).toHaveBeenCalledWith('oldPass', 'newPass123'))
  })

  it('shows error when new passwords do not match', async () => {
    const ProfileSettings = (await import('../../src/components/ProfileSettings')).default
    render(<ProfileSettings profile={fakeProfile} email="alice@test.com" onUpdate={vi.fn()} onUploadAvatar={vi.fn()} onChangePassword={vi.fn()} onUpdateEmail={vi.fn()} onDeleteAccount={vi.fn()} onClose={vi.fn()} />)
    const [pwCurrent] = allPasswords()
    await userEvent.type(pwCurrent, 'oldPass')
    await userEvent.type(screen.getByLabelText('profile.newPassword'), 'newPass123')
    await userEvent.type(screen.getByLabelText('profile.confirmPassword'), 'different')
    const [, changePwBtn2] = screen.getAllByText('profile.changePassword')
    await userEvent.click(changePwBtn2)
    await waitFor(() => expect(screen.getByText('profile.passwordsNoMatch')).toBeInTheDocument())
  })

  it('shows error when new password is too short', async () => {
    const ProfileSettings = (await import('../../src/components/ProfileSettings')).default
    render(<ProfileSettings profile={fakeProfile} email="alice@test.com" onUpdate={vi.fn()} onUploadAvatar={vi.fn()} onChangePassword={vi.fn()} onUpdateEmail={vi.fn()} onDeleteAccount={vi.fn()} onClose={vi.fn()} />)
    const [pwCurrent] = allPasswords()
    await userEvent.type(pwCurrent, 'old')
    await userEvent.type(screen.getByLabelText('profile.newPassword'), 'ab')
    await userEvent.type(screen.getByLabelText('profile.confirmPassword'), 'ab')
    const [, changePwBtn3] = screen.getAllByText('profile.changePassword')
    await userEvent.click(changePwBtn3)
    await waitFor(() => expect(screen.getByText('profile.passwordTooShort')).toBeInTheDocument())
  })

  it('calls onUpdateEmail with new email', async () => {
    const onUpdateEmail = vi.fn()
    const ProfileSettings = (await import('../../src/components/ProfileSettings')).default
    render(<ProfileSettings profile={fakeProfile} email="alice@test.com" onUpdate={vi.fn()} onUploadAvatar={vi.fn()} onChangePassword={vi.fn()} onUpdateEmail={onUpdateEmail} onDeleteAccount={vi.fn()} onClose={vi.fn()} />)
    const [, pwEmail] = allPasswords()
    await userEvent.type(pwEmail, 'pass')
    await userEvent.type(screen.getByLabelText('profile.newEmail'), 'new@test.com')
    const [, emailBtn] = screen.getAllByText('profile.updateEmail')
    await userEvent.click(emailBtn)
    await waitFor(() => expect(onUpdateEmail).toHaveBeenCalledWith('new@test.com', 'pass'))
  })

  it('shows error when new email is the same', async () => {
    const ProfileSettings = (await import('../../src/components/ProfileSettings')).default
    render(<ProfileSettings profile={fakeProfile} email="alice@test.com" onUpdate={vi.fn()} onUploadAvatar={vi.fn()} onChangePassword={vi.fn()} onUpdateEmail={vi.fn()} onDeleteAccount={vi.fn()} onClose={vi.fn()} />)
    const [, pwEmail] = allPasswords()
    await userEvent.type(pwEmail, 'pass')
    await userEvent.type(screen.getByLabelText('profile.newEmail'), 'alice@test.com')
    const [, emailBtn2] = screen.getAllByText('profile.updateEmail')
    await userEvent.click(emailBtn2)
    await waitFor(() => expect(screen.getByText('profile.emailMismatch')).toBeInTheDocument())
  })

  it('requires confirmation checkbox for account deletion', async () => {
    const onDeleteAccount = vi.fn()
    const ProfileSettings = (await import('../../src/components/ProfileSettings')).default
    render(<ProfileSettings profile={fakeProfile} email="alice@test.com" onUpdate={vi.fn()} onUploadAvatar={vi.fn()} onChangePassword={vi.fn()} onUpdateEmail={vi.fn()} onDeleteAccount={onDeleteAccount} onClose={vi.fn()} />)
    const [,, pwDelete] = allPasswords()
    await userEvent.type(pwDelete, 'pass')
    const confirmCheckbox = screen.getByLabelText('profile.deleteConfirmLabel')
    await userEvent.click(confirmCheckbox)
    await userEvent.click(screen.getByText('profile.deleteConfirmAction'))
    await waitFor(() => expect(onDeleteAccount).toHaveBeenCalledWith('pass'))
  })

  it('disables delete button without confirmation', async () => {
    const ProfileSettings = (await import('../../src/components/ProfileSettings')).default
    render(<ProfileSettings profile={fakeProfile} email="alice@test.com" onUpdate={vi.fn()} onUploadAvatar={vi.fn()} onChangePassword={vi.fn()} onUpdateEmail={vi.fn()} onDeleteAccount={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('profile.deleteConfirmAction')).toBeDisabled()
  })
})
