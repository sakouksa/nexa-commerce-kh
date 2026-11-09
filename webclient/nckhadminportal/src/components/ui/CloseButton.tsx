import React from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export type CloseButtonColor = 'rose' | 'primary' | 'amber' | 'emerald' | 'slate' | 'default'
export type CloseButtonVariant = 'default' | 'subtle' | 'ghost' | 'filled'
export type CloseButtonSize = 'sm' | 'md' | 'lg'
export type CloseButtonShape = 'circle' | 'rounded'

export interface CloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClose?: () => void
  color?: CloseButtonColor
  variant?: CloseButtonVariant
  size?: CloseButtonSize
  shape?: CloseButtonShape
  showShortcutHint?: boolean
  tooltip?: string
  className?: string
}

const sizeStyles: Record<CloseButtonSize, { button: string; icon: number }> = {
  sm: {
    button: 'w-7 h-7 min-w-[28px] min-h-[28px]',
    icon: 14,
  },
  md: {
    button: 'w-[34px] h-[34px] min-w-[34px] min-h-[34px]',
    icon: 16,
  },
  lg: {
    button: 'w-[38px] h-[38px] min-w-[38px] min-h-[38px]',
    icon: 18,
  },
}

const shapeStyles: Record<CloseButtonShape, string> = {
  circle: 'rounded-full',
  rounded: 'rounded-xl',
}

// Clean, high-end enterprise color schemes (crisp resting state + rich hover highlight)
const colorStyles: Record<CloseButtonColor, { base: string; hover: string; active: string; ring: string }> = {
  // 1. Default: Project-matched clean Slate with subtle hover & focus (100% harmonized with project UI)
  default: {
    base: 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs',
    hover: 'hover:bg-slate-200/90 dark:hover:bg-slate-700/90 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs',
    active: 'active:bg-slate-300 dark:active:bg-slate-600 active:scale-95',
    ring: 'focus-visible:ring-2 focus-visible:ring-indigo-500/25',
  },
  // 2. Corporate Primary Indigo Accent (Matching project brand)
  primary: {
    base: 'bg-indigo-50/90 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-100/90 dark:border-indigo-900/50 shadow-2xs',
    hover: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/70 hover:text-indigo-700 dark:hover:text-indigo-300 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-xs hover:shadow-indigo-500/10',
    active: 'active:bg-indigo-200 dark:active:bg-indigo-800 active:scale-95',
    ring: 'focus-visible:ring-indigo-500/30',
  },
  // 3. Neutral Slate
  slate: {
    base: 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 border-slate-200/90 dark:border-slate-700/90 shadow-2xs',
    hover: 'hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs',
    active: 'active:bg-slate-300 dark:active:bg-slate-600 active:scale-95',
    ring: 'focus-visible:ring-slate-400/30',
  },
  // 4. Soft Rose Accent (For delete/danger dialogs)
  rose: {
    base: 'bg-rose-50/90 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 border-rose-100/90 dark:border-rose-900/50 shadow-2xs',
    hover: 'hover:bg-rose-100 dark:hover:bg-rose-900/70 hover:text-rose-600 dark:hover:text-rose-300 hover:border-rose-200 dark:hover:border-rose-800 hover:shadow-xs hover:shadow-rose-500/10',
    active: 'active:bg-rose-200 dark:active:bg-rose-800 active:border-rose-300 active:scale-95',
    ring: 'focus-visible:ring-rose-500/30',
  },
  // 5. Warm Amber Accent
  amber: {
    base: 'bg-amber-50/90 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100/90 dark:border-amber-900/50 shadow-2xs',
    hover: 'hover:bg-amber-100 dark:hover:bg-amber-900/70 hover:text-amber-700 dark:hover:text-amber-300 hover:border-amber-200 dark:hover:border-amber-800 hover:shadow-xs hover:shadow-amber-500/10',
    active: 'active:bg-amber-200 dark:active:bg-amber-800 active:scale-95',
    ring: 'focus-visible:ring-amber-500/30',
  },
  // 6. Emerald Accent
  emerald: {
    base: 'bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100/90 dark:border-emerald-900/50 shadow-2xs',
    hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/70 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-xs hover:shadow-emerald-500/10',
    active: 'active:bg-emerald-200 dark:active:bg-emerald-800 active:scale-95',
    ring: 'focus-visible:ring-emerald-500/30',
  },
}

export const CloseButton = React.forwardRef<HTMLButtonElement, CloseButtonProps>(({
  onClose,
  onClick,
  color = 'default',
  variant = 'default',
  size = 'md',
  shape = 'circle',
  showShortcutHint = false,
  tooltip,
  className = '',
  ...rest
}, ref) => {
  const { t } = useTranslation(['common'])
  const currentSize = sizeStyles[size] || sizeStyles.md
  const currentShape = shapeStyles[shape] || shapeStyles.circle
  const currentScheme = colorStyles[color] || colorStyles.default
  const closeTitle = tooltip || t('common.close', 'Close (ESC)')

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClose) {
      onClose()
    }
    if (onClick) {
      onClick(e)
    }
  }

  // Variant overrides (ghost / subtle / filled)
  let variantClasses = `${currentScheme.base} ${currentScheme.hover} ${currentScheme.active}`
  if (variant === 'ghost') {
    variantClasses = `bg-transparent border border-transparent ${currentScheme.hover} ${currentScheme.active}`
  } else if (variant === 'subtle') {
    variantClasses = `bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 ${currentScheme.hover} ${currentScheme.active}`
  } else if (variant === 'filled') {
    variantClasses = `bg-slate-200/90 dark:bg-slate-700/90 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 ${currentScheme.hover} ${currentScheme.active}`
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      aria-label={closeTitle}
      title={closeTitle}
      className={cn(
        "group inline-flex items-center justify-center shrink-0 border transition-all duration-150 cursor-pointer select-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-offset-1 shadow-2xs",
        currentScheme.ring,
        currentSize.button,
        currentShape,
        variantClasses,
        className
      )}
      {...rest}
    >
      <X
        size={currentSize.icon}
        strokeWidth={2}
        className="transition-colors duration-150 shrink-0"
      />
      {showShortcutHint && (
        <span className="sr-only">ESC</span>
      )}
    </button>
  )
})

CloseButton.displayName = 'CloseButton'

export default CloseButton

