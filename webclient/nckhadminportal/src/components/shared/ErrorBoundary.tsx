import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import HttpErrorPage, { HttpErrorCode } from '@/components/shared/HttpErrorPage'

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode | ((error: Error | null, reset: () => void) => ReactNode)
  /** If true, error renders cleanly within the current layout (e.g. keeping sidebar & header intact) */
  inLayout?: boolean
  /** Keys that trigger an automatic error boundary reset when changed (e.g. location.pathname) */
  resetKeys?: unknown[]
  /** Callback fired when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /** Callback fired when the error boundary is reset */
  onReset?: () => void
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

// ─── ErrorBoundary Class Component ───────────────────────────────────────────

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    console.error('ErrorBoundary caught a frontend application error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // If resetKeys changed (e.g. user clicked another route/page), auto-reset error state
    if (this.state.hasError && this.props.resetKeys && prevProps.resetKeys) {
      const hasChanged = this.props.resetKeys.some(
        (key, idx) => key !== prevProps.resetKeys?.[idx]
      )
      if (hasChanged) {
        this.handleReset()
      }
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
    this.props.onReset?.()
  }

  handleHardReload = () => {
    window.location.reload()
  }

  private resolveErrorCode(): HttpErrorCode {
    const error = this.state.error as any
    if (!error) return 'app'

    const status = error.status || error.response?.status
    if (status === 404) return 404
    if (status === 403) return 403
    if (status === 401) return 401
    if (status === 500) return 500
    if (status === 502) return 502
    if (status === 503) return 503
    if (status === 504) return 504
    if (status === 408) return 408
    if (status === 429) return 429
    if (status === 0 || error.isNetworkError) return 'offline'

    return 'app'
  }

  render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error, this.handleReset)
      }
      if (this.props.fallback) {
        return this.props.fallback
      }

      const code = this.resolveErrorCode()

      // Render accurate HTTP Status Error page preserving real status code
      return (
        <HttpErrorPage
          code={code}
          title={this.state.error?.message}
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          fullPage={!this.props.inLayout}
          showRetryButton
          showHomeButton
          showBackButton
          showContactButton
          onRetry={this.handleReset}
        />
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
