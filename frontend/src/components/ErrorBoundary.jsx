import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Captured error in ErrorBoundary:', error, info);
    this.setState({ error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 30 }}>
          <div className="alert alert-danger">
            <h4 className="alert-heading">Application Error</h4>
            <p>Something went wrong while rendering the app — the error is displayed below.</p>
            <hr />
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>
              {String(this.state.error && this.state.error.toString())}
              {this.state.info && this.state.info.componentStack}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
