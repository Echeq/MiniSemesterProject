import { Component } from 'react'

const FALLBACK_ICON =
  'M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0M9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback(this.state.error, () => this.setState({ error: null }))
      return (
        <div className="flex min-h-full items-center justify-center px-4">
          <div className="glass-strong w-full max-w-md rounded-2xl p-8 text-center shadow-[var(--shadow-md)]">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ color: 'var(--danger)', background: 'color-mix(in srgb, var(--danger) 16%, transparent)' }}>
              <svg className="h-6 w-6" viewBox="0 0 16 16" fill="currentColor"><path d={FALLBACK_ICON} /></svg>
            </span>
            <h2 className="mt-4 text-lg font-semibold">Something went wrong</h2>
            <p className="mt-1 text-sm text-[var(--fg-muted)]">{this.props.message || 'An unexpected error occurred. Please try refreshing the page.'}</p>
            <button
              onClick={() => this.setState({ error: null })}
              className="mt-5 rounded-lg px-4 py-2 text-sm font-medium text-white transition"
              style={{ background: 'var(--accent)' }}
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
