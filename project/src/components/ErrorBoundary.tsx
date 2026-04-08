import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  /** Full screen vs card inside main content */
  variant?: 'fullscreen' | 'inline';
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message || 'Something went wrong.' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Norix ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const inline = this.props.variant === 'inline';
      return (
        <div
          className={
            inline
              ? 'flex flex-col items-stretch gap-3 rounded-2xl border border-red-500/35 bg-red-950/25 p-6 text-left text-slate-200'
              : 'min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-center text-slate-200'
          }
          role="alert"
        >
          <h2 className={inline ? 'text-lg font-bold text-white' : 'text-xl font-bold text-white'}>
            {this.props.fallbackTitle ?? 'This view crashed'}
          </h2>
          <p className={inline ? 'text-sm text-slate-400' : 'max-w-md text-sm text-slate-400'}>{this.state.message}</p>
          <button
            type="button"
            className={
              inline
                ? 'self-start rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-500'
                : 'rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500'
            }
            onClick={() => {
              this.setState({ hasError: false, message: '' });
              window.location.reload();
            }}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
