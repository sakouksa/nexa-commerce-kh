import React from 'react';
import { motion } from 'framer-motion';
import { Package, type LucideIcon } from 'lucide-react';
import { AnimatedCounter } from '../shared/AnimatedCounter';
import { cn } from '../../lib/utils';

// ─── Color Variant Types ───────────────────────────────────────────────────────

export type AccentCardVariant =
  | 'red'
  | 'rose'
  | 'danger'
  | 'out_of_stock'
  | 'amber'
  | 'yellow'
  | 'warning'
  | 'low_stock'
  | 'green'
  | 'emerald'
  | 'success'
  | 'in_stock'
  | 'normal'
  | 'blue'
  | 'sky'
  | 'info'
  | 'high_stock'
  | 'indigo'
  | 'purple'
  | 'violet'
  | 'slate'
  | 'gray';

interface VariantTheme {
  borderLeft: string;
  iconBox: string;
  badge: string;
  activeRing: string;
  activeBg: string;
}

const VARIANT_THEMES: Record<string, VariantTheme> = {
  // Red / Danger / Out of stock
  red: {
    borderLeft: 'border-l-4 !border-l-red-500 dark:!border-l-red-500',
    iconBox: 'bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    activeRing: 'ring-2 ring-red-500/50',
    activeBg: 'bg-red-50/20 dark:bg-red-950/10',
  },
  rose: {
    borderLeft: 'border-l-4 !border-l-rose-500 dark:!border-l-rose-500',
    iconBox: 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    activeRing: 'ring-2 ring-rose-500/50',
    activeBg: 'bg-rose-50/20 dark:bg-rose-950/10',
  },
  danger: {
    borderLeft: 'border-l-4 !border-l-red-500 dark:!border-l-red-500',
    iconBox: 'bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    activeRing: 'ring-2 ring-red-500/50',
    activeBg: 'bg-red-50/20 dark:bg-red-950/10',
  },
  out_of_stock: {
    borderLeft: 'border-l-4 !border-l-red-500 dark:!border-l-red-500',
    iconBox: 'bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    activeRing: 'ring-2 ring-red-500/50',
    activeBg: 'bg-red-50/20 dark:bg-red-950/10',
  },

  // Amber / Warning / Low stock
  amber: {
    borderLeft: 'border-l-4 !border-l-amber-500 dark:!border-l-amber-400',
    iconBox: 'bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    activeRing: 'ring-2 ring-amber-500/50',
    activeBg: 'bg-amber-50/20 dark:bg-amber-950/10',
  },
  yellow: {
    borderLeft: 'border-l-4 !border-l-amber-500 dark:!border-l-amber-400',
    iconBox: 'bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    activeRing: 'ring-2 ring-amber-500/50',
    activeBg: 'bg-amber-50/20 dark:bg-amber-950/10',
  },
  warning: {
    borderLeft: 'border-l-4 !border-l-amber-500 dark:!border-l-amber-400',
    iconBox: 'bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    activeRing: 'ring-2 ring-amber-500/50',
    activeBg: 'bg-amber-50/20 dark:bg-amber-950/10',
  },
  low_stock: {
    borderLeft: 'border-l-4 !border-l-amber-500 dark:!border-l-amber-400',
    iconBox: 'bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    activeRing: 'ring-2 ring-amber-500/50',
    activeBg: 'bg-amber-50/20 dark:bg-amber-950/10',
  },

  // Green / Emerald / In stock
  green: {
    borderLeft: 'border-l-4 !border-l-green-500 dark:!border-l-green-400',
    iconBox: 'bg-green-50 dark:bg-green-950/40 text-green-500 dark:text-green-400',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    activeRing: 'ring-2 ring-green-500/50',
    activeBg: 'bg-green-50/20 dark:bg-green-950/10',
  },
  emerald: {
    borderLeft: 'border-l-4 !border-l-emerald-500 dark:!border-l-emerald-400',
    iconBox: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    activeRing: 'ring-2 ring-emerald-500/50',
    activeBg: 'bg-emerald-50/20 dark:bg-emerald-950/10',
  },
  success: {
    borderLeft: 'border-l-4 !border-l-emerald-500 dark:!border-l-emerald-400',
    iconBox: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    activeRing: 'ring-2 ring-emerald-500/50',
    activeBg: 'bg-emerald-50/20 dark:bg-emerald-950/10',
  },
  in_stock: {
    borderLeft: 'border-l-4 !border-l-green-500 dark:!border-l-green-400',
    iconBox: 'bg-green-50 dark:bg-green-950/40 text-green-500 dark:text-green-400',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    activeRing: 'ring-2 ring-green-500/50',
    activeBg: 'bg-green-50/20 dark:bg-green-950/10',
  },
  normal: {
    borderLeft: 'border-l-4 !border-l-green-500 dark:!border-l-green-400',
    iconBox: 'bg-green-50 dark:bg-green-950/40 text-green-500 dark:text-green-400',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    activeRing: 'ring-2 ring-green-500/50',
    activeBg: 'bg-green-50/20 dark:bg-green-950/10',
  },

  // Blue / Sky / High stock
  blue: {
    borderLeft: 'border-l-4 !border-l-blue-500 dark:!border-l-blue-400',
    iconBox: 'bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    activeRing: 'ring-2 ring-blue-500/50',
    activeBg: 'bg-blue-50/20 dark:bg-blue-950/10',
  },
  sky: {
    borderLeft: 'border-l-4 !border-l-sky-500 dark:!border-l-sky-400',
    iconBox: 'bg-sky-50 dark:bg-sky-950/40 text-sky-500 dark:text-sky-400',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    activeRing: 'ring-2 ring-sky-500/50',
    activeBg: 'bg-sky-50/20 dark:bg-sky-950/10',
  },
  info: {
    borderLeft: 'border-l-4 !border-l-sky-500 dark:!border-l-sky-400',
    iconBox: 'bg-sky-50 dark:bg-sky-950/40 text-sky-500 dark:text-sky-400',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    activeRing: 'ring-2 ring-sky-500/50',
    activeBg: 'bg-sky-50/20 dark:bg-sky-950/10',
  },
  high_stock: {
    borderLeft: 'border-l-4 !border-l-blue-500 dark:!border-l-blue-400',
    iconBox: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    activeRing: 'ring-2 ring-blue-500/50',
    activeBg: 'bg-blue-50/20 dark:bg-blue-950/10',
  },

  // Indigo / Purple / Violet
  indigo: {
    borderLeft: 'border-l-4 !border-l-indigo-500 dark:!border-l-indigo-400',
    iconBox: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    activeRing: 'ring-2 ring-indigo-500/50',
    activeBg: 'bg-indigo-50/20 dark:bg-indigo-950/10',
  },
  purple: {
    borderLeft: 'border-l-4 !border-l-purple-500 dark:!border-l-purple-400',
    iconBox: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    activeRing: 'ring-2 ring-purple-500/50',
    activeBg: 'bg-purple-50/20 dark:bg-purple-950/10',
  },
  violet: {
    borderLeft: 'border-l-4 !border-l-violet-500 dark:!border-l-violet-400',
    iconBox: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    activeRing: 'ring-2 ring-violet-500/50',
    activeBg: 'bg-violet-50/20 dark:bg-violet-950/10',
  },

  // Slate / Gray
  slate: {
    borderLeft: 'border-l-4 !border-l-slate-400 dark:!border-l-slate-400',
    iconBox: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    activeRing: 'ring-2 ring-slate-400/50',
    activeBg: 'bg-slate-50/50 dark:bg-slate-900/50',
  },
  gray: {
    borderLeft: 'border-l-4 !border-l-gray-400 dark:!border-l-gray-400',
    iconBox: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300',
    badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    activeRing: 'ring-2 ring-gray-400/50',
    activeBg: 'bg-gray-50/50 dark:bg-gray-900/50',
  },
};

