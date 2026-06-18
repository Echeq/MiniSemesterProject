import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMockSupabase, createMockBuilder } from '../mockSupabase'

const mockSupabase = createMockSupabase()

vi.mock('../../src/api/supabaseClient', () => ({ supabase: mockSupabase }))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}))

const fakeSession = { user: { id: 'uid', email: 'admin@test.com' } }

const profiles = [
  { id: 'u2', display_name: 'Bob', role: 'member' },
  { id: 'u3', display_name: 'Carol', role: 'admin' },
]

describe('TaskModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const builder = createMockBuilder({ data: profiles, error: null })
    mockSupabase.from.mockReturnValue(builder)
  })

  it('renders create mode when task is null', async () => {
    const TaskModal = (await import('../../src/components/TaskModal')).default
    render(<TaskModal task={null} role="admin" session={fakeSession} onCreate={vi.fn()} onUpdate={vi.fn()} onDelete={vi.fn()} onClose={vi.fn()} />)
    await waitFor(() => expect(screen.getByText('task.new')).toBeInTheDocument())
    expect(screen.getByText('task.create')).toBeInTheDocument()
  })

  it('renders edit mode when task is provided', async () => {
    const TaskModal = (await import('../../src/components/TaskModal')).default
    render(<TaskModal task={{ id: 't1', title: 'Edit me', description: '', due_date: null, status: 'todo', assignee: null, created_by: 'uid' }} role="admin" session={fakeSession} onCreate={vi.fn()} onUpdate={vi.fn()} onDelete={vi.fn()} onClose={vi.fn()} />)
    await waitFor(() => expect(screen.getByText('task.edit')).toBeInTheDocument())
    expect(screen.getByText('task.save')).toBeInTheDocument()
  })

  it('renders member view for non-admin role', async () => {
    const TaskModal = (await import('../../src/components/TaskModal')).default
    render(<TaskModal task={{ id: 't1', title: 'Read only', description: 'desc', due_date: null, status: 'doing', assignee: null, created_by: 'other' }} role="member" session={fakeSession} onCreate={vi.fn()} onUpdate={vi.fn()} onDelete={vi.fn()} onClose={vi.fn()} />)
    await waitFor(() => expect(screen.getByText('task.details')).toBeInTheDocument())
    expect(screen.getByText('Read only')).toBeInTheDocument()
    expect(screen.getByText('desc')).toBeInTheDocument()
  })

  it('fetches profiles for assignee dropdown', async () => {
    const TaskModal = (await import('../../src/components/TaskModal')).default
    render(<TaskModal task={null} role="admin" session={fakeSession} onCreate={vi.fn()} onUpdate={vi.fn()} onDelete={vi.fn()} onClose={vi.fn()} />)
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
    })
  })

  it('calls onCreate with form data on create submit', async () => {
    const onCreate = vi.fn()
    const TaskModal = (await import('../../src/components/TaskModal')).default
    render(<TaskModal task={null} role="admin" session={fakeSession} onCreate={onCreate} onUpdate={vi.fn()} onDelete={vi.fn()} onClose={vi.fn()} />)
    await waitFor(() => expect(screen.getByLabelText('task.title')).toBeInTheDocument())
    await userEvent.type(screen.getByLabelText('task.title'), 'New Task')
    await userEvent.click(screen.getByText('task.create'))
    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Task' }))
    })
  })

  it('calls onUpdate with updated fields on edit submit', async () => {
    const onUpdate = vi.fn()
    const TaskModal = (await import('../../src/components/TaskModal')).default
    render(<TaskModal task={{ id: 't1', title: 'Old', description: '', due_date: null, status: 'todo', assignee: null, created_by: 'uid' }} role="admin" session={fakeSession} onCreate={vi.fn()} onUpdate={onUpdate} onDelete={vi.fn()} onClose={vi.fn()} />)
    await waitFor(() => expect(screen.getByLabelText('task.title')).toBeInTheDocument())
    const titleInput = screen.getByLabelText('task.title')
    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'Updated')
    await userEvent.click(screen.getByText('task.save'))
    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith('t1', expect.objectContaining({ title: 'Updated' }))
    })
  })

  it('calls onDelete when delete is confirmed', async () => {
    const onDelete = vi.fn()
    const originalConfirm = window.confirm
    window.confirm = vi.fn(() => true)
    const TaskModal = (await import('../../src/components/TaskModal')).default
    render(<TaskModal task={{ id: 't1', title: 'Delete me', description: '', due_date: null, status: 'todo', assignee: null, created_by: 'uid' }} role="admin" session={fakeSession} onCreate={vi.fn()} onUpdate={vi.fn()} onDelete={onDelete} onClose={vi.fn()} />)
    await waitFor(() => expect(screen.getByText('task.delete')).toBeInTheDocument())
    await userEvent.click(screen.getByText('task.delete'))
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith('t1'))
    window.confirm = originalConfirm
  })

  it('displays error message', async () => {
    const onCreate = vi.fn().mockRejectedValue(new Error('Create failed'))
    const TaskModal = (await import('../../src/components/TaskModal')).default
    render(<TaskModal task={null} role="admin" session={fakeSession} onCreate={onCreate} onUpdate={vi.fn()} onDelete={vi.fn()} onClose={vi.fn()} />)
    await waitFor(() => expect(screen.getByLabelText('task.title')).toBeInTheDocument())
    await userEvent.type(screen.getByLabelText('task.title'), 'Task')
    await userEvent.click(screen.getByText('task.create'))
    await waitFor(() => expect(screen.getByText('Create failed')).toBeInTheDocument())
  })
})
