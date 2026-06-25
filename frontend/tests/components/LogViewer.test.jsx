import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}))

const mockSupabase = {
  rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
}
vi.mock('../../src/api/supabaseClient', () => ({ supabase: mockSupabase }))

describe('LogViewer', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders action filter select', async () => {
    const LogViewer = (await import('../../src/components/LogViewer')).default
    render(<LogViewer />)
    expect(screen.getByText('All actions')).toBeInTheDocument()
  })

  it('renders date filter input', async () => {
    const LogViewer = (await import('../../src/components/LogViewer')).default
    render(<LogViewer />)
    expect(screen.getByTitle('Filter by date')).toBeInTheDocument()
  })

  it('calls get_logs RPC on mount', async () => {
    const LogViewer = (await import('../../src/components/LogViewer')).default
    render(<LogViewer />)
    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_logs', expect.any(Object))
  })

  it('shows no logs message when empty', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: [], error: null })
    const LogViewer = (await import('../../src/components/LogViewer')).default
    render(<LogViewer />)
    const notFound = await screen.findByText('No logs found.')
    expect(notFound).toBeInTheDocument()
  })

  it('renders log entries', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: [{ id: 'l1', action: 'task_created', target_type: 'tasks', created_at: '2026-06-25T00:00:00Z', user_display_name: 'Alice', metadata: {} }],
      error: null,
    })
    const LogViewer = (await import('../../src/components/LogViewer')).default
    render(<LogViewer />)
    const actionLabel = await screen.findByText('Created task')
    expect(actionLabel).toBeInTheDocument()
  })
})
