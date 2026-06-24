import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const Throws = () => { throw new Error('Boom!') }

describe('ErrorBoundary', () => {
  it('renders children when no error', async () => {
    const ErrorBoundary = (await import('../../src/components/ErrorBoundary')).default
    render(<ErrorBoundary><p>All good</p></ErrorBoundary>)
    expect(screen.getByText('All good')).toBeInTheDocument()
  })

  it('renders fallback UI on error', async () => {
    const ErrorBoundary = (await import('../../src/components/ErrorBoundary')).default
    // Suppress console.error from React for this intentional error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ErrorBoundary><Throws /></ErrorBoundary>)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Try again')).toBeInTheDocument()
    spy.mockRestore()
  })

  it('renders custom message on error', async () => {
    const ErrorBoundary = (await import('../../src/components/ErrorBoundary')).default
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ErrorBoundary message="Custom error"><Throws /></ErrorBoundary>)
    expect(screen.getByText('Custom error')).toBeInTheDocument()
    spy.mockRestore()
  })

  it('uses custom fallback render prop', async () => {
    const ErrorBoundary = (await import('../../src/components/ErrorBoundary')).default
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const fallback = vi.fn(() => <p>Custom fallback</p>)
    render(<ErrorBoundary fallback={fallback}><Throws /></ErrorBoundary>)
    expect(screen.getByText('Custom fallback')).toBeInTheDocument()
    expect(fallback).toHaveBeenCalled()
    spy.mockRestore()
  })
})
