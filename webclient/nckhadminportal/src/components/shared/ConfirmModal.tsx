import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/i18n';

export interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message?: React.ReactNode;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'destructive' | 'primary' | 'warning';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  itemName,
  confirmText,
  cancelText,
  variant = 'destructive',
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  const { t, language } = useLanguage();

  const isDestructive = variant === 'danger' || variant === 'destructive';

  const resolvedConfirm =
    confirmText ||
    (isLoading
      ? isDestructive
        ? t('buttons.deleting', 'កំពុងលុប...')
        : t('buttons.saving', 'កំពុងរក្សាទុក...')
      : isDestructive
      ? t('buttons.delete', 'Delete')
      : t('buttons.confirm', 'Confirm'));

  const resolvedCancel = cancelText || t('buttons.cancel', 'Cancel');

  const resolvedTitle =
    title ||
    (isDestructive
      ? t('common.confirmDelete', 'Delete')
      : t('common.confirm', 'Confirm'));

  const defaultDescription =
    itemName
      ? language === 'kh'
        ? `តើអ្នកពិតជាចង់លុប ${itemName} មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានទេ។`
        : `Are you sure you want to delete ${itemName}? This action cannot be undone.`
      : language === 'kh'
      ? 'តើអ្នកប្រាកដជាចង់បន្តសកម្មភាពនេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានទេ។'
      : 'Are you sure you want to continue? This action cannot be undone.';

  const resolvedMessage = message || defaultDescription;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isLoading && !isOpen && onClose()}>
      <DialogContent
        hideCloseButton={isLoading}
        className="sm:max-w-[460px] p-6 gap-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl"
      >
        <DialogHeader className="p-0 text-left space-y-2">
          <DialogTitle className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
            {resolvedTitle}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
            {resolvedMessage}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-row justify-end items-center gap-2 pt-6 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="h-9 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md cursor-pointer transition-colors"
          >
            {resolvedCancel}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className={`h-9 px-4 text-sm font-medium rounded-md shadow-xs cursor-pointer transition-colors ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white border-0'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isLoading && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
            {resolvedConfirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmModal;
