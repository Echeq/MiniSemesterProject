import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}))

vi.mock('../../src/hooks/useIsMobile', () => ({
  default: () => false,
  useIsMobile: () => false,
}))

const dndListeners = {}
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragStart, onDragEnd }) => {
    dndListeners.start = onDragStart
    dndListeners.end = onDragEnd
    return children
  },
  DragOverlay: ({ children }) => children,
  useSensor: (s) => s,
  PointerSensor: {},
  TouchSensor: {},
  useSensors: (...s) => s,
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false, active: null }),
  closestCorners: () => [],
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

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}))

const makeTask = (overrides = {}) => ({
  id: 't1',
  title: 'Task',
  description: '',
  due_date: null,
  status: 'todo',
  position: 1024,
  assignee: null,
  created_by: 'u1',
  ...overrides,
})

describe('Board', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete dndListeners.start
    delete dndListeners.end
  })

  it('renders all three columns', async () => {
    const Board = (await import('../../src/components/Board')).default
    render(<Board tasks={[]} role="admin" updateTask={vi.fn().mockResolvedValue()} onTaskClick={vi.fn()} onMobileAction={vi.fn()} onInvitationClick={vi.fn()} />)
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('Doing')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('distributes tasks to correct columns', async () => {
    const Board = (await import('../../src/components/Board')).default
    const tasks = [
      makeTask({ id: 't1', title: 'Todo task', status: 'todo' }),
      makeTask({ id: 't2', title: 'Doing task', status: 'doing' }),
      makeTask({ id: 't3', title: 'Done task', status: 'done' }),
    ]
    render(<Board tasks={tasks} role="admin" updateTask={vi.fn().mockResolvedValue()} onTaskClick={vi.fn()} onMobileAction={vi.fn()} onInvitationClick={vi.fn()} />)
    expect(screen.getByText('Todo task')).toBeInTheDocument()
    expect(screen.getByText('Doing task')).toBeInTheDocument()
    expect(screen.getByText('Done task')).toBeInTheDocument()
  })

  it('calls updateTask on drag end for admin', async () => {
    const updateTask = vi.fn().mockResolvedValue()
    const Board = (await import('../../src/components/Board')).default
    const activeTask = makeTask({ id: 't1', title: 'Moving', status: 'todo', position: 1024 })
    render(<Board tasks={[activeTask]} role="admin" updateTask={updateTask} onTaskClick={vi.fn()} onMobileAction={vi.fn()} onInvitationClick={vi.fn()} />)
    dndListeners.start({ active: { id: 't1', data: { current: () => activeTask } } })
    dndListeners.end({ active: { id: 't1', data: { current: () => activeTask } }, over: { id: 'doing' } })
    expect(updateTask).toHaveBeenCalledWith('t1', { status: 'doing', position: expect.any(Number) })
  })
})
