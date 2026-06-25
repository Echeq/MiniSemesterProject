import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k) => ({ 'board.todo': 'To Do', 'board.inProgress': 'In progress', 'board.done': 'Done', 'board.noTasks': 'No tasks yet' }[k] ?? k),
  }),
}))

vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false, active: null }),
}))

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }) => children,
  verticalListSortingStrategy: {},
  useSortable: () => ({
    setNodeRef: vi.fn(),
    listeners: {},
    attributes: {},
    transform: null,
    transition: null,
    isDragging: false,
  }),
}))

const makeTask = (overrides = {}) => ({
  id: 't1',
  title: 'Task',
  status: 'todo',
  position: 1024,
  assignee: null,
  ...overrides,
})

describe('Column', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders column header with status label', async () => {
    const Column = (await import('../../src/components/Column')).default
    render(<Column status="todo" tasks={[]} onTaskClick={vi.fn()} />)
    expect(screen.getByText('To Do')).toBeInTheDocument()
  })

  it('shows task count', async () => {
    const Column = (await import('../../src/components/Column')).default
    render(<Column status="todo" tasks={[makeTask()]} onTaskClick={vi.fn()} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('shows no-tasks placeholder when empty', async () => {
    const Column = (await import('../../src/components/Column')).default
    render(<Column status="todo" tasks={[]} onTaskClick={vi.fn()} />)
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
  })

  it('renders task cards for non-empty column', async () => {
    const Column = (await import('../../src/components/Column')).default
    render(<Column status="todo" tasks={[makeTask({ id: 't1', title: 'First' }), makeTask({ id: 't2', title: 'Second' })]} onTaskClick={vi.fn()} />)
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })
})
