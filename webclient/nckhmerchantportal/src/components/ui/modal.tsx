import React, { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Check, Loader2 } from 'lucide-react'
import CloseButton from './CloseButton'

/* ==========================================================================
   1. ModalHeader
   ========================================================================== */

export type ModalHeaderIconVariant =
  | 'emerald'
  | 'blue'
  | 'indigo'
  | 'purple'
  | 'violet'
  | 'cyan'
  | 'sky'
  | 'amber'
  | 'orange'
  | 'rose'
  | 'slate'

export interface ModalHeaderProps {
  /** Main title of the modal */
  title: React.ReactNode
  /** Subtitle or explanatory text */
  subtitle?: React.ReactNode
  /** Leading icon component */
  icon?: React.ReactNode
  /** Color theme variant for icon avatar */
  iconVariant?: ModalHeaderIconVariant
  /** Optional status badge or tag displayed alongside title */
  badge?: React.ReactNode
  /** Close button click handler */
  onClose?: () => void
  /** Whether to show the close button (default: true) */
  showClose?: boolean
  /** Extra action buttons on top right (before close button) */
  actions?: React.ReactNode
  /** Custom wrapper CSS class */
  className?: string
}

const variantStyles: Record<ModalHeaderIconVariant, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  slate: 'bg-muted text-muted-foreground border-border/80',
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  subtitle,
  icon,
  iconVariant = 'emerald',
  badge,
  onClose,
  showClose = true,
  actions,
  className = '',
}) => {
  const renderIcon = () => {
    if (!icon) return null
    if (React.isValidElement(icon)) return icon
    if (
      typeof icon === 'function' ||
      (typeof icon === 'object' &&
        icon !== null &&
        ('render' in (icon as any) || '$$typeof' in (icon as any)))
    ) {
      return React.createElement(icon as React.ElementType, {
        size: 20,
        className: 'w-5 h-5',
      })
    }
    return icon
  }

  return (
    <div
      className={`relative flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border/80 dark:border-slate-800 bg-muted/20 dark:bg-slate-900/50 shrink-0 ${className}`}
    >
      {/* Left side: Icon + Title & Subtitle */}
      <div className="flex items-center gap-3 min-w-0 flex-1 pr-14">
        {icon && (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs ${variantStyles[iconVariant]}`}
          >
            {renderIcon()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-bold text-foreground dark:text-slate-100 leading-snug">
              {title}
            </h3>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground dark:text-slate-400 mt-0.5 max-w-xl line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right corner: Actions & Close Button anchored tight to the corner */}
      <div className="absolute top-3.5 right-4 sm:top-4 sm:right-4 flex items-center gap-2 z-10">
        {actions}
        {showClose && onClose && (
          <CloseButton onClose={onClose} size="md" variant="default" />
        )}
      </div>
    </div>
  )
}

/* ==========================================================================
   2. ModalBody
   ========================================================================== */

export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  maxHeight?: string
}

export const ModalBody: React.FC<ModalBodyProps> = ({
  className = '',
  children,
  maxHeight,
  ...props
}) => (
  <div className={`p-5 sm:p-6 space-y-4 ${maxHeight || ''} ${className}`} {...props}>
    {children}
  </div>
)

/* ==========================================================================
   3. ModalFooter
   ========================================================================== */

export interface ModalFooterProps {
  /** Label for Cancel button. Defaults to t('common.cancel', 'Cancel') */
  cancelLabel?: string
  /** Alias for cancelLabel */
  cancelText?: string
  /** Click handler for Cancel button */
  onCancel?: () => void
  /** Whether to show the Cancel button (default: true) */
  showCancel?: boolean
  /** Label for Submit button. Defaults to Save / Save Changes */
  submitLabel?: string
  /** Alias for submitLabel */
  confirmText?: string
  /** Custom icon for Submit button (defaults to Check) */
  submitIcon?: React.ReactNode
  /** Alias for submitIcon */
  confirmIcon?: React.ReactNode | React.ElementType
  /** Click handler for submit button if not form-submitting */
  onSubmit?: (e?: React.FormEvent | React.MouseEvent) => void
  /** Alias for onSubmit */
  onConfirm?: (e?: React.FormEvent | React.MouseEvent) => void
  /** Submit button HTML type ('submit' | 'button'). Defaults to 'submit' */
  submitButtonType?: 'submit' | 'button'
  /** Whether to show the Submit button (default: true) */
  showSubmit?: boolean
  /** Whether submission is in progress */
  isSubmitting?: boolean
  /** Whether the submit button is disabled */
  disabled?: boolean
  /** Whether modal is in Edit mode (adjusts default label to 'Save Changes') */
  isEdit?: boolean
  /** Contextual info or helper notes displayed on the left */
  infoSummary?: React.ReactNode
  /** Color variant for submit button ('primary' | 'emerald' | 'danger'). Defaults to 'primary' */
  submitVariant?: 'primary' | 'emerald' | 'danger'
  /** Extra custom action buttons (rendered before Cancel/Submit) */
  extraActions?: React.ReactNode
  /** Custom wrapper CSS class */
  className?: string
  /** Custom children elements (replaces default button layout if provided) */
  children?: React.ReactNode
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  cancelLabel,
  cancelText,
  onCancel,
  showCancel = true,
  submitLabel,
  confirmText,
  submitIcon,
  confirmIcon,
  onSubmit,
  onConfirm,
  submitButtonType = 'submit',
  showSubmit = true,
  isSubmitting = false,
  disabled = false,
  isEdit = false,
  infoSummary,
  submitVariant = 'primary',
  extraActions,
  className = '',
  children,
}) => {
  const { t } = useTranslation(['common'])

  const effectiveCancelLabel = cancelLabel || cancelText || t('common.cancel', 'Cancel')
  const effectiveSubmitLabel =
    submitLabel ||
    confirmText ||
    (isEdit ? t('common.saveChanges', 'Save Changes') : t('common.save', 'Save'))
  const effectiveOnSubmit = onSubmit || onConfirm

  const renderSubmitIcon = () => {
    const icon = submitIcon || confirmIcon
    if (!icon) return <Check size={14} strokeWidth={2.5} />
    if (React.isValidElement(icon)) return icon
    if (
      typeof icon === 'function' ||
      (typeof icon === 'object' &&
        icon !== null &&
        ('render' in (icon as any) || '$$typeof' in (icon as any)))
    ) {
      return React.createElement(icon as React.ElementType, { size: 14 })
    }
    return icon
  }

  const getSubmitVariantStyles = () => {
    switch (submitVariant) {
      case 'emerald':
        return 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
      case 'danger':
        return 'bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-xs'
      case 'primary':
      default:
        return 'bg-[var(--btn-primary-hex,var(--primary-hex,#ec4899))] hover:brightness-90 text-white shadow-xs'
    }
  }

  if (children) {
    return (
      <div
        className={`flex items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-border/80 dark:border-slate-800 bg-muted/20 dark:bg-slate-900/50 shrink-0 ${className}`}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-border/80 dark:border-slate-800 bg-muted/20 dark:bg-slate-900/50 shrink-0 ${className}`}
    >
      {/* Left: Info Summary slot */}
      {infoSummary ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-slate-400 min-w-0">
          {infoSummary}
        </div>
      ) : (
        <div className="hidden sm:block" />
      )}

      {/* Right: Action Buttons */}
      <div className="flex items-center justify-end gap-3 shrink-0">
        {extraActions}

        {showCancel && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-10 px-5 rounded-xl border border-border/80 dark:border-slate-700 bg-card dark:bg-slate-800/80 text-xs sm:text-[13px] font-bold text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white hover:bg-muted dark:hover:bg-slate-700 transition-colors cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed select-none"
          >
            {effectiveCancelLabel}
          </button>
        )}

        {showSubmit && (
          <button
            type={submitButtonType}
            onClick={effectiveOnSubmit}
            disabled={isSubmitting || disabled}
            className={`h-10 inline-flex items-center justify-center gap-2 px-6 rounded-xl text-xs sm:text-[13px] font-bold hover:shadow transition-all disabled:opacity-50 cursor-pointer active:scale-95 disabled:cursor-not-allowed select-none ${getSubmitVariantStyles()}`}
          >
            {isSubmitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              renderSubmitIcon()
            )}
            <span>{effectiveSubmitLabel}</span>
          </button>
        )}
      </div>
    </div>
  )
}

