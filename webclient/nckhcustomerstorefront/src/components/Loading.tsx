import React from 'react';
import { OrbitProgress, ThreeDot } from 'react-loading-indicators';

export default function Loading({
  label = 'Loading...',
  white = false,
  color = '#4f46e5',
}: {
  label?: string;
  white?: boolean;
  color?: string;
} = {}) {
  return (
    <div className={`flex flex-col items-center justify-center py-20 ${white ? 'bg-white' : ''}`}>
      <OrbitProgress color={color} size="medium" variant="track-disc" />
      {label && <p className="text-gray-500 text-xs font-medium mt-4 tracking-wide">{label}</p>}
    </div>
  );
}

export function Spinner({ small = false, color = '#ffffff' }: { small?: boolean; color?: string } = {}) {
  return (
    <ThreeDot color={color} size={small ? 'small' : 'medium'} variant="pulsate" />
  );
}
