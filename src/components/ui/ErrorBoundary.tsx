import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  reset = () => this.setState({ hasError: false, error: null })

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#080C18' }}>
          <div className="text-center max-w-md">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(255,107,122,0.1)', border: '1px solid rgba(255,107,122,0.2)' }}
            >
              <AlertTriangle size={28} style={{ color: '#FF6B7A' }} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 font-display">Something went wrong</h2>
            <p className="text-sm text-white/40 mb-6 leading-relaxed">
              {this.state.error?.message || 'An unexpected error occurred. Please refresh the page.'}
            </p>
            <button
              onClick={this.reset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: 'rgba(77,124,255,0.15)', border: '1px solid rgba(77,124,255,0.3)' }}
            >
              <RefreshCw size={15} /> Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
