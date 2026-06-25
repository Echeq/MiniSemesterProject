import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => ({ 'filter.filters': 'Filters', 'filter.compact': 'Compact', 'filter.noMatch': 'No tasks match this view.', 'filter.clearFilters': 'Clear filters', 'task.labels': 'Labels' }[key] || key) }),
}))

const makeTask = (overrides = {}) => ({
  id: 't1', title: 'Task', status: 'todo', priority: null, due_date: null,
  labels: [], blocked_by: 0, assignee: null, assignee_profile: null, ...overrides,
})

describe('ListView', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders table', async () => {
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

  it('shows filter button', async () => {
    const ListView = (await import('../../src/components/ListView')).default
    render(<ListView tasks={[makeTask()]} onTaskClick={vi.fn()} />)
    expect(screen.getByText('Filters')).toBeInTheDocument()
  })

  it('shows compact toggle', async () => {
    const ListView = (await import('../../src/components/ListView')).default
    render(<ListView tasks={[makeTask()]} onTaskClick={vi.fn()} />)
    expect(screen.getByText('Compact')).toBeInTheDocument()
  })
})
