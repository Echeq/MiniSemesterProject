import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}))

vi.mock('@dnd-kit/sortable', () => ({
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
  title: 'Test Task',
  description: 'A description',
  due_date: null,
  status: 'todo',
  position: 1024,
  assignee: null,
  created_by: 'u1',
  ...overrides,
})

describe('TaskCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders task title', async () => {
    const TaskCard = (await import('../../src/components/TaskCard')).default
    render(<TaskCard task={makeTask()} onClick={vi.fn()} role="admin" />)
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })

  it('shows assignee initial when present', async () => {
    const TaskCard = (await import('../../src/components/TaskCard')).default
    render(<TaskCard task={makeTask({ assignee: { display_name: 'Alice', avatar_url: null } })} onClick={vi.fn()} role="admin" />)
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('shows due date badge when due_date set', async () => {
    const TaskCard = (await import('../../src/components/TaskCard')).default
    const futureDate = new Date(Date.now() + 86400000).toISOString()
    render(<TaskCard task={makeTask({ due_date: futureDate })} onClick={vi.fn()} role="admin" />)
    const badge = screen.getByText((content) => content.includes(futureDate.slice(0, 10)))
    expect(badge).toBeInTheDocument()
  })

  it('is clickable for non-admin (pointer cursor)', async () => {
    const TaskCard = (await import('../../src/components/TaskCard')).default
    const { container } = render(<TaskCard task={makeTask()} onClick={vi.fn()} role="member" />)
    const article = container.querySelector('[class*="cursor"]')
    expect(article).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    const TaskCard = (await import('../../src/components/TaskCard')).default
    render(<TaskCard task={makeTask()} onClick={onClick} role="admin" />)
    await userEvent.click(screen.getByText('Test Task'))
    expect(onClick).toHaveBeenCalledWith(makeTask())
  })
})
