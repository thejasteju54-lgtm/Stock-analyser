import React from 'react';

export interface CardProps {
  type?: 'primary' | 'secondary';
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  statusBadge?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const Card: React.FC<CardProps> = ({
  type = 'primary',
  title,
  subtitle,
  icon,
  action,
  statusBadge,
  footer,
  children,
  className = '',
  id,
}) => {
  const cardClass = type === 'secondary' ? 'terminal-card-secondary' : 'terminal-card';

  return (
    <div className={`${cardClass} ${className}`} id={id}>
      {(title || action || statusBadge) && (
        <div className="terminal-card-header">
          <div>
            <div className="terminal-card-title">
              {icon && <span className="card-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
              <span>{title}</span>
              {statusBadge && <span style={{ marginLeft: '6px' }}>{statusBadge}</span>}
            </div>
            {subtitle && (
              <div className="terminal-card-subtitle">
                {subtitle}
              </div>
            )}
          </div>
          {action && <div className="card-action" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{action}</div>}
        </div>
      )}
      <div className="terminal-card-body">{children}</div>
      {footer && (
        <div
          className="terminal-card-footer"
          style={{
            marginTop: '14px',
            paddingTop: '10px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};
