import React from 'react';
import { Utensils, ShoppingBag, Bike, ChevronLeft, ChevronRight } from 'lucide-react';
import { KitchenOrder, OrderType, KitchenOrderStatus } from './order.types';
import { OrderRowActions } from './OrderActions';
import { useLanguage } from '../../i18n';
import { Pagination } from '../../components/common/Pagination';

interface OrderTableProps {
  orders: KitchenOrder[];
  totalEntries: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  visibleColumns: Record<string, boolean>;
  onView: (order: KitchenOrder) => void;
  onPageChange: (page: number) => void;
}

const statusBadge: Record<KitchenOrderStatus, string> = {
  new: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800',
  preparing: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
  ready: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
  served: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
  cancelled: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
};

const renderTypeIcon = (type: OrderType) => {
  switch (type) {
    case 'dine-in':
      return <Utensils className="size-3 text-orange-500" />;
    case 'takeaway':
      return <ShoppingBag className="size-3 text-sky-500" />;
    case 'delivery':
      return <Bike className="size-3 text-emerald-500" />;
  }
};

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  totalEntries,
  currentPage,
  pageSize,
  totalPages,
  visibleColumns,
  onView,
  onPageChange,
}) => {
  const { t } = useLanguage();

  return (
    <div className="rounded-xl border border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] shadow-panel overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#dfe7df] dark:border-[#2a4245] bg-[#f7f8f2] dark:bg-[#17282b] text-[#71817e] dark:text-[#9fb0ac] font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-12">#</th>
              <th className="py-3 px-4 min-w-[120px]">{t('restaurant.orderId', 'Order ID')}</th>
              {visibleColumns.type && (
                <th className="py-3 px-4 min-w-[110px]">{t('restaurant.type', 'Type')}</th>
              )}
              {visibleColumns.status && (
                <th className="py-3 px-4 w-28">{t('restaurant.status', 'Status')}</th>
              )}
              {visibleColumns.for && (
                <th className="py-3 px-4 min-w-[160px]">{t('restaurant.for', 'Table / Customer')}</th>
              )}
              {visibleColumns.items && (
                <th className="py-3 px-4 min-w-[200px]">{t('restaurant.items', 'Items')}</th>
              )}
              {visibleColumns.total && (
                <th className="py-3 px-4 w-24">{t('restaurant.total', 'Total')}</th>
              )}
              {visibleColumns.placedAt && (
                <th className="py-3 px-4 w-24">{t('restaurant.placedAt', 'Placed At')}</th>
              )}
              <th className="py-3 px-4 w-16 text-right">{t('common.actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  {t('restaurant.noOrdersFound', 'No orders found')}
                </td>
              </tr>
            ) : (
              orders.map((order, idx) => {
                const rowNum = (currentPage - 1) * pageSize + idx + 1;
                const itemCount = order.items.reduce((s, it) => s + it.quantity, 0);

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{rowNum}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">
                        {order.id}
                      </span>
                    </td>
                    {visibleColumns.type && (
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                          {renderTypeIcon(order.type)}
                          <span>{order.type}</span>
                        </span>
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                            statusBadge[order.status]
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    )}
                    {visibleColumns.for && (
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {order.tableNumber || order.customerName || '—'}
                        </div>
                        {order.tableNumber && order.customerName && (
                          <div className="text-[10px] text-slate-400">{order.customerName}</div>
                        )}
                      </td>
                    )}
                    {visibleColumns.items && (
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        <div className="truncate max-w-[240px]">
                          {order.items.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </div>
                      </td>
                    )}
                    {visibleColumns.total && (
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                        ${order.total.toFixed(2)}
                      </td>
                    )}
                    {visibleColumns.placedAt && (
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {order.placedAt}
                      </td>
                    )}
                    <td className="py-3 px-4 text-right">
                      <OrderRowActions order={order} onView={onView} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer (SmartHR Employee Table Style) */}
      {totalEntries > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalEntries}
          pageSize={pageSize}
          onPageChange={onPageChange}
          itemLabel="orders"
        />
      )}
    </div>
  );
};

export default OrderTable;
