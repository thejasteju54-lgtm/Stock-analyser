import React from 'react';

export interface BadgeProps {
  variant?: 'bullish' | 'bearish' | 'warning' | 'cyan' | 'indigo' | 'neutral';
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  id?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  icon,
  className = '',
  id,
}) => {
  return (
    <span className={`terminal-badge badge-${variant} ${className}`} id={id}>
      {icon && <span className="badge-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </span>
  );
};
