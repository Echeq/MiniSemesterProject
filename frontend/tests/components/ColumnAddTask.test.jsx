/**
 * Targeted tests for the per-column Add Task button added to Column.jsx.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k) => k }) }))
vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }),
}))
vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }) => children,
  verticalListSortingStrategy: {},
  useSortable: () => ({ setNodeRef: vi.fn(), listeners: {}, attributes: {}, transform: null, transition: null, isDragging: false }),
}))

describe('Column — Add Task button', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders the + button when onAddTask is provided', async () => {
    const Column = (await import('../../src/components/Column')).default
    render(<Column status="todo" tasks={[]} onTaskClick={vi.fn()} onAddTask={vi.fn()} />)
    expect(screen.getByTitle('Add task to To Do')).toBeInTheDocument()
  })

  it('does NOT render the + button when onAddTask is omitted', async () => {
    const Column = (await import('../../src/components/Column')).default
    render(<Column status="todo" tasks={[]} onTaskClick={vi.fn()} />)
    expect(screen.queryByTitle('Add task to To Do')).not.toBeInTheDocument()
  })

  it('calls onAddTask with the column status on click', async () => {
    const Column = (await import('../../src/components/Column')).default
    const onAddTask = vi.fn()
    render(<Column status="doing" tasks={[]} onTaskClick={vi.fn()} onAddTask={onAddTask} />)
    await userEvent.click(screen.getByTitle('Add task to Doing'))
    expect(onAddTask).toHaveBeenCalledOnce()
    expect(onAddTask).toHaveBeenCalledWith('doing')
  })

  it('passes the correct status for each column type', async () => {
    const Column = (await import('../../src/components/Column')).default
    for (const [status, label] of [['todo', 'To Do'], ['doing', 'Doing'], ['done', 'Done']]) {
      const onAddTask = vi.fn()
      const { unmount } = render(<Column status={status} tasks={[]} onTaskClick={vi.fn()} onAddTask={onAddTask} />)
      await userEvent.click(screen.getByTitle(`Add task to ${label}`))
      expect(onAddTask).toHaveBeenCalledWith(status)
      unmount()
    }
  })
})
