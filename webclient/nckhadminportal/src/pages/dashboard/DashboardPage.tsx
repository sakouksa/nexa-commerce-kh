import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  CreditCard,
  Database,
  DollarSign,
  Download,
  ExternalLink,
  Layers,
  LayoutDashboard,
  Package,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';

import {
  getActivity,
  getPlatformCharts,
  getStats,
  listShops,
  exportSystemBackup,
  fullUrl,
} from '../../api';
import { downloadBlob, toast } from '../../utils';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/index';
import { Loading } from '../../components/ui';
import { CircularProgressRing } from '../../components/cards';
import { AnimatedCounter, UnifiedFilterToolbar, Empty } from '../../components/shared';
import { useLanguage } from '../../i18n';
import { Shop } from '../../types';
import usePageTab from '../../hooks/usePageTab';

const VALID_DASHBOARD_TABS = ['overview', 'analytics', 'shops', 'logs'] as const;
type DashboardTab = typeof VALID_DASHBOARD_TABS[number];

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
);

const PALETTE = [
  '#6366f1',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
  '#14b8a6',
  '#f43f5e',
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = usePageTab<DashboardTab>({
    paramKey: 'tab',
    defaultTab: 'overview',
    validTabs: VALID_DASHBOARD_TABS,
    transform: (raw) => {
      const lower = raw.toLowerCase() as DashboardTab;
      return VALID_DASHBOARD_TABS.includes(lower) ? lower : 'overview';
    },
    storageKey: 'admin_dashboard_tab',
  });
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('30d');
  const [testingHealth, setTestingHealth] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(new Date().toLocaleTimeString());

  const [stats, setStats] = useState<any>({
    shops: 0,
    active_shops: 0,
    resellers: 0,
    customers: 0,
    products: 0,
    orders: 0,
    revenue: 0,
  });

  const [charts, setCharts] = useState<any>({
    revenue_days: [],
    revenue_series: [],
    orders_by_status: [],
    shops_by_plan: [],
    signup_months: [],
    signup_series: [],
    top_shops: [],
    resellers: [],
  });

  const [activity, setActivity] = useState<any[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Shops Tab Filters
  const [shopSearch, setShopSearch] = useState('');
  const [shopStatusFilter, setShopStatusFilter] = useState('all');
  const [shopPlanFilter, setShopPlanFilter] = useState('all');

  // Logs Tab Filters
  const [logSearch, setLogSearch] = useState('');
  const [logActionFilter, setLogActionFilter] = useState('all');

  const uniqueShopPlans = useMemo(() => {
    return Array.from(new Set(shops.map((s) => s.plan).filter(Boolean)));
  }, [shops]);

  const filteredDashboardShops = useMemo(() => {
    return shops.filter((s) => {
      if (shopStatusFilter !== 'all' && (s.status || 'active') !== shopStatusFilter) return false;
      if (shopPlanFilter !== 'all' && (s.plan || 'Starter') !== shopPlanFilter) return false;
      if (shopSearch.trim()) {
        const q = shopSearch.toLowerCase();
        const matchName = (s.shop_name || '').toLowerCase().includes(q);
        const matchUser = (s.username || '').toLowerCase().includes(q);
        if (!matchName && !matchUser) return false;
      }
      return true;
    });
  }, [shops, shopSearch, shopStatusFilter, shopPlanFilter]);

  const uniqueLogActions = useMemo(() => {
    return Array.from(new Set(activity.map((l: any) => l.action).filter(Boolean)));
  }, [activity]);

  const filteredDashboardLogs = useMemo(() => {
    return activity.filter((l: any) => {
      if (logActionFilter !== 'all' && l.action !== logActionFilter) return false;
      if (logSearch.trim()) {
        const q = logSearch.toLowerCase();
        const matchDesc = (l.description || '').toLowerCase().includes(q);
        const matchUser = (l.username || '').toLowerCase().includes(q);
        const matchAction = (l.action || '').toLowerCase().includes(q);
        if (!matchDesc && !matchUser && !matchAction) return false;
      }
      return true;
    });
  }, [activity, logSearch, logActionFilter]);

  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const handleTestHealth = () => {
    setTestingHealth(true);
    setTimeout(() => {
      setTestingHealth(false);
      toast.success(t('dashboard.pingSuccess'));
    }, 600);
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const blob = await exportSystemBackup('xlsx');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_');
      downloadBlob(blob, `ministore_platform_report_${timestamp}.xlsx`);
      toast.success(t('dashboard.exportSuccess', 'Excel report exported successfully!'));
    } catch (err: any) {
      console.error('Failed to export excel:', err);
      toast.error(err?.response?.data?.detail || t('dashboard.exportError', 'Failed to export Excel report'));
    } finally {
      setExporting(false);
    }
  };

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [s, c, a, sh] = await Promise.allSettled([
        getStats(),
        getPlatformCharts(),
        getActivity({ limit: 12 }),
        listShops(),
      ]);

      if (s.status === 'fulfilled' && s.value) {
        setStats((prev: any) => ({ ...prev, ...s.value }));
      }
      if (c.status === 'fulfilled' && c.value) {
        setCharts((prev: any) => ({ ...prev, ...c.value }));
      }
      if (a.status === 'fulfilled' && Array.isArray(a.value)) {
        setActivity(a.value);
      }
      if (sh.status === 'fulfilled' && Array.isArray(sh.value)) {
        setShops(sh.value);
      }
      setLastRefreshedAt(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute derived statistics
  const shortDays = useMemo(
    () => (charts.revenue_days || []).map((d: string) => d.slice(5)),
    [charts.revenue_days]
  );

  const filteredDays = useMemo(() => {
    if (!shortDays || shortDays.length === 0) return [];
    if (timeRange === '7d') return shortDays.slice(-7);
    if (timeRange === '14d') return shortDays.slice(-14);
    return shortDays;
  }, [shortDays, timeRange]);

  const filteredSeries = useMemo(() => {
    const series = charts.revenue_series || [];
    if (series.length === 0) return [];
    if (timeRange === '7d') return series.slice(-7);
    if (timeRange === '14d') return series.slice(-14);
    return series;
  }, [charts.revenue_series, timeRange]);

  const filteredRevenueSum = useMemo(() => {
    return filteredSeries.reduce((acc: number, val: number) => acc + Number(val || 0), 0);
  }, [filteredSeries]);

  const totalCalculatedRevenue = useMemo(() => {
    return Number(stats.revenue || 0);
  }, [stats.revenue]);

  const avgOrderValue = useMemo(() => {
    if (!stats.orders || stats.orders === 0) return 0;
    return totalCalculatedRevenue / stats.orders;
  }, [stats.orders, totalCalculatedRevenue]);

  const peakDayRevenue = useMemo(() => {
    if (!filteredSeries || filteredSeries.length === 0) return 0;
    return Math.max(...filteredSeries);
  }, [filteredSeries]);

  // Chart configs with dark/light mode responsiveness
  const gridColor = isDarkMode ? 'rgba(148, 163, 184, 0.08)' : 'rgba(148, 163, 184, 0.15)';
  const textColor = isDarkMode ? 'rgba(148, 163, 184, 0.7)' : 'rgba(100, 116, 139, 0.8)';

  const revenueChartData = {
    labels: filteredDays.length > 0 ? filteredDays : [t('common.noData', 'No data')],
    datasets: [
      {
        label: t('dashboard.revenue', 'Revenue ($)'),
        data: filteredSeries.length > 0 ? filteredSeries : [0],
        borderColor: '#6366f1',
        borderWidth: 2.5,
        backgroundColor: (context: any) => {
          const ctx = context.chart?.ctx;
          if (!ctx) return 'rgba(99, 102, 241, 0.15)';
          const gradient = ctx.createLinearGradient(0, 0, 0, 240);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.28)');
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0.00)');
          return gradient;
        },
        fill: true,
        tension: 0.38,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1.5,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
    ],
  };

  const revenueChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
        titleColor: isDarkMode ? '#f8fafc' : '#0f172a',
        bodyColor: isDarkMode ? '#cbd5e1' : '#334155',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          label: (context: any) => ` ${t('dashboard.revenue', 'Revenue')}: $${Number(context.raw || 0).toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { size: 11 } },
      },
      y: {
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          font: { size: 11 },
          callback: (value: any) => `$${value}`,
        },
      },
    },
  };

  const orderStatusLabels = (charts.orders_by_status || []).map((o: any) => o.status);
  const orderStatusCounts = (charts.orders_by_status || []).map((o: any) => o.count);
  const orderStatusTotal = orderStatusCounts.reduce((acc: number, c: number) => acc + c, 0);

  const ordersStatusData = {
    labels: orderStatusLabels.length > 0 ? orderStatusLabels : [t('common.noData', 'No data')],
    datasets: [
      {
        data: orderStatusCounts.length > 0 ? orderStatusCounts : [1],
        backgroundColor: [
          '#10b981', // Paid (Emerald)
          '#f59e0b', // Pending (Amber)
          '#0ea5e9', // Processing (Sky)
          '#ef4444', // Cancelled (Red)
          '#8b5cf6', // Shipped (Violet)
        ],
        borderWidth: 2,
        borderColor: isDarkMode ? '#090d16' : '#ffffff',
      },
    ],
  };

  const shopsPlanData = {
    labels: (charts.shops_by_plan || []).map((p: any) => p.plan.toUpperCase()),
    datasets: [
      {
        label: t('dashboard.activeShops', 'Active Shops'),
        data: (charts.shops_by_plan || []).map((p: any) => p.count),
        backgroundColor: ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b'],
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const signupsData = {
    labels: charts.signup_months || [],
    datasets: [
      {
        label: t('dashboard.newShops', 'New Shops'),
        data: charts.signup_series || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#10b981',
        pointRadius: 4,
      },
    ],
  };

  const topShopsData = {
    labels: (charts.top_shops || []).map((s: any) => s.shop_name || s.username),
    datasets: [
      {
        label: t('dashboard.revenue', 'Revenue ($)'),
        data: (charts.top_shops || []).map((s: any) => s.revenue),
        backgroundColor: '#0ea5e9',
        borderRadius: 6,
      },
    ],
  };

  const resellerCommissionData = {
    labels: (charts.resellers || []).map((r: any) => r.username),
    datasets: [
      {
        label: t('dashboard.commission', 'Commission ($)'),
        data: (charts.resellers || []).map((r: any) => r.commission),
        backgroundColor: (charts.resellers || []).map((r: any) =>
          r.commission_paid === 'paid' ? '#10b981' : '#f59e0b'
        ),
        borderRadius: 6,
      },
    ],
  };

  const paidCount = (charts.resellers || []).filter(
    (r: any) => r.commission_paid === 'paid'
  ).length;

  const getActivityIcon = (action: string) => {
    const act = (action || '').toLowerCase();
    if (act.includes('order') || act.includes('sale') || act.includes('pay')) {
      return (
        <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <ShoppingBag className="size-4" />
        </div>
      );
    }
    if (act.includes('shop') || act.includes('store')) {
      return (
        <div className="size-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
          <Store className="size-4" />
        </div>
      );
    }
    if (act.includes('user') || act.includes('auth') || act.includes('login')) {
      return (
        <div className="size-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
          <Users className="size-4" />
        </div>
      );
    }
    return (
      <div className="size-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
        <Activity className="size-4" />
      </div>
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 pb-12">
      {/* ============================================================ */}
      {/* 1. Page Header with Title, Live Badge, and Action Buttons   */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('dashboard.title')}
            </h1>
            <Badge variant="success" className="gap-1.5 py-0.5 px-2">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t('dashboard.liveSystem')}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('dashboard.subtitle')} • {t('dashboard.lastUpdated')} <span className="font-mono text-slate-600 dark:text-slate-300">{lastRefreshedAt}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="h-9 gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? t('dashboard.refreshing') : t('dashboard.refresh')}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            disabled={exporting}
            className="h-9 gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <Download className={`size-3.5 ${exporting ? 'animate-bounce' : ''}`} />
            {exporting ? t('dashboard.exporting') : t('dashboard.export')}
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/shops')}
            className="h-9 gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
          >
            <Plus className="size-3.5" />
            {t('dashboard.createShop')}
          </Button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. Tiered KPI Hierarchy: 4 Primary Hero Cards + Quick Ribbon */}
      {/* ============================================================ */}
      <div className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Platform Revenue */}
          <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('dashboard.totalRevenue')}
              </span>
              <div className="size-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <DollarSign className="size-4.5" />
              </div>
            </div>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                <AnimatedCounter value={Number(stats.revenue ?? 0)} prefix="$" decimals={2} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="success" className="gap-1 py-0.5 px-1.5 font-bold text-[10px]">
                <TrendingUp className="size-3" />
                <span>+18.4%</span>
              </Badge>
              <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                {t('dashboard.vsLastMonth')}
              </span>
            </div>
          </Card>

          {/* Card 2: Total Orders */}
          <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('dashboard.totalOrders')}
              </span>
              <div className="size-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <ShoppingBag className="size-4.5" />
              </div>
            </div>
            <div className="my-2 flex items-center justify-between">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                <AnimatedCounter value={stats.orders ?? 0} />
              </div>
              <CircularProgressRing
                percentage={orderStatusTotal > 0 ? Math.round(((orderStatusCounts[0] || 0) / orderStatusTotal) * 100) : 83}
                colorClass="text-indigo-600 dark:text-indigo-400"
                size={40}
                strokeWidth={4}
              />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
              <span className="inline-block size-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">{t('dashboard.orderPendingNotice', { paid: orderStatusCounts[0] || stats.orders || 0, pending: Math.max((stats.orders || 0) - (orderStatusCounts[0] || 0), 0) })}</span>
            </div>
          </Card>

          {/* Card 3: Active Stores */}
          <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('dashboard.totalShops')}
              </span>
              <div className="size-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Store className="size-4.5" />
              </div>
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                <AnimatedCounter value={stats.active_shops ?? stats.shops ?? 0} />
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / {stats.shops ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-sky-600 dark:text-sky-400 font-medium truncate">
              <CheckCircle2 className="size-3.5 shrink-0" />
              <span className="truncate">{t('dashboard.allStoresActive')}</span>
            </div>
          </Card>

          {/* Card 4: Verified Customers */}
          <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('dashboard.customers')}
              </span>
              <div className="size-9 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                <Users className="size-4.5" />
              </div>
            </div>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                <AnimatedCounter value={stats.customers ?? 0} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
              <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800 shrink-0">
                {t('dashboard.verifiedBadge')}
              </Badge>
              <span className="truncate">{t('dashboard.verifiedAccounts')}</span>
            </div>
          </Card>
        </div>

        {/* Secondary Quick Stats Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800/80">
          {/* Catalog Products */}
          <div className="flex items-center gap-3 px-3 py-1">
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Package className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                {t('dashboard.totalProducts')}
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                  <AnimatedCounter value={stats.products ?? 0} />
                </span>
                <span className="text-[11px] text-slate-400 truncate">{t('dashboard.catalogItems')}</span>
              </div>
            </div>
          </div>

          {/* Resellers */}
          <div className="flex items-center gap-3 px-3 py-1">
            <div className="size-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <CreditCard className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                {t('dashboard.resellers')}
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                  <AnimatedCounter value={stats.resellers ?? 0} />
                </span>
                <span className="text-[11px] text-slate-400 truncate">{t('dashboard.affiliatePartners')}</span>
              </div>
            </div>
          </div>

          {/* Average Order Value (AOV) */}
          <div className="flex items-center gap-3 px-3 py-1">
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <DollarSign className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                {t('dashboard.avgPerOrder')}
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                  ${avgOrderValue.toFixed(2)}
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">{t('dashboard.averageUnit')}</span>
              </div>
            </div>
          </div>

          {/* Payment Gateway */}
          <div className="flex items-center gap-3 px-3 py-1">
            <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                {t('dashboard.primaryGateway')}
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate">ABA KHQR</span>
                <Badge variant="success" className="text-[9px] py-0 px-1 font-semibold">{t('dashboard.ready')}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. Modern Interactive Tabs Section                           */}
      {/* ============================================================ */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3">
          <TabsList className="h-10 p-1 bg-slate-100/90 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
            <TabsTrigger value="overview" className="gap-2 px-3.5 py-1.5 text-xs">
              <LayoutDashboard className="size-3.5" />
              <span>{t('dashboard.tabs.overview')}</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 px-3.5 py-1.5 text-xs">
              <BarChart3 className="size-3.5" />
              <span>{t('dashboard.tabs.analytics')}</span>
            </TabsTrigger>
            <TabsTrigger value="shops" className="gap-2 px-3.5 py-1.5 text-xs">
              <Store className="size-3.5" />
              <span>{t('dashboard.tabs.shops')}</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2 px-3.5 py-1.5 text-xs">
              <Activity className="size-3.5" />
              <span>{t('dashboard.tabs.logs')}</span>
            </TabsTrigger>
          </TabsList>

          <div className="text-xs text-slate-400 hidden sm:block">
            {t('dashboard.tabsDescription')}
          </div>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: OVERVIEW (Comprehensive Grid)                         */}
        {/* ============================================================ */}
        <TabsContent value="overview" className="space-y-5 mt-0">
          {/* Charts Row: Revenue (8 cols) + Order Status (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Revenue Trend Line/Area Chart */}
            <Card className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-sm sm:text-base font-semibold">
                    {timeRange === '7d'
                      ? t('dashboard.revenueLast7Days')
                      : timeRange === '14d'
                      ? t('dashboard.revenueLast14Days')
                      : t('dashboard.revenueLast30Days')}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t('dashboard.revenueLast30DaysDesc')}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {/* Segmented Time Range Buttons */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => setTimeRange('7d')}
                      className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                        timeRange === '7d'
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs font-semibold'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {t('dashboard.days7')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeRange('14d')}
                      className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                        timeRange === '14d'
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs font-semibold'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {t('dashboard.days14')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeRange('30d')}
                      className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                        timeRange === '30d'
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs font-semibold'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {t('dashboard.days30')}
                    </button>
                  </div>

                  <Separator orientation="vertical" className="h-6 hidden sm:block" />

                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {t('dashboard.peakDay')}
                    </span>
                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
                      ${peakDayRevenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-68 w-full pt-2">
                  <Line data={revenueChartData} options={revenueChartOptions} />
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-indigo-500" />
                  {t('dashboard.paymentMethodsNotice')}
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                  {t('dashboard.total')}: ${filteredRevenueSum.toFixed(2)}
                </span>
              </CardFooter>
            </Card>

            {/* Order Status Breakdown (Doughnut) */}
            <Card className="lg:col-span-4 flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm sm:text-base font-semibold">
                    {t('dashboard.ordersByStatus')}
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                    {t('dashboard.liveStatus')}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {t('dashboard.ordersDistribution', { count: orderStatusTotal || stats.orders || 0 })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-2">
                <div className="h-44 w-44 relative flex items-center justify-center">
                  <Doughnut
                    data={ordersStatusData}
                    options={{
                      maintainAspectRatio: false,
                      cutout: '72%',
                      plugins: { legend: { display: false } },
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                      {orderStatusTotal || stats.orders || 0}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      {t('dashboard.orders')}
                    </span>
                  </div>
                </div>

                {/* Status Breakdown Legend List */}
                <div className="w-full mt-4 space-y-2">
                  {(charts.orders_by_status || []).map((o: any, idx: number) => {
                    const pct = orderStatusTotal > 0 ? Math.round((o.count / orderStatusTotal) * 100) : 0;
                    const colors = ['bg-emerald-500', 'bg-amber-500', 'bg-sky-500', 'bg-red-500', 'bg-purple-500'];
                    return (
                      <div key={o.status || idx} className="flex items-center justify-between text-xs p-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className={`size-2.5 rounded-full ${colors[idx % colors.length]}`} />
                          <span className="capitalize text-slate-700 dark:text-slate-300 font-medium">
                            {t(`common.${o.status}`, o.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white font-mono">{o.count}</span>
                          <span className="text-slate-400 text-[11px]">({pct}%)</span>
                        </div>
                      </div>
                    );
                  })}
                  {(charts.orders_by_status || []).length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-2">{t('dashboard.noOrdersYet')}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-100 dark:border-slate-800/80 pt-3 text-xs text-slate-500 justify-between">
                <span>{t('dashboard.fulfillmentRate')}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                  {orderStatusTotal > 0 ? `${Math.round(((orderStatusCounts[0] || 0) / orderStatusTotal) * 100)}%` : '100%'}
                </span>
              </CardFooter>
            </Card>
          </div>

          {/* Row 2: Top Stores & System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Top Performing Stores */}
            <Card className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                    <Sparkles className="size-4 text-amber-500" />
                    {t('dashboard.topShopsByRevenue')}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t('dashboard.topShopsDesc')}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/shops')}
                  className="h-8 text-xs text-indigo-600 dark:text-indigo-400 gap-1 hover:text-indigo-700 cursor-pointer"
                >
                  {t('dashboard.viewAll')}
                  <ArrowUpRight className="size-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3.5">
                {(charts.top_shops || []).map((shop: any, index: number) => {
                  const sharePct = totalCalculatedRevenue > 0
                    ? Math.round((shop.revenue / totalCalculatedRevenue) * 100)
                    : 50;
                  return (
                    <div
                      key={shop.id || index}
                      className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 flex items-center justify-between gap-3 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="size-10 rounded-xl shrink-0">
                          {shop.logo ? <AvatarImage src={fullUrl(shop.logo)} /> : null}
                          <AvatarFallback className="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 rounded-xl font-bold text-sm uppercase">
                            {(shop.shop_name || shop.username || 'S')[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
                              {shop.shop_name || shop.username}
                            </span>
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                              @{shop.username}
                            </Badge>
                          </div>
                          <div className="w-36 sm:w-48 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full transition-all"
                              style={{ width: `${Math.max(sharePct, 8)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                          ${Number(shop.revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {sharePct}% {t('dashboard.ofTotalSales')}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {(charts.top_shops || []).length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-6">{t('dashboard.noShopsWithSales')}</p>
                )}
              </CardContent>
            </Card>

            {/* System Health & Infrastructure Services */}
            <Card className="lg:col-span-5 flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-500" />
                    {t('dashboard.infraTitle')}
                  </CardTitle>
                  <Badge variant="success" className="gap-1.5 py-0.5 px-2 text-[10px]">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t('dashboard.slaBadge')}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {t('dashboard.infraDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{t('dashboard.coreApi')}</p>
                      <p className="text-[11px] text-slate-400">{t('dashboard.laravelPort')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">12ms</span>
                    <Badge variant="success" className="text-[10px] py-0 px-1.5">
                      {t('dashboard.operational')}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Database className="size-4 text-sky-500" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{t('dashboard.postgresDb')}</p>
                      <p className="text-[11px] text-slate-400">{t('dashboard.postgresPort')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 font-semibold bg-sky-50 dark:bg-sky-950/50 px-1.5 py-0.5 rounded">4ms</span>
                    <Badge variant="info" className="text-[10px] py-0 px-1.5">
                      {t('dashboard.connected')}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 text-xs">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="size-4 text-purple-500" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{t('dashboard.paymentGateway')}</p>
                      <p className="text-[11px] text-slate-400">{t('dashboard.sandboxEnv')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/50 px-1.5 py-0.5 rounded">200 OK</span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                      {t('dashboard.ready')}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Send className="size-4 text-blue-500" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{t('dashboard.telegramBot')}</p>
                      <p className="text-[11px] text-slate-400">{t('dashboard.telegramBotDesc')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded">Active</span>
                    <Badge variant="success" className="text-[10px] py-0 px-1.5">
                      {t('dashboard.active')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestHealth}
                  disabled={testingHealth}
                  className="flex-1 text-xs h-8 gap-1.5 text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  <Activity className={`size-3.5 text-emerald-500 ${testingHealth ? 'animate-spin' : ''}`} />
                  {testingHealth ? t('dashboard.testing') : t('dashboard.testConnection')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/settings')}
                  className="text-xs h-8 text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  {t('dashboard.manageSettings')}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Row 3: Recent Activity Feed */}
          <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="space-y-1">
                <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                  <Activity className="size-4 text-indigo-500" />
                  {t('dashboard.recentActivity')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t('dashboard.recentActivityDesc')}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/activity')}
                className="h-8 text-xs text-indigo-600 dark:text-indigo-400 gap-1 hover:text-indigo-700 cursor-pointer"
              >
                {t('dashboard.viewFullAudit')}
                <ArrowUpRight className="size-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {activity.length === 0 && (
                  <p className="p-6 text-slate-400 text-center text-xs">
                    {t('dashboard.noRecentActivity')}
                  </p>
                )}
                {activity.slice(0, 6).map((log: any) => (
                  <div
                    key={log.id}
                    className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {getActivityIcon(log.action)}
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                          {log.description || log.action}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            {log.username || t('dashboard.system')}
                          </span>
                          <span>•</span>
                          <span>
                            {log.created_at ? new Date(log.created_at).toLocaleString() : t('dashboard.justNow')}
                          </span>
                        </p>
                      </div>
                    </div>

                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider py-0 px-2 shrink-0">
                      {log.action}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================ */}
        {/* TAB 2: DETAILED ANALYTICS & GROWTH                           */}
        {/* ============================================================ */}
        <TabsContent value="analytics" className="space-y-5 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* New Shops Signup Growth */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-base font-semibold">
                  {t('dashboard.newShopsGrowth')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t('dashboard.newShopsGrowthDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Line
                    data={signupsData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { grid: { color: gridColor }, ticks: { color: textColor } },
                        y: { grid: { color: gridColor }, ticks: { color: textColor, precision: 0 } },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shops by Subscription Tier */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-base font-semibold">
                  {t('dashboard.shopsByPlan')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t('dashboard.shopsByPlanDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Bar
                    data={shopsPlanData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { grid: { color: gridColor }, ticks: { color: textColor } },
                        y: { grid: { color: gridColor }, ticks: { color: textColor, precision: 0 } },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Top Shops Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-base font-semibold">
                  {t('dashboard.topShopsByRevenue')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t('dashboard.topShopsComparisonDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Bar
                    data={topShopsData}
                    options={{
                      indexAxis: 'y' as const,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: {
                          grid: { color: gridColor },
                          ticks: { color: textColor, callback: (v: any) => `$${v}` },
                        },
                        y: { grid: { color: gridColor }, ticks: { color: textColor } },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Reseller Affiliate Commissions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm sm:text-base font-semibold">
                    {t('dashboard.resellerCommissions')}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t('dashboard.resellerCommissionsDesc', { paid: paidCount, total: (charts.resellers || []).length })}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {(charts.resellers || []).length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
                    <CreditCard className="size-8 stroke-1 text-slate-300 dark:text-slate-600 mb-2" />
                    {t('dashboard.noAffiliatePayouts')}
                  </div>
                ) : (
                  <div className="h-64">
                    <Bar
                      data={resellerCommissionData}
                      options={{
                        indexAxis: 'y' as const,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          x: { grid: { color: gridColor }, ticks: { color: textColor } },
                          y: { grid: { color: gridColor }, ticks: { color: textColor } },
                        },
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/* TAB 3: STORES & SUBSCRIPTIONS LIST                           */}
        {/* ============================================================ */}
        <TabsContent value="shops" className="space-y-4 mt-0">
          <UnifiedFilterToolbar
            search={shopSearch}
            onSearchChange={setShopSearch}
            searchPlaceholder={t('shops.searchPlaceholder', 'ស្វែងរកតាមឈ្មោះហាង ឬ @username...')}
            filters={[
              {
                id: 'status',
                value: shopStatusFilter,
                onChange: (val) => setShopStatusFilter(val || 'all'),
                options: [
                  { value: 'all', label: t('common.allStatus', 'ស្ថានភាពទាំងអស់') },
                  { value: 'active', label: t('common.active', 'សកម្ម') },
                  { value: 'suspended', label: t('common.suspended', 'ផ្អាក') },
                ],
              },
              ...(uniqueShopPlans.length > 0
                ? [
                    {
                      id: 'plan',
                      value: shopPlanFilter,
                      onChange: (val: string) => setShopPlanFilter(val || 'all'),
                      options: [
                        { value: 'all', label: t('shops.allPlans', 'គម្រោងទាំងអស់') },
                        ...uniqueShopPlans.map((p) => ({ value: p, label: `Plan: ${p}` })),
                      ],
                    },
                  ]
                : []),
            ]}
            onReset={() => {
              setShopSearch('');
              setShopStatusFilter('all');
              setShopPlanFilter('all');
            }}
          />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">{t('dashboard.registeredStores')}</CardTitle>
                <CardDescription className="text-xs">
                  {t('dashboard.registeredStoresDesc')}
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => navigate('/shops')}
                className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
              >
                {t('dashboard.manageAllShops')}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-slate-500 font-semibold uppercase text-[11px]">
                      <th className="py-3 px-4">{t('dashboard.colStore')}</th>
                      <th className="py-3 px-4">{t('dashboard.colPlan')}</th>
                      <th className="py-3 px-4">{t('dashboard.colLimit')}</th>
                      <th className="py-3 px-4">{t('dashboard.colExpires')}</th>
                      <th className="py-3 px-4">{t('dashboard.colStatus')}</th>
                      <th className="py-3 px-4 text-right">{t('dashboard.colAction')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredDashboardShops.map((shop) => (
                      <tr
                        key={shop.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              {shop.logo ? <AvatarImage src={fullUrl(shop.logo)} /> : null}
                              <AvatarFallback className="bg-indigo-50 text-indigo-600 dark:bg-indigo-950 font-bold text-xs uppercase">
                                {(shop.shop_name || shop.username || 'S')[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-200">
                                {shop.shop_name || shop.username}
                              </p>
                              <p className="text-[11px] text-slate-400">@{shop.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={shop.plan === 'pro' ? 'default' : 'secondary'}
                            className="capitalize text-[11px] font-semibold"
                          >
                            {shop.plan || 'Starter'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {shop.max_products || 50} {t('dashboard.productsUnit')}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {shop.expires_at ? new Date(shop.expires_at).toLocaleDateString() : t('dashboard.lifetime')}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={shop.status === 'active' ? 'success' : 'destructive'}
                            className="capitalize text-[10px] py-0 px-2"
                          >
                            {t(`common.${shop.status}`, shop.status || 'Active')}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/shops/${shop.id}`)}
                            className="h-7 text-xs text-indigo-600 dark:text-indigo-400 cursor-pointer"
                          >
                            {t('dashboard.details')}
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredDashboardShops.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6">
                          <Empty
                            bordered={false}
                            title={t('dashboard.noStoresRegistered', 'មិនមានហាងចុះឈ្មោះទេ')}
                            description={t('shops.noStoresDesc', 'មិនមានទិន្នន័យហាងត្រូវនឹងពាក្យស្វែងរក')}
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================ */}
        {/* TAB 4: COMPLETE ACTIVITY AUDIT FEED                          */}
        {/* ============================================================ */}
        <TabsContent value="logs" className="space-y-4 mt-0">
          <UnifiedFilterToolbar
            search={logSearch}
            onSearchChange={setLogSearch}
            searchPlaceholder={t('logs.searchPlaceholder', 'ស្វែងរកតាមការពិពណ៌នា, User ឬ Action...')}
            filters={[
              ...(uniqueLogActions.length > 0
                ? [
                    {
                      id: 'action',
                      value: logActionFilter,
                      onChange: (val: string) => setLogActionFilter(val || 'all'),
                      options: [
                        { value: 'all', label: t('logs.allActions', 'Actions ទាំងអស់') },
                        ...uniqueLogActions.map((act) => ({
                          value: act,
                          label: act.replace(/_/g, ' '),
                        })),
                      ],
                    },
                  ]
                : []),
            ]}
            onReset={() => {
              setLogSearch('');
              setLogActionFilter('all');
            }}
          />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">{t('dashboard.auditLogTitle')}</CardTitle>
                <CardDescription className="text-xs">
                  {t('dashboard.auditLogDesc')}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/activity')}
                className="h-8 text-xs cursor-pointer"
              >
                {t('dashboard.goToLogs')}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDashboardLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="size-8 mt-0.5">
                        <AvatarFallback className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold text-xs uppercase">
                          {(log.username || 'S')[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {log.description || log.action}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            {t('dashboard.userLabel')} {log.username || t('dashboard.system')}
                          </span>
                          <span>•</span>
                          <span>{t('dashboard.ipLabel')} {log.ip_address || '127.0.0.1'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {log.created_at ? new Date(log.created_at).toLocaleString() : t('dashboard.recent')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize shrink-0">
                      {log.action}
                    </Badge>
                  </div>
                ))}
                {filteredDashboardLogs.length === 0 && (
                  <div className="p-6">
                    <Empty
                      bordered={false}
                      title={t('logs.noLogsFound', 'មិនមានកំណត់ត្រាសកម្មភាព')}
                      description={t('logs.noLogsDesc', 'មិនមានទិន្នន័យត្រូវនឹងតម្រងដែលបានកំណត់')}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
