import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => ({ 'filter.filters': 'Filters', 'filter.compact': 'Compact', 'filter.noMatch': 'No tasks match this view.', 'filter.clearFilters': 'Clear filters', 'task.labels': 'Labels', 'task.bulkSelected': '{{count}} selected', 'task.bulkDeleteConfirm': 'Delete {{count}} tasks?', 'task.status': 'Status', 'task.priority': 'Priority', 'task.delete': 'Delete', 'task.cancel': 'Cancel', 'task.title': 'Title', 'task.dueDate': 'Due date', 'task.assignee': 'Assignee', 'board.todo': 'To Do', 'board.inProgress': 'In progress', 'board.done': 'Done', 'filter.p0': 'Critical', 'filter.p1': 'High', 'filter.p2': 'Medium', 'filter.p3': 'Low', 'filter.taskCount': '{{count}} tasks' }[key] || key) }),
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

  it('renders checkbox for each row', async () => {
    const ListView = (await import('../../src/components/ListView')).default
    render(<ListView tasks={[makeTask({ id: 't1' }), makeTask({ id: 't2' })]} onTaskClick={vi.fn()} updateTask={vi.fn()} onDeleteTask={vi.fn()} />)
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBe(3) // select-all + 2 rows
  })

  it('selection toolbar appears when checkbox toggled', async () => {
    const ListView = (await import('../../src/components/ListView')).default
    render(<ListView tasks={[makeTask({ id: 't1', title: 'Task A' })]} onTaskClick={vi.fn()} updateTask={vi.fn()} onDeleteTask={vi.fn()} />)
    const rowCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(rowCheckbox)
    expect(screen.getByText(/selected/)).toBeInTheDocument()
  })

  it('select-all checkbox toggles all rows', async () => {
    const ListView = (await import('../../src/components/ListView')).default
    render(<ListView tasks={[makeTask({ id: 't1', title: 'A' }), makeTask({ id: 't2', title: 'B' })]} onTaskClick={vi.fn()} updateTask={vi.fn()} onDeleteTask={vi.fn()} />)
    const selectAll = screen.getAllByRole('checkbox')[0]
    fireEvent.click(selectAll)
    expect(screen.getByText(/selected/)).toBeInTheDocument()
    fireEvent.click(selectAll)
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument()
  })
})
