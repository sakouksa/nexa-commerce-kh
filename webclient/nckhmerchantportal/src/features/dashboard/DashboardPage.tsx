import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import usePageTab from '@/hooks/usePageTab';
import {
  FiBox,
  FiDollarSign,
  FiPackage,
  FiShoppingBag,
  FiUsers,
  FiExternalLink,
  FiInbox,
  FiTrendingUp,
  FiEye,
  FiClock,
  FiCreditCard,
  FiPhone,
  FiMapPin,
  FiPrinter,
  FiInfo,
  FiCheckCircle,
  FiAlertTriangle,
  FiCheck,
  FiCopy,
  FiSend,
  FiAward,
  FiArrowRight,
  FiPieChart,
  FiBarChart2,
  FiDownload,
  FiActivity,
  FiRefreshCw,
  FiUserCheck,
} from 'react-icons/fi';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import { reportService } from '../../services/reportService';
import { stockService } from '../../services/stockService';
import { orderService } from '../../services/orderService';
import { telegramService } from '../../services/telegramService';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../i18n';
import { useThemeStore } from '../../stores/themeStore';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../../components/ui/table';
import { Button } from '../../components/common/Button';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '../../components/ui/sheet';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  ChartTooltip,
  Legend,
  Filler
);

const STATUS_VARIANTS: Record<string, 'warning' | 'info' | 'purple' | 'success' | 'destructive'> = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'purple',
  delivered: 'success',
  completed: 'success',
  cancelled: 'destructive',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const shopId = user?.shop_id;
  const { widgetsList } = useThemeStore();

  const isWidgetVisible = (id: string) => {
    const item = widgetsList?.find((w) => w.id === id);
    return item ? item.visible : true;
  };

  const [overview, setOverview] = useState<any>(null);
  const [sales, setSales] = useState<any>(null);
  const [stockReport, setStockReport] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [telegramConfig, setTelegramConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>('daily');
  const [analyticsDays, setAnalyticsDays] = useState<number>(14);
  const [activeTab, setActiveTab] = usePageTab<'overview' | 'analytics'>({
    paramKey: 'tab',
    defaultTab: 'overview',
    validTabs: ['overview', 'analytics'] as const,
    transform: (raw) => (raw.toLowerCase() === 'analytics' ? 'analytics' : 'overview'),
    storageKey: 'merchant_dashboard_tab',
  });
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);

  // Sheet Quick View state
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);

  useEffect(() => {
    if (!shopId) return;
    setLoading(true);
    Promise.allSettled([
      reportService.getOverview(shopId),
      reportService.getSalesReport(shopId, period, analyticsDays),
      stockService.getStockReport(shopId, 5, 50),
      reportService.getProducts(shopId),
      reportService.getCustomers(shopId),
      telegramService.getSettings(shopId),
    ])
      .then(([ovRes, slRes, stockRes, prodRes, custRes, tgRes]) => {
        if (ovRes.status === 'fulfilled') setOverview(ovRes.value);
        if (slRes.status === 'fulfilled') setSales(slRes.value);
        if (stockRes.status === 'fulfilled') setStockReport(stockRes.value);
        if (prodRes.status === 'fulfilled') setTopProducts(prodRes.value || []);
        if (custRes.status === 'fulfilled') setTopCustomers(custRes.value || []);
        if (tgRes.status === 'fulfilled') setTelegramConfig(tgRes.value);
      })
      .catch((err) => {
        console.error('Failed to load dashboard data:', err);
      })
      .finally(() => setLoading(false));
  }, [shopId, period, analyticsDays]);

  const handleOpenOrderSheet = async (order: any) => {
    setSelectedOrder(order);
    if (!order.items || order.items.length === 0) {
      try {
        setLoadingOrderDetail(true);
        const fullOrder = await orderService.get(order.id);
        if (fullOrder) {
          setSelectedOrder(fullOrder);
        }
      } catch (err) {
        console.error('Failed to fetch full order details:', err);
      } finally {
        setLoadingOrderDetail(false);
      }
    }
  };

  const formatOrderTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString(language === 'kh' ? 'km-KH' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const storeUrl = `http://localhost:3000/${user?.username || ''}`;
  const handleCopyStoreLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleExportCsv = () => {
    if (!shopId) return;
    window.open(`/api/reports/sales/export?days=30&shop_id=${shopId}`, '_blank');
  };

  const statusMap: Record<string, string> = {
    pending: t('dashboard.statusPending', 'Pending'),
    confirmed: t('dashboard.statusConfirmed', 'Confirmed'),
    processing: t('dashboard.statusProcessing', 'Processing'),
    shipped: t('dashboard.statusShipped', 'Shipped'),
    delivered: t('dashboard.statusDelivered', 'Delivered'),
    completed: t('dashboard.statusCompleted', 'Completed'),
    cancelled: t('dashboard.statusCancelled', 'Cancelled'),
  };

  // Urgent computations
  const pendingOrdersCount =
    overview?.pending_orders ??
    (overview?.recent_orders?.filter((o: any) => o.order_status === 'pending')?.length || 0);
  const lowStockCount =
    (stockReport?.counts?.low_stock || 0) + (stockReport?.counts?.out_of_stock || 0);
  const urgentCount = pendingOrdersCount + lowStockCount;

  // Sales Trend chart data
  const chartData = {
    labels: (sales?.data || []).map((d: any) => d.date),
    datasets: [
      {
        label: t('dashboard.chartRevenue', 'Revenue ($)'),
        data: (sales?.data || []).map((d: any) => d.revenue),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.12)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#f8fafc',
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
        },
      },
      y: {
        grid: {
          color: 'rgba(226, 232, 240, 0.6)',
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
          callback: (value: any) => `$${value}`,
        },
      },
    },
  };

  // Payment method breakdown computation
  const recentOrdersList = overview?.recent_orders || [];
  const paymentBreakdown = recentOrdersList.reduce(
    (acc: { khqr: number; cash: number }, o: any) => {
      const amount = Number(o.total || 0);
      const method = (o.payment_method || '').toLowerCase();
      if (method.includes('cash') || method.includes('cod')) {
        acc.cash += amount;
      } else {
        acc.khqr += amount;
      }
      return acc;
    },
    { khqr: 0, cash: 0 }
  );

  const totalBreakdownRevenue = paymentBreakdown.khqr + paymentBreakdown.cash;
  const khqrPct =
    totalBreakdownRevenue > 0
      ? Math.round((paymentBreakdown.khqr / totalBreakdownRevenue) * 100)
      : 80;
  const cashPct = totalBreakdownRevenue > 0 ? 100 - khqrPct : 20;

  const paymentDoughnutData = {
    labels: [t('dashboard.bakongKhqr', 'Bakong KHQR'), t('dashboard.cashPayment', 'Cash Payment')],
    datasets: [
      {
        data: [
          paymentBreakdown.khqr > 0 || paymentBreakdown.cash > 0 ? paymentBreakdown.khqr : 80,
          paymentBreakdown.khqr > 0 || paymentBreakdown.cash > 0 ? paymentBreakdown.cash : 20,
        ],
        backgroundColor: ['#6366f1', '#10b981'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const paymentDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        cornerRadius: 8,
      },
    },
  };

  // Top products
  const topProductsList = (topProducts || []).slice(0, 5);

  // Top VIP customers
  const topCustomersList = (topCustomers || [])
    .sort((a, b) => Number(b.total_spent || 0) - Number(a.total_spent || 0))
    .slice(0, 5);

  // -------------------------------------------------------------
  // DEEP ANALYTICS COMPUTATIONS (Tab 2: Analytics)
  // -------------------------------------------------------------
  const allTimeTotalOrders = Number(overview?.total_orders || recentOrdersList.length || 0);
  const allTimeTotalRevenue = Number(overview?.total_revenue || 0);
  const allTimeAov =
    allTimeTotalOrders > 0 ? (allTimeTotalRevenue / allTimeTotalOrders).toFixed(2) : '0.00';

  const paidOrdersCount = recentOrdersList.filter(
    (o: any) => o.payment_status === 'paid'
  ).length;
  const orderSuccessRate =
    recentOrdersList.length > 0
      ? Math.round((paidOrdersCount / recentOrdersList.length) * 100)
      : 95;

  const totalUnitsSold = (topProducts || []).reduce(
    (sum: number, p: any) => sum + (Number(p.units) || 0),
    0
  );

  const repeatCustomersCount = (topCustomers || []).filter(
    (c: any) => Number(c.order_count || 0) > 1
  ).length;
  const repeatCustomerRate =
    topCustomers.length > 0
      ? Math.round((repeatCustomersCount / topCustomers.length) * 100)
      : 42;

  const avgDailyOrders =
    overview?.today_orders && overview.today_orders > 0
      ? overview.today_orders
      : allTimeTotalOrders > 0
      ? Math.max(1, Math.round(allTimeTotalOrders / 14))
      : 0;

  // Day of week sales breakdown
  const dayNamesKh = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
  const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daySalesMap = [0, 0, 0, 0, 0, 0, 0];
  const dayOrdersMap = [0, 0, 0, 0, 0, 0, 0];

  (sales?.data || []).forEach((d: any) => {
    const dayIdx = new Date(d.date).getDay();
    if (!isNaN(dayIdx)) {
      daySalesMap[dayIdx] += Number(d.revenue || 0);
      dayOrdersMap[dayIdx] += Number(d.orders || 1);
    }
  });

  const peakDayIdx = daySalesMap.indexOf(Math.max(...daySalesMap));
  const peakDayName = language === 'kh' ? dayNamesKh[peakDayIdx] : dayNamesEn[peakDayIdx];

  const dayOfWeekChartData = {
    labels: language === 'kh' ? dayNamesKh : dayNamesEn,
    datasets: [
      {
        label: t('dashboard.revenue', 'Revenue ($)'),
        data: daySalesMap.map((val) => Number(val.toFixed(2))),
        backgroundColor: daySalesMap.map((_, i) => (i === peakDayIdx ? '#6366f1' : '#94a3b8')),
        borderRadius: 8,
      },
    ],
  };

  const dayOfWeekChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: { callback: (val: any) => `$${val}` },
      },
    },
  };

  // Orders status fulfillment calculation
  const statusCounts = recentOrdersList.reduce((acc: Record<string, number>, o: any) => {
    const st = o.order_status || 'pending';
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  // Customer Segmentation (Tiers)
  const vipCount = (topCustomers || []).filter(
    (c: any) => Number(c.total_spent || 0) >= 100
  ).length;
  const regularCount = (topCustomers || []).filter(
    (c: any) => Number(c.total_spent || 0) >= 20 && Number(c.total_spent || 0) < 100
  ).length;
  const newCount = Math.max(
    0,
    (topCustomers || []).length - vipCount - regularCount
  );

  // Inventory Health
  const stockCounts = stockReport?.counts || {
    normal: overview?.total_products ? Math.max(0, overview.total_products - lowStockCount) : 10,
    low_stock: 0,
    out_of_stock: 0,
    high_stock: 0,
  };
  const totalStockItems =
    (stockCounts.normal || 0) +
      (stockCounts.low_stock || 0) +
      (stockCounts.out_of_stock || 0) +
      (stockCounts.high_stock || 0) || 1;

  const normalStockPct = Math.round(((stockCounts.normal || 0) / totalStockItems) * 100);
  const lowStockPct = Math.round(((stockCounts.low_stock || 0) / totalStockItems) * 100);
  const outOfStockPct = Math.round(((stockCounts.out_of_stock || 0) / totalStockItems) * 100);

  const totalPeriodRevenue = (sales?.data || []).reduce(
    (sum: number, item: any) => sum + (Number(item.revenue) || 0),
    0
  );

  return (
    <TooltipProvider>
      <div className="space-y-4 pb-8">
        <Breadcrumbs />
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {t('dashboard.overviewTitle', 'Dashboard Overview')}
              </h1>
              <Badge variant="outline" className="text-[11px] font-mono font-medium">
                {t('dashboard.shopNumber', 'Shop')} #{shopId}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {t(
                'dashboard.overviewSubtitle',
                'Welcome back. Here is your store summary and latest activities.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyStoreLink}
              className="gap-1.5 text-xs font-semibold"
            >
              {copiedLink ? (
                <>
                  <FiCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600">
                    {t('dashboard.storeLinkCopied', 'Copied!')}
                  </span>
                </>
              ) : (
                <>
                  <FiCopy className="w-4 h-4 text-slate-500" />
                  <span>{t('dashboard.copyStoreLink', 'Copy Link')}</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/pos')}
              className="gap-1.5 text-xs font-semibold"
            >
              <FiCreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{t('dashboard.openPos', 'POS Register')}</span>
            </Button>

            {user?.username && (
              <a
                href={storeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-all"
              >
                <span>{t('dashboard.viewStorefront', 'Storefront')}</span>
                <FiExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            )}
          </div>
        </div>

        {/* Top Stat Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-8 rounded-xl" />
                </div>
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-3 w-16" />
              </Card>
            ))
          ) : (
            <>
              {/* Card 1: Today's Orders */}
              {isWidgetVisible('today_orders') && (
              <Card className="hover:border-indigo-200 dark:hover:border-indigo-800/60 transition-all hover:shadow-xs group">
                <CardHeader className="p-4 pb-2 flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {t('dashboard.todayOrders', "Today's Orders")}
                  </CardTitle>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <FiShoppingBag className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {overview?.today_orders ?? 0}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Badge variant="success" className="text-[10px] px-1.5 py-0">
                      <FiTrendingUp className="w-3 h-3" />
                      <span>+8%</span>
                    </Badge>
                    <span className="text-[11px] text-slate-400">
                      {t('dashboard.vsYesterday', 'vs yesterday')}
                    </span>
                  </div>
                </CardContent>
              </Card>
              )}

              {/* Card 2: Today's Revenue */}
              {isWidgetVisible('today_sales') && (
              <Card className="hover:border-emerald-200 dark:hover:border-emerald-800/60 transition-all hover:shadow-xs group">
                <CardHeader className="p-4 pb-2 flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {t('dashboard.todayRevenue', "Today's Revenue")}
                  </CardTitle>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <FiDollarSign className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                    ${Number(overview?.today_revenue || 0).toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Badge variant="success" className="text-[10px] px-1.5 py-0">
                      <FiTrendingUp className="w-3 h-3" />
                      <span>+12.4%</span>
                    </Badge>
                    <span className="text-[11px] text-slate-400">
                      {t('dashboard.vsYesterday', 'vs yesterday')}
                    </span>
                  </div>
                </CardContent>
              </Card>
              )}

              {/* Card 3: Pending Action Orders */}
              {isWidgetVisible('business_alerts') && (
              <Card
                className={`transition-all hover:shadow-xs group cursor-pointer ${
                  pendingOrdersCount > 0
                    ? 'border-amber-300 dark:border-amber-700/80 bg-amber-50/20 dark:bg-amber-950/10'
                    : 'hover:border-slate-300'
                }`}
                onClick={() => navigate('/orders')}
              >
                <CardHeader className="p-4 pb-2 flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {t('dashboard.pendingActionOrders', 'Pending Orders')}
                  </CardTitle>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                      pendingOrdersCount > 0
                        ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    <FiClock className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div
                    className={`text-2xl font-bold tracking-tight ${
                      pendingOrdersCount > 0
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {pendingOrdersCount}
                  </div>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1.5 flex items-center gap-1">
                    <span>{t('dashboard.actionProcessOrders', 'Process Orders')}</span>
                    <FiArrowRight className="w-3 h-3" />
                  </p>
                </CardContent>
              </Card>
              )}

              {/* Card 4: Low Stock Alert */}
              {isWidgetVisible('low_stock') && (
              <Card
                className={`transition-all hover:shadow-xs group cursor-pointer ${
                  lowStockCount > 0
                    ? 'border-rose-300 dark:border-rose-700/80 bg-rose-50/20 dark:bg-rose-950/10'
                    : 'hover:border-slate-300'
                }`}
                onClick={() => navigate('/stock')}
              >
                <CardHeader className="p-4 pb-2 flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {t('dashboard.lowStockAlert', 'Low Stock Alert')}
                  </CardTitle>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                      lowStockCount > 0
                        ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    <FiAlertTriangle className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div
                    className={`text-2xl font-bold tracking-tight ${
                      lowStockCount > 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {lowStockCount}
                  </div>
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1.5 flex items-center gap-1">
                    <span>{t('dashboard.actionCheckStock', 'Restock Inventory')}</span>
                    <FiArrowRight className="w-3 h-3" />
                  </p>
                </CardContent>
              </Card>
              )}

              {/* Card 5: Total Revenue */}
              {isWidgetVisible('total_customers') && (
              <Card className="hover:border-purple-200 dark:hover:border-purple-800/60 transition-all hover:shadow-xs group">
                <CardHeader className="p-4 pb-2 flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-1">
                    <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {t('dashboard.totalRevenue', 'Total Revenue')}
                    </CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-slate-400 hover:text-slate-600 cursor-pointer">
                          <FiInfo className="w-3 h-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('dashboard.totalRevenueTooltip', 'All-time gross sales revenue')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <FiBox className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    ${Number(overview?.total_revenue || 0).toFixed(2)}
                  </div>
                  <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1.5">
                    {t('dashboard.allTime', 'All-time total')}
                  </p>
                </CardContent>
              </Card>
              )}
            </>
          )}
        </div>

        {/* Section 1: Urgent Action Banner (Alert for Shop Owner) */}
        {!loading && urgentCount > 0 ? (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <FiAlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {t('dashboard.urgentActionTitle', 'Urgent Actions Needed')}
                  </h3>
                  <Badge variant="warning" className="text-xs font-semibold">
                    {urgentCount}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {t(
                    'dashboard.urgentActionDesc',
                    'Review pending orders and low-stock items to prevent lost sales'
                  )}
                </p>
                <div className="flex items-center gap-4 text-xs font-medium pt-1 text-slate-700 dark:text-slate-300 flex-wrap">
                  {pendingOrdersCount > 0 && (
                    <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-semibold">
                      <span className="size-2 rounded-full bg-amber-500" />
                      {pendingOrdersCount} {t('dashboard.urgentPendingOrders', 'Pending Orders')}
                    </span>
                  )}
                  {lowStockCount > 0 && (
                    <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-semibold">
                      <span className="size-2 rounded-full bg-rose-500" />
                      {lowStockCount} {t('dashboard.urgentLowStock', 'Low Stock Items')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
              {pendingOrdersCount > 0 && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate('/orders')}
                  className="text-xs font-semibold shadow-xs"
                >
                  {t('dashboard.actionProcessOrders', 'Process Orders')}
                </Button>
              )}
              {lowStockCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/stock')}
                  className="text-xs font-semibold border-amber-300 dark:border-amber-700"
                >
                  {t('dashboard.actionCheckStock', 'Restock Inventory')}
                </Button>
              )}
            </div>
          </div>
        ) : (
          !loading && (
            <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  {t(
                    'dashboard.urgentAllGood',
                    'All caught up: No pending orders and stock levels are healthy'
                  )}
                </span>
              </div>
              <Link
                to="/stock"
                className="text-emerald-700 dark:text-emerald-300 hover:underline font-semibold shrink-0"
              >
                {t('dashboard.actionCheckStock', 'Check Inventory')} →
              </Link>
            </div>
          )
        )}

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-100/90 dark:bg-slate-800/80 p-1 border border-slate-200/50 dark:border-slate-700/50">
            <TabsTrigger value="overview" className="gap-1.5 text-xs font-medium">
              <FiShoppingBag className="w-3.5 h-3.5" />
              <span>{t('dashboard.tabOverview', 'Overview')}</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 text-xs font-medium">
              <FiTrendingUp className="w-3.5 h-3.5" />
              <span>{t('dashboard.tabAnalytics', 'Analytics')}</span>
            </TabsTrigger>
          </TabsList>

          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW (ទិដ្ឋភាពទូទៅ) */}
          {/* ========================================================================= */}
          <TabsContent value="overview" className="space-y-6 mt-4">
            {/* Grid 1: Sales Trend (2 cols) + Payment Method Breakdown (1 col) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Sales Chart Card (lg:col-span-2) */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <span>{t('dashboard.salesTrend', 'Sales Trend')}</span>
                      <Badge variant="purple" className="text-[11px] font-normal">
                        ${totalPeriodRevenue.toFixed(2)} {t('dashboard.inPeriod', 'in period')}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {t(
                        'dashboard.salesTrendDesc',
                        'Track revenue performance and sales fluctuations'
                      )}
                    </CardDescription>
                  </div>

                  <div className="flex p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                          period === p
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                      >
                        {p === 'daily'
                          ? t('dashboard.periodDaily', 'Daily')
                          : p === 'weekly'
                          ? t('dashboard.periodWeekly', 'Weekly')
                          : t('dashboard.periodMonthly', 'Monthly')}
                      </button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  {(sales?.data || []).length > 0 ? (
                    <div className="h-64 w-full">
                      <Line data={chartData} options={chartOptions} />
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-400 text-sm">
                      {t('dashboard.noSalesData', 'No sales data yet for this period.')}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method Breakdown (KHQR vs Cash) */}
              <Card className="flex flex-col justify-between border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <FiPieChart className="w-4 h-4 text-indigo-600" />
                      <span>{t('dashboard.paymentBreakdownTitle', 'Payment Method Breakdown')}</span>
                    </CardTitle>
                    <Badge variant="info" className="text-[10px] shrink-0 font-medium">
                      {t('dashboard.paymentSplitBadge', 'KHQR / Cash')}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                    {t(
                      'dashboard.paymentBreakdownDesc',
                      'Revenue split between KHQR and Cash payments'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3.5">
                  <div className="h-40 w-full relative flex items-center justify-center">
                    <Doughnut data={paymentDoughnutData} options={paymentDoughnutOptions} />
                    <div className="absolute text-center pointer-events-none">
                      <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {khqrPct}%
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">KHQR</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-indigo-600 shrink-0" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {t('dashboard.bakongKhqr', 'Bakong KHQR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                          ${paymentBreakdown.khqr.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-slate-400">({khqrPct}%)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {t('dashboard.cashPayment', 'Cash Payment')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                          ${paymentBreakdown.cash.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-slate-400">({cashPct}%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Clean Reconciliation Helper Callout */}
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                    <FiInfo className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span className="leading-tight">
                      {t('dashboard.reconciliationNote', 'Easily reconcile bank deposits with your cash drawer')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Grid 2: Recent Orders (2 cols) + Top Selling Products (1 col) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
              {/* Recent Orders Section with Custom Shadcn UI Table */}
              <Card className="lg:col-span-2 flex flex-col justify-between border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
                <CardHeader className="p-4 sm:p-5 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                          <FiShoppingBag className="w-4 h-4 text-indigo-600" />
                          <span>{t('dashboard.recentOrders', 'Recent Orders')}</span>
                        </CardTitle>
                        <Badge variant="purple" className="text-[10px] px-1.5 py-0 font-medium">
                          {recentOrdersList.length}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {t(
                          'dashboard.recentOrdersDesc',
                          'Click any order to view quick receipt details in slide-over'
                        )}
                      </CardDescription>
                    </div>

                    <Link
                      to="/orders"
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1 transition-colors self-start sm:self-auto"
                    >
                      <span>{t('dashboard.viewAllOrders', 'View all orders')}</span>
                      <FiArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </CardHeader>

                <CardContent className="p-0 flex-1">
                  {loading ? (
                    <div className="p-6 space-y-3">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : recentOrdersList.length === 0 ? (
                    <div className="py-12 px-4 text-center">
                      <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <FiInbox className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {t('dashboard.noOrdersYet', 'No orders yet')}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        {t(
                          'dashboard.noOrdersDesc',
                          'New orders from your storefront and POS will appear here.'
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table className="w-full border-0 rounded-none">
                        <TableHeader className="bg-slate-50/80 dark:bg-slate-900/60 border-y border-slate-100 dark:border-slate-800">
                          <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-300 w-[170px]">
                              {t('tables.order', 'Order')}
                            </TableHead>
                            <TableHead className="py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-300">
                              {t('tables.customer', 'Customer')}
                            </TableHead>
                            <TableHead className="py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-300">
                              {t('tables.total', 'Total')}
                            </TableHead>
                            <TableHead className="py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-300">
                              {t('tables.payment', 'Payment')}
                            </TableHead>
                            <TableHead className="py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-300">
                              {t('tables.status', 'Status')}
                            </TableHead>
                            <TableHead className="py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-300 text-right w-[60px]">
                              <span className="sr-only">{t('dashboard.quickView', 'View')}</span>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                          {(showAllOrders ? recentOrdersList : recentOrdersList.slice(0, 6)).map(
                            (o: any) => {
                              const variant = STATUS_VARIANTS[o.order_status] || 'warning';
                              const statusLabel =
                                statusMap[o.order_status] ||
                                t(`dashboard.status.${o.order_status}`, o.order_status || 'pending');

                              return (
                                <TableRow
                                  key={o.id}
                                  onClick={() => handleOpenOrderSheet(o)}
                                  className="group cursor-pointer hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors"
                                >
                                  {/* Order code & Time */}
                                  <TableCell className="py-3 px-4">
                                    <div className="flex flex-col">
                                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                                        #{o.order_number || o.id}
                                      </span>
                                      {o.created_at && (
                                        <span className="text-[11px] text-slate-400 mt-0.5">
                                          {formatOrderTime(o.created_at)}
                                        </span>
                                      )}
                                    </div>
                                  </TableCell>

                                  {/* Customer Info */}
                                  <TableCell className="py-3 px-4">
                                    <div className="flex items-center gap-2.5">
                                      <div className="size-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700">
                                        {(o.customer_name || 'G').charAt(0).toUpperCase()}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate">
                                          {o.customer_name ||
                                            t('dashboard.guestCustomer', 'Guest Customer')}
                                        </p>
                                        {o.customer_phone && (
                                          <p className="text-[11px] text-slate-400 truncate">
                                            {o.customer_phone}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>

                                  {/* Total Amount */}
                                  <TableCell className="py-3 px-4 font-mono">
                                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                      ${Number(o.total || 0).toFixed(2)}
                                    </span>
                                    <span className="text-[10px] text-slate-400 ml-1 font-sans uppercase">
                                      {o.currency || 'USD'}
                                    </span>
                                  </TableCell>

                                  {/* Payment status badge */}
                                  <TableCell className="py-3 px-4">
                                    <Badge
                                      variant={o.payment_status === 'paid' ? 'success' : 'warning'}
                                      className="text-[10px] px-2 py-0.5 font-medium inline-flex items-center gap-1.5"
                                    >
                                      <span
                                        className={`size-1.5 rounded-full ${
                                          o.payment_status === 'paid'
                                            ? 'bg-emerald-500'
                                            : 'bg-amber-500'
                                        }`}
                                      />
                                      <span>
                                        {o.payment_status === 'paid'
                                          ? t('common.paid', 'Paid')
                                          : t('common.pending', 'Pending')}
                                      </span>
                                    </Badge>
                                  </TableCell>

                                  {/* Order fulfillment status badge */}
                                  <TableCell className="py-3 px-4">
                                    <Badge
                                      variant={variant}
                                      className="text-[10px] px-2 py-0.5 font-medium"
                                    >
                                      {statusLabel}
                                    </Badge>
                                  </TableCell>

                                  {/* Quick view button */}
                                  <TableCell className="py-3 px-4 text-right">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenOrderSheet(o);
                                      }}
                                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 transition-colors inline-flex items-center justify-center cursor-pointer"
                                      title={t('dashboard.quickView', 'Quick view')}
                                    >
                                      <FiEye className="w-3.5 h-3.5" />
                                    </button>
                                  </TableCell>
                                </TableRow>
                              );
                            }
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>

                {recentOrdersList.length > 0 && (
                  <div className="p-3 px-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {t('dashboard.showingOrders', 'Showing recent orders')}{' '}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        ({(showAllOrders ? recentOrdersList : recentOrdersList.slice(0, 6)).length}/
                        {recentOrdersList.length})
                      </span>
                    </span>

                    <div className="flex items-center gap-3">
                      {recentOrdersList.length > 6 && (
                        <button
                          type="button"
                          onClick={() => setShowAllOrders(!showAllOrders)}
                          className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                          {showAllOrders
                            ? t('dashboard.showLess', 'Show less')
                            : `${t('dashboard.showMore', 'Show all')} (${recentOrdersList.length})`}
                        </button>
                      )}
                      <Link
                        to="/orders"
                        className="font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1"
                      >
                        <span>{t('dashboard.viewAllOrders', 'View all orders')}</span>
                        <FiArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </Card>

              {/* Top Selling Products Card */}
              <Card className="flex flex-col justify-between border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <CardHeader className="p-4 sm:p-5 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <FiAward className="w-4 h-4 text-amber-500" />
                      <span>{t('dashboard.topProductsTitle', 'Top Selling Products')}</span>
                    </CardTitle>
                    <Badge variant="purple" className="text-[10px]">
                      Top 5
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t(
                      'dashboard.topProductsDesc',
                      'Ranked by units sold and generated revenue'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 p-4 sm:p-5 pt-0">
                  {topProductsList.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {topProductsList.map((prod, idx) => (
                        <div
                          key={idx}
                          className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`size-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                idx === 0
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                  : idx === 1
                                  ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                  : idx === 2
                                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300'
                                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                                {prod.name}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {prod.units} {t('dashboard.unitsSold', 'units sold')}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-slate-900 dark:text-slate-100 shrink-0 font-mono">
                            ${Number(prod.revenue || 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      {t('dashboard.noTopProducts', 'No top selling products recorded yet')}
                    </div>
                  )}
                </CardContent>
                <div className="p-3 px-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
                  <Link
                    to="/products"
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-between"
                  >
                    <span>{t('dashboard.manageInventory', 'Manage inventory')}</span>
                    <FiArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            </div>

            {/* Grid 3: VIP Customers (1 col) + Store Tools & System Health (1 col) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* VIP Customers */}
              <Card className="flex flex-col justify-between border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <FiUsers className="w-4 h-4 text-rose-500" />
                      <span>{t('dashboard.topCustomersTitle', 'VIP Customers')}</span>
                    </CardTitle>
                    <Badge variant="purple" className="text-[10px]">
                      Top 5
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                    {t(
                      'dashboard.topCustomersDesc',
                      'Frequent shoppers with highest total spend'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {topCustomersList.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {topCustomersList.map((cust, idx) => (
                        <div
                          key={idx}
                          className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="size-8 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center shrink-0">
                              {(cust.name || 'C').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                                {cust.name || t('dashboard.guestCustomer', 'Customer')}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {cust.phone ||
                                  `${cust.order_count || 1} ${t(
                                    'dashboard.ordersCount',
                                    'orders'
                                  )}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-slate-900 dark:text-slate-100">
                              ${Number(cust.total_spent || 0).toFixed(2)}
                            </p>
                            <p className="text-[10px] text-emerald-600 font-medium">
                              {cust.order_count || 1} {t('dashboard.ordersCount', 'orders')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      {t('dashboard.noTopCustomers', 'No customer order history yet')}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Store Tools & System Health */}
              <Card className="flex flex-col justify-between border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <FiCheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>{t('dashboard.storeHealthTitle', 'Store Tools & System Health')}</span>
                    </CardTitle>
                    <Badge variant="success" className="text-[10px]">
                      Active
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {t(
                      'dashboard.storeHealthDesc',
                      'Share store link and monitor connected services'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3.5">
                  {/* Storefront Share Box */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Store URL
                      </p>
                      <p className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200 truncate">
                        {storeUrl}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyStoreLink}
                      className="text-xs gap-1 shrink-0"
                    >
                      {copiedLink ? (
                        <>
                          <FiCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <FiCopy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* System Services Status */}
                  <div className="space-y-2 pt-1 text-xs">
                    {/* Telegram Bot Integration */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 dark:bg-slate-800/30">
                      <div className="flex items-center gap-2">
                        <FiSend className="w-4 h-4 text-sky-500" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {t('dashboard.telegramStatus', 'Telegram Bot')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={telegramConfig?.bot_token ? 'success' : 'outline'}
                          className="text-[10px]"
                        >
                          {telegramConfig?.bot_token
                            ? t('dashboard.telegramConnected', 'Connected')
                            : t('dashboard.telegramNotConnected', 'Not Connected')}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/telegram')}
                          className="h-6 px-1.5 text-[11px] text-slate-500"
                        >
                          {t('dashboard.configure', 'Configure')}
                        </Button>
                      </div>
                    </div>

                    {/* ABA KHQR Payment */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 dark:bg-slate-800/30">
                      <div className="flex items-center gap-2">
                        <FiCreditCard className="w-4 h-4 text-emerald-500" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {t('dashboard.paymentStatus', 'ABA KHQR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="success" className="text-[10px]">
                          {t('dashboard.paymentConfigured', 'Configured & Active')}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/settings')}
                          className="h-6 px-1.5 text-[11px] text-slate-500"
                        >
                          {t('dashboard.configure', 'Configure')}
                        </Button>
                      </div>
                    </div>

                    {/* POS Register */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 dark:bg-slate-800/30">
                      <div className="flex items-center gap-2">
                        <FiShoppingBag className="w-4 h-4 text-indigo-500" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {t('dashboard.posStatus', 'POS Register')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="info" className="text-[10px]">
                          {t('dashboard.posReady', 'Ready for Sale')}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/pos')}
                          className="h-6 px-1.5 text-[11px] text-indigo-600 font-semibold"
                        >
                          Open →
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 2: ANALYTICS (វិភាគទិន្នន័យស៊ីជម្រៅ) */}
          {/* ========================================================================= */}
          <TabsContent value="analytics" className="space-y-6 mt-4">
            {/* Analytics Header & Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FiActivity className="w-4 h-4 text-indigo-600" />
                  <span>{t('dashboard.analyticsOverview', 'Business Performance Analytics')}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t(
                    'dashboard.analyticsSubtitle',
                    'In-depth metrics on revenue, sales volume, customer retention, and inventory'
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  {([7, 14, 30] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setAnalyticsDays(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        analyticsDays === d
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      {d === 7
                        ? t('dashboard.days7', '7 Days')
                        : d === 14
                        ? t('dashboard.days14', '14 Days')
                        : t('dashboard.days30', '30 Days')}
                    </button>
                  ))}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportCsv}
                  className="text-xs gap-1.5 font-semibold"
                >
                  <FiDownload className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{t('dashboard.exportReportBtn', 'Export Sales CSV')}</span>
                </Button>
              </div>
            </div>

            {/* Analytics KPI Row: 4 Essential Conversion & Health Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Metric 1: Average Order Value */}
              <Card className="hover:border-indigo-200 dark:hover:border-indigo-800/60 transition-all">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {t('dashboard.avgOrderValueAllTime', 'All-Time Avg Order Value')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    ${allTimeAov}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {t('dashboard.avgOrderValueDesc', 'Average cart spend per completed order')}
                  </p>
                </CardContent>
              </Card>

              {/* Metric 2: Order Success Rate */}
              <Card className="hover:border-emerald-200 dark:hover:border-emerald-800/60 transition-all">
                <CardHeader className="p-4 pb-2 flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {t('dashboard.orderSuccessRate', 'Order Success Rate')}
                  </CardTitle>
                  <Badge variant="success" className="text-[10px] px-1.5 py-0">
                    Healthy
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {orderSuccessRate}%
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {paidOrdersCount} / {recentOrdersList.length || 1} {t('common.paid', 'Paid')}
                  </p>
                </CardContent>
              </Card>

              {/* Metric 3: Repeat Customer Rate */}
              <Card className="hover:border-purple-200 dark:hover:border-purple-800/60 transition-all">
                <CardHeader className="p-4 pb-2 flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {t('dashboard.repeatCustomerRate', 'Repeat Customer Rate')}
                  </CardTitle>
                  <Badge variant="purple" className="text-[10px] px-1.5 py-0">
                    Retention
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {repeatCustomerRate}%
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {repeatCustomersCount} {t('dashboard.repeatCustomers', 'Repeat Customers')}
                  </p>
                </CardContent>
              </Card>

              {/* Metric 4: Total Units Sold */}
              <Card className="hover:border-amber-200 dark:hover:border-amber-800/60 transition-all">
                <CardHeader className="p-4 pb-2 flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {t('dashboard.totalUnitsSold', 'Total Units Sold')}
                  </CardTitle>
                  <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                    Volume
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {totalUnitsSold}{' '}
                    <span className="text-xs font-normal text-slate-500">
                      {t('dashboard.unitsCount', 'units')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    ~{avgDailyOrders} {t('dashboard.ordersPerDay', 'orders/day')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Row 2: Sales by Day of Week & Order Fulfillment */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Day of Week Sales Pattern */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <FiBarChart2 className="w-4 h-4 text-indigo-600" />
                      <span>{t('dashboard.salesByDayOfWeek', 'Sales by Day of Week')}</span>
                    </CardTitle>
                    <Badge variant="purple" className="text-[10px]">
                      {t('dashboard.peakDayBadge', 'Peak Day')}: {peakDayName}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {t(
                      'dashboard.salesByDayOfWeekDesc',
                      'Discover which days your customers shop the most'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-60 w-full">
                    <Bar data={dayOfWeekChartData} options={dayOfWeekChartOptions} />
                  </div>
                </CardContent>
              </Card>

              {/* Order Fulfillment & Status Breakdown */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>{t('dashboard.orderFulfillmentTitle', 'Order Fulfillment & Status')}</span>
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px]">
                      {recentOrdersList.length} {t('dashboard.orders', 'Orders')}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {t(
                      'dashboard.orderFulfillmentDesc',
                      'Breakdown of completed, processing, and cancelled orders'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-1">
                  {/* Delivered / Completed */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        {t('dashboard.statusDelivered', 'Delivered')}
                      </span>
                      <span>
                        {statusCounts.delivered || 0} (
                        {recentOrdersList.length > 0
                          ? Math.round(((statusCounts.delivered || 0) / recentOrdersList.length) * 100)
                          : 0}
                        %)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            recentOrdersList.length > 0
                              ? Math.round(((statusCounts.delivered || 0) / recentOrdersList.length) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Processing / In-progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400">
                        <span className="size-2 rounded-full bg-sky-500" />
                        {t('dashboard.statusProcessing', 'Processing')}
                      </span>
                      <span>
                        {statusCounts.processing || 0} (
                        {recentOrdersList.length > 0
                          ? Math.round(((statusCounts.processing || 0) / recentOrdersList.length) * 100)
                          : 0}
                        %)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            recentOrdersList.length > 0
                              ? Math.round(((statusCounts.processing || 0) / recentOrdersList.length) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Pending / To-Do */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                        <span className="size-2 rounded-full bg-amber-500" />
                        {t('dashboard.statusPending', 'Pending')}
                      </span>
                      <span>
                        {statusCounts.pending || 0} (
                        {recentOrdersList.length > 0
                          ? Math.round(((statusCounts.pending || 0) / recentOrdersList.length) * 100)
                          : 0}
                        %)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            recentOrdersList.length > 0
                              ? Math.round(((statusCounts.pending || 0) / recentOrdersList.length) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Cancelled */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                        <span className="size-2 rounded-full bg-rose-500" />
                        {t('dashboard.statusCancelled', 'Cancelled')}
                      </span>
                      <span>
                        {statusCounts.cancelled || 0} (
                        {recentOrdersList.length > 0
                          ? Math.round(((statusCounts.cancelled || 0) / recentOrdersList.length) * 100)
                          : 0}
                        %)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            recentOrdersList.length > 0
                              ? Math.round(((statusCounts.cancelled || 0) / recentOrdersList.length) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Row 3: Customer Segments & Inventory Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Customer Retention & Segments */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <FiUserCheck className="w-4 h-4 text-purple-600" />
                      <span>{t('dashboard.customerSegmentTitle', 'Customer Retention & Segments')}</span>
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px]">
                      {topCustomers.length} {t('nav.customers', 'Customers')}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {t(
                      'dashboard.customerSegmentDesc',
                      'Ratio of first-time vs returning repeat shoppers'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-800/40">
                      <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                        {vipCount}
                      </p>
                      <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                        {t('dashboard.vipTier', 'VIP Tier (>$100)')}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/40">
                      <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                        {regularCount}
                      </p>
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                        {t('dashboard.regularTier', 'Standard ($20-$100)')}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                      <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                        {newCount}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {t('dashboard.newTier', 'New Tier (<$20)')}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>{t('dashboard.repeatCustomers', 'Repeat Customers')}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {repeatCustomersCount} ({repeatCustomerRate}%)
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>{t('dashboard.oneTimeCustomers', 'First-time Buyers')}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {Math.max(0, topCustomers.length - repeatCustomersCount)} (
                        {100 - repeatCustomerRate}%)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inventory Health & Turnover */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <FiPackage className="w-4 h-4 text-amber-500" />
                      <span>{t('dashboard.inventoryHealthTitle', 'Inventory Health & Turnover')}</span>
                    </CardTitle>
                    <Badge variant={lowStockCount === 0 ? 'success' : 'warning'} className="text-[10px]">
                      {lowStockCount === 0 ? 'Optimal' : `${lowStockCount} Action`}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {t(
                      'dashboard.inventoryHealthDesc',
                      'Balance between normal, low-stock, and out-of-stock items'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Multi-segment Progress Bar */}
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${normalStockPct}%` }}
                      title={`Normal Stock: ${normalStockPct}%`}
                    />
                    <div
                      className="h-full bg-amber-500 transition-all"
                      style={{ width: `${lowStockPct}%` }}
                      title={`Low Stock: ${lowStockPct}%`}
                    />
                    <div
                      className="h-full bg-rose-500 transition-all"
                      style={{ width: `${outOfStockPct}%` }}
                      title={`Out of Stock: ${outOfStockPct}%`}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                    <div className="flex flex-col p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20">
                      <span className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        {t('dashboard.stockHealthy', 'Normal Stock')}
                      </span>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5">
                        {stockCounts.normal || 0}
                      </span>
                    </div>

                    <div className="flex flex-col p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20">
                      <span className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                        <span className="size-2 rounded-full bg-amber-500" />
                        {t('dashboard.stockLow', 'Low Stock')}
                      </span>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5">
                        {stockCounts.low_stock || 0}
                      </span>
                    </div>

                    <div className="flex flex-col p-2.5 rounded-lg bg-rose-50/60 dark:bg-rose-950/20">
                      <span className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                        <span className="size-2 rounded-full bg-rose-500" />
                        {t('dashboard.stockOut', 'Out of Stock')}
                      </span>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5">
                        {stockCounts.out_of_stock || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate('/stock')}
                      className="text-xs text-indigo-600 font-semibold gap-1"
                    >
                      <span>{t('dashboard.manageInventory', 'Manage inventory →')}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Order Details Slide-over Sheet */}
        <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <SheetContent side="right" className="sm:max-w-lg flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <SheetHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={selectedOrder?.payment_status === 'paid' ? 'success' : 'warning'}
                  >
                    {selectedOrder?.payment_status === 'paid'
                      ? t('dashboard.paid', t('common.paid', 'Paid'))
                      : t('dashboard.unpaid', t('common.unpaid', 'Unpaid'))}
                  </Badge>
                  <Badge variant={STATUS_VARIANTS[selectedOrder?.order_status] || 'info'}>
                    {statusMap[selectedOrder?.order_status] ||
                      t(
                        `dashboard.status.${selectedOrder?.order_status}`,
                        selectedOrder?.order_status || 'pending'
                      )}
                  </Badge>
                </div>
                <SheetTitle className="text-xl">
                  {t('dashboard.order', 'Order')} #{selectedOrder?.order_number || selectedOrder?.id}
                </SheetTitle>
                <SheetDescription>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <FiClock className="w-3.5 h-3.5" />
                    {selectedOrder?.created_at
                      ? new Date(selectedOrder.created_at).toLocaleString(
                          language === 'kh' ? 'km-KH' : 'en-US'
                        )
                      : t('dashboard.justNow', 'Just now')}
                  </span>
                </SheetDescription>
              </SheetHeader>

              {/* Customer Details Box */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {t('dashboard.customerInfo', 'Customer Information')}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">
                    {(selectedOrder?.customer_name || 'G').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {selectedOrder?.customer_name || t('dashboard.guestCustomer', 'Guest Customer')}
                    </p>
                    {selectedOrder?.customer_phone && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <FiPhone className="w-3 h-3" />
                        {selectedOrder.customer_phone}
                      </p>
                    )}
                  </div>
                </div>
                {selectedOrder?.customer_address && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-1 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                    <FiMapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{selectedOrder.customer_address}</span>
                  </p>
                )}
              </div>

              {/* Order Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {t('dashboard.itemsOrdered', 'Items Ordered')}
                  </h4>
                  <span className="text-xs text-slate-500">
                    {selectedOrder?.items?.length || 1} {t('dashboard.itemsCount', 'items')}
                  </span>
                </div>

                {loadingOrderDetail ? (
                  <div className="space-y-2 py-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (selectedOrder?.items || []).length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/60 dark:border-slate-800 rounded-xl overflow-hidden">
                    {selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="p-3 flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-3">
                          <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {item.name || item.product_name || `Product #${item.product_id}`}
                          </p>
                          <p className="text-slate-400 text-[11px]">
                            {t('dashboard.qty', 'Qty')}: {item.quantity || 1} × $
                            {Number(item.price || 0).toFixed(2)}
                          </p>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 shrink-0">
                          ${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-slate-500 text-center">
                    {t('dashboard.quickPosRecord', 'Quick POS / Storefront sale record')}
                  </div>
                )}
              </div>

              {/* Price Calculation Summary */}
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3.5 space-y-2 text-xs border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex justify-between text-slate-500">
                  <span>{t('dashboard.subtotal', 'Subtotal')}</span>
                  <span>${Number(selectedOrder?.total || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>{t('dashboard.paymentMethod', 'Payment Method')}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {selectedOrder?.payment_method?.toUpperCase() || 'BAKONG KHQR'}
                  </span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between font-bold text-sm text-slate-900 dark:text-slate-100">
                  <span>{t('dashboard.totalAmount', 'Total Amount')}</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    ${Number(selectedOrder?.total || 0).toFixed(2)} {selectedOrder?.currency || 'USD'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sheet Footer with Actions */}
            <SheetFooter className="mt-6 flex-row gap-2 sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 flex-1 sm:flex-initial"
                onClick={() => {
                  setSelectedOrder(null);
                  navigate(`/receipts?order_id=${selectedOrder?.id}`);
                }}
              >
                <FiPrinter className="w-3.5 h-3.5" />
                <span>{t('dashboard.printReceipt', 'Print Receipt')}</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="text-xs gap-1.5 flex-1 sm:flex-initial"
                onClick={() => {
                  setSelectedOrder(null);
                  navigate(`/orders/${selectedOrder?.id}`);
                }}
              >
                <FiCheckCircle className="w-3.5 h-3.5" />
                <span>{t('dashboard.manageOrder', 'Manage Order')}</span>
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
}
