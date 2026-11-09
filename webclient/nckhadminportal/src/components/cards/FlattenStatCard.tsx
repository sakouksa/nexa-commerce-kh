import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  type LucideIcon,
} from 'lucide-react';
import { AnimatedCounter } from '../shared/AnimatedCounter';

export type FlattenStatColor =
  | 'teal'
  | 'emerald'
  | 'cyan'
  | 'slate'
  | 'rose'
  | 'amber'
  | 'purple'
  | 'indigo'
  | 'blue';

export type FlattenStatVariant = 'icon-box' | 'project' | 'crypto' | 'compact';

const FLATTEN_SOLID_BG: Record<FlattenStatColor, string> = {
  teal: 'bg-[#0e5a77] text-white',
  emerald: 'bg-[#059669] text-white',
  cyan: 'bg-[#06b6d4] text-white',
  slate: 'bg-[#64748b] text-white',
  rose: 'bg-[#e11d48] text-white',
  amber: 'bg-[#f59e0b] text-white',
  purple: 'bg-[#8b5cf6] text-white',
  indigo: 'bg-[#6366f1] text-white',
  blue: 'bg-[#0284c7] text-white',
};

export interface FlattenTrendProps {
  value: number | string;
  label?: string;
  direction?: 'up' | 'down' | 'neutral';
  isPositive?: boolean;
  prefix?: string;
  suffix?: string;
}

export interface FlattenStatCardProps {
  variant?: FlattenStatVariant;
  title: React.ReactNode;
  value: number | string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  useCounter?: boolean;
  subtitle?: React.ReactNode;
  icon?: LucideIcon | React.ComponentType<{ size?: number; className?: string }> | React.ReactNode;
  color?: FlattenStatColor;
  customBgColor?: string;
  trend?: FlattenTrendProps | string | number;
  trendLabel?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  onActionClick?: () => void;
  actionIcon?: LucideIcon | React.ComponentType<{ size?: number; className?: string }> | React.ReactNode;
  actionTitle?: string;
  onClick?: () => void;
  isActive?: boolean;
  delay?: number;
  className?: string;
  valueClassName?: string;
}

