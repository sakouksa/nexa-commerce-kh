import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useLanguage } from '../../i18n';

export interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  const { t } = useLanguage();
  const resolvedConfirm = confirmText || t('buttons.confirm');
  const resolvedCancel = cancelText || t('buttons.cancel');

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {resolvedCancel}
          </Button>
          <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
            {resolvedConfirm}
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
    </Modal>
  );
};
export default ConfirmModal;
