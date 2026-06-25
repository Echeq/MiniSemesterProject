import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => ({ 'export.button': 'Export', 'export.excel': 'Export Excel', 'export.pdf': 'Export PDF', 'export.csv': 'Export CSV' }[key] ?? key),
  }),
}))

const mockTasks = [
  { id: 't1', title: 'Task A', status: 'todo', priority: 'P1', due_date: '2026-07-01', assignee_profile: null },
  { id: 't2', title: 'Task B', status: 'done', priority: null, due_date: null, assignee_profile: { display_name: 'Alice' } },
]

describe('ExportMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    HTMLCanvasElement.prototype.getContext = vi.fn()
  })

  it('renders export button', async () => {
    const ExportMenu = (await import('../../src/components/ExportMenu')).default
    render(<ExportMenu tasks={mockTasks} />)
    expect(screen.getByText('Export')).toBeInTheDocument()
  })

  it('shows PDF and CSV options on click', async () => {
    const ExportMenu = (await import('../../src/components/ExportMenu')).default
    render(<ExportMenu tasks={mockTasks} />)
    await userEvent.click(screen.getByText('Export'))
    expect(screen.getByText('Export PDF')).toBeInTheDocument()
    expect(screen.getByText('Export CSV')).toBeInTheDocument()
  })

  it('closes menu when clicking CSV option', async () => {
    const ExportMenu = (await import('../../src/components/ExportMenu')).default
    render(<ExportMenu tasks={mockTasks} />)
    await userEvent.click(screen.getByText('Export'))
    // jsPDF is not available in test so PDF will throw, but CSV creates a blob
    const linkCreate = vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() })
    URL.createObjectURL = vi.fn(() => 'blob:url')
    URL.revokeObjectURL = vi.fn()
    await userEvent.click(screen.getByText('Export CSV'))
    expect(screen.queryByText('Export PDF')).not.toBeInTheDocument()
    linkCreate.mockRestore()
  })
})
