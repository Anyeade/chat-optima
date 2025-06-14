'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="text-red-600 dark:text-red-400 text-center">
        <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
        <p className="text-sm mb-4">An error occurred while rendering this component.</p>
        <details className="text-xs bg-red-100 dark:bg-red-900/40 p-2 rounded mb-4">
          <summary className="cursor-pointer font-medium">Error details</summary>
          <pre className="mt-2 text-left whitespace-pre-wrap break-all">
            {error.message}
          </pre>
        </details>
        <button
          onClick={resetError}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// Tool-specific error fallback for search components
export function ToolErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="flex flex-col p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
      <div className="text-amber-700 dark:text-amber-300">
        <h4 className="font-medium mb-2">🔧 Tool Error</h4>
        <p className="text-sm mb-3">
          The search tool encountered an error. This might be due to:
        </p>
        <ul className="text-xs space-y-1 mb-3 list-disc list-inside">
          <li>API service temporarily unavailable</li>
          <li>Network connectivity issues</li>
          <li>Unexpected data format</li>
        </ul>
        <button
          onClick={resetError}
          className="px-3 py-1 bg-amber-600 text-white rounded text-sm hover:bg-amber-700 transition-colors"
        >
          Retry Search
        </button>
      </div>
    </div>
  );
}
