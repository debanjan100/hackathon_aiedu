import React from 'react';

/**
 * DashboardErrorBoundary — catches any render-time JS error
 * in the Dashboard and its children and shows a friendly UI
 * instead of a blank white screen.
 */
class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log for debugging — remove in production
    if (import.meta.env.DEV) {
      console.error('[DashboardErrorBoundary] caught:', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '40px 20px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: 'var(--on-surface)', fontWeight: 800, margin: '0 0 10px' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--on-surface-muted)', maxWidth: 420, marginBottom: 24 }}>
            A component on this page encountered an error. Your account data is safe.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10, padding: '12px 16px', fontSize: 11, color: '#ef4444',
              maxWidth: 600, overflowX: 'auto', marginBottom: 20, textAlign: 'left',
            }}>
              {this.state.error.toString()}
            </pre>
          )}
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{
              background: 'var(--primary)', color: '#002022', border: 'none',
              borderRadius: 9999, padding: '10px 28px', fontWeight: 700,
              fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default DashboardErrorBoundary;
