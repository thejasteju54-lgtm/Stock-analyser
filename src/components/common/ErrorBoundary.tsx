import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Terminal Boundary Caught Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ padding: '24px', maxWidth: '640px', margin: '40px auto' }}>
          <Card
            title="Terminal Runtime Error"
            subtitle="An unexpected runtime issue occurred while rendering this module."
            icon={<AlertTriangle size={16} color="var(--color-bearish)" />}
            action={
              <Button size="sm" variant="primary" onClick={this.handleReset} icon={<RefreshCw size={12} />}>
                Reset Component
              </Button>
            }
          >
            <div
              style={{
                background: 'var(--color-bearish-bg)',
                border: '1px solid var(--color-bearish-border)',
                borderRadius: '4px',
                padding: '12px 14px',
                color: 'var(--color-bearish)',
                fontSize: '12px',
                marginBottom: '12px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <strong>Error Diagnostic:</strong> {this.state.error?.message || 'An unexpected error occurred in the terminal view.'}
            </div>
            <pre
              style={{
                background: '#f8fafc',
                padding: '12px',
                borderRadius: '4px',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                overflowX: 'auto',
                border: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-mono)',
                maxHeight: '180px',
              }}
            >
              {this.state.errorInfo?.componentStack || this.state.error?.stack}
            </pre>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
