import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-4">
            Something went wrong
          </h2>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-md mb-4">
            <p className="text-red-600 dark:text-red-400 font-mono text-sm">
              {this.state.error?.toString()}
            </p>
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-gray-700 dark:text-gray-300 mb-2">
              Error Details
            </summary>
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto text-xs font-mono text-gray-800 dark:text-gray-200">
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={() => window.location.reload()}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 