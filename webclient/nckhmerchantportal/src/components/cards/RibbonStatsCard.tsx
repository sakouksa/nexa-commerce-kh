import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { AnimatedCounter } from '../shared/AnimatedCounter';

// ─── Color & Variant Themes ───────────────────────────────────────────────────
export type RibbonStatsVariant =
  | 'emerald'
  | 'green'
  | 'pink'
  | 'rose'
  | 'magenta'
  | 'amber'
  | 'yellow'
  | 'orange'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'purple'
  | 'violet'
  | 'indigo'
  | 'danger'
  | 'red'
  | 'slate'
  | 'gray'
  | 'primary';

interface VariantTheme {
  gradient: string;
  iconText: string;
  hoverBorder: string;
  ring: string;
}

const VARIANT_THEMES: Record<RibbonStatsVariant, VariantTheme> = {
  emerald: {
    gradient: 'from-emerald-500 to-emerald-400 dark:from-emerald-600 dark:to-teal-500',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    hoverBorder: 'group-hover:border-emerald-500/40',
    ring: 'ring-emerald-500/50 dark:ring-emerald-400/50',
  },
  green: {
    gradient: 'from-emerald-500 to-teal-400 dark:from-emerald-600 dark:to-teal-500',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    hoverBorder: 'group-hover:border-emerald-500/40',
    ring: 'ring-emerald-500/50',
  },
  pink: {
    gradient: 'from-pink-500 to-rose-400 dark:from-pink-600 dark:to-rose-500',
    iconText: 'text-pink-600 dark:text-pink-400',
    hoverBorder: 'group-hover:border-pink-500/40',
    ring: 'ring-pink-500/50 dark:ring-pink-400/50',
  },
  rose: {
    gradient: 'from-rose-500 to-pink-400 dark:from-rose-600 dark:to-pink-500',
    iconText: 'text-rose-600 dark:text-rose-400',
    hoverBorder: 'group-hover:border-rose-500/40',
    ring: 'ring-rose-500/50',
  },
  magenta: {
    gradient: 'from-fuchsia-500 to-pink-500 dark:from-fuchsia-600 dark:to-pink-600',
    iconText: 'text-fuchsia-600 dark:text-fuchsia-400',
    hoverBorder: 'group-hover:border-fuchsia-500/40',
    ring: 'ring-fuchsia-500/50',
  },
  amber: {
    gradient: 'from-amber-500 to-amber-400 dark:from-amber-600 dark:to-amber-500',
    iconText: 'text-amber-600 dark:text-amber-400',
    hoverBorder: 'group-hover:border-amber-500/40',
    ring: 'ring-amber-500/50 dark:ring-amber-400/50',
  },
  yellow: {
    gradient: 'from-yellow-500 to-amber-400 dark:from-yellow-600 dark:to-amber-500',
    iconText: 'text-amber-600 dark:text-amber-400',
    hoverBorder: 'group-hover:border-yellow-500/40',
    ring: 'ring-yellow-500/50',
  },
  orange: {
    gradient: 'from-orange-500 to-amber-400 dark:from-orange-600 dark:to-amber-500',
    iconText: 'text-orange-600 dark:text-orange-400',
    hoverBorder: 'group-hover:border-orange-500/40',
    ring: 'ring-orange-500/50',
  },
  cyan: {
    gradient: 'from-cyan-500 to-blue-500 dark:from-cyan-600 dark:to-blue-600',
    iconText: 'text-cyan-600 dark:text-cyan-400',
    hoverBorder: 'group-hover:border-cyan-500/40',
    ring: 'ring-cyan-500/50 dark:ring-cyan-400/50',
  },
  sky: {
    gradient: 'from-sky-500 to-blue-500 dark:from-sky-600 dark:to-blue-600',
    iconText: 'text-sky-600 dark:text-sky-400',
    hoverBorder: 'group-hover:border-sky-500/40',
    ring: 'ring-sky-500/50',
  },
  blue: {
    gradient: 'from-blue-600 to-indigo-500 dark:from-blue-700 dark:to-indigo-600',
    iconText: 'text-blue-600 dark:text-blue-400',
    hoverBorder: 'group-hover:border-blue-500/40',
    ring: 'ring-blue-500/50',
  },
  purple: {
    gradient: 'from-purple-500 to-indigo-500 dark:from-purple-600 dark:to-indigo-600',
    iconText: 'text-purple-600 dark:text-purple-400',
    hoverBorder: 'group-hover:border-purple-500/40',
    ring: 'ring-purple-500/50 dark:ring-purple-400/50',
  },
  violet: {
    gradient: 'from-violet-500 to-purple-500 dark:from-violet-600 dark:to-purple-600',
    iconText: 'text-violet-600 dark:text-violet-400',
    hoverBorder: 'group-hover:border-violet-500/40',
    ring: 'ring-violet-500/50',
  },
  indigo: {
    gradient: 'from-indigo-500 to-blue-500 dark:from-indigo-600 dark:to-blue-600',
    iconText: 'text-indigo-600 dark:text-indigo-400',
    hoverBorder: 'group-hover:border-indigo-500/40',
    ring: 'ring-indigo-500/50',
  },
  danger: {
    gradient: 'from-rose-600 to-red-500 dark:from-rose-700 dark:to-red-600',
    iconText: 'text-rose-600 dark:text-rose-400',
    hoverBorder: 'group-hover:border-rose-500/40',
    ring: 'ring-rose-500/50',
  },
  red: {
    gradient: 'from-red-500 to-rose-500 dark:from-red-600 dark:to-rose-600',
    iconText: 'text-red-600 dark:text-red-400',
    hoverBorder: 'group-hover:border-red-500/40',
    ring: 'ring-red-500/50',
  },
  slate: {
    gradient: 'from-slate-600 to-slate-500 dark:from-slate-700 dark:to-slate-600',
    iconText: 'text-slate-600 dark:text-slate-300',
    hoverBorder: 'group-hover:border-slate-500/40',
    ring: 'ring-slate-400/50',
  },
  gray: {
    gradient: 'from-gray-600 to-gray-500 dark:from-gray-700 dark:to-gray-600',
    iconText: 'text-gray-600 dark:text-gray-300',
    hoverBorder: 'group-hover:border-gray-500/40',
    ring: 'ring-gray-400/50',
  },
  primary: {
    gradient: 'from-indigo-600 to-indigo-500 dark:from-indigo-600 dark:to-indigo-500',
    iconText: 'text-indigo-600 dark:text-indigo-400',
    hoverBorder: 'group-hover:border-indigo-500/40',
    ring: 'ring-indigo-500/50',
  },
};

