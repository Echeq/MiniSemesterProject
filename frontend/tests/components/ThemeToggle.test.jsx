import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}))

describe('ThemeToggle', () => {
  it('renders light mode button', async () => {
    const ThemeToggle = (await import('../../src/components/ThemeToggle')).default
    render(<ThemeToggle theme="light" onToggle={vi.fn()} />)
    expect(screen.getByTitle('theme.switchToDark')).toBeInTheDocument()
  })

  it('renders dark mode button', async () => {
    const ThemeToggle = (await import('../../src/components/ThemeToggle')).default
    render(<ThemeToggle theme="dark" onToggle={vi.fn()} />)
    expect(screen.getByTitle('theme.switchToLight')).toBeInTheDocument()
  })

  it('calls onToggle on click', async () => {
    const onToggle = vi.fn()
    const ThemeToggle = (await import('../../src/components/ThemeToggle')).default
    render(<ThemeToggle theme="light" onToggle={onToggle} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledOnce()
  })
})
