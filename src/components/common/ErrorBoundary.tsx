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
        <div style={{ padding: '24px', maxWidth: '600px', margin: '40px auto' }}>
          <Card
            title="Terminal Runtime Error"
            icon={<AlertTriangle size={16} color="#ef4444" />}
            action={
              <Button size="sm" onClick={this.handleReset} icon={<RefreshCw size={12} />}>
                Reset Component
              </Button>
            }
          >
            <div style={{ color: '#f87171', fontSize: '12px', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
              {this.state.error?.message || 'An unexpected error occurred in the terminal view.'}
            </div>
            <pre
              style={{
                background: 'var(--bg-surface-raised)',
                padding: '10px',
                borderRadius: '3px',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                overflowX: 'auto',
                border: '1px solid var(--border-subtle)',
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
