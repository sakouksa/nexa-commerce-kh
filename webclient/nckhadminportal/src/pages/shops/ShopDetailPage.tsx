import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from '../../utils';
import HttpErrorPage from '../../components/shared/HttpErrorPage';
import {
  ArrowLeft,
  Store,
  Package,
  ShoppingBag,
  Users,
  FolderTree,
  Calendar,
  CalendarPlus,
  CalendarCheck,
  CalendarX,
  ExternalLink,
  FileSpreadsheet,
  Power,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Pencil,
  Trash2,
  Plus,
  Search,
  Eye,
  Copy,
  Check,
  Clock,
  Sparkles,
  Save,
  DollarSign,
  Phone,
  Send,
  LayoutDashboard,
  ShieldCheck,
  Receipt,
  FileText,
  BadgeAlert,
  ChevronRight,
  UploadCloud,
  ImageIcon,
  Link2,
  Loader2,
  Tag,
  ZoomIn,
  Printer,
  MapPin,
  User,
} from 'lucide-react';

import { api } from '../../api/client';
import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteCustomer,
  deleteOrder,
  deleteProduct,
  exportShopBackup,
  fullUrl,
  getOrder,
  getShopDetail,
  listShopCategories,
  listShopCustomers,
  listShopOrders,
  listShopProducts,
  setShopExpiry,
  setShopLimits,
  updateCategory,
  updateOrderStatus,
  updateProduct,
  updateShopStatus,
} from '../../api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui/card';
import { AccentStatCard, AccentStatGrid } from '../../components/cards/AccentStatCard';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../../components/ui/tabs';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '../../components/ui/dialog';
import { Pagination } from '../../components/common/Pagination';
import usePageTab from '../../hooks/usePageTab';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import { ConfirmModal } from '../../components/shared';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/shared/EmptyState';
import { Category, Customer, Order, Product, Shop } from '../../types';
import { useLanguage } from '../../i18n';

// ─── Reusable Pagination Bar ──────────────────────────────────────────────────

interface PaginationBarProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  itemName?: string;
}

const PaginationBar: React.FC<PaginationBarProps> = ({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  itemName,
}) => {
  return (
    <Pagination
      page={page}
      pageSize={pageSize}
      totalItems={totalItems}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      itemLabel={itemName}
    />
  );
};

// ─── Main ShopDetailPage Component ────────────────────────────────────────────

const VALID_SHOP_TABS = ['Overview', 'Products', 'Orders', 'Customers', 'Categories'] as const;
type ShopTab = typeof VALID_SHOP_TABS[number];

