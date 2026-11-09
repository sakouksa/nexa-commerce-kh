import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { useLanguage } from '../../i18n';
import CloseButton from './CloseButton';
import { sound } from '@/utils/sound';

/* ==========================================================================
   1. ModalHeader
   ========================================================================== */

export type ModalHeaderIconVariant =
  | 'primary'
  | 'pink'
  | 'emerald'
  | 'blue'
  | 'indigo'
  | 'purple'
  | 'violet'
  | 'cyan'
  | 'amber'
  | 'orange'
  | 'rose'
  | 'danger'
  | 'slate';

export interface ModalHeaderProps {
  /** Main title of the modal */
  title: React.ReactNode;
  /** Subtitle or explanatory text */
  subtitle?: React.ReactNode;
  /** Alias for subtitle */
  description?: React.ReactNode;
  /** Leading icon component */
  icon?: React.ReactNode;
  /** Color theme variant for icon avatar */
  iconVariant?: ModalHeaderIconVariant;
  /** Alias for iconVariant */
  iconColor?: ModalHeaderIconVariant;
  /** Optional status badge or tag displayed alongside title */
  badge?: React.ReactNode;
  /** Close button click handler */
  onClose?: () => void;
  /** Whether to show the close button (default: true) */
  showClose?: boolean;
  /** Extra action buttons on top right (before close button) */
  actions?: React.ReactNode;
  /** Custom wrapper CSS class */
  className?: string;
  /** Custom children (replaces default header layout if provided) */
  children?: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  pink: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
  slate: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
};

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  subtitle,
  description,
  icon,
  iconVariant,
  iconColor,
  badge,
  onClose,
  showClose = true,
  actions,
  className = '',
  children,
}) => {
  const effectiveSubtitle = subtitle || description;
  const effectiveVariant = iconVariant || iconColor || 'primary';

  const isPrimary = effectiveVariant === 'primary';
  const primaryInlineStyle: React.CSSProperties = isPrimary
    ? {
        backgroundColor: 'color-mix(in srgb, var(--primary-hex, #ec4899) 12%, transparent)',
        color: 'var(--btn-primary-hex, var(--primary-hex, #ec4899))',
        borderColor: 'color-mix(in srgb, var(--primary-hex, #ec4899) 25%, transparent)',
      }
    : {};

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (
      typeof icon === 'function' ||
      (typeof icon === 'object' &&
        icon !== null &&
        ('render' in (icon as any) || '$$typeof' in (icon as any)))
    ) {
      return React.createElement(icon as React.ElementType, {
        size: 20,
        className: 'w-5 h-5',
      });
    }
    return icon;
  };

  if (children) {
    return (
      <div
        className={`relative flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border/80 dark:border-slate-800 bg-muted/20 dark:bg-slate-900/50 shrink-0 ${className}`}
      >
        {children}
        {showClose && onClose && (
          <div className="absolute top-3.5 right-4 sm:top-4 sm:right-4 flex items-center gap-2 z-10">
            <CloseButton onClose={onClose} size="md" variant="default" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/60 shrink-0 ${className}`}
    >
      {/* Left side: Icon + Title & Subtitle */}
      <div className="flex items-center gap-3 min-w-0 flex-1 pr-12">
        {icon && (
          <div
            style={primaryInlineStyle}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs ${
              isPrimary ? '' : variantStyles[effectiveVariant] || variantStyles.indigo
            }`}
          >
            {renderIcon()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug truncate">
              {title}
            </h3>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {effectiveSubtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl line-clamp-1">
              {effectiveSubtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right corner: Actions & Close Button */}
      <div className="absolute top-3.5 right-4 sm:top-4 sm:right-4 flex items-center gap-2 z-10">
        {actions}
        {showClose && onClose && (
          <CloseButton onClose={onClose} size="md" variant="default" />
        )}
      </div>
    </div>
  );
};

/* ==========================================================================
   2. ModalBody
   ========================================================================== */

export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  maxHeight?: string;
}

export const ModalBody: React.FC<ModalBodyProps> = ({
  className = '',
  children,
  maxHeight = 'max-h-[75vh]',
  ...props
}) => (
  <div
    className={`p-5 sm:p-6 space-y-4 overflow-y-auto overflow-x-hidden flex-1 ${maxHeight} ${className}`}
    {...props}
  >
    {children}
  </div>
);

/* ==========================================================================
   3. ModalFooter
   ========================================================================== */

export type ModalSubmitVariant = 'primary' | 'emerald' | 'danger' | 'purple' | 'slate';

export interface ModalFooterProps {
  /** Label for Cancel button. Defaults to 'Cancel' or 'បោះបង់' */
  cancelLabel?: React.ReactNode;
  /** Alias for cancelLabel */
  cancelText?: React.ReactNode;
  /** Click handler for Cancel button */
  onCancel?: () => void;
  /** Whether to show the Cancel button (default: true) */
  showCancel?: boolean;
  /** Whether Cancel button is disabled */
  cancelDisabled?: boolean;
  /** Label for Submit button. Defaults to 'Save' or 'រក្សាទុក' */
  submitLabel?: React.ReactNode;
  /** Alias for submitLabel */
  submitText?: React.ReactNode;
  /** Alias for submitLabel */
  confirmText?: React.ReactNode;
  /** Custom icon for Submit button (defaults to Check) */
  submitIcon?: React.ReactNode;
  /** Alias for submitIcon */
  confirmIcon?: React.ReactNode | React.ElementType;
  /** Click handler for submit button if not form-submitting */
  onSubmit?: (e?: React.FormEvent | React.MouseEvent) => void;
  /** Alias for onSubmit */
  onConfirm?: (e?: React.FormEvent | React.MouseEvent) => void;
  /** Submit button HTML type ('submit' | 'button'). Defaults to 'submit' */
  submitButtonType?: 'submit' | 'button';
  /** Whether to show the Submit button (default: true) */
  showSubmit?: boolean;
  /** Whether submission is in progress */
  isSubmitting?: boolean;
  /** Alias for isSubmitting */
  loading?: boolean;
  /** Whether the submit button is disabled */
  disabled?: boolean;
  /** Alias for disabled */
  submitDisabled?: boolean;
  /** Whether modal is in Edit mode */
  isEdit?: boolean;
  /** Contextual info or helper notes displayed on the left */
  infoSummary?: React.ReactNode;
  /** Color variant for submit button. Defaults to 'primary' (dynamic theme) */
  submitVariant?: ModalSubmitVariant;
  /** Alias for submitVariant */
  variant?: ModalSubmitVariant;
  /** Extra custom action buttons (rendered before Cancel/Submit) */
  extraActions?: React.ReactNode;
  /** Custom wrapper CSS class */
  className?: string;
  /** Custom children elements (replaces default button layout if provided) */
  children?: React.ReactNode;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  cancelLabel,
  cancelText,
  onCancel,
  showCancel = true,
  cancelDisabled = false,
  submitLabel,
  submitText,
  confirmText,
  submitIcon,
  confirmIcon,
  onSubmit,
  onConfirm,
  submitButtonType = 'submit',
  showSubmit = true,
  isSubmitting = false,
  loading = false,
  disabled = false,
  submitDisabled = false,
  isEdit = false,
  infoSummary,
  submitVariant,
  variant = 'primary',
  extraActions,
  className = '',
  children,
}) => {
  const { t, isKhmer } = useLanguage();

  const effectiveIsSubmitting = isSubmitting || loading;
  const effectiveDisabled = disabled || submitDisabled || effectiveIsSubmitting;
  const effectiveVariant = submitVariant || variant;

  const defaultCancel = isKhmer ? 'បោះបង់' : 'Cancel';
  const defaultSubmit = isEdit
    ? isKhmer
      ? 'រក្សាទុកការកែប្រែ'
      : 'Save Changes'
    : isKhmer
    ? 'រក្សាទុក'
    : 'Save';

  const effectiveCancelLabel = cancelLabel || cancelText || defaultCancel;
  const effectiveSubmitLabel = submitLabel || submitText || confirmText || defaultSubmit;
  const effectiveOnSubmit = onSubmit || onConfirm;

  const handleCancelClick = () => {
    sound.playClick();
    onCancel?.();
  };

  const renderSubmitIcon = () => {
    const icon = submitIcon || confirmIcon;
    if (icon === null) return null;
    if (!icon) return <Check size={14} className="stroke-[2.5]" />;
    if (React.isValidElement(icon)) return icon;
    if (
      typeof icon === 'function' ||
      (typeof icon === 'object' &&
        icon !== null &&
        ('render' in (icon as any) || '$$typeof' in (icon as any)))
    ) {
      return React.createElement(icon as React.ElementType, { size: 14 });
    }
    return icon;
  };

  const isPrimary = effectiveVariant === 'primary';
  const primarySubmitStyle: React.CSSProperties = isPrimary
    ? {
        backgroundColor:
          'var(--btn-primary-hex, var(--primary-hex, var(--sidebar-active-bg, #ec4899)))',
      }
    : {};

  const getSubmitVariantStyles = () => {
    switch (effectiveVariant) {
      case 'emerald':
        return 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs';
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-500 text-white shadow-xs';
      case 'purple':
        return 'bg-purple-600 hover:bg-purple-500 text-white shadow-xs';
      case 'slate':
        return 'bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white shadow-xs';
      case 'primary':
      default:
        return 'text-white shadow-xs hover:brightness-95';
    }
  };

  if (children) {
    return (
      <div
        className={`flex items-center justify-end gap-3 px-5 sm:px-6 py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/60 shrink-0 ${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-5 sm:px-6 py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/60 shrink-0 ${className}`}
    >
      {/* Left: Info Summary slot */}
      {infoSummary ? (
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 min-w-0">
          {infoSummary}
        </div>
      ) : (
        <div className="hidden sm:block" />
      )}

      {/* Right: Action Buttons */}
      <div className="flex items-center justify-end gap-2.5 shrink-0">
        {extraActions}

        {showCancel && onCancel && (
          <button
            type="button"
            onClick={handleCancelClick}
            disabled={cancelDisabled || effectiveIsSubmitting}
            className="h-9 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-card hover:bg-muted dark:bg-slate-800 dark:hover:bg-slate-700 text-xs sm:text-[13px] font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed select-none shadow-2xs"
          >
            {effectiveCancelLabel}
          </button>
        )}

        {showSubmit && (
          <button
            type={submitButtonType}
            onClick={effectiveOnSubmit}
            disabled={effectiveDisabled}
            style={primarySubmitStyle}
            className={`h-9 inline-flex items-center justify-center gap-1.5 px-5 rounded-xl text-xs sm:text-[13px] font-semibold transition-all disabled:opacity-50 cursor-pointer active:scale-95 disabled:cursor-not-allowed select-none ${getSubmitVariantStyles()}`}
          >
            {effectiveIsSubmitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              renderSubmitIcon()
            )}
            <span>{effectiveSubmitLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};

/* ==========================================================================
   4. Modal (Main Dialog Container)
   ========================================================================== */

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';

export interface ModalProps {
  /** Whether the modal is open */
  isOpen?: boolean;
  /** Alias for isOpen */
  open?: boolean;
  /** Close handler */
  onClose?: () => void;
  /** Alias for onClose */
  onOpenChange?: (open: boolean) => void;
  /** Modal header title */
  title?: React.ReactNode;
  /** Modal header subtitle */
  subtitle?: React.ReactNode;
  /** Alias for subtitle */
  description?: React.ReactNode;
  /** Modal header leading icon */
  icon?: React.ReactNode;
  /** Modal header icon variant */
  iconVariant?: ModalHeaderIconVariant;
  /** Alias for iconVariant */
  iconColor?: ModalHeaderIconVariant;
  /** Modal header status badge */
  badge?: React.ReactNode;
  /** Custom header component (replaces default ModalHeader) */
  header?: React.ReactNode;
  /** Custom footer component */
  footer?: React.ReactNode;
  /** Form submission handler (automatically wraps children in <form> if provided) */
  onSubmit?: (e: React.FormEvent) => void;
  /** Submit button label */
  submitLabel?: React.ReactNode;
  /** Alias for submitLabel */
  submitText?: React.ReactNode;
  /** Alias for submitLabel */
  confirmText?: React.ReactNode;
  /** Custom icon for submit button */
  submitIcon?: React.ReactNode;
  /** Alias for submitIcon */
  confirmIcon?: React.ReactNode | React.ElementType;
  /** Whether submit action is pending */
  isSubmitting?: boolean;
  /** Alias for isSubmitting */
  loading?: boolean;
  /** Whether submit button is disabled */
  disabled?: boolean;
  /** Alias for disabled */
  submitDisabled?: boolean;
  /** Cancel button label */
  cancelLabel?: React.ReactNode;
  /** Alias for cancelLabel */
  cancelText?: React.ReactNode;
  /** Cancel button click handler (defaults to onClose) */
  onCancel?: () => void;
  /** Whether to show cancel button (default: true) */
  showCancel?: boolean;
  /** Whether to show submit button (default: true) */
  showSubmit?: boolean;
  /** Submit button color variant */
  submitVariant?: ModalSubmitVariant;
  /** Alias for submitVariant */
  variant?: ModalSubmitVariant;
  /** Whether in edit mode */
  isEdit?: boolean;
  /** Max-width size preset of the modal dialog */
  size?: ModalSize;
  /** Alias for size */
  maxWidth?: ModalSize | string;
  /** Modal body content */
  children: React.ReactNode;
  /** Whether to show the close button in default header (default: true) */
  showCloseButton?: boolean;
  /** Whether pressing Escape closes the modal (default: true) */
  closeOnEsc?: boolean;
  /** Whether clicking the backdrop closes the modal (default: true) */
  closeOnBackdropClick?: boolean;
  /** Whether to render via React Portal (default: true) */
  usePortal?: boolean;
  /** Custom CSS class for the modal dialog panel */
  className?: string;
  /** Custom CSS class for the inner scrollable body area */
  bodyClassName?: string;
  /** Hide header entirely */
  hideHeader?: boolean;
  /** Hide footer entirely */
  hideFooter?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md sm:max-w-[480px]',
  lg: 'max-w-lg sm:max-w-[560px]',
  xl: 'max-w-xl sm:max-w-[640px]',
  '2xl': 'max-w-2xl sm:max-w-[760px]',
  '3xl': 'max-w-3xl sm:max-w-[900px]',
  '4xl': 'max-w-4xl sm:max-w-[1020px]',
  full: 'max-w-[calc(100vw-2rem)] sm:max-w-6xl',
};

export const Modal: React.FC<ModalProps> & {
  Header: typeof ModalHeader;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
} = ({
  isOpen,
  open,
  onClose,
  onOpenChange,
  title,
  subtitle,
  description,
  icon,
  iconVariant,
  iconColor,
  badge,
  header,
  footer,
  onSubmit,
  submitLabel,
  submitText,
  confirmText,
  submitIcon,
  confirmIcon,
  isSubmitting = false,
  loading = false,
  disabled = false,
  submitDisabled = false,
  cancelLabel,
  cancelText,
  onCancel,
  showCancel = true,
  showSubmit = true,
  submitVariant,
  variant,
  isEdit = false,
  size = 'md',
  maxWidth,
  children,
  showCloseButton = true,
  closeOnEsc = true,
  closeOnBackdropClick = true,
  usePortal = true,
  className = '',
  bodyClassName = '',
  hideHeader = false,
  hideFooter = false,
}) => {
  const effectiveIsOpen = isOpen !== undefined ? isOpen : Boolean(open);
  const effectiveOnClose = useCallback(() => {
    sound.playClick();
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  }, [onClose, onOpenChange]);

  const effectiveSubtitle = subtitle || description;
  const effectiveVariant = iconVariant || iconColor || 'primary';
  const resolvedSize = (maxWidth && sizeClasses[maxWidth as ModalSize] ? maxWidth : size) as ModalSize;
  const handleCancel = onCancel || effectiveOnClose;

  // Handle Escape key listener
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape') {
        effectiveOnClose();
      }
    },
    [closeOnEsc, effectiveOnClose]
  );

  useEffect(() => {
    if (effectiveIsOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [effectiveIsOpen, handleKeyDown]);

  const hasDefaultHeader = !hideHeader && (header !== undefined || Boolean(title));
  const hasDefaultFooter = !hideFooter && (footer !== undefined || onSubmit !== undefined || Boolean(submitLabel || submitText || confirmText));

  const innerContent = (
    <>
      {/* Header Slot */}
      {header !== undefined ? (
        header
      ) : hasDefaultHeader ? (
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
      <ModalBody className={bodyClassName}>{children}</ModalBody>

      {/* Footer Slot */}
      {footer !== undefined ? (
        footer
      ) : hasDefaultFooter ? (
        <ModalFooter
          cancelLabel={cancelLabel}
          cancelText={cancelText}
          onCancel={handleCancel}
          showCancel={showCancel}
          submitLabel={submitLabel}
          submitText={submitText}
          confirmText={confirmText}
          submitIcon={submitIcon}
          confirmIcon={confirmIcon}
          isSubmitting={isSubmitting || loading}
          disabled={disabled || submitDisabled}
          submitVariant={submitVariant || variant || 'primary'}
          isEdit={isEdit}
          showSubmit={showSubmit}
        />
      ) : null}
    </>
  );

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
            transition={{ duration: 0.18 }}
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
            className={`relative w-full ${sizeClasses[resolvedSize] || sizeClasses.md} bg-card dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] z-10 ${className}`}
          >
            {onSubmit ? (
              <form onSubmit={onSubmit} className="flex flex-col w-full min-w-0 max-h-[92vh] flex-1 overflow-hidden">
                {innerContent}
              </form>
            ) : (
              innerContent
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (usePortal && typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};

// Compound Subcomponents
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

// Aliases
export const ActionModal = Modal;
export const EnterpriseModal = Modal;
export const GlobalModal = Modal;

export default Modal;
