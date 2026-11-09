import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Utensils,
  ShoppingBag,
  Bike,
  CheckCircle2,
  ChefHat,
  Flame,
  Check,
} from 'lucide-react';
import { useRestaurantStore } from '../../stores/restaurantStore';
import { KitchenOrder, KitchenOrderStatus } from '../../types/restaurant';
import { useLanguage } from '../../i18n';
import toast from '../../utils/toast';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

export const KitchenDisplayPage: React.FC = () => {
  const { orders, updateOrderStatus } = useRestaurantStore();
  const { t } = useLanguage();

  // Real-time ticking clock formatted as "Current time 09:48 pm"
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const columns: {
    status: KitchenOrderStatus;
    label: string;
    badgeColor: string;
    headerBg: string;
    accentDot: string;
  }[] = [
    {
      status: 'new',
      label: 'New',
      badgeColor: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
      headerBg: 'bg-sky-50/60 dark:bg-sky-950/20 border-sky-200/80 dark:border-sky-900/40',
      accentDot: 'bg-sky-500',
    },
    {
      status: 'preparing',
      label: 'Preparing',
      badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      headerBg: 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40',
      accentDot: 'bg-amber-500',
    },
    {
      status: 'ready',
      label: 'Ready',
      badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      headerBg: 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40',
      accentDot: 'bg-emerald-500',
    },
    {
      status: 'served',
      label: 'Served',
      badgeColor: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
      headerBg: 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800',
      accentDot: 'bg-slate-400',
    },
  ];

  const ordersByStatus = useMemo(() => {
    const map: Record<KitchenOrderStatus, KitchenOrder[]> = {
      new: [],
      preparing: [],
      ready: [],
      served: [],
      cancelled: [],
    };
    orders.forEach((o) => {
      if (map[o.status]) {
        map[o.status].push(o);
      }
    });
    return map;
  }, [orders]);

  const handleStartPreparing = (orderId: string) => {
    updateOrderStatus(orderId, 'preparing');
    toast.success(t('restaurant.orderStarted', { id: orderId, defaultValue: `Order ${orderId} is now preparing` }));
  };

  const handleMarkReady = (orderId: string) => {
    updateOrderStatus(orderId, 'ready');
    toast.success(t('restaurant.orderReady', { id: orderId, defaultValue: `Order ${orderId} is ready for pickup/serving!` }));
  };

  const handleMarkServed = (orderId: string) => {
    updateOrderStatus(orderId, 'served');
    toast.success(t('restaurant.orderServed', { id: orderId, defaultValue: `Order ${orderId} served successfully!` }));
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <Breadcrumbs />
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t('restaurant.kitchenDisplay', 'Kitchen Display')}</span>
          </h1>
          <p className="text-xs text-slate-500">
            {t('restaurant.liveOrderQueue', 'Live order queue')}
          </p>
        </div>

        {/* Live Clock */}
        <div className="px-3.5 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex items-center gap-2">
          <Clock className="size-3.5 text-slate-400" />
          <span className="text-xs text-slate-500">
            {t('restaurant.currentTime', 'Current time')}{' '}
            <strong className="text-slate-800 dark:text-slate-100 font-semibold">{currentTime}</strong>
          </span>
        </div>
      </div>

      {/* 4 Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const list = ordersByStatus[col.status] || [];

          return (
            <div
              key={col.status}
              className={`rounded-2xl border p-3 flex flex-col gap-3 min-h-[500px] ${col.headerBg}`}
            >
              {/* Column Header */}
              <div className="flex items-center gap-2 px-1">
                <span className={`size-2 rounded-full ${col.accentDot}`} />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {col.label}
                </span>
                <span
                  className={`size-5 rounded-full text-[11px] font-bold flex items-center justify-center border ${col.badgeColor}`}
                >
                  {list.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3">
                {list.map((order) => {
                  const isServed = order.status === 'served';

                  return (
                    <div
                      key={order.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3 transition-shadow hover:shadow-md"
                    >
                      {/* Card Header: Order ID + Target & Elapsed */}
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm font-mono text-slate-900 dark:text-white">
                              {order.id}
                            </span>

                            {order.type === 'dine-in' && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
                                <Utensils className="size-3" />
                                <span>{order.tableNumber || 'Table'}</span>
                              </span>
                            )}

                            {order.type === 'takeaway' && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 truncate max-w-[130px]">
                                <ShoppingBag className="size-3 shrink-0" />
                                <span className="truncate">{order.customerName || 'Takeaway'}</span>
                              </span>
                            )}

                            {order.type === 'delivery' && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 truncate max-w-[130px]">
                                <Bike className="size-3 shrink-0" />
                                <span className="truncate">{order.customerName || 'Delivery'}</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {order.items.reduce((sum, i) => sum + i.quantity, 0)} {t('restaurant.items', 'items')}
                          </p>
                        </div>

                        {/* Elapsed time */}
                        <div className="flex items-center gap-1 text-xs font-medium text-slate-500 shrink-0">
                          <Clock className="size-3" />
                          <span>{order.elapsedMinutes}m</span>
                        </div>
                      </div>

                      {/* Itemized Foods list */}
                      <div className="space-y-2.5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-xs">
                            <p
                              className={`font-semibold text-slate-800 dark:text-slate-200 ${
                                isServed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                              }`}
                            >
                              <span className="text-orange-600 dark:text-orange-400 mr-1.5 font-bold">
                                {item.quantity}×
                              </span>
                              {item.name}
                            </p>

                            {/* Subtext options/add-ons */}
                            {item.options && item.options.length > 0 && (
                              <p
                                className={`text-[10.5px] text-slate-500 dark:text-slate-400 pl-4 mt-0.5 leading-snug ${
                                  isServed ? 'line-through text-slate-400 dark:text-slate-600' : ''
                                }`}
                              >
                                {item.options.join(' · ')}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Card Action Button */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        {col.status === 'new' && (
                          <button
                            type="button"
                            onClick={() => handleStartPreparing(order.id)}
                            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Flame className="size-3.5 text-orange-500" />
                            <span>{t('restaurant.startPreparing', 'Start Preparing')}</span>
                          </button>
                        )}

                        {col.status === 'preparing' && (
                          <button
                            type="button"
                            onClick={() => handleMarkReady(order.id)}
                            style={{
                              backgroundColor:
                                'var(--btn-primary-hex, var(--primary-hex, #ec4899))',
                            }}
                            className="w-full py-2 px-3 rounded-xl hover:brightness-90 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                          >
                            <Check className="size-3.5 stroke-[2.5]" />
                            <span>{t('restaurant.markReady', 'Mark Ready')}</span>
                          </button>
                        )}

                        {col.status === 'ready' && (
                          <button
                            type="button"
                            onClick={() => handleMarkServed(order.id)}
                            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="size-3.5" />
                            <span>{t('restaurant.markServed', 'Mark Served')}</span>
                          </button>
                        )}

                        {col.status === 'served' && (
                          <div className="flex items-center justify-center gap-1.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="size-3.5" />
                            <span>{t('restaurant.served', 'Served')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {list.length === 0 && (
                  <div className="py-12 text-center text-xs text-slate-400">
                    {t('restaurant.noOrdersInCol', `No orders in ${col.label}`)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KitchenDisplayPage;
