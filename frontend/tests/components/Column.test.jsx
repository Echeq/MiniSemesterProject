import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
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
    render(<Column status="todo" tasks={[]} role="admin" onTaskClick={vi.fn()} onInvitationClick={vi.fn()} onMobileAction={vi.fn()} />)
    expect(screen.getByText('board.todo')).toBeInTheDocument()
  })

  it('shows task count', async () => {
    const Column = (await import('../../src/components/Column')).default
    render(<Column status="todo" tasks={[makeTask()]} role="admin" onTaskClick={vi.fn()} onInvitationClick={vi.fn()} onMobileAction={vi.fn()} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('shows no-tasks placeholder when empty', async () => {
    const Column = (await import('../../src/components/Column')).default
    render(<Column status="todo" tasks={[]} role="admin" onTaskClick={vi.fn()} onInvitationClick={vi.fn()} onMobileAction={vi.fn()} />)
    expect(screen.getByText('board.noTasks')).toBeInTheDocument()
  })

  it('shows invitation prompt for unknown role', async () => {
    const Column = (await import('../../src/components/Column')).default
    render(<Column status="todo" tasks={[]} role="unknown" onTaskClick={vi.fn()} onInvitationClick={vi.fn()} onMobileAction={vi.fn()} />)
    expect(screen.getByText('board.tasksHidden')).toBeInTheDocument()
    expect(screen.getByText('board.clickRequest')).toBeInTheDocument()
  })

  it('calls onInvitationClick when unknown user clicks request', async () => {
    const onInvitationClick = vi.fn()
    const Column = (await import('../../src/components/Column')).default
    render(<Column status="todo" tasks={[]} role="unknown" onTaskClick={vi.fn()} onInvitationClick={onInvitationClick} onMobileAction={vi.fn()} />)
    await userEvent.click(screen.getByText('board.clickRequest'))
    expect(onInvitationClick).toHaveBeenCalled()
  })

  it('renders task cards for non-empty column', async () => {
    const Column = (await import('../../src/components/Column')).default
    render(<Column status="todo" tasks={[makeTask({ id: 't1', title: 'First' }), makeTask({ id: 't2', title: 'Second' })]} role="admin" onTaskClick={vi.fn()} onInvitationClick={vi.fn()} onMobileAction={vi.fn()} />)
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })
})