/* ==========================================================================
   4. Modal (Main Dialog Container)
   ========================================================================== */

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full'

export interface ModalProps {
  /** Whether the modal is open */
  isOpen?: boolean
  /** Alias for isOpen */
  open?: boolean
  /** Close handler */
  onClose?: () => void
  /** Alias for onClose */
  onOpenChange?: (open: boolean) => void
  /** Modal header title (used when default header is rendered) */
  title?: React.ReactNode
  /** Modal header subtitle (used when default header is rendered) */
  subtitle?: React.ReactNode
  /** Alias for subtitle */
  description?: React.ReactNode
  /** Modal header icon (used when default header is rendered) */
  icon?: React.ReactNode
  /** Modal header icon variant */
  iconVariant?: ModalHeaderIconVariant
  /** Alias for iconVariant */
  iconColor?: ModalHeaderIconVariant
  /** Modal header status badge or tag */
  badge?: React.ReactNode
  /** Custom header component (replaces default ModalHeader) */
  header?: React.ReactNode
  /** Custom footer component */
  footer?: React.ReactNode
  /** Max-width size preset of the modal dialog */
  size?: ModalSize
  /** Alias for size */
  maxWidth?: ModalSize | string
  /** Modal body content */
  children: React.ReactNode
  /** Whether to show the close button in default header (default: true) */
  showCloseButton?: boolean
  /** Whether pressing Escape closes the modal (default: true) */
  closeOnEsc?: boolean
  /** Whether clicking the backdrop closes the modal (default: true) */
  closeOnBackdropClick?: boolean
  /** Whether to render via React Portal (default: true) */
  usePortal?: boolean
  /** Custom CSS class for the modal dialog panel */
  className?: string
  /** Custom CSS class for the inner scrollable body area */
  bodyClassName?: string
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  full: 'max-w-[calc(100vw-2rem)] sm:max-w-6xl',
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  open,
  onClose,
  onOpenChange,
  title,
  subtitle,
  description,
  icon,
  iconVariant,
  iconColor = 'emerald',
  badge,
  header,
  footer,
  size = '2xl',
  maxWidth,
  children,
  showCloseButton = true,
  closeOnEsc = true,
  closeOnBackdropClick = true,
  usePortal = true,
  className = '',
  bodyClassName = '',
}) => {
  const effectiveIsOpen = isOpen !== undefined ? isOpen : !!open
  const effectiveOnClose = onClose || (() => onOpenChange?.(false)) || (() => {})
  const effectiveSubtitle = subtitle || description
  const effectiveVariant = iconVariant || iconColor || 'emerald'
  const resolvedSize = (maxWidth && sizeClasses[maxWidth as ModalSize] ? maxWidth : size) as ModalSize

  // Handle Escape key listener
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape') {
        effectiveOnClose()
      }
    },
    [closeOnEsc, effectiveOnClose]
  )

  useEffect(() => {
    if (effectiveIsOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [effectiveIsOpen, handleKeyDown])

  const modalContent = (
    <AnimatePresence>
      {effectiveIsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnBackdropClick ? effectiveOnClose : undefined}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Dialog Panel */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full ${sizeClasses[resolvedSize] || 'max-w-2xl'} bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] z-10 ${className}`}
          >
            {/* Header Slot */}
            {header !== undefined ? (
              header
            ) : title ? (
              <ModalHeader
                title={title}
                subtitle={effectiveSubtitle}
                icon={icon}
                iconVariant={effectiveVariant}
                badge={badge}
                onClose={effectiveOnClose}
                showClose={showCloseButton}
              />
            ) : null}

            {/* Scrollable Body Slot */}
            <div className={`overflow-y-auto flex-1 ${bodyClassName}`}>
              {children}
            </div>

            {/* Footer Slot */}
            {footer}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  if (usePortal && typeof document !== 'undefined') {
    return createPortal(modalContent, document.body)
  }

  return modalContent
}

// ─── Backward Compatibility Aliases ───────────────────────────────────────────
export type EnterpriseModalProps = ModalProps
export const EnterpriseModal = Modal
export const AppModal = Modal
export const ActionModal = Modal

export default Modal
