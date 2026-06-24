import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EmptyState from '../../src/components/EmptyState'

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No tasks" description="This view is empty." />)
    expect(screen.getByText('No tasks')).toBeInTheDocument()
    expect(screen.getByText('This view is empty.')).toBeInTheDocument()
  })

  it('renders action when provided', () => {
    render(<EmptyState title="No projects" action={<button>Create</button>} />)
    expect(screen.getByText('Create')).toBeInTheDocument()
  })

  it('renders with icon', () => {
    const { container } = render(<EmptyState icon="project" title="Test" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders nothing when title and description are omitted', () => {
    const { container } = render(<EmptyState />)
    expect(container.querySelector('h3')).not.toBeInTheDocument()
  })
})
