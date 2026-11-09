import React from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { DataTableViewOptions } from '../../components/common/DataTableViewOptions';
import { useLanguage } from '../../i18n';

interface OrderFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  pageSize: number;
  setPageSize: (val: number) => void;
  setCurrentPage: (val: number) => void;
  visibleColumns: Record<string, boolean>;
  toggleColumn: (id: string) => void;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  pageSize,
  setPageSize,
  setCurrentPage,
  visibleColumns,
  toggleColumn,
}) => {
  const { t } = useLanguage();

  const handleReset = () => {
    setSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5 p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-panel font-sans">
      {/* 1. Search Box (Reference: 🔍 Search name, title, ID...) */}
      <div className="relative w-full sm:w-64 md:w-72">
        <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder={t('restaurant.searchOrders', 'Search order ID, table, customer...')}
          className="h-9 w-full pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
        />
      </div>

      {/* 2. Status Dropdown */}
      <div className="relative">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-9 pl-3 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 appearance-none cursor-pointer focus:outline-none focus:border-orange-500 transition-all"
        >
          <option value="all">{t('common.allStatuses', 'All Statuses')}</option>
          <option value="new">{t('restaurant.statusNew', 'New')}</option>
          <option value="preparing">{t('restaurant.statusPreparing', 'Preparing')}</option>
          <option value="ready">{t('restaurant.statusReady', 'Ready')}</option>
          <option value="served">{t('restaurant.statusServed', 'Served')}</option>
          <option value="cancelled">{t('common.cancelled', 'Cancelled')}</option>
        </select>
        <ChevronDown className="size-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* 3. Type Dropdown */}
      <div className="relative">
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-9 pl-3 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 appearance-none cursor-pointer focus:outline-none focus:border-orange-500 transition-all"
        >
          <option value="all">{t('restaurant.allTypes', 'All Types')}</option>
          <option value="dine-in">{t('restaurant.dineIn', 'Dine-in')}</option>
          <option value="takeaway">{t('restaurant.takeaway', 'Takeaway')}</option>
          <option value="delivery">{t('restaurant.delivery', 'Delivery')}</option>
        </select>
        <ChevronDown className="size-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* 4. Apply Button (Reference: ✓ Apply) */}
      <button
        type="button"
        onClick={() => setCurrentPage(1)}
        style={{
          backgroundColor: 'var(--btn-primary-hex, var(--primary-hex, #ec4899))',
        }}
        className="h-9 px-3.5 rounded-lg hover:brightness-90 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
      >
        <Check className="size-3.5 stroke-[2.5]" />
        <span>{t('buttons.apply', t('common.apply', 'Apply'))}</span>
      </button>

      {/* 5. Reset Button (Reference: Reset) */}
      <button
        type="button"
        onClick={handleReset}
        className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer active:scale-95"
      >
        {t('buttons.reset', t('common.reset', 'Reset'))}
      </button>

      {/* 6. Column Visibility (Placed at the very far right) */}
      <div className="ml-auto">
        <DataTableViewOptions
          columns={[
            { id: 'type', label: t('restaurant.type', 'Type'), visible: Boolean(visibleColumns.type) },
            { id: 'status', label: t('restaurant.status', 'Status'), visible: Boolean(visibleColumns.status) },
            { id: 'for', label: t('restaurant.for', 'Table / Customer'), visible: Boolean(visibleColumns.for) },
            { id: 'items', label: t('restaurant.items', 'Items'), visible: Boolean(visibleColumns.items) },
            { id: 'total', label: t('restaurant.total', 'Total'), visible: Boolean(visibleColumns.total) },
            { id: 'placedAt', label: t('restaurant.placedAt', 'Placed At'), visible: Boolean(visibleColumns.placedAt) },
          ]}
          onToggleColumn={toggleColumn}
        />
      </div>
    </div>
  );
};

export default OrderFilters;