// ─── AccentStatCard Props ─────────────────────────────────────────────────────

export interface AccentStatCardProps {
  label: React.ReactNode;
  value: number | string;
  icon?: LucideIcon | React.ComponentType<{ className?: string; size?: number }> | React.ReactNode;
  variant?: AccentCardVariant;
  badge?: React.ReactNode;
  subtitle?: React.ReactNode;
  prefix?: string;
  suffix?: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  useCounter?: boolean;
  loading?: boolean;
}

// ─── AccentStatCard Component ─────────────────────────────────────────────────

export const AccentStatCard: React.FC<AccentStatCardProps> = ({
  label,
  value,
  icon,
  variant = 'blue',
  badge,
  subtitle,
  prefix = '',
  suffix = '',
  isActive = false,
  onClick,
  className,
  labelClassName,
  valueClassName,
  useCounter = false,
  loading = false,
}) => {
  const theme = VARIANT_THEMES[variant] || VARIANT_THEMES.blue;

  const renderIcon = () => {
    if (!icon) {
      return <Package className="w-5 h-5" />;
    }
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon as React.ComponentType<{ className?: string; size?: number }>;
    return <IconComponent className="w-5 h-5" size={20} />;
  };

  if (loading) {
    return (
      <div
        className={cn(
          'bg-card dark:bg-slate-900 rounded-2xl shadow-xs p-5 min-h-[96px] flex items-center gap-3.5 border border-border/60 animate-pulse',
          theme.borderLeft,
          className
        )}
      >
        <div className="w-12 h-12 rounded-xl bg-muted shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-muted rounded w-20" />
          <div className="h-6 bg-muted rounded w-12" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={onClick ? { y: -2, transition: { duration: 0.15 } } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        'bg-card dark:bg-slate-900 rounded-2xl shadow-xs p-5 min-h-[96px] flex items-center gap-3.5 border border-border/60 transition-all duration-200 select-none bg-white dark:border-slate-800',
        theme.borderLeft,
        onClick && 'cursor-pointer hover:shadow-md',
        isActive && cn('ring-2 shadow-sm', theme.activeRing, theme.activeBg),
        className
      )}
    >
      {/* Icon Square with soft tinted background */}
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors',
          theme.iconBox
        )}
      >
        {renderIcon()}
      </div>

      {/* Metric Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1.5">
          <p className={cn('text-xs text-muted-foreground font-medium truncate text-slate-500 dark:text-slate-400', labelClassName)}>
            {label}
          </p>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>

        <p className={cn('text-2xl font-bold text-foreground tracking-tight mt-0.5 text-slate-900 dark:text-white font-mono', valueClassName)}>
          {prefix}
          {useCounter && typeof value === 'number' ? (
            <AnimatedCounter value={value} />
          ) : (
            value
          )}
          {suffix}
        </p>

        {subtitle && (
          <div className="text-[11px] text-muted-foreground/80 mt-0.5 truncate text-slate-400 dark:text-slate-500">
            {subtitle}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── AccentStatGrid Wrapper Component ─────────────────────────────────────────

export interface AccentStatGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export const AccentStatGrid: React.FC<AccentStatGridProps> = ({
  children,
  columns = 4,
  className,
}) => {
  const colClass =
    {
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
    }[columns] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return <div className={cn('grid gap-4 mb-6', colClass, className)}>{children}</div>;
};

export default AccentStatCard;

