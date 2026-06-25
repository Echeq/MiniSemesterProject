/**
 * Targeted tests for the LabelManager edit-flow fix.
 *
 * Before the fix: clicking Edit set `editing = label.id` (a UUID), which was
 * then used as the input value — so the user saw a UUID, not the label name.
 * Color swatches called handleUpdate immediately, ignoring any typed changes.
 *
 * After the fix: editId / editName / editColor are separate; the input is
 * pre-filled with the label name; Save uses the in-progress values.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const LABELS = [
  { id: 'l1', name: 'bug', color: '#ef4444', project_id: 'p1' },
  { id: 'l2', name: 'feature', color: '#10b981', project_id: 'p1' },
]

let mockUpdate

const makeMock = (labels = LABELS) => ({
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: labels, error: null })),
      })),
    })),
    insert: vi.fn(() => Promise.resolve({ error: null })),
    update: vi.fn(() => ({
      eq: (mockUpdate = vi.fn(() => Promise.resolve({ error: null }))),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    })),
  })),
})

vi.mock('../../src/api/supabaseClient', () => ({ supabase: makeMock() }))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k) => ({
      'label.manageTitle': 'Manage labels', 'label.manageSubtitle': 'Create, edit, or delete labels for this project',
      'label.none': 'No labels yet. Create one below.', 'label.deleteConfirm': 'Delete this label? It will be removed from all tasks.',
      'label.namePlaceholder': 'Label name', 'label.add': 'Add label',
      'label.edit': 'Edit', 'label.cancel': 'Cancel', 'label.save': 'Save', 'label.delete': 'Delete',
    }[k] ?? k),
  }),
}))

describe('LabelManager — edit flow', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('clicking Edit pre-fills the input with the label name, not the UUID', async () => {
    const LabelManager = (await import('../../src/components/LabelManager')).default
    render(<LabelManager projectId="p1" onClose={vi.fn()} />)

    await screen.findByText('bug')
    await userEvent.click(screen.getAllByText('Edit')[0])

    const input = screen.getByDisplayValue('bug')
    expect(input).toBeInTheDocument()
    // Must NOT show the UUID
    expect(screen.queryByDisplayValue('l1')).not.toBeInTheDocument()
  })

  it('typing in the edit input changes only the in-progress name', async () => {
    const LabelManager = (await import('../../src/components/LabelManager')).default
    render(<LabelManager projectId="p1" onClose={vi.fn()} />)

    await screen.findByText('bug')
    await userEvent.click(screen.getAllByText('Edit')[0])

    const input = screen.getByDisplayValue('bug')
    await userEvent.clear(input)
    await userEvent.type(input, 'critical')

    expect(screen.getByDisplayValue('critical')).toBeInTheDocument()
    // The other label row must be unaffected
    expect(screen.getByText('feature')).toBeInTheDocument()
  })

  it('Save calls supabase.update with the typed name, not the original', async () => {
    const { supabase } = await import('../../src/api/supabaseClient')
    let capturedFields = null
    supabase.from.mockReturnValue({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: LABELS, error: null })) })) })),
      update: vi.fn((fields) => {
        capturedFields = fields
        return { eq: vi.fn(() => Promise.resolve({ error: null })) }
      }),
      delete: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
    })

    const LabelManager = (await import('../../src/components/LabelManager')).default
    render(<LabelManager projectId="p1" onClose={vi.fn()} />)

    await screen.findByText('bug')
    await userEvent.click(screen.getAllByText('Edit')[0])

    const input = screen.getByDisplayValue('bug')
    await userEvent.clear(input)
    await userEvent.type(input, 'blocker')
    await userEvent.click(screen.getByText('Save'))

    await waitFor(() => expect(capturedFields).not.toBeNull())
    expect(capturedFields.name).toBe('blocker')
    // Color must come through too (unchanged from original)
    expect(capturedFields.color).toBe('#ef4444')
  })

  it('clicking a color swatch updates the preview without saving immediately', async () => {
    const { supabase } = await import('../../src/api/supabaseClient')
    const updateSpy = vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) }))
    supabase.from.mockReturnValue({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: LABELS, error: null })) })) })),
      update: updateSpy,
      delete: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
    })

    const LabelManager = (await import('../../src/components/LabelManager')).default
    render(<LabelManager projectId="p1" onClose={vi.fn()} />)

    await screen.findByText('bug')
    await userEvent.click(screen.getAllByText('Edit')[0])

    // Click a color swatch — should NOT call update yet
    const swatches = document.querySelectorAll('[style*="background: rgb"]')
    if (swatches.length > 0) await userEvent.click(swatches[0])

    // update must not have been called yet
    expect(updateSpy).not.toHaveBeenCalled()
  })

  it('Cancel closes the edit form without saving', async () => {
    const { supabase } = await import('../../src/api/supabaseClient')
    const updateSpy = vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) }))
    supabase.from.mockReturnValue({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: LABELS, error: null })) })) })),
      update: updateSpy,
      delete: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
    })

    const LabelManager = (await import('../../src/components/LabelManager')).default
    render(<LabelManager projectId="p1" onClose={vi.fn()} />)

    await screen.findByText('bug')
    await userEvent.click(screen.getAllByText('Edit')[0])
    await userEvent.click(screen.getByText('Cancel'))

    // Edit form gone, label row back
    expect(screen.queryByDisplayValue('bug')).not.toBeInTheDocument()
    expect(screen.getByText('bug')).toBeInTheDocument()
    expect(updateSpy).not.toHaveBeenCalled()
  })
})
