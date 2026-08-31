import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
          <div className="bg-rose-50 text-rose-700 p-6 rounded-xl border border-rose-100 max-w-lg w-full">
            <h2 className="text-lg font-bold mb-2">Something went wrong.</h2>
            <p className="text-sm mb-4">We are sorry, an unexpected error has occurred.</p>
            <div className="bg-white p-3 rounded text-left text-xs text-slate-800 overflow-auto border border-rose-200">
              {this.state.error?.message}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
