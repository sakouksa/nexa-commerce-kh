import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from '../../utils/toast';
import {
  Search,
  ChevronDown,
  ArrowUpDown,
  Plus,
  Minus,
  Bell,
  Package,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  Edit2,
  Sliders,
  Check,
} from 'lucide-react';
import { stockService } from '../../services/stockService';
import { fullUrl } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../i18n';
import { Loading, Modal, Button } from '../../components/ui';
import { DataTableViewOptions, Pagination, Breadcrumbs } from '../../components/common';
import { localizeCategoryName } from '../categories/category.types';

interface StockProduct {
  id: number | string;
  name: string;
  category_name?: string;
  quantity: number;
  price?: number;
  images?: string[];
  [key: string]: any;
}

const GROUP_META: Record<
  string,
  {
    label: string;
    labelKh: string;
    border: string;
    iconBg: string;
    iconColor: string;
    pillClass: string;
    leftBorder: string;
    countColor: string;
  }
> = {
  out_of_stock: {
    label: 'Out of stock',
    labelKh: 'ចំនួនខ្វះ',
    border: 'border-rose-500',
    iconBg: 'bg-rose-50 dark:bg-rose-950/40',
    iconColor: 'text-rose-600 dark:text-rose-400',
    pillClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800',
    leftBorder: 'border-l-4 border-l-rose-500',
    countColor: 'text-rose-600 dark:text-rose-400',
  },
  low_stock: {
    label: 'Low stock',
    labelKh: 'ក្នុងគំនូរ',
    border: 'border-amber-500',
    iconBg: 'bg-amber-50 dark:bg-amber-950/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    pillClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800',
    leftBorder: 'border-l-4 border-l-amber-500',
    countColor: 'text-amber-600 dark:text-amber-400',
  },
  normal: {
    label: 'In stock',
    labelKh: 'មានគ្រប់គ្រាន់',
    border: 'border-emerald-500',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    pillClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800',
    leftBorder: 'border-l-4 border-l-emerald-500',
    countColor: 'text-emerald-600 dark:text-emerald-400',
  },
  high_stock: {
    label: 'High stock',
    labelKh: 'ស្ទុករួច',
    border: 'border-blue-500',
    iconBg: 'bg-sky-50 dark:bg-sky-950/40',
    iconColor: 'text-sky-600 dark:text-sky-400',
    pillClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800',
    leftBorder: 'border-l-4 border-l-blue-500',
    countColor: 'text-sky-600 dark:text-sky-400',
  },
};

const ORDER_GROUPS = ['out_of_stock', 'low_stock', 'normal', 'high_stock'];

