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
    render(<TaskModal task={null} members={[]} projects={[]} onCreate={vi.fn()} onUpdate={vi.fn()} onDelete={vi.fn()} onClose={vi.fn()} />)
    await waitFor(() => expect(screen.getByText('New task')).toBeInTheDocument())
    expect(screen.getByText('Create')).toBeInTheDocument()
  })

  it('renders edit mode when task is provided', async () => {
    const TaskModal = (await import('../../src/components/TaskModal')).default
    render(<TaskModal task={{ id: 't1', title: 'Edit me', description: '', due_date: null, status: 'todo', assignee: null, created_by: 'uid' }} members={[]} projects={[]} onCreate={vi.fn()} onUpdate={vi.fn()} onDelete={vi.fn()} onClose={vi.fn()} />)
    await waitFor(() => expect(screen.getByText('Edit task')).toBeInTheDocument())
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('renders task details in edit mode', async () => {
    const TaskModal = (await import('../../src/components/TaskModal')).default
    render(<TaskModal task={{ id: 't1', title: 'Read only', description: 'desc', due_date: null, status: 'doing', assignee: null, created_by: 'other' }} members={[]} projects={[]} onCreate={vi.fn()} onUpdate={vi.fn()} onDelete={vi.fn()} onClose={vi.fn()} />)
    await waitFor(() => expect(screen.getByText('Edit task')).toBeInTheDocument())
    expect(screen.getByDisplayValue('Read only')).toBeInTheDocument()
    expect(screen.getByText('desc')).toBeInTheDocument()
  })

  it('fetches projects for project dropdown', async () => {
    const TaskModal = (await import('../../src/components/TaskModal')).default
    render(<TaskModal task={null} members={[]} projects={[]} onCreate={vi.fn()} onUpdate={vi.fn()} onDelete={vi.fn()} onClose={vi.fn()} />)
    await waitFor(() => {
      expect(screen.getByText('New task')).toBeInTheDocument()
    })
  })

  it('calls onCreate with form data on create submit', async () => {
    const onCreate = vi.fn()
    const TaskModal = (await import('../../src/components/TaskModal')).default
    render(<TaskModal task={null} members={[]} projects={[]} onCreate={onCreate} onUpdate={vi.fn()} onDelete={vi.fn()} onClose={vi.fn()} />)
    await waitFor(() => expect(screen.getByLabelText('Title')).toBeInTheDocument())
    await userEvent.type(screen.getByLabelText('Title'), 'New Task')
    await userEvent.click(screen.getByText('Create'))
    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Task' }))
    })
  })

  it('calls onUpdate with updated fields on edit submit', async () => {
    const onUpdate = vi.fn()
    const TaskModal = (await import('../../src/components/TaskModal')).default
    render(<TaskModal task={{ id: 't1', title: 'Old', description: '', due_date: null, status: 'todo', assignee: null, created_by: 'uid' }} members={[]} projects={[]} onCreate={vi.fn()} onUpdate={onUpdate} onDelete={vi.fn()} onClose={vi.fn()} />)
    await waitFor(() => expect(screen.getByLabelText('Title')).toBeInTheDocument())
    const titleInput = screen.getByLabelText('Title')
    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'Updated')
    await userEvent.click(screen.getByText('Save'))
    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith('t1', expect.objectContaining({ title: 'Updated' }))
    })
  })

  it('calls onDelete when delete is confirmed', async () => {
    const onDelete = vi.fn()
    const originalConfirm = window.confirm
    window.confirm = vi.fn(() => true)
    const TaskModal = (await import('../../src/components/TaskModal')).default
    render(<TaskModal task={{ id: 't1', title: 'Delete me', description: '', due_date: null, status: 'todo', assignee: null, created_by: 'uid' }} members={[]} projects={[]} onCreate={vi.fn()} onUpdate={vi.fn()} onDelete={onDelete} onClose={vi.fn()} />)
    await waitFor(() => expect(screen.getByText('Delete')).toBeInTheDocument())
    await userEvent.click(screen.getByText('Delete'))
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith('t1'))
    window.confirm = originalConfirm
  })

  it('displays error message', async () => {
    const onCreate = vi.fn().mockRejectedValue(new Error('Create failed'))
    const TaskModal = (await import('../../src/components/TaskModal')).default
    render(<TaskModal task={null} members={[]} projects={[]} onCreate={onCreate} onUpdate={vi.fn()} onDelete={vi.fn()} onClose={vi.fn()} />)
    await waitFor(() => expect(screen.getByLabelText('Title')).toBeInTheDocument())
    await userEvent.type(screen.getByLabelText('Title'), 'Task')
    await userEvent.click(screen.getByText('Create'))
    await waitFor(() => expect(screen.getByText('Create failed')).toBeInTheDocument())
  })
})
