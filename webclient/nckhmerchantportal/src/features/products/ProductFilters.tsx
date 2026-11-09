import React from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { Category, localizeCategoryName } from '../categories/category.types';
import { DataTableViewOptions } from '../../components/common';
import { useLanguage } from '../../i18n';

interface ProductFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  categories: Category[];
  pageSize: number;
  setPageSize: (val: number) => void;
  setCurrentPage: (val: number) => void;
  visibleColumns: Record<string, boolean>;
  toggleColumn: (id: string) => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  categories,
  pageSize,
  setPageSize,
  setCurrentPage,
  visibleColumns,
  toggleColumn,
}) => {
  const { t, language } = useLanguage();
  const isKhmer = language === 'kh';

  const handleReset = () => {
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5 p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-panel font-sans">
      {/* 1. Search Input (Reference: 🔍 Search name, title, ID...) */}
      <div className="relative w-full sm:w-64 md:w-72">
        <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder={t('common.search', 'Search name, SKU, barcode, ID...')}
          className="h-9 w-full pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
        />
      </div>

      {/* 2. Category Filter Dropdown */}
      <div className="relative">
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-9 pl-3 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 appearance-none cursor-pointer focus:outline-none focus:border-orange-500 transition-all max-w-[160px] truncate"
        >
          <option value="all">{t('products.allCategories', 'All Categories')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {localizeCategoryName(c.name, isKhmer, true)}
            </option>
          ))}
        </select>
        <ChevronDown className="size-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* 3. Status Filter Dropdown */}
      <div className="relative">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-9 pl-3 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 appearance-none cursor-pointer focus:outline-none focus:border-orange-500 transition-all"
        >
          <option value="all">{t('common.allStatus', 'All Status')}</option>
          <option value="active">{t('common.active', 'Active')}</option>
          <option value="inactive">{t('common.inactive', 'Inactive')}</option>
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
            { id: 'category', label: t('products.category', 'Category'), visible: Boolean(visibleColumns.category) },
            { id: 'price', label: t('products.price', 'Price'), visible: Boolean(visibleColumns.price) },
            { id: 'stock', label: t('products.stock', 'Stock'), visible: Boolean(visibleColumns.stock) },
            { id: 'status', label: t('products.status', 'Status'), visible: Boolean(visibleColumns.status) },
          ]}
          onToggleColumn={toggleColumn}
        />
      </div>
    </div>
  );
};

export default ProductFilters;
