import React, { Component, ErrorInfo, ReactNode } from 'react';
import { GlassCard } from './glass/GlassCard';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-900 text-white">
          <GlassCard className="p-8 max-w-lg w-full">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h1>
            <p className="mb-4 text-gray-300">The application encountered a critical error.</p>
            
            <div className="bg-black/50 p-4 rounded-lg overflow-auto max-h-60 mb-4">
              <p className="font-mono text-xs text-red-300 break-all">
                {this.state.error && this.state.error.toString()}
              </p>
              {this.state.errorInfo && (
                <pre className="font-mono text-[10px] text-gray-500 mt-2">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Reload Application
            </button>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}
