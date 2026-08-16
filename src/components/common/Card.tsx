import React from 'react';

export interface CardProps {
  title?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  icon,
  action,
  children,
  className = '',
  id,
}) => {
  return (
    <div className={`terminal-card ${className}`} id={id}>
      {title && (
        <div className="terminal-card-header">
          <div className="terminal-card-title">
            {icon && <span className="card-icon">{icon}</span>}
            <span>{title}</span>
          </div>
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      <div className="terminal-card-body">{children}</div>
    </div>
  );
};
