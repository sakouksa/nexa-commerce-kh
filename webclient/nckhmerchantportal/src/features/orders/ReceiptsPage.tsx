import React, { useEffect, useMemo, useState } from 'react';
import toast from '../../utils/toast';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
  Printer,
  ExternalLink,
  DollarSign,
  Banknote,
  QrCode,
  Calendar,
  ShoppingBag,
  Store,
  Send,
  Copy,
  Check,
  CreditCard,
  Package,
  Receipt,
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { fullUrl } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../i18n';
import { Order } from '../../types';
import { Loading } from '../../components/ui';
import { GlobalFormat } from '../../utils/GlobalFormat';
import { DataTableViewOptions, Pagination, Breadcrumbs } from '../../components/common';
import ReceiptPrintDocument from './ReceiptPrintDocument';

export default function ReceiptsPage() {
  const { user } = useAuth();
  const { t, language, isKhmer } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<number | string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  // Filters & Controls
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'bank'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'this_week' | 'this_month'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    order: true,
    channel: true,
    customer: true,
    items: true,
    payment: true,
    total: true,
    receipt: true,
  });

  const toggleColumn = (id: string) => {
    setVisibleColumns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Sorting
  const [sortAsc, setSortAsc] = useState(false);
  const [sortField, setSortField] = useState<'index' | 'order' | 'total' | 'date'>('date');

  const load = () => {
    if (!user?.shop_id) return;
    setLoading(true);
    orderService
      .listOrders(user.shop_id)
      .then(setOrders)
      .catch((err) => {
        toast.error(err?.response?.data?.detail || t('receipts.failedToLoad', 'Failed to load receipts'));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [user?.shop_id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, paymentFilter, dateFilter, pageSize]);

  const makeReceipt = (id: number | string) => {
    const lang = isKhmer ? 'km' : 'en';
    window.open(fullUrl(`/api/orders/${id}/receipt?lang=${lang}`), '_blank');
  };

  const handlePrint = (order: Order) => {
    setPrintOrder(order);
    const cleanup = () => {
      setPrintOrder(null);
    };
    window.addEventListener('afterprint', cleanup, { once: true });
    setTimeout(() => {
      window.print();
    }, 60);
  };

  const handleViewPdf = (order: Order) => {
    const lang = isKhmer ? 'km' : 'en';
    window.open(fullUrl(`/api/orders/${order.id}/receipt?lang=${lang}`), '_blank');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success(t('receipts.copiedOrderNumber', 'Copied order number'));
    setTimeout(() => setCopiedId(null), 1500);
  };

  const paidOrders = useMemo(() => {
    return orders.filter((o) => o.payment_status === 'paid');
  }, [orders]);

  // Helper date key formatter for Cambodia timezone
  const getKhmerDateKey = (dateStr?: string | Date | null): string => {
    if (!dateStr) return '';
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Phnom_Penh' }).format(d);
  };

  // Helper for dual currency values
  const getDualCurrency = (amount: number = 0, currency: string = 'USD') => {
    const isKhr = currency.toUpperCase() === 'KHR';
    const usd = isKhr ? amount / 4100 : amount;
    const khr = isKhr ? amount : Math.round(amount * 4100);
    return {
      usdStr: `$${Number(usd).toFixed(2)}`,
      khrStr: `៛${new Intl.NumberFormat('en-US').format(khr)}`,
    };
  };

  // Metric Stats Calculation
  const stats = useMemo(() => {
    const todayKey = getKhmerDateKey(new Date());
    let totalRevUsd = 0;
    let cashUsd = 0;
    let cashCount = 0;
    let bankUsd = 0;
    let bankCount = 0;
    let todayUsd = 0;
    let todayCount = 0;

    for (const o of paidOrders) {
      const isKhr = (o.currency || 'USD').toUpperCase() === 'KHR';
      const amountUsd = isKhr ? (o.total ?? 0) / 4100 : (o.total ?? 0);

      totalRevUsd += amountUsd;

      const m = (o.payment_method || 'cash').toLowerCase();
      if (m === 'cash') {
        cashUsd += amountUsd;
        cashCount++;
      } else {
        bankUsd += amountUsd;
        bankCount++;
      }

      const orderDateKey = getKhmerDateKey(o.paid_at || o.created_at);
      if (orderDateKey === todayKey) {
        todayUsd += amountUsd;
        todayCount++;
      }
    }

    return {
      totalRev: getDualCurrency(totalRevUsd, 'USD'),
      totalCount: paidOrders.length,
      cash: getDualCurrency(cashUsd, 'USD'),
      cashCount,
      cashPct: paidOrders.length > 0 ? Math.round((cashCount / paidOrders.length) * 100) : 0,
      bank: getDualCurrency(bankUsd, 'USD'),
      bankCount,
      bankPct: paidOrders.length > 0 ? Math.round((bankCount / paidOrders.length) * 100) : 0,
      today: getDualCurrency(todayUsd, 'USD'),
      todayCount,
    };
  }, [paidOrders]);

  // Channel helper
  const getOrderChannel = (o: Order) => {
    const num = (o.order_number || '').toUpperCase();
    if (num.startsWith('POS')) return 'pos';
    if (o.customer_telegram || (o.customer_note || '').toLowerCase().includes('telegram')) return 'telegram';
    return 'storefront';
  };

  // Payment Badge helper
  const renderPaymentBadge = (method?: string) => {
    const m = (method || 'cash').toLowerCase();
    if (m === 'cash') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
          <Banknote className="size-3" />
          <span>{t('receipts.cash', 'Cash')}</span>
        </span>
      );
    }
    if (['aba', 'khqr', 'bakong'].includes(m)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
          <QrCode className="size-3" />
          <span>ABA KHQR</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800">
        <CreditCard className="size-3" />
        <span>{m ? m.toUpperCase() : t('receipts.otherPayment', 'OTHER')}</span>
      </span>
    );
  };

  // Filtered & Sorted orders
  const filteredData = useMemo(() => {
    const now = new Date();
    const todayKey = getKhmerDateKey(now);
    const yesterdayKey = getKhmerDateKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));
    const currentMonthKey = todayKey.slice(0, 7);
    const sevenDaysAgoTime = now.getTime() - 7 * 24 * 60 * 60 * 1000;

    let list = paidOrders.filter((o) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        (o.order_number || '').toLowerCase().includes(q) ||
        (o.customer_name || '').toLowerCase().includes(q) ||
        (o.customer_phone || '').toLowerCase().includes(q);

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'generated' && Boolean(o.receipt_url)) ||
        (statusFilter === 'not_generated' && !o.receipt_url);

      const m = (o.payment_method || 'cash').toLowerCase();
      const matchPayment =
        paymentFilter === 'all' ||
        (paymentFilter === 'cash' && m === 'cash') ||
        (paymentFilter === 'bank' && m !== 'cash');

      const orderDateKey = getKhmerDateKey(o.paid_at || o.created_at);
      const orderTime = o.paid_at
        ? new Date(o.paid_at).getTime()
        : o.created_at
        ? new Date(o.created_at).getTime()
        : 0;

      let matchDate = true;
      if (dateFilter === 'today') {
        matchDate = orderDateKey === todayKey;
      } else if (dateFilter === 'yesterday') {
        matchDate = orderDateKey === yesterdayKey;
      } else if (dateFilter === 'this_week') {
        matchDate = orderTime >= sevenDaysAgoTime;
      } else if (dateFilter === 'this_month') {
        matchDate = orderDateKey.startsWith(currentMonthKey);
      }

      return matchSearch && matchStatus && matchPayment && matchDate;
    });

    list.sort((a, b) => {
      if (sortField === 'order') {
        const ordA = a.order_number || '';
        const ordB = b.order_number || '';
        return sortAsc ? ordA.localeCompare(ordB) : ordB.localeCompare(ordA);
      }
      if (sortField === 'total') {
        const totalA = a.total ?? 0;
        const totalB = b.total ?? 0;
        return sortAsc ? totalA - totalB : totalB - totalA;
      }
      if (sortField === 'date') {
        const dateA = a.paid_at
          ? new Date(a.paid_at).getTime()
          : a.created_at
          ? new Date(a.created_at).getTime()
          : 0;
        const dateB = b.paid_at
          ? new Date(b.paid_at).getTime()
          : b.created_at
          ? new Date(b.created_at).getTime()
          : 0;
        return sortAsc ? dateA - dateB : dateB - dateA;
      }
      // default 'index'
      const idA = Number(a.id) || 0;
      const idB = Number(b.id) || 0;
      return sortAsc ? idA - idB : idB - idA;
    });

    return list;
  }, [paidOrders, search, statusFilter, paymentFilter, dateFilter, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  if (loading && orders.length === 0) return <Loading />;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <Breadcrumbs />
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t('receipts.title', 'Receipts')}</span>
          </h1>
          <p className="text-xs text-slate-500">
            {t('receipts.subtitle', 'Manage, view and print PDF receipts for all paid orders')}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200/80 dark:border-orange-800 text-xs font-semibold">
          <span className="size-2 rounded-full bg-orange-500" />
          <span>{paidOrders.length}</span>
          <span>{t('receipts.paidReceiptsBadge', 'Paid Receipts')}</span>
        </div>
      </div>

      {/* KPI Stat Cards (Matching Customers Page Clean Design) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Total Receipts */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center gap-3">
          <div className="size-9 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Receipt className="size-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">
              {t('receipts.totalReceipts', 'Total Receipts')}
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {stats.totalCount}
            </div>
          </div>
        </div>

        {/* Card 2: Today's Receipts */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center gap-3">
          <div className="size-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Calendar className="size-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">
              {t('receipts.todayReceipts', "Today's Receipts")}
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {stats.todayCount}
            </div>
          </div>
        </div>

        {/* Card 3: Total Revenue */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center gap-3">
          <div className="size-9 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <DollarSign className="size-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">
              {t('receipts.totalRevenue', 'Total Revenue')}
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {stats.totalRev.usdStr}
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[#71817e] font-semibold mr-1 text-[11px]">
          {t('receipts.dateLabel', 'Date:')}
        </span>
        {[
          { key: 'all', label: t('receipts.dateAll', 'All Time') },
          { key: 'today', label: t('receipts.dateToday', 'Today') },
          { key: 'yesterday', label: t('receipts.dateYesterday', 'Yesterday') },
          { key: 'this_week', label: t('receipts.dateThisWeek', 'Last 7 Days') },
          { key: 'this_month', label: t('receipts.dateThisMonth', 'This Month') },
        ].map((item) => {
          const active = dateFilter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setDateFilter(item.key as any);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-[#ea580c] text-white shadow-xs font-bold'
                  : 'bg-white dark:bg-[#142629] text-[#71817e] dark:text-[#a0b0ad] border border-[#dfe7df] dark:border-[#2a4245] hover:bg-[#f7f8f2] dark:hover:bg-[#1b3438]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* SmartHR Employee Table Filter Bar */}
      <div className="flex flex-wrap items-center gap-2.5 p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-panel font-sans">
        {/* Search Box */}
        <div className="relative w-full sm:w-64 md:w-72">
          <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={t('receipts.searchPlaceholder', 'Search by order #, customer...')}
            className="h-9 w-full pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
        </div>

        {/* Payment Method Filter */}
        <div className="relative">
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="h-9 pl-3 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 appearance-none cursor-pointer focus:outline-none focus:border-orange-500 transition-all"
          >
            <option value="all">{t('receipts.allPayments', 'All Payments')}</option>
            <option value="cash">{t('receipts.cashWithIcon', 'Cash')}</option>
            <option value="bank">{t('receipts.bankWithIcon', 'Bank / KHQR')}</option>
          </select>
          <ChevronDown className="size-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Receipt PDF Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 pl-3 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 appearance-none cursor-pointer focus:outline-none focus:border-orange-500 transition-all"
          >
            <option value="all">{t('receipts.allReceipts', 'All Receipts')}</option>
            <option value="generated">{t('receipts.generatedPdf', 'Generated PDF')}</option>
            <option value="not_generated">{t('receipts.notGenerated', 'Not Generated')}</option>
          </select>
          <ChevronDown className="size-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Apply Button */}
        <button
          type="button"
          onClick={() => {
            load();
            setCurrentPage(1);
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
            setPaymentFilter('all');
            setStatusFilter('all');
            setDateFilter('all');
            setCurrentPage(1);
          }}
          className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {t('buttons.reset', t('common.reset', 'Reset'))}
        </button>

        {/* View / Column Visibility Toggle (Placed at the very far right) */}
        <div className="ml-auto">
          <DataTableViewOptions
            columns={[
              { id: 'order', label: t('receipts.orderAndDate', 'Order # & Date'), visible: visibleColumns.order },
              { id: 'channel', label: t('receipts.channel', 'Channel'), visible: visibleColumns.channel },
              { id: 'customer', label: t('tables.customer', 'Customer'), visible: visibleColumns.customer },
              { id: 'items', label: t('receipts.items', 'Items'), visible: visibleColumns.items },
              { id: 'payment', label: t('receipts.payment', 'Payment'), visible: visibleColumns.payment },
              { id: 'total', label: t('tables.total', 'Total'), visible: visibleColumns.total },
              { id: 'receipt', label: t('tables.receipt', 'Receipt'), visible: visibleColumns.receipt },
            ]}
            onToggleColumn={toggleColumn}
          />
        </div>
      </div>

      {/* Receipts Table Card */}
      <div className="rounded-xl border border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] shadow-panel overflow-hidden font-sans">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#dfe7df] dark:border-[#2a4245] text-[#71817e] dark:text-[#a0b0ad] font-semibold uppercase text-[11px] tracking-wider bg-[#f7f8f2]/90 dark:bg-[#17282b]/90">
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
                  className="py-3.5 px-3 w-10 cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>{t('receipts.colIndex', '#')}</span>
                    <ArrowUpDown className="size-3 text-slate-400" />
                  </div>
                </th>

                {/* Order & Time */}
                {visibleColumns.order && (
                  <th
                    onClick={() => {
                      if (sortField === 'order') {
                        setSortAsc(!sortAsc);
                      } else {
                        setSortField('order');
                        setSortAsc(true);
                      }
                    }}
                    className="py-3.5 px-4 cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>{t('receipts.orderAndDate', 'Order # & Date')}</span>
                      {sortField === 'order' && <ArrowUpDown className="size-3 text-orange-500" />}
                    </div>
                  </th>
                )}

                {/* Channel / Source */}
                {visibleColumns.channel && (
                  <th className="py-3.5 px-3">
                    {t('receipts.channel', 'Channel')}
                  </th>
                )}

                {/* Customer */}
                {visibleColumns.customer && (
                  <th className="py-3.5 px-4">{t('tables.customer', 'Customer')}</th>
                )}

                {/* Items */}
                {visibleColumns.items && (
                  <th className="py-3.5 px-3">{t('receipts.items', 'Items')}</th>
                )}

                {/* Payment Method */}
                {visibleColumns.payment && (
                  <th className="py-3.5 px-3">{t('receipts.payment', 'Payment')}</th>
                )}

                {/* Total ($ & ៛) */}
                {visibleColumns.total && (
                  <th
                    onClick={() => {
                      if (sortField === 'total') {
                        setSortAsc(!sortAsc);
                      } else {
                        setSortField('total');
                        setSortAsc(true);
                      }
                    }}
                    className="py-3.5 px-4 cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>{t('tables.total', 'Total')} ($ & ៛)</span>
                      {sortField === 'total' && <ArrowUpDown className="size-3 text-orange-500" />}
                    </div>
                  </th>
                )}

                {/* Receipt PDF */}
                {visibleColumns.receipt && (
                  <th className="py-3.5 px-3 text-center">{t('tables.receipt', 'Receipt')}</th>
                )}

                {/* Actions */}
                <th className="py-3.5 px-4 text-right">{t('tables.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {paginatedData.map((o, idx) => {
                const rowNum = (currentPage - 1) * pageSize + idx + 1;
                const isGenerating = generatingId === o.id;
                const channel = getOrderChannel(o);
                const dual = getDualCurrency(o.total ?? 0, o.currency || 'USD');
                const isCopied = copiedId === o.order_number;

                // Format short order number if very long
                const rawNum = o.order_number || '';
                const shortNum =
                  rawNum.length > 20
                    ? `${rawNum.slice(0, 10)}...${rawNum.slice(-5)}`
                    : rawNum;

                // Total items count
                const totalItemCount = o.items && o.items.length > 0 ? o.items.length : 1;
                const totalQuantity =
                  o.items && o.items.length > 0
                    ? o.items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0)
                    : 1;

                return (
                  <tr
                    key={o.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Index Number */}
                    <td className="py-3.5 px-3 font-medium text-slate-400 text-xs">
                      {rowNum}
                    </td>

                    {/* Order Number & Timestamp */}
                    {visibleColumns.order && (
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              title={rawNum}
                              className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400"
                            >
                              #{shortNum}
                            </span>
                            <button
                              type="button"
                              title={t('receipts.copyOrderNumber', 'Copy order number')}
                              onClick={() => handleCopy(rawNum)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                            >
                              {isCopied ? (
                                <Check className="size-3 text-emerald-500" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                            </button>
                          </div>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            {o.paid_at || o.created_at
                              ? GlobalFormat.dateTime(o.paid_at || o.created_at)
                              : '—'}
                          </span>
                        </div>
                      </td>
                    )}

                    {/* Channel / Source */}
                    {visibleColumns.channel && (
                      <td className="py-3.5 px-3">
                        {channel === 'pos' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-200/80 dark:border-orange-800">
                            <Store className="size-3" />
                            <span>{t('receipts.channels.pos', 'POS')}</span>
                          </span>
                        )}
                        {channel === 'telegram' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800">
                            <Send className="size-3" />
                            <span>{t('receipts.channels.telegram', 'Telegram')}</span>
                          </span>
                        )}
                        {channel === 'storefront' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
                            <ShoppingBag className="size-3" />
                            <span>{t('receipts.channels.storefront', 'Online')}</span>
                          </span>
                        )}
                      </td>
                    )}

                    {/* Customer */}
                    {visibleColumns.customer && (
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {o.customer_name || t('receipts.walkInCustomer', 'Walk-in Customer')}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {o.customer_phone || '—'}
                        </p>
                      </td>
                    )}

                    {/* Items Count */}
                    {visibleColumns.items && (
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                          <Package className="size-3 text-slate-400" />
                          <span className="font-medium text-xs">
                            {totalItemCount}{' '}
                            {totalItemCount === 1
                              ? t('receipts.itemCount', 'item')
                              : t('receipts.itemsCount', 'items')}
                          </span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            ({totalQuantity})
                          </span>
                        </div>
                      </td>
                    )}

                    {/* Payment Method */}
                    {visibleColumns.payment && (
                      <td className="py-3.5 px-3">
                        {renderPaymentBadge(o.payment_method)}
                      </td>
                    )}

                    {/* Total ($ & ៛) */}
                    {visibleColumns.total && (
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div>
                          <div className="font-bold font-mono text-slate-900 dark:text-white">
                            {dual.usdStr}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-400 font-mono">
                            {dual.khrStr}
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Receipt PDF View Link */}
                    {visibleColumns.receipt && (
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          disabled={generatingId === o.id}
                          onClick={() => handleViewPdf(o)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-800/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <ExternalLink className="size-3.5" />
                          <span>{generatingId === o.id ? '...' : t('receipts.viewPdf', 'View PDF')}</span>
                        </button>
                      </td>
                    )}

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          disabled={isGenerating}
                          onClick={() => makeReceipt(o.id)}
                          className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Download className="size-3 text-slate-400" />
                          <span>{isGenerating ? '...' : t('receipts.downloadPdf', 'PDF')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrint(o)}
                          className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Printer className="size-3 text-slate-400" />
                          <span>{t('receipts.print', 'Print')}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedData.length === 0 && (
                <tr>
                  <td
                    colSpan={2 + Object.values(visibleColumns).filter(Boolean).length}
                    className="py-12 text-center text-slate-400 text-sm"
                  >
                    {search || dateFilter !== 'all' || paymentFilter !== 'all'
                      ? t('receipts.noReceiptsMatch', 'No receipts match your filter or search')
                      : t('receipts.noReceiptsYet', 'No paid receipts yet')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Standardized SmartHR Pagination Footer */}
        {filteredData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredData.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            itemLabel={t('receipts.receipts', 'receipts')}
          />
        )}
      </div>

      {/* Direct Native Print Canvas (No preview modal) */}
      {printOrder && (
        <div
          id="direct-print-container"
          className="fixed -left-[99999px] top-0 opacity-0 pointer-events-none print:static print:left-0 print:opacity-100 print:pointer-events-auto print:block print:w-full print:m-0 print:p-0"
        >
          <style>{`
            @media print {
              @page {
                size: A4 portrait !important;
                margin: 8mm 10mm !important;
              }
              body * {
                visibility: hidden !important;
              }
              #direct-print-container, #direct-print-container * {
                visibility: visible !important;
              }
              #direct-print-container {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
              }
            }
          `}</style>
          <ReceiptPrintDocument order={printOrder} />
        </div>
      )}
    </div>
  );
}
