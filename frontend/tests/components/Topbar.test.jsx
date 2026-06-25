import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}))

vi.mock('../../src/i18n', () => ({ default: { language: 'en', changeLanguage: vi.fn() }, changeLanguage: vi.fn() }))

describe('Topbar', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders title and task count', async () => {
    const Topbar = (await import('../../src/components/Topbar')).default
    render(<Topbar title="My Board" taskCount={3} tasks={[]} session={{ user: { email: 'a@b.com' } }} profile={{ display_name: 'Alice' }} isAdmin={false} onOpenAccount={vi.fn()} onOpenAdmin={vi.fn()} />)
    expect(screen.getByText('My Board')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows archived label when archived', async () => {
    const Topbar = (await import('../../src/components/Topbar')).default
    render(<Topbar title="Archived" archived={true} taskCount={0} tasks={[]} session={{ user: { email: 'a@b.com' } }} profile={{ display_name: 'Alice' }} isAdmin={false} onOpenAccount={vi.fn()} onOpenAdmin={vi.fn()} />)
    expect(screen.getByText('archived')).toBeInTheDocument()
  })

  it('renders ProfileMenu avatar', async () => {
    const Topbar = (await import('../../src/components/Topbar')).default
    render(<Topbar title="Board" taskCount={0} tasks={[]} session={{ user: { email: 'a@b.com' } }} profile={{ display_name: 'Bob' }} isAdmin={false} onOpenAccount={vi.fn()} onOpenAdmin={vi.fn()} />)
    expect(screen.getByText('B')).toBeInTheDocument()
  })
})
