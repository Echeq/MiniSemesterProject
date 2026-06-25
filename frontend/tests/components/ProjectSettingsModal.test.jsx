import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => ({
      'project.settingsTitle': 'Project settings', 'project.name': 'Name', 'project.description': 'Description',
      'project.color': 'Color', 'project.icon': 'Icon', 'project.save': 'Save', 'project.cancel': 'Cancel',
    }[key] ?? key),
  }),
}))

const mockProject = { id: 'p1', name: 'Test Project', description: 'A test', color: '#6366f1', icon: 'project' }

describe('ProjectSettingsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders project settings form', async () => {
    const ProjectSettingsModal = (await import('../../src/components/ProjectSettingsModal')).default
    render(<ProjectSettingsModal project={mockProject} onUpdate={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('Project settings')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument()
    expect(screen.getByDisplayValue('A test')).toBeInTheDocument()
  })

  it('calls onUpdate with modified fields', async () => {
    const onUpdate = vi.fn().mockResolvedValue()
    const onClose = vi.fn()
    const ProjectSettingsModal = (await import('../../src/components/ProjectSettingsModal')).default
    render(<ProjectSettingsModal project={mockProject} onUpdate={onUpdate} onClose={onClose} />)

    const nameInput = screen.getByDisplayValue('Test Project')
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Renamed Project')

    await userEvent.click(screen.getByText('Save'))
    expect(onUpdate).toHaveBeenCalledWith('p1', expect.objectContaining({ name: 'Renamed Project' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('does not call onUpdate with empty name', async () => {
    const onUpdate = vi.fn()
    const ProjectSettingsModal = (await import('../../src/components/ProjectSettingsModal')).default
    render(<ProjectSettingsModal project={mockProject} onUpdate={onUpdate} onClose={vi.fn()} />)

    const nameInput = screen.getByDisplayValue('Test Project')
    await userEvent.clear(nameInput)

    await userEvent.click(screen.getByText('Save'))
    expect(onUpdate).not.toHaveBeenCalled()
  })

  it('renders cancel button and calls onClose', async () => {
    const onClose = vi.fn()
    const ProjectSettingsModal = (await import('../../src/components/ProjectSettingsModal')).default
    render(<ProjectSettingsModal project={mockProject} onUpdate={vi.fn()} onClose={onClose} />)
    await userEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })
})
