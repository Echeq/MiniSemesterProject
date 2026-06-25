import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockRpc = vi.fn()
vi.mock('../../src/api/supabaseClient', () => ({
  supabase: { rpc: mockRpc },
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => ({ 'backup.download': 'Download backup (.json)', 'backup.description': 'Download all project data as JSON.', 'backup.exporting': 'Exporting…' }[key] || key) }),
}))

describe('BackupPanel', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders download button', async () => {
    const BackupPanel = (await import('../../src/components/BackupPanel')).default
    render(<BackupPanel />)
    expect(screen.getByText('Download backup (.json)')).toBeInTheDocument()
  })

  it('calls export_all_data RPC on click', async () => {
    mockRpc.mockResolvedValue({ data: { projects: [], tasks: [] }, error: null })
    const BackupPanel = (await import('../../src/components/BackupPanel')).default
    render(<BackupPanel />)
    const linkCreate = vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() })
    URL.createObjectURL = vi.fn(() => 'blob:url')
    URL.revokeObjectURL = vi.fn()
    await userEvent.click(screen.getByText('Download backup (.json)'))
    expect(mockRpc).toHaveBeenCalledWith('export_all_data')
    linkCreate.mockRestore()
  })
})
