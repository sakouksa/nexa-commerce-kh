import React from 'react';
import {
  OrbitProgress,
  Commet,
  ThreeDot,
  Atom,
  Mosaic,
  FourSquare,
  Riple,
  BlinkBlur,
  LifeLine,
} from 'react-loading-indicators';

export type IndicatorType =
  | 'orbit'
  | 'commet'
  | 'three-dot'
  | 'atom'
  | 'mosaic'
  | 'foursquare'
  | 'riple'
  | 'blink'
  | 'lifeline';

export interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg' | 'small' | 'medium' | 'large';
  color?: string | string[];
  textColor?: string;
  type?: IndicatorType;
  fullPage?: boolean;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text,
  size = 'medium',
  color = ['#ea580c', '#f97316', '#fb923c', '#c2410c'],
  textColor = '#64748b',
  type = 'orbit',
  fullPage = false,
  className = '',
}) => {
  // Normalize size for react-loading-indicators ("small" | "medium" | "large")
  const normalizedSize: 'small' | 'medium' | 'large' =
    size === 'sm' || size === 'small'
      ? 'small'
      : size === 'lg' || size === 'large'
      ? 'large'
      : 'medium';

  const renderIndicator = () => {
    switch (type) {
      case 'commet':
        return <Commet color={color} size={normalizedSize} />;
      case 'three-dot':
        return <ThreeDot color={color} size={normalizedSize} variant="pulsate" />;
      case 'atom':
        return <Atom color={color} size={normalizedSize} />;
      case 'mosaic':
        return <Mosaic color={color} size={normalizedSize} />;
      case 'foursquare':
        return <FourSquare color={color} size={normalizedSize} />;
      case 'riple':
        return <Riple color={color} size={normalizedSize} />;
      case 'blink':
        return <BlinkBlur color={color} size={normalizedSize} />;
      case 'lifeline':
        return <LifeLine color={color} size={normalizedSize} />;
      case 'orbit':
      default:
        return (
          <OrbitProgress
            color={color}
            size={normalizedSize}
            variant="track-disc"
            dense={false}
          />
        );
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center py-10 gap-3.5 select-none ${className}`}>
      <div className="transition-transform duration-300 hover:scale-105">
        {renderIndicator()}
      </div>
      {text && (
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