export interface RibbonStatsTrend {
  value: string | number;
  isPositive?: boolean;
  label?: string;
}

// ─── Component Props ──────────────────────────────────────────────────────────
export interface RibbonStatsCardProps {
  title: React.ReactNode;
  value: number | string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  useCounter?: boolean;
  subtitle?: React.ReactNode;
  trend?: RibbonStatsTrend | React.ReactNode;
  icon?: LucideIcon | React.ComponentType<{ size?: number; className?: string }> | React.ReactNode;
  variant?: RibbonStatsVariant;
  onClick?: () => void;
  isActive?: boolean;
  activeRingClass?: string;
  tooltip?: string;
  delay?: number;
  className?: string;
  valueClassName?: string;
  waveWidth?: string;
}

// ─── Main RibbonStatsCard Component ───────────────────────────────────────────
export const RibbonStatsCard: React.FC<RibbonStatsCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  useCounter = true,
  subtitle,
  trend,
  icon: Icon,
  variant = 'emerald',
  onClick,
  isActive = false,
  activeRingClass,
  tooltip,
  delay = 0,
  className = '',
  valueClassName = '',
  waveWidth = 'w-24',
}) => {
  const isClickable = Boolean(onClick);
  const isNumeric = typeof value === 'number';
  const theme = VARIANT_THEMES[variant] || VARIANT_THEMES.emerald;

  const activeRing = activeRingClass || `ring-2 ${theme.ring} shadow-xs`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      onClick={onClick}
      title={tooltip}
      className={`relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center justify-between group transition-all duration-200 select-none ${
        theme.hoverBorder
      } ${
        isClickable
          ? 'cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 active:scale-[0.99]'
          : ''
      } ${isActive ? activeRing : ''} ${className}`}
    >
      {/* Left Decorative Vibrant Wave Badge */}
      <div
        className={`absolute left-0 top-0 bottom-0 ${waveWidth} bg-gradient-to-r ${theme.gradient} rounded-r-[40px] flex items-center justify-center shadow-inner`}
      >
        <div
          className={`w-10 h-10 rounded-full bg-white/95 dark:bg-slate-900/90 ${theme.iconText} flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-105`}
        >
          {Icon ? (
            React.isValidElement(Icon) ? (
              Icon
            ) : typeof Icon === 'function' || typeof Icon === 'object' ? (
              // @ts-expect-error dynamic component render
              <Icon size={20} className="stroke-[2.5]" />
            ) : null
          ) : null}
        </div>
      </div>

      {/* Right Metrics Display */}
      <div className="pl-24 pr-2 space-y-0.5 text-right w-full min-w-0">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
          {title}
        </span>

        <span
          className={`text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight block font-mono truncate ${valueClassName}`}
        >
          {isNumeric && useCounter ? (
            <AnimatedCounter
              value={value}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
            />
          ) : (
            <span>
              {prefix}
              {value}
              {suffix}
            </span>
          )}
        </span>

        {/* Optional Subtitle / Trend Note */}
        {(subtitle || trend) && (
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1.5 truncate pt-0.5">
            {typeof trend === 'object' && trend !== null && 'value' in trend ? (
              <span
                className={`font-bold ${
                  (trend as RibbonStatsTrend).isPositive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {(trend as RibbonStatsTrend).value} {(trend as RibbonStatsTrend).label || ''}
              </span>
            ) : React.isValidElement(trend) || typeof trend === 'string' || typeof trend === 'number' ? (
              trend
            ) : null}
            {subtitle}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── RibbonStatsGrid Container Component ───────────────────────────────────────
export interface RibbonStatsGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5;
  className?: string;
}

export const RibbonStatsGrid: React.FC<RibbonStatsGridProps> = ({
  children,
  columns = 4,
  className = '',
}) => {
  const colClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : columns === 3
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : columns === 5
      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return <div className={`grid ${colClass} gap-3.5 ${className}`}>{children}</div>;
};

// ─── Aliases for Developer Ergonomics & Backward Compatibility ─────────────────
export const WaveStatsCard = RibbonStatsCard;
export const EnterpriseWaveCard = RibbonStatsCard;
export const WaveStatsGrid = RibbonStatsGrid;
export const EnterpriseWaveGrid = RibbonStatsGrid;

export default RibbonStatsCard;
