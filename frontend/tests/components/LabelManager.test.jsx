import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockLabels = [
  { id: 'l1', name: 'bug', color: '#ef4444', project_id: 'p1' },
  { id: 'l2', name: 'feature', color: '#10b981', project_id: 'p1' },
]

const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: mockLabels, error: null })),
      })),
      order: vi.fn(() => Promise.resolve({ data: mockLabels, error: null })),
    })),
    insert: vi.fn(() => Promise.resolve({ error: null })),
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    })),
  })),
}

vi.mock('../../src/api/supabaseClient', () => ({ supabase: mockSupabase }))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}))

describe('LabelManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders existing labels', async () => {
    const LabelManager = (await import('../../src/components/LabelManager')).default
    render(<LabelManager projectId="p1" onClose={vi.fn()} />)
    expect(await screen.findByText('bug')).toBeInTheDocument()
    expect(await screen.findByText('feature')).toBeInTheDocument()
  })

  it('shows empty state when no labels', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })
    const LabelManager = (await import('../../src/components/LabelManager')).default
    render(<LabelManager projectId="p1" onClose={vi.fn()} />)
    expect(await screen.findByText(/No labels yet/)).toBeInTheDocument()
  })

  it('renders add label form', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })
    const LabelManager = (await import('../../src/components/LabelManager')).default
    render(<LabelManager projectId="p1" onClose={vi.fn()} />)
    expect(await screen.findByPlaceholderText('Label name')).toBeInTheDocument()
    expect(await screen.findByText('Add label')).toBeInTheDocument()
  })
})
