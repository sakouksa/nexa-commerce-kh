import React, { ReactNode } from 'react';
import { Modal as GlobalModal, ModalSize } from '../ui/modal';

export interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  footer?: ReactNode;
  size?: ModalSize;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  title,
  onClose,
  children,
  wide = false,
  footer,
  size,
}) => {
  const resolvedSize: ModalSize = size || (wide ? '2xl' : 'lg');

  return (
    <GlobalModal
      isOpen={open}
      onClose={onClose}
      title={title}
      size={resolvedSize}
      footer={footer}
    >
      <div className="p-6">{children}</div>
    </GlobalModal>
  );
};

export default Modal;
