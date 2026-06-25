import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}))

const makeTask = (overrides = {}) => ({
  id: 't1',
  title: 'Task',
  status: 'todo',
  priority: null,
  due_date: null,
  position: 1024,
  assignee: null,
  labels: [],
  blocked_by: 0,
  assignee_profile: null,
  ...overrides,
})

describe('ListView', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders table headers', async () => {
    const ListView = (await import('../../src/components/ListView')).default
    const { container } = render(<ListView tasks={[]} onTaskClick={vi.fn()} />)
    expect(container.querySelector('table')).toBeInTheDocument()
  })

  it('renders task rows', async () => {
    const ListView = (await import('../../src/components/ListView')).default
    render(<ListView tasks={[makeTask({ id: 't1', title: 'First' }), makeTask({ id: 't2', title: 'Second' })]} onTaskClick={vi.fn()} />)
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('shows empty message when no tasks', async () => {
    const ListView = (await import('../../src/components/ListView')).default
    render(<ListView tasks={[]} onTaskClick={vi.fn()} />)
    expect(screen.getByText('No tasks match this view.')).toBeInTheDocument()
  })

  it('shows priority badge when set', async () => {
    const ListView = (await import('../../src/components/ListView')).default
    render(<ListView tasks={[makeTask({ priority: 'P1' })]} onTaskClick={vi.fn()} />)
    expect(screen.getByText('P1')).toBeInTheDocument()
  })

  it('shows assignee avatar when set', async () => {
    const ListView = (await import('../../src/components/ListView')).default
    render(<ListView tasks={[makeTask({ assignee_profile: { display_name: 'Alice' } })]} onTaskClick={vi.fn()} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })
})
