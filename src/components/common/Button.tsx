import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}) => {
  let variantClass = '';
  if (variant === 'primary') variantClass = 'terminal-btn-primary';
  else if (variant === 'secondary') variantClass = 'terminal-btn-secondary';
  else if (variant === 'danger') variantClass = 'terminal-btn-danger';

  const sizeClass = size === 'sm' ? 'terminal-btn-sm' : '';

  return (
    <button
      className={`terminal-btn ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {icon && <span className="btn-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </button>
  );
};
