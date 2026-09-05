import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <div className="mb-2 text-base font-medium text-ink-text">Something broke on this screen</div>
          <p className="max-w-xs text-xs text-ink-muted">{this.state.error.message}</p>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-5 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-ink-bg"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
