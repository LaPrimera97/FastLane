import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) {
      return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24, color: '#fff' }}>
          <div>
            <h1>Something went wrong</h1>
            <p>Please refresh the page.</p>
            <button className="btn" onClick={() => window.location.reload()}>Refresh</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
