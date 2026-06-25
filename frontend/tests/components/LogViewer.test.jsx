import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockRpc = vi.fn()
vi.mock('../../src/api/supabaseClient', () => ({
  supabase: { rpc: mockRpc },
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => ({ 'admin.allActions': 'All actions', 'log.loading': 'Loading…', 'log.noLogs': 'No logs found.', 'log.by': 'by' }[key] || key), i18n: { language: 'en' } }),
}))

describe('LogViewer', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders action filter select', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    const LogViewer = (await import('../../src/components/LogViewer')).default
    render(<LogViewer />)
    const found = await screen.findByText('All actions')
    expect(found).toBeInTheDocument()
  })

  it('calls get_logs RPC on mount', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    const LogViewer = (await import('../../src/components/LogViewer')).default
    render(<LogViewer />)
    await screen.findByText('All actions')
    expect(mockRpc).toHaveBeenCalledWith('get_logs', expect.any(Object))
  })

  it('shows no logs message when empty', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    const LogViewer = (await import('../../src/components/LogViewer')).default
    render(<LogViewer />)
    const notFound = await screen.findByText('No logs found.')
    expect(notFound).toBeInTheDocument()
  })
})