export default function StockPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [low, setLow] = useState<number | string>(5);
  const [high, setHigh] = useState<number | string>(50);
  const [sending, setSending] = useState(false);
  const [stockModal, setStockModal] = useState<{
    product: StockProduct;
    qty: number | string;
    mode: 'add' | 'set';
  } | null>(null);

  // Tab & Filters
  const [tab, setTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    category: true,
    stock: true,
    status: true,
  });

  const toggleColumn = (id: string) => {
    setVisibleColumns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Sorting
  const [sortAsc, setSortAsc] = useState(true);
  const [sortField, setSortField] = useState<'index' | 'name' | 'stock'>('index');

  // Actions Dropdown
  const [openDropdownId, setOpenDropdownId] = useState<number | string | null>(null);

  const load = (l = Number(low) || 0, h = Number(high) || 0) => {
    if (!user?.shop_id) return;
    setLoading(true);
    stockService
      .getStockReport(user.shop_id, l, h)
      .then(setReport)
      .catch((err) => {
        toast.error(err?.response?.data?.detail || 'Failed to load stock report');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [user?.shop_id]);

  useEffect(() => {
    setPage(1);
  }, [tab, search, pageSize]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.action-dropdown-container')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const applyThresholds = () => {
    const l = Math.max(0, Number(low) || 0);
    const h = Math.max(1, Number(high) || 1);
    setLow(l);
    setHigh(h);
    load(l, h);
  };

  const openAddModal = (product: StockProduct) =>
    setStockModal({ product, qty: 1, mode: 'add' });
  const openSetModal = (product: StockProduct) =>
    setStockModal({ product, qty: product.quantity || 0, mode: 'set' });

  const saveStock = async () => {
    if (!stockModal) return;
    try {
      const qtyNumber = Number(stockModal.qty) || 0;
      const res = await stockService.updateStock(
        stockModal.product.id,
        qtyNumber,
        stockModal.mode
      );
      toast.success(
        language === 'kh'
          ? `បានកែសម្រួលស្តុកដោយជោគជ័យ → ${res.quantity}`
          : `${stockModal.mode === 'add' ? 'Added' : 'Set'} stock → ${res.quantity}`
      );
      setStockModal(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to update stock');
    }
  };

  const alertTelegram = async () => {
    if (!user?.shop_id) return;
    setSending(true);
    try {
      const res = await stockService.sendStockAlert(user.shop_id);
      toast.success(
        res.detail || (language === 'kh' ? 'បានផ្ញើសារដំណឹងទៅ Telegram' : 'Stock alert sent!')
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to send alert');
    } finally {
      setSending(false);
    }
  };

  const groups = report?.groups || {};
  const counts = report?.counts || {};

  const allProducts: StockProduct[] = useMemo(() => {
    return [
      ...(groups.out_of_stock || []),
      ...(groups.low_stock || []),
      ...(groups.normal || []),
      ...(groups.high_stock || []),
    ];
  }, [groups]);

  const currentTabProducts: StockProduct[] =
    tab === 'all' ? allProducts : groups[tab] || [];
  const totalProductsCount = report?.total_products ?? allProducts.length;

  // Filtered & Sorted items
  const filteredData = useMemo(() => {
    let list = currentTabProducts.filter((p) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.category_name || '').toLowerCase().includes(q) ||
        String(p.id).includes(q)
      );
    });

    list.sort((a, b) => {
      if (sortField === 'name') {
        return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      if (sortField === 'stock') {
        const qtyA = a.quantity ?? 0;
        const qtyB = b.quantity ?? 0;
        return sortAsc ? qtyA - qtyB : qtyB - qtyA;
      }
      // default 'index'
      const idA = Number(a.id) || 0;
      const idB = Number(b.id) || 0;
      return sortAsc ? idA - idB : idB - idA;
    });

    return list;
  }, [currentTabProducts, search, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, page, pageSize]);

  if (loading && allProducts.length === 0) return <Loading />;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <Breadcrumbs />
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {language === 'kh' ? 'គ្រប់គ្រងស្តុកទំនិញ' : t('nav.stock', 'Stock Management')}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'kh'
              ? 'ត្រួតពិនិត្យ និងកែសម្រួលកម្រិតស្តុកទំនិញទាំងអស់ក្នុងហាង'
              : 'Track and adjust inventory levels across all product tiers.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs shadow-panel">
            <span className="font-semibold text-slate-500">
              {language === 'kh' ? 'តិច ≤' : 'Low ≤'}
            </span>
            <input
              value={low}
              onChange={(e) => setLow(e.target.value)}
              className="w-8 text-center font-bold bg-transparent border-b border-slate-300 dark:border-slate-700 focus:outline-none focus:border-orange-500 text-xs text-slate-800 dark:text-slate-100"
            />
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="font-semibold text-slate-500">
              {language === 'kh' ? 'ច្រើន ≥' : 'High ≥'}
            </span>
            <input
              value={high}
              onChange={(e) => setHigh(e.target.value)}
              className="w-8 text-center font-bold bg-transparent border-b border-slate-300 dark:border-slate-700 focus:outline-none focus:border-orange-500 text-xs text-slate-800 dark:text-slate-100"
            />
            <button
              onClick={applyThresholds}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline ml-1 cursor-pointer"
            >
              {language === 'kh' ? 'អនុវត្ត' : 'Apply'}
            </button>
          </div>

          <button
            type="button"
            onClick={alertTelegram}
            disabled={sending}
            className="h-9 px-3.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Bell className="size-3.5" />
            <span>{sending ? 'Sending...' : 'Telegram Alert'}</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards (SmartHR Design Pattern) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ORDER_GROUPS.map((k) => {
          const meta = GROUP_META[k];
          const isActive = tab === k;
          return (
            <div
              key={k}
              onClick={() => setTab(tab === k ? 'all' : k)}
              className={`p-3.5 sm:p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-panel cursor-pointer transition-all ${
                isActive
                  ? 'border-orange-500 ring-2 ring-orange-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-orange-400/50'
              }`}
            >
              {/* Top Row: Icon + Status Pill */}
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`size-8.5 rounded-lg flex items-center justify-center shrink-0 ${meta.iconBg} ${meta.iconColor}`}
                >
                  {k === 'out_of_stock' ? (
                    <AlertTriangle className="size-4" />
                  ) : k === 'normal' ? (
                    <CheckCircle className="size-4" />
                  ) : (
                    <Package className="size-4" />
                  )}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${meta.pillClass}`}>
                  {language === 'kh' ? meta.labelKh : meta.label}
                </span>
              </div>

              {/* Count + Subtitle */}
              <div className="text-2xl font-bold font-mono text-[#16292e] dark:text-[#e7ede9]">
                {counts[k] ?? 0}
              </div>
              <p className="text-xs text-[#71817e] font-medium mt-0.5 truncate">
                {language === 'kh' ? meta.labelKh : meta.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* SmartHR Employee Table Filter Bar */}
      <div className="flex flex-wrap items-center gap-2.5 p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-panel font-sans">
        {/* Search Input */}
        <div className="relative w-full sm:w-64 md:w-72">
          <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={language === 'kh' ? 'ស្វែងរក ទំនិញក្នុងស្តុក...' : 'Search stock items...'}
            className="h-9 w-full pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
        </div>

        {/* Group / Stock Tier Dropdown */}
        <div className="relative">
          <select
            value={tab}
            onChange={(e) => {
              setTab(e.target.value);
              setPage(1);
            }}
            className="h-9 pl-3 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 appearance-none cursor-pointer focus:outline-none focus:border-orange-500 transition-all"
          >
            <option value="all">
              {language === 'kh' ? `ទាំងអស់ (${totalProductsCount})` : `All (${totalProductsCount})`}
            </option>
            {ORDER_GROUPS.map((k) => (
              <option key={k} value={k}>
                {language === 'kh' ? GROUP_META[k].labelKh : GROUP_META[k].label} ({counts[k] ?? 0})
              </option>
            ))}
          </select>
          <ChevronDown className="size-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Apply Button */}
        <button
          type="button"
          onClick={() => {
            load();
            setPage(1);
          }}
          style={{
            backgroundColor: 'var(--btn-primary-hex, var(--primary-hex, #ec4899))',
          }}
          className="h-9 px-3.5 rounded-lg hover:brightness-90 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Check className="size-3.5 stroke-[2.5]" />
          <span>{t('buttons.apply', t('common.apply', 'Apply'))}</span>
        </button>

        {/* Reset Button */}
        <button
          type="button"
          onClick={() => {
            setSearch('');
            setTab('all');
            setPage(1);
          }}
          className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {t('buttons.reset', t('common.reset', 'Reset'))}
        </button>

        {/* View / Column Visibility Toggle (Placed at the very far right) */}
        <div className="ml-auto">
          <DataTableViewOptions
            columns={[
              { id: 'category', label: t('tables.category', 'Category'), visible: visibleColumns.category },
              { id: 'stock', label: t('tables.currentStock', 'Current Stock'), visible: visibleColumns.stock },
              { id: 'status', label: t('tables.status', 'Status'), visible: visibleColumns.status },
            ]}
            onToggleColumn={toggleColumn}
          />
        </div>
      </div>

      {/* RestroPOS Stock Table Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-panel overflow-hidden font-sans">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[11px] tracking-wider bg-slate-50/90 dark:bg-slate-800/90">
                {/* Index Sort */}
                <th
                  onClick={() => {
                    if (sortField === 'index') {
                      setSortAsc(!sortAsc);
                    } else {
                      setSortField('index');
                      setSortAsc(true);
                    }
                  }}
                  className="py-3.5 px-4 w-12 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>#</span>
                    <ArrowUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                {/* Product Name */}
                <th
                  onClick={() => {
                    if (sortField === 'name') {
                      setSortAsc(!sortAsc);
                    } else {
                      setSortField('name');
                      setSortAsc(true);
                    }
                  }}
                  className="py-3.5 px-4 min-w-[200px] cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{t('tables.products', 'Product')}</span>
                    {sortField === 'name' && <ArrowUpDown className="size-3 text-orange-600" />}
                  </div>
                </th>

                {/* Category */}
                {visibleColumns.category && (
                  <th className="py-3.5 px-4">{t('tables.category', 'Category')}</th>
                )}

                {/* Current Stock */}
                {visibleColumns.stock && (
                  <th
                    onClick={() => {
                      if (sortField === 'stock') {
                        setSortAsc(!sortAsc);
                      } else {
                        setSortField('stock');
                        setSortAsc(true);
                      }
                    }}
                    className="py-3.5 px-4 text-center cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>{t('tables.currentStock', 'Current Stock')}</span>
                      {sortField === 'stock' && <ArrowUpDown className="size-3 text-orange-600" />}
                    </div>
                  </th>
                )}

                {/* Status */}
                {visibleColumns.status && (
                  <th className="py-3.5 px-4 text-center w-28">{t('tables.status', 'Status')}</th>
                )}

                {/* Actions */}
                <th className="py-3.5 px-4 w-12 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
              {paginatedData.map((p, idx) => {
                const rowNum = (page - 1) * pageSize + idx + 1;
                const isDropdownOpen = openDropdownId === p.id;
                let meta = GROUP_META.normal;
                if (p.quantity <= 0) {
                  meta = GROUP_META.out_of_stock;
                } else if (p.quantity <= Number(low)) {
                  meta = GROUP_META.low_stock;
                } else if (p.quantity >= Number(high)) {
                  meta = GROUP_META.high_stock;
                }

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Index Number */}
                    <td className="py-3.5 px-4 font-medium text-slate-400 text-xs">
                      {rowNum}
                    </td>

                    {/* Product Name + Image Thumbnail */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <img
                            src={fullUrl(p.images[0])}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-contain bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shrink-0"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/images/default-product.svg';
                            }}
                          />
                        ) : (
                          <img
                            src="/images/default-product.svg"
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-contain bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">ID: #{p.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    {visibleColumns.category && (
                      <td className="py-3.5 px-4">
                        <span className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md font-medium">
                          {p.category_name ? localizeCategoryName(p.category_name, language === 'kh', true) : '—'}
                        </span>
                      </td>
                    )}

                    {/* Current Stock */}
                    {visibleColumns.stock && (
                      <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-white">
                        {p.quantity}
                      </td>
                    )}

                    {/* Status Badge */}
                    {visibleColumns.status && (
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${meta.pillClass}`}
                        >
                          {language === 'kh' ? meta.labelKh : meta.label}
                        </span>
                      </td>
                    )}

                    {/* Three-dots Action Menu */}
                    <td className="py-3.5 px-4 text-right relative action-dropdown-container">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenDropdownId(isDropdownOpen ? null : p.id)
                        }
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      >
                        <MoreHorizontal className="size-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {isDropdownOpen && (
                        <div className="absolute right-4 top-10 z-30 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 text-left text-xs animate-in fade-in duration-100">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenDropdownId(null);
                              openAddModal(p);
                            }}
                            className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-400 cursor-pointer"
                          >
                            <Plus className="size-3.5" />
                            <span>{language === 'kh' ? 'បន្ថែមចំនួនស្តុក' : 'Add Stock'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setOpenDropdownId(null);
                              openSetModal(p);
                            }}
                            className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                          >
                            <Sliders className="size-3.5 text-slate-400" />
                            <span>{language === 'kh' ? 'កំណត់ស្តុកឡើងវិញ' : 'Set Stock'}</span>
                          </button>

                          <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                          <Link
                            to={`/products/${p.id}/edit`}
                            onClick={() => setOpenDropdownId(null)}
                            className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                          >
                            <Edit2 className="size-3.5 text-slate-400" />
                            <span>{language === 'kh' ? 'កែប្រែព័ត៌មានទំនិញ' : 'Edit Product'}</span>
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {paginatedData.length === 0 && (
                <tr>
                  <td
                    colSpan={3 + Object.values(visibleColumns).filter(Boolean).length}
                    className="py-12 text-center text-slate-400 text-sm"
                  >
                    {search
                      ? (language === 'kh' ? 'គ្មានទំនិញត្រូវនឹងការស្វែងរកទេ' : 'No items match your search')
                      : (language === 'kh' ? 'មិនមានទំនិញក្នុងក្រុមនេះទេ' : 'No products in this category')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Standardized SmartHR Pagination Footer */}
        {filteredData.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={filteredData.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
            itemLabel={language === 'kh' ? 'ទំនិញ' : 'items'}
          />
        )}
      </div>

      {/* Add / Set Stock Modal */}
      <Modal
        open={!!stockModal}
        title={
          stockModal?.mode === 'add'
            ? language === 'kh'
              ? `បន្ថែមស្តុក — ${stockModal?.product?.name}`
              : `Add Stock — ${stockModal?.product?.name}`
            : language === 'kh'
            ? `កំណត់ស្តុក — ${stockModal?.product?.name}`
            : `Set Stock — ${stockModal?.product?.name}`
        }
        onClose={() => setStockModal(null)}
      >
        {stockModal && (
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {language === 'kh' ? 'ស្តុកបច្ចុប្បន្ន' : 'Current stock'}
              </span>
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stockModal.product.quantity}
              </span>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                {stockModal.mode === 'add'
                  ? language === 'kh'
                    ? 'ចំនួនត្រូវបន្ថែម'
                    : 'Quantity to add'
                  : language === 'kh'
                  ? 'ចំនួនស្តុកថ្មី'
                  : 'New quantity'}
              </label>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="w-12 h-12 p-0 flex items-center justify-center rounded-xl"
                  onClick={() =>
                    setStockModal({
                      ...stockModal,
                      qty: Math.max(0, (Number(stockModal.qty) || 0) - 1),
                    })
                  }
                >
                  <Minus className="w-5 h-5" />
                </Button>

                <input
                  type="number"
                  min="0"
                  value={stockModal.qty}
                  onChange={(e) => setStockModal({ ...stockModal, qty: e.target.value })}
                  className="flex-1 h-12 text-center text-xl font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />

                <Button
                  variant="outline"
                  className="w-12 h-12 p-0 flex items-center justify-center rounded-xl"
                  onClick={() =>
                    setStockModal({
                      ...stockModal,
                      qty: (Number(stockModal.qty) || 0) + 1,
                    })
                  }
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              {stockModal.mode === 'add' && Number(stockModal.qty) > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5">
                  {language === 'kh' ? 'លទ្ធផលក្រោយបន្ថែម:' : 'Resulting stock:'}{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {(stockModal.product.quantity || 0) + (Number(stockModal.qty) || 0)}
                  </strong>
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setStockModal(null)}>
                {language === 'kh' ? 'បោះបង់' : 'Cancel'}
              </Button>
              <Button onClick={saveStock}>
                {language === 'kh' ? 'រក្សាទុក' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}