import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
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

describe('TaskCard priority', () => {
  it('renders priority badge P0 as Critical', async () => {
    const TaskCard = (await import('../../src/components/TaskCard')).default
    render(<TaskCard task={{ id: 't1', title: 'Test', status: 'todo', priority: 'P0', labels: [], blocked_by: 0 }} onClick={vi.fn()} />)
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('renders priority badge P1 as High', async () => {
    const TaskCard = (await import('../../src/components/TaskCard')).default
    render(<TaskCard task={{ id: 't2', title: 'Test', status: 'todo', priority: 'P1', labels: [], blocked_by: 0 }} onClick={vi.fn()} />)
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('renders priority badge P2 as Medium', async () => {
    const TaskCard = (await import('../../src/components/TaskCard')).default
    render(<TaskCard task={{ id: 't3', title: 'Test', status: 'todo', priority: 'P2', labels: [], blocked_by: 0 }} onClick={vi.fn()} />)
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('renders priority badge P3 as Low', async () => {
    const TaskCard = (await import('../../src/components/TaskCard')).default
    render(<TaskCard task={{ id: 't4', title: 'Test', status: 'todo', priority: 'P3', labels: [], blocked_by: 0 }} onClick={vi.fn()} />)
    expect(screen.getByText('Low')).toBeInTheDocument()
  })

  it('does not render priority badge when priority is null', async () => {
    const TaskCard = (await import('../../src/components/TaskCard')).default
    render(<TaskCard task={{ id: 't5', title: 'Test', status: 'todo', priority: null, labels: [], blocked_by: 0 }} onClick={vi.fn()} />)
    expect(screen.queryByText('P0')).not.toBeInTheDocument()
    expect(screen.queryByText('Critical')).not.toBeInTheDocument()
  })

  it('renders label chips when labels exist', async () => {
    const TaskCard = (await import('../../src/components/TaskCard')).default
    const labels = [{ id: 'l1', name: 'bug', color: '#ef4444' }, { id: 'l2', name: 'feature', color: '#10b981' }]
    render(<TaskCard task={{ id: 't6', title: 'Test', status: 'todo', labels, blocked_by: 0 }} onClick={vi.fn()} />)
    expect(screen.getByText('bug')).toBeInTheDocument()
    expect(screen.getByText('feature')).toBeInTheDocument()
  })

  it('renders blocked badge when blocked_by > 0', async () => {
    const TaskCard = (await import('../../src/components/TaskCard')).default
    render(<TaskCard task={{ id: 't7', title: 'Test', status: 'todo', labels: [], blocked_by: 2 }} onClick={vi.fn()} />)
    expect(screen.getByText('Blocked by 2')).toBeInTheDocument()
  })
})
