import React from 'react';
import { Badge } from '../common/Badge';

export interface StatusBadgeProps {
  status: string | undefined | null;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const norm = (status || 'unknown').toLowerCase();

  switch (norm) {
    case 'active':
    case 'completed':
    case 'paid':
      return <Badge variant="success">{status || 'Active'}</Badge>;
    case 'pending':
    case 'trial':
      return <Badge variant="warning">{status || 'Pending'}</Badge>;
    case 'suspended':
    case 'expired':
    case 'failed':
    case 'cancelled':
      return <Badge variant="danger">{status || 'Suspended'}</Badge>;
    default:
      return <Badge variant="neutral">{status || 'Unknown'}</Badge>;
  }
};
export default StatusBadge;