export const FlattenStatCard: React.FC<FlattenStatCardProps> = ({
  variant = 'icon-box',
  title,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  useCounter = true,
  subtitle,
  icon: Icon,
  color = 'teal',
  customBgColor,
  trend,
  trendLabel,
  trendDirection,
  onActionClick,
  actionIcon: ActionIcon,
  actionTitle = 'Action',
  onClick,
  isActive = false,
  delay = 0,
  className = '',
  valueClassName = '',
}) => {
  const isClickable = Boolean(onClick);
  const isNumeric = typeof value === 'number';
  const bgClass = customBgColor || FLATTEN_SOLID_BG[color] || FLATTEN_SOLID_BG.teal;

  // Helper for trend calculation
  const parsedTrend: FlattenTrendProps | null = React.useMemo(() => {
    if (!trend) return null;
    if (typeof trend === 'object' && 'value' in trend) {
      return trend;
    }
    const strVal = String(trend);
    const isNegative = strVal.startsWith('-');
    const dir = trendDirection || (isNegative ? 'down' : 'up');
    return {
      value: trend,
      label: trendLabel,
      direction: dir,
      isPositive: dir === 'up',
    };
  }, [trend, trendDirection, trendLabel]);

  // ──────────────────────────────────────────────────────────────────────────
  // VARIANT 1: "project" (Dashboard with top title, big number, bottom trend, right circular button)
  // ──────────────────────────────────────────────────────────────────────────
  if (variant === 'project') {
    const isUp = parsedTrend?.direction === 'up' || parsedTrend?.isPositive !== false;
    const trendTextColor = isUp
      ? 'text-emerald-500 dark:text-emerald-400'
      : 'text-rose-500 dark:text-rose-400';

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay }}
        onClick={onClick}
        className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-2xs transition-all select-none flex items-center justify-between gap-4 ${
          isClickable ? 'cursor-pointer hover:shadow-md hover:border-cyan-400/60 active:scale-[0.99]' : 'hover:shadow-xs'
        } ${isActive ? 'ring-2 ring-cyan-500/40 border-cyan-400' : ''} ${className}`}
      >
        <div className="flex-1 min-w-0">
          {/* Top Label */}
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate leading-snug">
            {title}
          </p>

          {/* Big Number */}
          <div
            className={`text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight leading-tight truncate my-1 font-sans ${valueClassName}`}
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
          </div>

          {/* Bottom Trend or Subtitle */}
          {parsedTrend ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 truncate">
              {parsedTrend.label && <span>{parsedTrend.label}</span>}
              <span className={`inline-flex items-center gap-0.5 font-semibold ${trendTextColor}`}>
                {parsedTrend.direction === 'up' ? '+' : parsedTrend.direction === 'down' ? '-' : ''}
                {String(parsedTrend.value).replace(/^[+-]/, '')}
                {isUp ? (
                  <ArrowUpRight size={13} className="shrink-0 stroke-[2.5]" />
                ) : (
                  <ArrowDownRight size={13} className="shrink-0 stroke-[2.5]" />
                )}
              </span>
            </div>
          ) : subtitle ? (
            <div className="text-xs text-slate-400 dark:text-slate-500 truncate">{subtitle}</div>
          ) : null}
        </div>

        {/* Right Circular Action Icon Button */}
        <button
          type="button"
          onClick={(e) => {
            if (onActionClick) {
              e.stopPropagation();
              onActionClick();
            }
          }}
          title={actionTitle}
          aria-label={actionTitle}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-all ${
            onActionClick ? 'cursor-pointer hover:opacity-90 active:scale-95' : 'cursor-default'
          } ${bgClass}`}
        >
          {ActionIcon ? (
            React.isValidElement(ActionIcon) ? (
              ActionIcon
            ) : (
              // @ts-expect-error dynamic component render
              <ActionIcon size={18} className="shrink-0 stroke-[2.2]" />
            )
          ) : Icon ? (
            React.isValidElement(Icon) ? (
              Icon
            ) : (
              // @ts-expect-error dynamic component render
              <Icon size={18} className="shrink-0 stroke-[2.2]" />
            )
          ) : (
            <Copy size={17} className="shrink-0 stroke-[2.2]" />
          )}
        </button>
      </motion.div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VARIANT 2: "crypto" (Crypto Stat Card with Arrow badge on right)
  // ──────────────────────────────────────────────────────────────────────────
  if (variant === 'crypto') {
    const isUp = parsedTrend?.direction === 'up' || parsedTrend?.isPositive !== false;
    const trendTextColor = isUp
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-rose-600 dark:text-rose-400';
    const badgeBgColor = isUp ? 'bg-[#059669]' : 'bg-[#e11d48]';

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay }}
        onClick={onClick}
        className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-2xs transition-all select-none flex items-center justify-between gap-4 ${
          isClickable ? 'cursor-pointer hover:shadow-md hover:border-cyan-400/60 active:scale-[0.99]' : 'hover:shadow-xs'
        } ${isActive ? 'ring-2 ring-cyan-500/40 border-cyan-400' : ''} ${className}`}
      >
        <div className="flex-1 min-w-0">
          {/* Top Label */}
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate leading-snug">
            {title}
          </p>

          {/* Big Number */}
          <div
            className={`text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight leading-tight truncate my-1 font-sans ${valueClassName}`}
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
          </div>

          {/* Bottom Annual Growth */}
          {parsedTrend ? (
            <div className={`flex items-center gap-1 text-xs font-semibold ${trendTextColor} truncate`}>
              <span>{isUp ? '▲' : '▼'}</span>
              <span>
                {String(parsedTrend.value).replace(/^[+-]/, '')}
                {parsedTrend.label ? ` ${parsedTrend.label}` : ' per year'}
              </span>
            </div>
          ) : subtitle ? (
            <div className="text-xs text-slate-400 dark:text-slate-500 truncate">{subtitle}</div>
          ) : null}
        </div>

        {/* Right Arrow Badge */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs text-white ${badgeBgColor}`}
        >
          {isUp ? (
            <div className="w-7 h-7 rounded-full border border-white/40 flex items-center justify-center">
              <ArrowUp size={16} strokeWidth={2.8} />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full border border-white/40 flex items-center justify-center">
              <ArrowDown size={16} strokeWidth={2.8} />
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VARIANT 3: "compact" (Minimal inline layout)
  // ──────────────────────────────────────────────────────────────────────────
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay }}
        onClick={onClick}
        className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg p-3.5 flex items-center justify-between gap-3 shadow-2xs transition-all select-none ${
          isClickable ? 'cursor-pointer hover:shadow-xs active:scale-[0.99]' : ''
        } ${className}`}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">{title}</p>
          <div className="text-lg font-bold text-slate-800 dark:text-white truncate">
            {prefix}
            {value}
            {suffix}
          </div>
        </div>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}>
            {React.isValidElement(Icon) ? (
              Icon
            ) : typeof Icon === 'function' || typeof Icon === 'object' ? (
              // @ts-expect-error dynamic component render
              <Icon size={18} strokeWidth={2.2} className="shrink-0" />
            ) : null}
          </div>
        )}
      </motion.div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // DEFAULT VARIANT: "icon-box" (Signature Flutter Flatten Icon Box on Left)
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay }}
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 sm:p-6 flex items-center gap-5 shadow-2xs transition-all select-none ${
        isClickable ? 'cursor-pointer hover:shadow-md hover:border-cyan-400/60 active:scale-[0.99]' : 'hover:shadow-xs'
      } ${isActive ? 'ring-2 ring-cyan-500/40 border-cyan-400' : ''} ${className}`}
    >
      {/* Left: Solid Rounded-xl Icon Box */}
      {Icon && (
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${bgClass}`}
        >
          {React.isValidElement(Icon) ? (
            Icon
          ) : typeof Icon === 'function' || typeof Icon === 'object' ? (
            // @ts-expect-error dynamic component render
            <Icon size={26} strokeWidth={2.2} className="shrink-0" />
          ) : null}
        </div>
      )}

      {/* Right: Two-line Value + Label Hierarchy */}
      <div className="flex-1 min-w-0">
        <div
          className={`text-xl sm:text-2xl font-bold text-slate-800 dark:text-white tracking-tight leading-tight truncate font-sans ${valueClassName}`}
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
        </div>

        <p className="text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 truncate leading-snug mt-1">
          {title}
        </p>

        {subtitle && (
          <div className="mt-1.5 pt-1 text-[11px] text-slate-400 dark:text-slate-500 truncate">
            {subtitle}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Convenience Wrappers ──────────────────────────────────────────────────

export const FlattenProjectStatCard: React.FC<Omit<FlattenStatCardProps, 'variant'>> = (props) => (
  <FlattenStatCard variant="project" {...props} />
);

export const FlattenCryptoStatCard: React.FC<Omit<FlattenStatCardProps, 'variant'>> = (props) => (
  <FlattenStatCard variant="crypto" {...props} />
);

// ─── Responsive Stats Grid Container ────────────────────────────────────────

export interface FlattenStatsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export const FlattenStatsGrid: React.FC<FlattenStatsGridProps> = ({
  children,
  columns = 4,
  className = '',
}) => {
  const colClass =
    columns === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : columns === 3
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : columns === 5
      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return <div className={`grid ${colClass} gap-4 sm:gap-5 ${className}`}>{children}</div>;
};

export default FlattenStatCard;
