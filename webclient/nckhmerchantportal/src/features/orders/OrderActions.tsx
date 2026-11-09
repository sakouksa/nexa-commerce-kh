import React from 'react';
import { Eye } from 'lucide-react';
import { KitchenOrder } from './order.types';
import { OrderDetailsModal } from './OrderDetailsModal';
import { useLanguage } from '../../i18n';

interface OrderRowActionsProps {
  order: KitchenOrder;
  onView: (order: KitchenOrder) => void;
}

export const OrderRowActions: React.FC<OrderRowActionsProps> = ({ order, onView }) => {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => onView(order)}
      className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
      title={t('common.view', 'View Details')}
    >
      <Eye className="size-4" />
    </button>
  );
};

interface OrderModalActionProps {
  order: KitchenOrder | null;
  onClose: () => void;
}

export const OrderModalAction: React.FC<OrderModalActionProps> = ({ order, onClose }) => {
  if (!order) return null;
  return <OrderDetailsModal isOpen={Boolean(order)} order={order} onClose={onClose} />;
};

export default OrderRowActions;
