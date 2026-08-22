import React from 'react';
import { Inbox, ArrowRight } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  reason?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  id?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  reason,
  icon = <Inbox size={32} color="var(--brand-blue)" />,
  actionLabel,
  onAction,
  actionIcon = <ArrowRight size={13} />,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
  id,
}) => {
  return (
    <div
      className={`terminal-card-secondary ${className}`}
      id={id}
      style={{
        padding: '36px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '12px',
        maxWidth: '560px',
        margin: '20px auto',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--brand-blue-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '4px',
        }}
      >
        {icon}
      </div>

      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brand-navy)', margin: 0 }}>
        {title}
      </h3>

      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '420px', margin: 0 }}>
        {description}
      </p>

      {reason && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
            padding: '8px 14px',
            fontSize: '11px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            marginTop: '4px',
          }}
        >
          <strong>Status Reason:</strong> {reason}
        </div>
      )}

      {(actionLabel || secondaryActionLabel) && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          {secondaryActionLabel && (
            <Button size="sm" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
          {actionLabel && (
            <Button variant="primary" size="sm" icon={actionIcon} onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
