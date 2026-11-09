import React from 'react';

/**
 * SquareDot — Universal Vegetarian / Dietary Symbol Icon
 * A square with a centered dot, used to indicate dietary type.
 */
export const SquareDot: React.FC<{ color: string; className?: string }> = ({
  color,
  className = 'size-3.5',
}) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" className={`${className} shrink-0`}>
    <rect width="18" height="18" x="3" y="3" rx="3" stroke={color} />
    <circle cx="12" cy="12" r="3" fill={color} stroke="none" />
  </svg>
);
