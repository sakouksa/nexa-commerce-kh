import React from 'react';
import { Utensils, ShoppingBag, Bike, Calendar, Clock, DollarSign, Printer, CheckCircle } from 'lucide-react';
import { KitchenOrder } from '../../types/restaurant';
import { useLanguage } from '../../i18n';
import { Modal, ModalFooter } from '../../components/ui';

interface OrderDetailsModalProps {
  order: KitchenOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, isOpen, onClose }) => {
  const { t } = useLanguage();

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const statusBadge = {
    new: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    preparing: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    ready: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    served: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    cancelled: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  }[order.status];

  return (
    <Modal
      isOpen={isOpen && !!order}
      onClose={onClose}
      size="lg"
      icon={<span className="font-bold font-mono text-sm">{order.id}</span>}
      iconVariant="orange"
      title={`Order ${order.id}`}
      badge={
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize ${statusBadge}`}>
          {order.status}
        </span>
      }
      subtitle={order.placedAt}
      footer={
        <ModalFooter
          onCancel={onClose}
          cancelLabel={t('common.close', 'Close')}
          showSubmit={false}
          extraActions={
            <button
              type="button"
              onClick={handlePrint}
              className="h-10 px-4 rounded-xl border border-border/80 dark:border-slate-700 hover:bg-muted dark:hover:bg-slate-800 text-xs sm:text-[13px] font-bold text-muted-foreground dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="size-4" />
              <span>{t('restaurant.printTicket', 'Print Ticket')}</span>
            </button>
          }
        />
      }
    >
      <div className="p-6 space-y-4">
        {/* Order Meta Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400 block">{t('restaurant.orderType', 'Order Type')}</span>
            <div className="flex items-center gap-1 mt-0.5 font-semibold text-xs text-slate-800 dark:text-white capitalize">
              {order.type === 'dine-in' && <Utensils className="size-3 text-orange-500" />}
              {order.type === 'takeaway' && <ShoppingBag className="size-3 text-sky-500" />}
              {order.type === 'delivery' && <Bike className="size-3 text-emerald-500" />}
              <span>{order.type}</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block">{t('restaurant.tableOrCustomer', 'Table / Customer')}</span>
            <span className="font-semibold text-xs text-slate-800 dark:text-white mt-0.5 block">
              {order.tableNumber || order.customerName || 'Walk-in Guest'}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block">{t('restaurant.channel', 'Channel')}</span>
            <span className="font-semibold text-xs text-slate-800 dark:text-white mt-0.5 block uppercase">
              POS
            </span>
          </div>
        </div>

        {/* Items List */}
        <div>
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {t('restaurant.orderedItems', 'Ordered Items')} ({order.items.length})
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-3 bg-white dark:bg-slate-800/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="size-6 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 font-bold text-xs flex items-center justify-center">
                    {item.quantity}x
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                      {item.name}
                    </p>
                    {item.options && item.options.length > 0 && (
                      <p className="text-[11px] text-orange-600 dark:text-orange-400 italic">
                        {item.options.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100">
                    ${((item.price || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Total */}
        <div className="pt-2 flex justify-between items-center text-sm font-bold border-t border-slate-100 dark:border-slate-800">
          <span className="text-slate-700 dark:text-slate-300">{t('restaurant.totalAmount', 'Total Amount')}:</span>
          <span className="text-base font-mono text-orange-600 dark:text-orange-400">
            ${order.total?.toFixed(2) || '0.00'}
          </span>
        </div>
      </div>
    </Modal>
  );
};

export default OrderDetailsModal;
