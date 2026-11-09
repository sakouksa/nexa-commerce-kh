import React, { useState } from 'react';
import defaultLogo from '../../assets/logo.png';

export interface MiniStoreLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  title?: string;
  subtitle?: string;
  badge?: string;
  textColor?: string;
  color?: string;
  imageSrc?: string;
  onClick?: () => void;
}

const sizeConfig = {
  xs: {
    iconSize: 'size-6',
    titleSize: 'text-xs font-semibold',
    subSize: 'text-[9px]',
    badgeSize: 'text-[9px] px-1 py-0.2',
    gap: 'gap-2',
  },
  sm: {
    iconSize: 'size-8',
    titleSize: 'text-sm font-semibold',
    subSize: 'text-[11px]',
    badgeSize: 'text-[10px] px-1.5 py-0.5',
    gap: 'gap-2.5',
  },
  md: {
    iconSize: 'size-9',
    titleSize: 'text-base font-bold',
    subSize: 'text-xs',
    badgeSize: 'text-[10px] px-1.5 py-0.5',
    gap: 'gap-2.5',
  },
  lg: {
    iconSize: 'size-11',
    titleSize: 'text-lg font-bold',
    subSize: 'text-xs',
    badgeSize: 'text-xs px-2 py-0.5',
    gap: 'gap-3',
  },
  xl: {
    iconSize: 'size-14',
    titleSize: 'text-2xl font-bold',
    subSize: 'text-sm',
    badgeSize: 'text-xs px-2 py-1',
    gap: 'gap-3.5',
  },
};

export const MiniStoreLogo: React.FC<MiniStoreLogoProps> = ({
  className = '',
  size = 'sm',
  showText = false,
  title = 'MiniStore KH',
  subtitle,
  badge = 'Admin',
  textColor,
  color = '#0284c7',
  imageSrc,
  onClick,
}) => {
  const [imgError, setImgError] = useState(false);
  const cfg = sizeConfig[size] || sizeConfig.sm;
  const headingColor = textColor || 'text-slate-900 dark:text-white';
  const logoSrc = imageSrc || defaultLogo;

  const renderIcon = () => {
    if (!imgError && logoSrc) {
      return (
        <div
          className={`relative ${cfg.iconSize} shrink-0 transition-transform duration-200 group-hover:scale-105 select-none`}
        >
          <img
            src={logoSrc}
            alt={title}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain rounded-full shadow-2xs ring-1 ring-border/60 bg-white"
          />
        </div>
      );
    }

    return (
      <div
        className={`relative ${cfg.iconSize} shrink-0 transition-transform duration-200 group-hover:scale-105 select-none`}
      >
        <svg
          viewBox="0 0 328 329"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect y="0.5" width="328" height="328" rx="164" fill={color} />
          <path
            d="M165.018 72.3008V132.771C165.018 152.653 148.9 168.771 129.018 168.771H70.2288"
            stroke="white"
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M166.627 265.241L166.627 204.771C166.627 184.889 182.744 168.771 202.627 168.771L261.416 168.771"
            stroke="white"
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="238.136"
            y1="98.8184"
            x2="196.76"
            y2="139.707"
            stroke="white"
            strokeWidth="22"
            strokeLinecap="round"
          />
          <line
            x1="135.688"
            y1="200.957"
            x2="94.3128"
            y2="241.845"
            stroke="white"
            strokeWidth="22"
            strokeLinecap="round"
          />
          <line
            x1="133.689"
            y1="137.524"
            x2="92.5566"
            y2="96.3914"
            stroke="white"
            strokeWidth="22"
            strokeLinecap="round"
          />
          <line
            x1="237.679"
            y1="241.803"
            x2="196.547"
            y2="200.671"
            stroke="white"
            strokeWidth="22"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  };

  if (!showText) {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center group cursor-pointer ${className}`}
      >
        {renderIcon()}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center ${cfg.gap} group cursor-pointer ${className}`}
    >
      {renderIcon()}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`tracking-tight ${headingColor} ${cfg.titleSize}`}>
            {title}
          </span>
          {badge && (
            <span
              className={`uppercase font-bold tracking-wider bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/25 rounded ${cfg.badgeSize}`}
            >
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <span className={`text-slate-500 dark:text-slate-400 font-medium mt-1 truncate ${cfg.subSize}`}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default MiniStoreLogo;
