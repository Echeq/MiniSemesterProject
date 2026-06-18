import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}))

const makeTask = (overrides = {}) => ({
  id: 't1',
  title: 'Test task',
  status: 'todo',
  ...overrides,
})

describe('TaskActionSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders task title', async () => {
    const TaskActionSheet = (await import('../../src/components/TaskActionSheet')).default
    render(<TaskActionSheet task={makeTask()} role="admin" onEdit={vi.fn()} onMove={vi.fn()} onDelete={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('Test task')).toBeInTheDocument()
  })

  it('shows edit, move, and delete for admin', async () => {
    const TaskActionSheet = (await import('../../src/components/TaskActionSheet')).default
    render(<TaskActionSheet task={makeTask()} role="admin" onEdit={vi.fn()} onMove={vi.fn()} onDelete={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('task.editAction')).toBeInTheDocument()
    expect(screen.getByText('task.deleteTask')).toBeInTheDocument()
    expect(screen.getAllByText((c) => c.includes('task.moveTo')).length).toBe(2)
  })

  it('shows read-only message for non-admin', async () => {
    const TaskActionSheet = (await import('../../src/components/TaskActionSheet')).default
    render(<TaskActionSheet task={makeTask()} role="member" onEdit={vi.fn()} onMove={vi.fn()} onDelete={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('task.readOnly')).toBeInTheDocument()
    expect(screen.queryByText('task.editAction')).not.toBeInTheDocument()
    expect(screen.queryByText('task.deleteTask')).not.toBeInTheDocument()
  })

  it('shows move options for other statuses', async () => {
    const TaskActionSheet = (await import('../../src/components/TaskActionSheet')).default
    render(<TaskActionSheet task={makeTask({ status: 'todo' })} role="admin" onEdit={vi.fn()} onMove={vi.fn()} onDelete={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText((c) => c.includes('board.inProgress'))).toBeInTheDocument()
    expect(screen.getByText((c) => c.includes('board.done'))).toBeInTheDocument()
  })

  it('calls onEdit when edit clicked', async () => {
    const onEdit = vi.fn()
    const TaskActionSheet = (await import('../../src/components/TaskActionSheet')).default
    render(<TaskActionSheet task={makeTask()} role="admin" onEdit={onEdit} onMove={vi.fn()} onDelete={vi.fn()} onClose={vi.fn()} />)
    await userEvent.click(screen.getByText('task.editAction'))
    expect(onEdit).toHaveBeenCalled()
  })

  it('calls onMove with new status', async () => {
    const onMove = vi.fn()
    const TaskActionSheet = (await import('../../src/components/TaskActionSheet')).default
    render(<TaskActionSheet task={makeTask({ status: 'todo' })} role="admin" onEdit={onMove} onMove={onMove} onDelete={vi.fn()} onClose={vi.fn()} />)
    await userEvent.click(screen.getByText((c) => c.includes('board.done')))
    expect(onMove).toHaveBeenCalledWith('t1', { status: 'done' })
  })

  it('calls onDelete when delete clicked', async () => {
    const onDelete = vi.fn()
    const TaskActionSheet = (await import('../../src/components/TaskActionSheet')).default
    render(<TaskActionSheet task={makeTask()} role="admin" onEdit={vi.fn()} onMove={vi.fn()} onDelete={onDelete} onClose={vi.fn()} />)
    await userEvent.click(screen.getByText('task.deleteTask'))
    expect(onDelete).toHaveBeenCalled()
  })

  it('calls onClose when close is pressed', async () => {
    const onClose = vi.fn()
    const TaskActionSheet = (await import('../../src/components/TaskActionSheet')).default
    const { container } = render(<TaskActionSheet task={makeTask()} role="admin" onEdit={vi.fn()} onMove={vi.fn()} onDelete={vi.fn()} onClose={onClose} />)
    await userEvent.click(container.querySelector('.modal-overlay'))
    expect(onClose).toHaveBeenCalled()
  })
})