export default function ShopDetail() {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const shopId = Number(id);
  const navigate = useNavigate();

  const [shop, setShop] = useState<Shop | null>(null);
  const [tab, setTab] = usePageTab<ShopTab>({
    paramKey: 'tab',
    defaultTab: 'Overview',
    validTabs: VALID_SHOP_TABS,
    transform: (raw) => {
      const match = VALID_SHOP_TABS.find((t) => t.toLowerCase() === raw.toLowerCase());
      return match || 'Overview';
    },
    storageKey: `shop_detail_tab_${shopId}`,
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadShop = async () => {
    try {
      setErrorStatus(null);
      setErrorMessage(null);
      const data = await getShopDetail(shopId);
      setShop(data);
    } catch (e: any) {
      const status = e?.status || e?.response?.status || 500;
      const message = e?.message || e?.detail || e?.response?.data?.detail || t('shops.loadFailed', 'Failed to load shop');
      setErrorStatus(status);
      setErrorMessage(message);
      toast.error(message);
    }
  };

  useEffect(() => {
    loadShop().finally(() => setLoading(false));
  }, [shopId]);

  const toggleStatus = async () => {
    if (!shop) return;
    const next = shop.status === 'active' ? 'suspended' : 'active';
    try {
      await updateShopStatus(shopId, next);
      toast.success(next === 'active' ? t('shops.activate') : t('shops.suspend'));
      loadShop();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || t('shops.updateStatusFailed', 'Failed to update status'));
    }
  };

  const setExpiry = async (days: number) => {
    try {
      await setShopExpiry(shopId, days);
      toast.success(
        days > 0
          ? t('shops.expirySetSuccess', { days, defaultValue: `Expiry set (+${days} days)` })
          : t('shops.expiryCleared', 'Expiry cleared')
      );
      loadShop();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || t('shops.expirySetFailed', 'Failed to set expiry'));
    }
  };

  const exportExcel = async () => {
    try {
      const blob = await exportShopBackup(shopId, 'xlsx');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shop_${shopId}_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_')}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t('shops.exportExcel', 'Shop Excel exported'));
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Export failed');
    }
  };

  const copyUsername = () => {
    if (!shop) return;
    navigator.clipboard.writeText(`@${shop.username}`);
    setCopied(true);
    toast.success(t('shops.copyStorefrontLink', 'Copied to clipboard'));
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <LoadingSpinner text={t('shops.loading', 'Loading shop details...')} />;
  }

  if (errorStatus || !shop) {
    const code = errorStatus === 404 ? 404 : errorStatus === 403 ? 403 : 500;
    return (
      <HttpErrorPage
        code={code}
        fullPage={false}
        title={code === 404 ? t('shops.notFound', 'Shop not found') : errorMessage || undefined}
        description={
          code === 404
            ? t('shops.noMatchingShops', 'Shop details unavailable or does not exist.')
            : undefined
        }
        onRetry={loadShop}
        showRetryButton={code !== 404}
      />
    );
  }

  const isExpired = !!shop.expires_at && new Date(shop.expires_at) < new Date();
  const storefrontUrl = `http://localhost:3000/${shop.username}`;

  return (
    <div className="space-y-6">
      {/* ─── Clean Header & Quick Actions ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        {/* Left: Brand Identity & Meta */}
        <div className="flex items-center gap-3.5 min-w-0">
          <Avatar className="size-11 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs shrink-0">
            {shop.logo ? (
              <AvatarImage src={fullUrl(shop.logo)} alt={shop.shop_name} className="object-cover" />
            ) : null}
            <AvatarFallback className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              {(shop.shop_name || shop.username).slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                {shop.shop_name || shop.username}
              </h1>

              <Badge
                variant="outline"
                className="bg-indigo-50/80 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200/80 uppercase font-mono text-[10px] tracking-wider py-0.5 px-2 font-bold"
              >
                {shop.plan || 'Starter'}
              </Badge>

              {shop.status === 'active' && !isExpired ? (
                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 gap-1.5 font-semibold text-xs py-0.5 px-2">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t('common.active', 'សកម្ម')}
                </Badge>
              ) : isExpired ? (
                <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 gap-1.5 font-semibold text-xs py-0.5 px-2">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  {t('shops.expired', 'ផុតកំណត់')}
                </Badge>
              ) : (
                <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60 gap-1.5 font-semibold text-xs py-0.5 px-2">
                  <span className="size-1.5 rounded-full bg-rose-500" />
                  {t('common.suspended', 'ផ្អាក')}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <button
                onClick={copyUsername}
                className="inline-flex items-center gap-1 font-mono hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                title={t('shops.copyStorefrontLink', 'Copy Username')}
              >
                <span>@{shop.username}</span>
                {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3 text-slate-400" />}
              </button>

              <span>•</span>

              <a
                href={storefrontUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-mono"
              >
                <span>localhost:3000/{shop.username}</span>
                <ExternalLink className="size-3 text-slate-400" />
              </a>

              <span>•</span>

              <span>
                {shop.expires_at ? (
                  <span>
                    {t('shops.expiresAt', 'Expires')}: {new Date(shop.expires_at).toLocaleDateString()}
                  </span>
                ) : (
                  <span>{t('shops.never', 'Permanent')}</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions & Back Button */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={exportExcel}
            className="gap-1.5 h-9 text-xs font-medium shadow-2xs"
          >
            <FileSpreadsheet className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('shops.exportExcel', 'Export Excel')}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleStatus}
            className={`gap-1.5 h-9 text-xs font-semibold shadow-2xs ${
              shop.status === 'active'
                ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 dark:border-rose-900/60'
                : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200 dark:border-emerald-900/60'
            }`}
          >
            {shop.status === 'active' ? (
              <Power className="size-3.5 text-rose-500" />
            ) : (
              <CheckCircle2 className="size-3.5 text-emerald-500" />
            )}
            <span>
              {shop.status === 'active'
                ? t('shops.suspend', 'Suspend')
                : t('shops.activate', 'Activate')}
            </span>
          </Button>

          <Button
            asChild
            className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-9 px-3.5 text-xs shadow-2xs"
          >
            <a href={storefrontUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="size-3.5" />
              <span>{t('shops.visit', 'Storefront ↗')}</span>
            </a>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/shops')}
            className="gap-1.5 h-9 px-3 text-xs font-medium shadow-2xs text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
            title={t('buttons.back', 'Back to Shops')}
          >
            <ArrowLeft className="size-3.5" />
            <span>{t('buttons.back', 'ត្រឡប់ក្រោយ')}</span>
          </Button>
        </div>
      </div>

      {/* ─── Shadcn Tabs Navigation ───────────────────────────────────────── */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <div className="flex items-center justify-start w-full">
          <TabsList className="justify-start inline-flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-1 rounded-xl h-auto flex-wrap gap-1">
            <TabsTrigger
              value="Overview"
              className="gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-xs transition-all"
            >
              <LayoutDashboard className="size-3.5" />
              <span>{t('shops.tabs.overview', 'Overview')}</span>
            </TabsTrigger>

            <TabsTrigger
              value="Products"
              className="gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-xs transition-all"
            >
              <Package className="size-3.5" />
              <span>{t('shops.tabs.products', 'Products')}</span>
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-mono">
                {shop.product_count ?? 0}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="Orders"
              className="gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-xs transition-all"
            >
              <ShoppingBag className="size-3.5" />
              <span>{t('shops.tabs.orders', 'Orders')}</span>
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-mono">
                {shop.order_count ?? 0}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="Customers"
              className="gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-xs transition-all"
            >
              <Users className="size-3.5" />
              <span>{t('shops.tabs.customers', 'Customers')}</span>
            </TabsTrigger>

            <TabsTrigger
              value="Categories"
              className="gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-xs transition-all"
            >
              <FolderTree className="size-3.5" />
              <span>{t('shops.tabs.categories', 'Categories')}</span>
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-mono">
                {shop.category_count ?? 0}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Overview */}
        <TabsContent value="Overview" className="space-y-6 focus-visible:outline-none">
          <OverviewTab shop={shop} setExpiry={setExpiry} toggleStatus={toggleStatus} onSaved={loadShop} />
        </TabsContent>

        {/* Tab 2: Products */}
        <TabsContent value="Products" className="space-y-6 focus-visible:outline-none">
          <ProductsTab shopId={shopId} />
        </TabsContent>

        {/* Tab 3: Orders */}
        <TabsContent value="Orders" className="space-y-6 focus-visible:outline-none">
          <OrdersTab shopId={shopId} />
        </TabsContent>

        {/* Tab 4: Customers */}
        <TabsContent value="Customers" className="space-y-6 focus-visible:outline-none">
          <CustomersTab shopId={shopId} />
        </TabsContent>

        {/* Tab 5: Categories */}
        <TabsContent value="Categories" className="space-y-6 focus-visible:outline-none">
          <CategoriesTab shopId={shopId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── TAB 1: OVERVIEW COMPONENT ────────────────────────────────────────────────

function OverviewTab({
  shop,
  setExpiry,
  toggleStatus,
  onSaved,
}: {
  shop: Shop;
  setExpiry: (days: number) => void;
  toggleStatus: () => void;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
  const [pLimit, setPLimit] = useState<string | number>(shop.max_products ?? '');
  const [cLimit, setCLimit] = useState<string | number>(shop.max_categories ?? '');
  const [savingLimits, setSavingLimits] = useState(false);

  const saveLimits = async () => {
    setSavingLimits(true);
    try {
      const data = {
        max_products: pLimit === '' || Number(pLimit) === 0 ? 0 : Number(pLimit),
        max_categories: cLimit === '' || Number(cLimit) === 0 ? 0 : Number(cLimit),
      };
      await setShopLimits(shop.id, data);
      toast.success(t('toast.savedSuccessfully', 'Limits saved'));
      onSaved();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || t('toast.failedToSave', 'Failed to save limits'));
    } finally {
      setSavingLimits(false);
    }
  };

  const isExpired = !!shop.expires_at && new Date(shop.expires_at) < new Date();
  const daysLeft = shop.expires_at
    ? Math.ceil((new Date(shop.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6">
      {/* ─── Modern Accent KPI Stat Cards ───────────────────────────────── */}
      <AccentStatGrid columns={4}>
        <AccentStatCard
          variant="indigo"
          label={t('shops.products', 'Products')}
          value={shop.product_count ?? 0}
          useCounter={true}
          icon={<Package className="size-5" />}
          subtitle={
            shop.max_products
              ? `${shop.product_count ?? 0} / ${shop.max_products} ${t('shops.used', 'used')}`
              : t('shops.never', 'Unlimited quota')
          }
        />

        <AccentStatCard
          variant="purple"
          label={t('shops.orders', 'Orders')}
          value={shop.order_count ?? 0}
          useCounter={true}
          icon={<ShoppingBag className="size-5" />}
          subtitle={t('shops.inventoryOrdersSubtitle', {
            products: shop.product_count ?? 0,
            orders: shop.order_count ?? 0,
            defaultValue: `${shop.order_count ?? 0} orders recorded`,
          })}
        />

        <AccentStatCard
          variant="sky"
          label={t('shops.users', 'Users')}
          value={shop.user_count ?? 0}
          useCounter={true}
          icon={<Users className="size-5" />}
          subtitle={t('shops.staffAndAdmins', 'Shop Owner & Staff members')}
        />

        <AccentStatCard
          variant="emerald"
          label={t('shops.currency', 'Currency')}
          value={shop.currency || 'USD'}
          useCounter={false}
          icon={<DollarSign className="size-5" />}
          subtitle={`${t('shops.planLabel', 'Plan')}: ${shop.plan || 'Starter'}`}
        />
      </AccentStatGrid>

      {/* ─── 2x2 Clean Cards Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Shop & Contact Info */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="size-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Store className="size-4" />
              </div>
              <span>{t('shops.detail', 'Shop Information')}</span>
            </CardTitle>
            <CardDescription className="text-xs">
              {t('shops.detailSubtitle', 'General details, biography, and storefront configuration')}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4 text-sm">
            <div>
              <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
                {t('shops.bio', 'Bio / Description')}
              </Label>
              <p className="text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800 text-xs leading-relaxed">
                {shop.bio || shop.description || '—'}
              </p>
            </div>

            <div>
              <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
                {t('shops.contact', 'Contact Information')}
              </Label>
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800 text-xs">
                <Phone className="size-3.5 text-slate-400 shrink-0" />
                <span>{shop.contact || '—'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  {t('shops.planLabel', 'Plan')}
                </span>
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  {shop.plan || 'Free / Starter'}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  {t('common.status', 'Status')}
                </span>
                <span className="font-semibold text-xs capitalize text-slate-800 dark:text-slate-200">
                  {shop.status === 'active' ? t('common.active', 'Active') : t('common.suspended', 'Suspended')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Subscription & Expiry */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="size-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Calendar className="size-4" />
              </div>
              <span>{t('shops.subscriptionExpiry', 'Subscription / Expiry')}</span>
            </CardTitle>
            <CardDescription className="text-xs">
              {t('shops.subscriptionDesc', 'Manage validity periods and subscription renewals')}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4 text-sm">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  {t('shops.currentExpiryDate', 'Current Expiry Date')}
                </span>
                <p className="font-bold text-sm text-slate-900 dark:text-slate-100 font-mono">
                  {shop.expires_at
                    ? new Date(shop.expires_at).toLocaleDateString()
                    : t('shops.permanent', 'Permanent / Unlimited')}
                </p>
              </div>

              {shop.expires_at && (
                <div>
                  {isExpired ? (
                    <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200">
                      {t('shops.expired', 'Expired')}
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200">
                      {daysLeft} {t('shops.daysRemaining', 'days left')}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs text-slate-500 dark:text-slate-400 mb-2 block">
                {t('shops.setExpiry', 'Quick Extend Subscription')}
              </Label>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpiry(30)}
                  className="gap-1.5 h-8 text-xs font-semibold shadow-xs"
                >
                  <CalendarPlus className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{t('shops.add1Month', '+ 1 Month')}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpiry(365)}
                  className="gap-1.5 h-8 text-xs font-semibold shadow-xs"
                >
                  <CalendarCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('shops.add1Year', '+ 1 Year')}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpiry(0)}
                  className="gap-1.5 h-8 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 dark:border-rose-900/60 shadow-xs"
                >
                  <CalendarX className="size-3.5" />
                  <span>{t('shops.clearExpiry', 'Clear Expiry')}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Creation Limits & Quota */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="size-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Sliders className="size-4" />
              </div>
              <span>{t('shops.creationLimits', 'Creation Limits & Quotas')}</span>
            </CardTitle>
            <CardDescription className="text-xs">
              {t('shops.limits', 'Set maximum allowable products and categories (0 = unlimited)')}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block">
                  {t('shops.maxProducts', 'Max Products')}
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={pLimit}
                  onChange={(e) => setPLimit(e.target.value)}
                  placeholder={`0 (${t('shops.never', 'Unlimited')})`}
                  className="h-9 text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {shop.product_count ?? 0} {t('shops.used', 'used')}
                  {shop.max_products ? ` / ${shop.max_products}` : ' / ∞'}
                </p>
              </div>

              <div>
                <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block">
                  {t('shops.maxCategories', 'Max Categories')}
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={cLimit}
                  onChange={(e) => setCLimit(e.target.value)}
                  placeholder={`0 (${t('shops.never', 'Unlimited')})`}
                  className="h-9 text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {shop.category_count ?? 0} {t('shops.used', 'used')}
                  {shop.max_categories ? ` / ${shop.max_categories}` : ' / ∞'}
                </p>
              </div>
            </div>

            <Button
              onClick={saveLimits}
              disabled={savingLimits}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-9 px-4 text-xs shadow-xs"
            >
              <Save className="size-3.5" />
              <span>{savingLimits ? t('buttons.saving', 'Saving...') : t('shops.saveLimits', 'Save Limits')}</span>
            </Button>
          </CardContent>
        </Card>

        {/* Card 4: Payments & Integrations */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CreditCard className="size-4" />
              </div>
              <span>{t('shops.abaPay', 'Payment & Telegram Integrations')}</span>
            </CardTitle>
            <CardDescription className="text-xs">
              {t('shops.khqrConfig', 'ABA KHQR Merchant settings & Telegram Bot state')}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-3 text-sm">
            <div className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                  ABA Pay (KHQR)
                </span>
                {shop.aba_settings?.profile_id ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 text-[10px]">
                    {shop.aba_settings?.test_mode ? t('shops.sandboxMode', 'Sandbox') : t('shops.liveMode', 'Live')}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-slate-400">
                    {t('shops.notConfigured', 'Not Configured')}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {shop.aba_settings?.profile_id ? `${t('shops.merchantProfile', 'Merchant Profile:')} ${shop.aba_settings.profile_id}` : t('shops.notConfigured')}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Send className="size-3 text-sky-500" />
                  {t('shops.telegramNotifications', 'Telegram Notifications')}
                </span>
                {shop.telegram_settings?.bot_token ? (
                  <Badge className="bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 text-[10px]">
                    {t('common.connected', 'Connected')}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-slate-400">
                    {t('shops.notConfigured', 'Not Configured')}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {shop.telegram_settings?.chat_id
                  ? `${t('shops.chatId', 'Chat ID:')} ${shop.telegram_settings.chat_id}`
                  : t('shops.telegramOrdersAndStock', 'Orders & Stock Alerts')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── TAB 2: PRODUCTS COMPONENT ────────────────────────────────────────────────

function ProductsTab({ shopId }: { shopId: number }) {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    title: string;
    category?: string;
    price?: number;
  } | null>(null);

  const [form, setForm] = useState<{
    name: string;
    description: string;
    price: number | string;
    quantity: number | string;
    category_id: number | string;
    image: string;
    status: string;
    featured: boolean;
  }>({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category_id: '',
    image: '',
    status: 'active',
    featured: false,
  });

  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = () =>
    Promise.all([listShopProducts(shopId), listShopCategories(shopId)])
      .then(([p, c]) => {
        setProducts(p);
        setCats(c);
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, [shopId]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '',
      description: '',
      price: '',
      quantity: '',
      category_id: '',
      image: '',
      status: 'active',
      featured: false,
    });
    setImageMode('upload');
    setModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    const existingImg = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '';
    setForm({
      name: p.name || '',
      description: p.description || '',
      price: p.price !== undefined && p.price !== null ? String(p.price) : '',
      quantity: p.quantity !== undefined && p.quantity !== null ? String(p.quantity) : '',
      category_id: p.category_id ? String(p.category_id) : '',
      image: existingImg,
      status: p.status || 'active',
      featured: !!p.featured,
    });
    setImageMode(existingImg && existingImg.startsWith('http') ? 'url' : 'upload');
    setModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error(t('toast.fileTooLarge', 'រូបភាពធំពេក (អតិបរមា 8MB) / File too large (max 8MB)'));
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setUploadingImage(true);
    try {
      const res = await api.post('/api/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.url) {
        setForm((prev) => ({ ...prev, image: res.data.url }));
        toast.success(t('toast.imageUploaded', 'រូបភាពត្រូវបានបញ្ចូលជោគជ័យ'));
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err?.response?.data?.message || t('toast.uploadFailed', 'បរាជ័យក្នុងការបញ្ចូលរូបភាព'));
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error(t('shops.nameRequired', 'ឈ្មោះទំនិញត្រូវបានទាមទារ / Name is required'));
      return;
    }
    setSubmitting(true);
    const payload = {
      shop_id: shopId,
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      quantity: Number(form.quantity) || 0,
      category_id: form.category_id ? Number(form.category_id) : null,
      images: form.image.trim() ? [form.image.trim()] : [],
      status: form.status,
      featured: form.featured,
    };
    try {
      if (editing) {
        await updateProduct(editing.id, payload);
        toast.success(t('toast.productUpdated', 'ទំនិញត្រូវបានកែសម្រួលជោគជ័យ'));
      } else {
        await createProduct(payload);
        toast.success(t('toast.productCreated', 'ទំនិញត្រូវបានបង្កើតជោគជ័យ'));
      }
      setModal(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('toast.failedToSave', 'Failed to save product'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      toast.success(t('toast.productDeleted', 'Product deleted'));
      setDeleteTarget(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('toast.failedToDelete', 'Failed to delete'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & Pagination
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter((p) => p.name?.toLowerCase().includes(q));
  }, [products, search]);

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredProducts, page, pageSize]);

  if (loading) return <LoadingSpinner text={t('shops.loadingProducts', 'Loading products...')} />;

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t('shops.searchProductsPlaceholder', 'Search products...')}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <Button
          onClick={openCreate}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-9 px-4 text-xs shadow-xs shrink-0"
        >
          <Plus className="size-4" />
          <span>{t('shops.addProduct', 'Add Product')}</span>
        </Button>
      </div>

      {/* Modern Shadcn Table */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[45%]">{t('tables.name', 'Product')}</TableHead>
              <TableHead>{t('tables.price', 'Price')}</TableHead>
              <TableHead>{t('tables.stock', 'Stock')}</TableHead>
              <TableHead>{t('tables.status', 'Status')}</TableHead>
              <TableHead className="text-right">{t('tables.actions', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center text-slate-400 text-xs">
                  {t('shops.noProductsFound', 'No products found.')}
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((p) => (
                <TableRow key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewImage({
                              url: fullUrl(p.images[0]),
                              title: p.name,
                              category: p.category?.name,
                              price: Number(p.sale_price ?? p.price),
                            })
                          }
                          className="size-9 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                          title={t('shops.previewImage', 'ចុចដើម្បីមើលរូបភាពធំ')}
                        >
                          <img
                            src={fullUrl(p.images[0])}
                            alt={p.name}
                            className="size-full object-cover transition-transform duration-200 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ZoomIn className="size-3.5 text-white drop-shadow-xs" />
                          </div>
                        </button>
                      ) : (
                        <div className="size-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-500 shrink-0">
                          {p.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate block">
                          {p.name}
                        </span>
                        {p.category && (
                          <span className="text-[11px] text-slate-400 block truncate">
                            {p.category.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="font-semibold text-xs text-slate-900 dark:text-slate-100 font-mono">
                    ${Number(p.sale_price ?? p.price).toFixed(2)}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs font-mono py-0.5 ${
                        (p.quantity ?? 0) <= 0
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                          : (p.quantity ?? 0) <= 5
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                      }`}
                    >
                      {p.quantity ?? 0} {t('tables.inStock', 'units')}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs py-0.5 font-medium ${
                        p.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {p.status === 'active' ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(p)}
                        className="size-8 p-0 text-slate-500 hover:text-indigo-600"
                        title={t('buttons.edit', 'Edit')}
                      >
                        <Pencil className="size-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(p)}
                        className="size-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title={t('buttons.delete', 'Delete')}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <PaginationBar
          page={page}
          pageSize={pageSize}
          totalItems={filteredProducts.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemName={t('shops.products', 'products')}
        />
      </div>

      {/* Add / Edit Product Modal - Modern Clean Shadcn UI */}
      <Modal
        open={modal}
        onOpenChange={setModal}
        icon={<Package className="size-5" />}
        iconColor="indigo"
        title={editing ? t('shops.editProduct', 'កែសម្រួលទំនិញ') : t('shops.addProduct', 'បន្ថែមទំនិញ')}
        description={
          editing
            ? t('shops.editProductSubtitle', 'កែប្រែព័ត៌មានលម្អិតនៃទំនិញរបស់អ្នក')
            : t('shops.addProductSubtitle', 'បញ្ចូលព័ត៌មានលម្អិតសម្រាប់ទំនិញថ្មីរបស់អ្នក')
        }
        maxWidth="md"
        onSubmit={submit}
        isSubmitting={submitting || uploadingImage}
        submitText={editing ? t('shops.saveChanges', 'រក្សាទុកការផ្លាស់ប្តូរ') : t('shops.addProduct', 'បន្ថែមទំនិញ')}
        cancelText={t('buttons.cancel', 'បោះបង់')}
      >
        {/* 1. ឈ្មោះទំនិញ * */}
              <div className="space-y-1.5 w-full min-w-0">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 h-5 whitespace-nowrap">
                  <span>{t('shops.productName', 'ឈ្មោះទំនិញ')}</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t('shops.productNamePlaceholder', 'ឧ. អាវយឺត, កាបូប, ស្បែកជើង...')}
                  className="w-full h-10 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 px-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  required
                />
              </div>

              {/* 2. ប្រភេទ (Category) */}
              <div className="space-y-1.5 w-full min-w-0">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center h-5 whitespace-nowrap">
                  {t('shops.category', 'ប្រភេទទំនិញ')}
                </label>
                <div className="relative w-full min-w-0">
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="w-full h-10 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 px-3.5 pr-8 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="">{t('shops.selectCategory', 'ជ្រើសរើសប្រភេទទំនិញ...')}</option>
                    {cats.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                    ▼
                  </div>
                </div>
              </div>

              {/* 3. តម្លៃ ($) * និង ចំនួនស្តុក (2 Columns) */}
              <div className="grid grid-cols-2 gap-3 items-start w-full min-w-0">
                <div className="space-y-1.5 min-w-0">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center h-5 whitespace-nowrap">
                    <span>{t('tables.price', 'តម្លៃ ($)')}</span>
                    <span className="text-rose-500 ml-1 font-bold">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full h-10 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 px-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5 min-w-0">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center h-5 whitespace-nowrap">
                    <span>{t('shops.quantity', 'ចំនួនស្តុក')}</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="0"
                    className="w-full h-10 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 px-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                  />
                </div>
              </div>

              {/* 4. រូបភាពទំនិញ (Product Image) with Upload & URL Tabs */}
              <div className="space-y-2 w-full min-w-0">
                <div className="flex items-center justify-between gap-2 w-full min-w-0">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {t('shops.productImage', 'រូបភាពទំនិញ')}
                  </label>
                  
                  {/* Segmented Control Pill */}
                  <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                    <button
                      type="button"
                      onClick={() => setImageMode('upload')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                        imageMode === 'upload'
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs font-semibold'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {t('shops.uploadImage', 'ជ្រើសរើសរូបភាព')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                        imageMode === 'url'
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs font-semibold'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {t('shops.imageUrl', 'តំណភ្ជាប់ URL')}
                    </button>
                  </div>
                </div>

                {imageMode === 'upload' ? (
                  <div className="w-full min-w-0">
                    {form.image ? (
                      <div className="relative rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 p-3 flex items-center justify-between gap-3 w-full min-w-0">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={fullUrl(form.image)}
                            alt="Product preview"
                            className="size-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shadow-xs shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {form.image.split('/').pop()}
                            </p>
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              ✓ {t('shops.imageReady', 'រូបភាពរួចរាល់')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                          >
                            {t('buttons.change', 'ប្តូរ')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, image: '' })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title={t('buttons.remove', 'លុប')}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all group w-full"
                      >
                        <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform shadow-2xs">
                          {uploadingImage ? (
                            <Loader2 className="size-5 animate-spin" />
                          ) : (
                            <UploadCloud className="size-5" />
                          )}
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs group-hover:border-indigo-300">
                          <UploadCloud className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>{uploadingImage ? t('shops.uploading', 'កំពុងបញ្ចូល...') : t('shops.chooseImage', 'ជ្រើសរើសរូបភាព')}</span>
                        </div>

                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                          {t('shops.imageHint', 'ទំហំដែលគាំទ្រ 400x400 JPG, PNG ឬ WebP')}
                        </p>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-2 w-full min-w-0">
                    <input
                      type="url"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      placeholder="https://example.com/product-image.jpg"
                      className="w-full h-10 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 px-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                    />
                    {form.image && (
                      <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 w-full min-w-0 overflow-hidden">
                        <img
                          src={form.image}
                          alt="URL Preview"
                          className="size-12 rounded-lg object-cover border border-slate-200 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <span className="text-xs text-slate-500 truncate min-w-0 flex-1">{form.image}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 5. ការពិពណ៌នា (Description) */}
              <div className="space-y-1.5 w-full min-w-0">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center h-5 whitespace-nowrap">
                  {t('shops.description', 'ការពិពណ៌នា')}
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={t('shops.descPlaceholder', 'ពិពណ៌នាសង្ខេបអំពីទំនិញនេះ...')}
                  rows={2}
                  className="w-full rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none font-normal"
                />
              </div>

              {/* 6. ស្ថានភាពទំនិញសកម្ម (Active Status Switch Card) */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/30 p-3.5 flex items-center justify-between gap-3 w-full min-w-0">
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {t('shops.activeProductStatus', 'ស្ថានភាពទំនិញសកម្ម')}
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                    {t('shops.activeProductDesc', 'បង្ហាញទំនិញនេះក្នុងហាង និងអនុញ្ញាតឱ្យទិញបាន')}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={form.status === 'active'}
                  onClick={() =>
                    setForm({ ...form, status: form.status === 'active' ? 'draft' : 'active' })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                    form.status === 'active' ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      form.status === 'active' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title={t('shops.deleteProductTitle', 'Delete Product')}
        message={t('shops.deleteProductConfirm', { name: deleteTarget?.name })}
        itemName={deleteTarget?.name}
        confirmText={t('buttons.delete', 'Delete')}
        cancelText={t('buttons.cancel', 'Cancel')}
        variant="destructive"
        isLoading={isDeleting}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* Product Image Preview Dialog - Modern Shadcn UI */}
      <Dialog open={!!previewImage} onOpenChange={(open) => { if (!open) setPreviewImage(null); }}>
        <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
          <DialogHeader className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800/80 pr-12">
            <div className="flex items-center gap-2 flex-wrap">
              <DialogTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {previewImage?.title}
              </DialogTitle>
              {previewImage?.category && (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium bg-slate-50 dark:bg-slate-800">
                  {previewImage.category}
                </Badge>
              )}
            </div>
            {previewImage?.price !== undefined && (
              <DialogDescription className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                ${previewImage.price.toFixed(2)}
              </DialogDescription>
            )}
          </DialogHeader>

          {previewImage && (
            <div className="p-4 flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/40 min-h-[300px] max-h-[70vh] overflow-hidden">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[60vh] max-w-full w-auto h-auto object-contain rounded-xl shadow-xs border border-slate-200/60 dark:border-slate-800"
              />
            </div>
          )}

          <DialogFooter className="p-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex sm:items-center sm:justify-between gap-2">
            <a
              href={previewImage?.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium px-2 py-1"
            >
              <ExternalLink className="size-3.5" />
              <span>{t('shops.openOriginal', 'បើករូបភាពទំហំដើម ↗')}</span>
            </a>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewImage(null)}
              className="h-8 text-xs font-medium"
            >
              {t('buttons.close', 'បិទ')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── TAB 3: ORDERS COMPONENT ──────────────────────────────────────────────────

function OrdersTab({ shopId }: { shopId: number }) {
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = () => listShopOrders(shopId).then(setOrders).finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, [shopId]);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'delivered':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/80 font-medium text-xs">
            {t('common.delivered', 'បានប្រគល់')}
          </Badge>
        );
      case 'shipped':
        return (
          <Badge className="bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200/80 font-medium text-xs">
            {t('common.shipped', 'បានផ្ញើចេញ')}
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200/80 font-medium text-xs">
            {t('common.processing', 'កំពុងដំណើរការ')}
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/80 font-medium text-xs">
            {t('common.cancelled', 'បានបោះបង់')}
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/80 font-medium text-xs">
            {t('common.pending', 'រង់ចាំ')}
          </Badge>
        );
    }
  };

  const getPaymentBadge = (method?: string, status?: string) => {
    const isPaid = status?.toLowerCase() === 'paid';
    const methodLabel = method === 'aba_khqr' || method === 'aba' ? 'ABA KHQR' : method?.toUpperCase() || 'COD';
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge variant="outline" className="font-mono text-[10px] uppercase font-bold py-0.5 px-2 bg-slate-50 dark:bg-slate-800">
          {methodLabel}
        </Badge>
        <Badge
          className={`text-[10px] font-semibold py-0.5 px-2 border ${
            isPaid
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60'
              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60'
          }`}
        >
          {isPaid ? `✓ ${t('common.paid', 'បានបង់')}` : t('common.pending', 'រង់ចាំ')}
        </Badge>
      </div>
    );
  };

  const copyOrderNumber = (num?: string) => {
    if (!num) return;
    navigator.clipboard.writeText(num);
    toast.success(t('toast.copied', 'បានចម្លងទៅ Clipboard'));
  };

  const setStatus = async (o: Order, status: string) => {
    try {
      await updateOrderStatus(o.id, { order_status: status });
      toast.success(`Order #${o.order_number} → ${status}`);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || t('toast.failedToUpdate', 'Failed to update order'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteOrder(deleteTarget.id);
      toast.success(t('toast.orderDeleted', 'Order deleted'));
      setDeleteTarget(null);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || t('toast.failedToDelete', 'Failed to delete'));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (o) =>
        o.order_number?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_phone?.includes(q)
    );
  }, [orders, search]);

  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredOrders, page, pageSize]);

  if (loading) return <LoadingSpinner text={t('shops.loadingOrders', 'Loading orders...')} />;

  return (
    <div className="space-y-4">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t('shops.searchOrdersPlaceholder', 'ស្វែងរកតាមលេខកុម្ម៉ង់ ឬអតិថិជន...')}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {t('shops.totalOrders', 'ការកុម្ម៉ង់សរុប')}: <strong className="text-slate-800 dark:text-slate-200 font-mono">{orders.length}</strong>
        </div>
      </div>

      {/* Modern Shadcn Table */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[18%]">{t('tables.order', 'Order #')}</TableHead>
              <TableHead>{t('tables.customer', 'Customer')}</TableHead>
              <TableHead>{t('tables.total', 'Total')}</TableHead>
              <TableHead>{t('tables.payment', 'Payment')}</TableHead>
              <TableHead>{t('tables.status', 'Status')}</TableHead>
              <TableHead className="text-right">{t('tables.actions', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-slate-400 text-xs">
                  {t('shops.noOrdersFound', 'No orders found.')}
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((o) => (
                <TableRow key={o.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <TableCell>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                      #{o.order_number}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="min-w-0">
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block truncate">
                        {o.customer_name || '—'}
                      </span>
                      {o.customer_phone && (
                        <span className="text-[11px] text-slate-400 block font-mono">
                          {o.customer_phone}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                    ${Number(o.total).toFixed(2)}{' '}
                    <span className="text-[10px] font-normal text-slate-400">{o.currency || 'USD'}</span>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="text-xs uppercase font-mono py-0.5">
                      {o.payment_method || 'aba'}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <select
                      value={o.order_status || 'pending'}
                      onChange={(e) => setStatus(o, e.target.value)}
                      className="h-7 rounded-md border border-slate-200 dark:border-slate-800 bg-background text-xs px-2 py-0.5 font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="pending">{t('common.pending', 'រង់ចាំ')}</option>
                      <option value="processing">{t('common.processing', 'កំពុងដំណើរការ')}</option>
                      <option value="shipped">{t('common.shipped', 'បានផ្ញើចេញ')}</option>
                      <option value="delivered">{t('common.delivered', 'បានប្រគល់')}</option>
                      <option value="cancelled">{t('common.cancelled', 'បានបោះបង់')}</option>
                    </select>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => getOrder(o.id).then(setView)}
                        className="size-8 p-0 text-slate-500 hover:text-indigo-600"
                        title={t('buttons.view', 'View Order Details')}
                      >
                        <Eye className="size-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(o)}
                        className="size-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title={t('buttons.delete', 'Delete')}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <PaginationBar
          page={page}
          pageSize={pageSize}
          totalItems={filteredOrders.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemName={t('shops.orders', 'orders')}
        />
      </div>

      {/* Order Details Receipt Dialog - Modern Clean Shadcn UI */}
      <Dialog open={!!view} onOpenChange={(open) => { if (!open) setView(null); }}>
        <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl">
          {/* Header */}
          <DialogHeader className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800/80 pr-12 text-left">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/40 shadow-2xs">
                <Receipt className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight">
                    #{view?.order_number}
                  </DialogTitle>
                  <button
                    type="button"
                    onClick={() => copyOrderNumber(view?.order_number)}
                    className="size-6 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 inline-flex items-center justify-center transition-colors cursor-pointer"
                    title={t('shops.copyOrderNumber', 'ចម្លងលេខកុម្ម៉ង់')}
                  >
                    <Copy className="size-3" />
                  </button>
                  {getStatusBadge(view?.order_status)}
                </div>
                <DialogDescription className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-mono">
                  <Clock className="size-3 text-slate-400" />
                  <span>{view?.created_at ? new Date(view.created_at).toLocaleString() : ''}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {view && (
            <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto">
              {/* 2-Column Customer & Payment Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Customer Info Card */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium uppercase tracking-wider">
                    <User className="size-3.5 text-indigo-500" />
                    <span>{t('tables.customer', 'អតិថិជន')}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-9 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
                      <AvatarFallback className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                        {(view.customer_name || 'C').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block truncate">
                        {view.customer_name || '—'}
                      </span>
                      {view.customer_phone ? (
                        <a
                          href={`tel:${view.customer_phone}`}
                          className="text-[11px] text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-mono inline-flex items-center gap-1 mt-0.5 hover:underline"
                        >
                          <Phone className="size-3" />
                          <span>{view.customer_phone}</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400">—</span>
                      )}
                    </div>
                  </div>

                  {(view.customer_city || view.customer_address) && (
                    <div className="flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                      <MapPin className="size-3 text-slate-400 shrink-0 mt-0.5" />
                      <span className="truncate">
                        {[view.customer_address, view.customer_city, view.customer_country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Payment & Method Card */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium uppercase tracking-wider">
                    <CreditCard className="size-3.5 text-emerald-500" />
                    <span>{t('tables.payment', 'ការទូទាត់')}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">
                      {t('shops.paymentMethod', 'វិធីសាស្ត្រទូទាត់')}
                    </span>
                    {getPaymentBadge(view.payment_method, view.payment_status)}
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{t('shops.transaction', 'លេខប្រតិបត្តិការ')}:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                      {view.transaction_id || '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Package className="size-3.5 text-indigo-500" />
                    <span>{t('shops.orderItems', 'ទំនិញដែលបានកុម្ម៉ង់')}</span>
                  </Label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {view.items?.length ?? 0} {t('shops.products', 'មុខ')}
                  </span>
                </div>

                {view.items && view.items.length > 0 ? (
                  <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80 max-h-48 overflow-y-auto bg-white dark:bg-slate-900/60 shadow-2xs">
                    {view.items.map((it: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="size-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/40">
                            <Package className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate block">
                              {it.product_name || `Item #${i + 1}`}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              ${Number(it.price).toFixed(2)} × {it.quantity}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 shrink-0 ml-3">
                          ${(Number(it.price) * Number(it.quantity)).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-center space-y-1">
                    <Package className="size-6 text-slate-400 mx-auto opacity-60" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t('shops.standardOrderPackage', 'កញ្ចប់ទំនិញកុម្ម៉ង់ទូទៅ')}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {t('shops.noItemBreakdown', 'ទិន្នន័យទំនិញជាក់លាក់មិនត្រូវបានកត់ត្រាក្នុងប្រព័ន្ធ')}
                    </p>
                  </div>
                )}
              </div>

              {/* Financial Breakdown (Receipt Summary) */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>{t('shops.itemsSubtotal', 'ថ្លៃទំនិញសរុប')}</span>
                  <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                    ${Number(view.items_total || view.total).toFixed(2)}
                  </span>
                </div>

                {Number(view.shipping_fee) > 0 && (
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>{t('shops.shippingFee', 'ថ្លៃសេវាដឹកជញ្ជូន')}</span>
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                      +${Number(view.shipping_fee).toFixed(2)}
                    </span>
                  </div>
                )}

                {Number(view.discount) > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                    <span>{t('shops.discount', 'ការបញ្ចុះតម្លៃ')}</span>
                    <span className="font-mono font-medium">
                      -${Number(view.discount).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">
                      {t('shops.totalAmount', 'ទឹកប្រាក់សរុប')}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {t('shops.includingTax', 'រួមបញ្ចូលការទូទាត់ទាំងអស់')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-lg text-indigo-600 dark:text-indigo-400">
                      ${Number(view.total).toFixed(2)}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 ml-1">
                      {view.currency || 'USD'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer with View Receipt & Close Button */}
          <DialogFooter className="p-4 bg-slate-50/80 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex sm:items-center sm:justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-9 px-3.5 text-xs font-semibold gap-1.5 hover:text-indigo-600 hover:border-indigo-200 dark:hover:border-indigo-800"
            >
              <a
                href={fullUrl(`/api/orders/${view?.id}/receipt?lang=${language === 'en' ? 'en' : 'kh'}`)}
                target="_blank"
                rel="noreferrer"
              >
                <Printer className="size-3.5 text-slate-500" />
                <span>{t('shops.viewReceipt', 'មើលវិក្កយបត្រ ↗')}</span>
              </a>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => setView(null)}
              className="h-9 px-5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              {t('buttons.close', 'បិទ')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title={t('shops.deleteOrderTitle', 'Delete Order')}
        message={t('shops.deleteOrderConfirm', { number: deleteTarget?.order_number })}
        itemName={deleteTarget ? `#${deleteTarget.order_number}` : undefined}
        confirmText={t('buttons.delete', 'Delete')}
        cancelText={t('buttons.cancel', 'Cancel')}
        variant="destructive"
        isLoading={isDeleting}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

// ─── TAB 4: CUSTOMERS COMPONENT ───────────────────────────────────────────────

function CustomersTab({ shopId }: { shopId: number }) {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = () =>
    listShopCustomers(shopId, search)
      .then(setCustomers)
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, [shopId, search]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteCustomer(deleteTarget.id);
      toast.success(t('toast.customerDeleted', 'Customer deleted'));
      setDeleteTarget(null);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || t('toast.failedToDelete', 'Failed to delete'));
    } finally {
      setIsDeleting(false);
    }
  };

  const paginatedCustomers = useMemo(() => {
    return customers.slice((page - 1) * pageSize, page * pageSize);
  }, [customers, page, pageSize]);

  if (loading) return <LoadingSpinner text={t('shops.loadingCustomers', 'Loading customers...')} />;

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t('shops.searchCustomers', 'Search name / phone / Telegram...')}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {t('shops.totalCustomers', 'អតិថិជនសរុប')}: <strong className="text-slate-800 dark:text-slate-200 font-mono">{customers.length}</strong>
        </div>
      </div>

      {/* Modern Shadcn Table */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t('tables.name', 'Customer')}</TableHead>
              <TableHead>{t('tables.phone', 'Phone')}</TableHead>
              <TableHead>{t('tables.telegram', 'Telegram')}</TableHead>
              <TableHead>{t('tables.orders', 'Orders')}</TableHead>
              <TableHead>{t('tables.totalSpent', 'Total Spent')}</TableHead>
              <TableHead className="text-right">{t('tables.actions', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-slate-400 text-xs">
                  {t('shops.noCustomersFound', 'No customers found.')}
                </TableCell>
              </TableRow>
            ) : (
              paginatedCustomers.map((c) => (
                <TableRow key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
                        <AvatarFallback className="bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 font-semibold text-xs">
                          {(c.name || 'C').slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        {c.name || '—'}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-300">
                    {c.phone || '—'}
                  </TableCell>

                  <TableCell className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                    {c.telegram ? `@${c.telegram.replace(/^@/, '')}` : '—'}
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="text-xs font-mono py-0.5">
                      {c.order_count ?? 0}
                    </Badge>
                  </TableCell>

                  <TableCell className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                    ${Number(c.total_spent || 0).toFixed(2)}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(c)}
                      className="size-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title={t('buttons.delete', 'Delete')}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <PaginationBar
          page={page}
          pageSize={pageSize}
          totalItems={customers.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemName={t('shops.tabs.customers', 'customers')}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title={t('shops.deleteCustomerTitle', 'Delete Customer')}
        message={t('shops.deleteCustomerConfirm', {
          name: deleteTarget?.name || deleteTarget?.telegram || 'Customer',
        })}
        itemName={deleteTarget ? `${deleteTarget.name || deleteTarget.telegram || 'Customer'}` : undefined}
        confirmText={t('buttons.delete', 'Delete')}
        cancelText={t('buttons.cancel', 'Cancel')}
        variant="destructive"
        isLoading={isDeleting}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

// ─── TAB 5: CATEGORIES COMPONENT ──────────────────────────────────────────────

function CategoriesTab({ shopId }: { shopId: number }) {
  const { t } = useLanguage();
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<{
    name: string;
    slug: string;
    description: string;
    status: string;
  }>({
    name: '',
    slug: '',
    description: '',
    status: 'active',
  });
  const [submitting, setSubmitting] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = () => listShopCategories(shopId).then(setCats).finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, [shopId]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '',
      slug: '',
      description: '',
      status: 'active',
    });
    setModal(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({
      name: c.name || '',
      slug: c.slug || '',
      description: c.description || '',
      status: c.status || 'active',
    });
    setModal(true);
  };

  const handleNameChange = (val: string) => {
    setForm((prev) => ({
      ...prev,
      name: val,
      slug: !editing ? val.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : prev.slug,
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error(t('categories.nameRequired', 'ឈ្មោះប្រភេទទំនិញត្រូវបានទាមទារ / Name is required'));
      return;
    }
    setSubmitting(true);
    const finalSlug = form.slug.trim() || form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const payload = {
      shop_id: shopId,
      name: form.name.trim(),
      slug: finalSlug,
      description: form.description.trim(),
      status: form.status,
    };
    try {
      if (editing) {
        await updateCategory(editing.id, payload);
        toast.success(t('toast.categoryRenamed', 'ប្រភេទទំនិញត្រូវបានកែសម្រួលជោគជ័យ'));
      } else {
        await createCategory(payload);
        toast.success(t('toast.categoryCreated', 'ប្រភេទទំនិញត្រូវបានបង្កើតជោគជ័យ'));
      }
      setModal(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('toast.failedToSave', 'Failed to save category'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      toast.success(t('toast.categoryDeleted', 'ប្រភេទទំនិញត្រូវបានលុបជោគជ័យ'));
      setDeleteTarget(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('toast.failedToDelete', 'Failed to delete'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & Pagination
  const filteredCats = useMemo(() => {
    if (!search.trim()) return cats;
    const q = search.toLowerCase();
    return cats.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.slug?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
  }, [cats, search]);

  const paginatedCats = useMemo(() => {
    return filteredCats.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredCats, page, pageSize]);

  if (loading) return <LoadingSpinner text={t('shops.loadingCategories', 'Loading categories...')} />;

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t('categories.searchPlaceholder', 'ស្វែងរកតាមឈ្មោះប្រភេទទំនិញ...')}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <Button
          onClick={openCreate}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-9 px-4 text-xs shadow-xs shrink-0"
        >
          <Plus className="size-4" />
          <span>{t('categories.addCategory', 'បន្ថែមប្រភេទទំនិញ')}</span>
        </Button>
      </div>

      {/* Modern Shadcn Table */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[35%]">{t('tables.name', 'ប្រភេទទំនិញ')}</TableHead>
              <TableHead>{t('tables.slug', 'Slug')}</TableHead>
              <TableHead>{t('tables.products', 'ចំនួនទំនិញ')}</TableHead>
              <TableHead>{t('tables.status', 'ស្ថានភាព')}</TableHead>
              <TableHead className="text-right">{t('tables.actions', 'សកម្មភាព')}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedCats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center text-slate-400 text-xs">
                  {t('shops.noCategoriesFound', 'រកមិនឃើញប្រភេទទំនិញឡើយ')}
                </TableCell>
              </TableRow>
            ) : (
              paginatedCats.map((c) => (
                <TableRow key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/40">
                        <Tag className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate block">
                          {c.name}
                        </span>
                        {c.description && (
                          <span className="text-[11px] text-slate-400 block truncate">
                            {c.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {c.slug || '—'}
                    </span>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="text-xs font-mono py-0.5 bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300">
                      {c.product_count ?? 0} {t('shops.products', 'ទំនិញ')}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs py-0.5 font-medium ${
                        c.status === 'inactive'
                          ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                      }`}
                    >
                      {c.status === 'inactive' ? t('common.inactive', 'Inactive') : t('common.active', 'Active')}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(c)}
                        className="size-8 p-0 text-slate-500 hover:text-indigo-600"
                        title={t('buttons.edit', 'Edit')}
                      >
                        <Pencil className="size-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(c)}
                        className="size-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title={t('buttons.delete', 'Delete')}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <PaginationBar
          page={page}
          pageSize={pageSize}
          totalItems={filteredCats.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemName={t('shops.tabs.categories', 'categories')}
        />
      </div>

      {/* Add / Edit Category Modal - Modern Clean Shadcn UI */}
      <Modal
        open={modal}
        onOpenChange={setModal}
        icon={<Tag className="size-5" />}
        iconColor="indigo"
        variant="primary"
        title={editing ? t('categories.editCategory', 'កែសម្រួលប្រភេទទំនិញ') : t('categories.addCategory', 'បន្ថែមប្រភេទទំនិញ')}
        description={
          editing
            ? t('categories.editCategorySubtitle', 'កែប្រែព័ត៌មានលម្អិតនៃប្រភេទទំនិញនេះ')
            : t('categories.addCategorySubtitle', 'បញ្ចូលព័ត៌មានលម្អិតសម្រាប់ប្រភេទទំនិញថ្មីរបស់អ្នក')
        }
        maxWidth="sm:max-w-[480px]"
        onSubmit={submit}
        isSubmitting={submitting}
        submitText={editing ? t('shops.saveChanges', 'រក្សាទុកការផ្លាស់ប្តូរ') : t('categories.addCategory', 'បន្ថែមប្រភេទទំនិញ')}
        cancelText={t('buttons.cancel', 'បោះបង់')}
      >
        {/* 1. ឈ្មោះប្រភេទទំនិញ * */}
        <div className="space-y-1.5 w-full min-w-0">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <span>{t('categories.name', 'ឈ្មោះប្រភេទទំនិញ')}</span>
            <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder={t('categories.namePlaceholder', 'ឧ. អាហារសម្រន់, ភេសជ្ជៈ, បង្អែម...')}
            className="w-full h-10 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 px-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            required
          />
        </div>

        {/* 2. Slug (តំណភ្ជាប់) */}
        <div className="space-y-1.5 w-full min-w-0">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t('tables.slug', 'Slug (តំណភ្ជាប់)')}
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder={t('categories.slugPlaceholder', 'drinks, snacks, desserts...')}
            className="w-full h-10 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 px-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
          />
        </div>

        {/* 3. ការពិពណ៌នា (Description) */}
        <div className="space-y-1.5 w-full min-w-0">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t('categories.description', 'ការពិពណ៌នា')}
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder={t('categories.descPlaceholder', 'ពិពណ៌នាសង្ខេបអំពីប្រភេទទំនិញនេះ...')}
            rows={2}
            className="w-full rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none font-normal"
          />
        </div>

        {/* 4. ស្ថានភាពប្រភេទសកម្ម (Active Status Switch Card) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/30 p-3.5 flex items-center justify-between gap-3 w-full min-w-0">
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
              {t('categories.activeStatus', 'ស្ថានភាពប្រភេទសកម្ម')}
            </h4>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
              {t('categories.activeDesc', 'បង្ហាញប្រភេទទំនិញនេះក្នុងហាង និង POS')}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={form.status === 'active'}
            onClick={() =>
              setForm({ ...form, status: form.status === 'active' ? 'inactive' : 'active' })
            }
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
              form.status === 'active' ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                form.status === 'active' ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title={t('shops.deleteCategoryTitle', 'Delete Category')}
        message={t('shops.deleteCategoryConfirm', { name: deleteTarget?.name })}
        itemName={deleteTarget?.name}
        confirmText={t('buttons.delete', 'Delete')}
        cancelText={t('buttons.cancel', 'Cancel')}
        variant="destructive"
        isLoading={isDeleting}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
