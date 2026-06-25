import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}))

const mockSupabase = { auth: { signOut: vi.fn() } }
vi.mock('../../src/api/supabaseClient', () => ({ supabase: mockSupabase }))

vi.mock('../../src/i18n', () => ({ default: { language: 'en', changeLanguage: vi.fn() }, changeLanguage: vi.fn() }))

const mockTasks = [
  { id: 't1', title: 'Task A', status: 'todo', priority: 'P1', labels: [], blocked_by: 0 },
  { id: 't2', title: 'Task B', status: 'done', priority: null, labels: [], blocked_by: 0 },
]

describe('Topbar', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders title and task count', async () => {
    const Topbar = (await import('../../src/components/Topbar')).default
    render(<Topbar title="My board" taskCount={5} tasks={[]} session={{ user: { email: 'a@b.com' } }} profile={{ display_name: 'Alice' }} isAdmin={false} onOpenAccount={vi.fn()} onOpenAdmin={vi.fn()} />)
    expect(screen.getByText('My board')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('shows archived label when archived', async () => {
    const Topbar = (await import('../../src/components/Topbar')).default
    render(<Topbar title="Archived project" archived={true} taskCount={0} tasks={[]} session={{ user: { email: 'a@b.com' } }} profile={{ display_name: 'Alice' }} isAdmin={false} onOpenAccount={vi.fn()} onOpenAdmin={vi.fn()} />)
    expect(screen.getByText('archived')).toBeInTheDocument()
  })

  it('calls onNewTask when New task clicked', async () => {
    const onNewTask = vi.fn()
    const Topbar = (await import('../../src/components/Topbar')).default
    render(<Topbar title="Board" taskCount={0} tasks={mockTasks} session={{ user: { email: 'a@b.com' } }} profile={{ display_name: 'Alice' }} isAdmin={false} onNewTask={onNewTask} onOpenAccount={vi.fn()} onOpenAdmin={vi.fn()} />)
    await userEvent.click(screen.getByText('New task'))
    expect(onNewTask).toHaveBeenCalled()
  })

  it('renders ExportMenu when tasks exist', async () => {
    const Topbar = (await import('../../src/components/Topbar')).default
    render(<Topbar title="Board" taskCount={2} tasks={mockTasks} session={{ user: { email: 'a@b.com' } }} profile={{ display_name: 'Alice' }} isAdmin={false} onOpenAccount={vi.fn()} onOpenAdmin={vi.fn()} />)
    expect(screen.getByText('Export')).toBeInTheDocument()
  })

  it('renders ProfileMenu', async () => {
    const Topbar = (await import('../../src/components/Topbar')).default
    render(<Topbar title="Board" taskCount={0} tasks={[]} session={{ user: { email: 'a@b.com' } }} profile={{ display_name: 'Alice' }} isAdmin={false} onOpenAccount={vi.fn()} onOpenAdmin={vi.fn()} />)
    expect(screen.getByText('A')).toBeInTheDocument()
  })
})
