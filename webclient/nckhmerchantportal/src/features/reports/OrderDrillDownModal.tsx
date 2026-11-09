import React from 'react';
import { Calendar } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Order } from '../../types';
import { useLanguage } from '../../i18n';

interface OrderDrillDownModalProps {
  language?: string;
  selectedDate: string | null;
  onClose: () => void;
  orders: Order[];
}

export const OrderDrillDownModal: React.FC<OrderDrillDownModalProps> = ({
  selectedDate,
  onClose,
  orders,
}) => {
  const { t } = useLanguage();
  const filteredOrders = orders.filter((o) => {
    if (!selectedDate || !o.created_at) return false;
    return o.created_at.startsWith(selectedDate);
  });

  return (
    <Modal
      isOpen={!!selectedDate}
      onClose={onClose}
      size="3xl"
      icon={<Calendar className="size-5" />}
      iconVariant="orange"
      title={t('reports.drillDownTitle', {
        date: selectedDate,
        defaultValue: `Orders Breakdown for ${selectedDate}`,
      })}
      subtitle={t('reports.drillDownSubtitle', {
        count: filteredOrders.length,
        defaultValue: `Showing all individual orders created on this date (${filteredOrders.length} orders)`,
      })}
    >
      <div className="p-6 space-y-3">
        {filteredOrders.length > 0 ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 dark:bg-slate-800/50">
                  <TableHead>{t('reports.orderNumber', 'Order #')}</TableHead>
                  <TableHead>{t('reports.colCustomer', 'Customer')}</TableHead>
                  <TableHead className="text-center">{t('reports.payment', 'Payment')}</TableHead>
                  <TableHead className="text-center">{t('reports.status', 'Status')}</TableHead>
                  <TableHead className="text-right">{t('reports.total', 'Total')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((ord) => (
                  <TableRow key={ord.id}>
                    <TableCell className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      {ord.order_number || `#${ord.id}`}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {ord.customer_name || t('reports.walkInCustomer', 'Walk-in Customer')}
                      </div>
                      {ord.customer_phone && (
                        <div className="text-[11px] text-slate-400 font-mono">
                          {ord.customer_phone}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono font-medium">
                        {ord.payment_method || 'Cash'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={ord.payment_status === 'paid' ? 'success' : 'warning'}
                        className="text-[10px] capitalize"
                      >
                        {ord.payment_status || ord.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                      ${Number(ord.total || 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">
            {t('reports.noOrdersForDate', 'No individual order records found matching this date')}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default OrderDrillDownModal;
