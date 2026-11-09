import React, { ReactNode } from 'react';
import { Modal as GlobalModal, ModalSize, ModalProps as GlobalModalProps } from '../ui/modal';

export interface ModalProps extends Omit<GlobalModalProps, 'children'> {
  open?: boolean;
  isOpen?: boolean;
  title?: ReactNode;
  onClose?: () => void;
  children: ReactNode;
  wide?: boolean;
  footer?: ReactNode;
  size?: ModalSize;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  isOpen,
  title,
  onClose,
  children,
  wide = false,
  footer,
  size,
  ...rest
}) => {
  const resolvedOpen = isOpen !== undefined ? isOpen : Boolean(open);
  const resolvedSize: ModalSize = size || (wide ? '2xl' : 'lg');

  return (
    <GlobalModal
      isOpen={resolvedOpen}
      onClose={onClose}
      title={title}
      size={resolvedSize}
      footer={footer}
      {...rest}
    >
      {children}
    </GlobalModal>
  );
};

export default Modal;
