import React from 'react';
import { CheckCircle2, GitCommit, Clock, AlertTriangle, HelpCircle, Slash, Calculator } from 'lucide-react';

export type DataReliabilityStatus =
  | 'VERIFIED'
  | 'DERIVED'
  | 'ESTIMATED'
  | 'STALE'
  | 'CONFLICT'
  | 'NOT_ASSESSABLE'
  | 'UNAVAILABLE';

export interface StatusBadgeProps {
  status: DataReliabilityStatus | string;
  label?: string;
  className?: string;
  id?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className = '',
  id,
}) => {
  const normStatus = (status || 'UNAVAILABLE').toUpperCase() as DataReliabilityStatus;

  let icon: React.ReactNode = <HelpCircle size={11} />;
  let cssClass = 'status-not-assessable';
  let defaultLabel = normStatus.replace(/_/g, ' ');

  switch (normStatus) {
    case 'VERIFIED':
      icon = <CheckCircle2 size={11} />;
      cssClass = 'status-verified';
      defaultLabel = 'Verified';
      break;
    case 'DERIVED':
      icon = <Calculator size={11} />;
      cssClass = 'status-derived';
      defaultLabel = 'Derived';
      break;
    case 'ESTIMATED':
      icon = <GitCommit size={11} />;
      cssClass = 'status-estimated';
      defaultLabel = 'Estimated';
      break;
    case 'STALE':
      icon = <Clock size={11} />;
      cssClass = 'status-stale';
      defaultLabel = 'Stale Data';
      break;
    case 'CONFLICT':
      icon = <AlertTriangle size={11} />;
      cssClass = 'status-conflict';
      defaultLabel = 'Conflict';
      break;
    case 'NOT_ASSESSABLE':
      icon = <HelpCircle size={11} />;
      cssClass = 'status-not-assessable';
      defaultLabel = 'Not Assessable';
      break;
    case 'UNAVAILABLE':
    default:
      icon = <Slash size={11} />;
      cssClass = 'status-not-assessable';
      defaultLabel = 'Unavailable';
      break;
  }

  return (
    <span className={`terminal-badge ${cssClass} ${className}`} id={id}>
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>
      <span>{label || defaultLabel}</span>
    </span>
  );
};
