import React, { useState, useMemo } from 'react';
import { ShoppingBag, Clock, CheckCircle } from 'lucide-react';
import { useRestaurantStore } from '../../stores/restaurantStore';
import { KitchenOrder } from './order.types';
import { OrderFilters } from './OrderFilters';
import { OrderTable } from './OrderTable';
import { OrderModalAction } from './OrderActions';
import { useLanguage } from '../../i18n';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

export const OrdersPage: React.FC = () => {
  const { orders } = useRestaurantStore();
  const { t } = useLanguage();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    type: true,
    status: true,
    for: true,
    items: true,
    total: true,
    placedAt: true,
  });

  const toggleColumn = (id: string) => {
    setVisibleColumns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.tableNumber && o.tableNumber.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchType = typeFilter === 'all' || o.type === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [orders, search, statusFilter, typeFilter]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  // Metrics KPI summary
  const totalOrders = orders.length;
  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === 'new' || o.status === 'preparing').length,
    [orders]
  );
  const completedOrders = useMemo(
    () => orders.filter((o) => o.status === 'ready' || o.status === 'served').length,
    [orders]
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <Breadcrumbs />
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {t('restaurant.orders', 'Orders')}
        </h1>
        <p className="text-xs text-slate-500">
          {t('restaurant.ordersSubtitle', 'Manage and track all restaurant orders')}
        </p>
      </div>

      {/* KPI Stat Cards (Matching Customers Page Clean Design) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Total Orders */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center gap-3">
          <div className="size-9 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <ShoppingBag className="size-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">
              {t('restaurant.totalOrders', 'Total Orders')}
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {totalOrders}
            </div>
          </div>
        </div>

        {/* Card 2: Pending / Preparing */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center gap-3">
          <div className="size-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="size-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">
              {t('restaurant.pendingPreparing', 'Pending / Preparing')}
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {pendingOrders}
            </div>
          </div>
        </div>

        {/* Card 3: Completed / Delivered */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center gap-3">
          <div className="size-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle className="size-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">
              {t('restaurant.completedOrders', 'Completed Orders')}
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {completedOrders}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <OrderFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        pageSize={pageSize}
        setPageSize={setPageSize}
        setCurrentPage={setCurrentPage}
        visibleColumns={visibleColumns}
        toggleColumn={toggleColumn}
      />

      {/* Order Table Component */}
      <OrderTable
        orders={paginatedOrders}
        totalEntries={filteredOrders.length}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        visibleColumns={visibleColumns}
        onView={setSelectedOrder}
        onPageChange={setCurrentPage}
      />

      {/* Order Detail Modal */}
      <OrderModalAction
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};

export default OrdersPage;
