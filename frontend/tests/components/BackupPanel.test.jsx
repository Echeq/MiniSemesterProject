import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}))

const mockSupabase = {
  rpc: vi.fn().mockResolvedValue({ data: { projects: [], tasks: [], labels: [], members: [] }, error: null }),
}
vi.mock('../../src/api/supabaseClient', () => ({ supabase: mockSupabase }))

describe('BackupPanel', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders export button', async () => {
    const BackupPanel = (await import('../../src/components/BackupPanel')).default
    render(<BackupPanel />)
    expect(screen.getByText('Download backup (.json)')).toBeInTheDocument()
  })

  it('calls export_all_data RPC on click', async () => {
    const BackupPanel = (await import('../../src/components/BackupPanel')).default
    render(<BackupPanel />)
    const linkCreate = vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() })
    URL.createObjectURL = vi.fn(() => 'blob:url')
    URL.revokeObjectURL = vi.fn()
    await userEvent.click(screen.getByText('Download backup (.json)'))
    expect(mockSupabase.rpc).toHaveBeenCalledWith('export_all_data')
    linkCreate.mockRestore()
  })
})
