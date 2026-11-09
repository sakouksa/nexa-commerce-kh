import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../utils';
import {
  Store,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Package,
  ShoppingCart,
  ExternalLink,
  Settings2,
  Eye,
  Trash2,
  RefreshCw,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  X,
  Copy,
  Check,
  Building2,
  Clock,
  Sparkles,
  Users as UsersIcon,
  Palette,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import {
  createShop,
  deleteShop,
  listShops,
  setShopExpiry,
  updateShopStatus,
  fullUrl,
} from '../../api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { AccentStatCard, AccentStatGrid } from '../../components/cards/AccentStatCard';
import { Table, Column } from '../../components/common/Table';
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
} from '../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { ConfirmModal, UnifiedFilterToolbar, type ColumnOption, Modal } from '../../components/shared';
import { Shop } from '../../types';
import { useLanguage } from '../../i18n';

const STORE_URL = process.env.REACT_APP_STORE_URL || 'http://localhost:3000';

const isExpired = (shop: Shop) =>
  Boolean(shop.expires_at && new Date(shop.expires_at) < new Date());

const getDaysRemaining = (expiresAt?: string | null): number | null => {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export default function Shops() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filtering
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'expired'>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'products' | 'orders' | 'expiry'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    name: true,
    plan: true,
    products: true,
    orders: true,
    expiry: true,
    status: true,
  });

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailShop, setDetailShop] = useState<Shop | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Shop | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Forms state
  const [form, setForm] = useState({
    username: '',
    shop_name: '',
    email: '',
    password: '',
  });
  const [expiryDays, setExpiryDays] = useState(30);
  const [copiedShopId, setCopiedShopId] = useState<string | number | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listShops();
      setShops(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('shops.loadFailed', 'Failed to load shops'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const copyStoreLink = (username: string, id: string | number) => {
    const url = `${STORE_URL}/${username}`;
    navigator.clipboard.writeText(url);
    setCopiedShopId(id);
    toast.success(t('toast.linkCopied', 'Storefront link copied!'));
    setTimeout(() => setCopiedShopId(null), 2000);
  };

  const setExpiry = async (shop: Shop, days: number) => {
    try {
      await setShopExpiry(shop.id, days);
      toast.success(
        days > 0
          ? t('shops.expirySetSuccess', { days, defaultValue: `Expiry set (+${days} days)` })
          : t('shops.expiryCleared', 'Expiry cleared')
      );
      setDetailShop(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('shops.expirySetFailed', 'Failed to set expiry'));
    }
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      toast.error(t('toast.enterCredentials', 'Username and password are required'));
      return;
    }
    setIsCreating(true);
    try {
      await createShop({
        username: form.username.trim().toLowerCase(),
        shop_name: form.shop_name.trim() || form.username.trim(),
        email: form.email.trim() || undefined,
        password: form.password,
      });
      toast.success(t('toast.shopCreated', 'Shop created successfully!'));
      setCreateModalOpen(false);
      setForm({ username: '', shop_name: '', email: '', password: '' });
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('shops.createShopFailed', 'Failed to create shop'));
    } finally {
      setIsCreating(false);
    }
  };

  const toggleStatus = async (shop: Shop) => {
    const next = shop.status === 'active' ? 'suspended' : 'active';
    try {
      await updateShopStatus(shop.id, next);
      toast.success(
        next === 'active'
          ? t('toast.shopActivated', 'Shop activated')
          : t('toast.shopSuspended', 'Shop suspended')
      );
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('shops.updateStatusFailed', 'Failed to update shop status'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteShop(deleteTarget.id);
      toast.success(t('toast.shopDeleted', 'Shop deleted successfully'));
      setDeleteTarget(null);
      if (detailShop?.id === deleteTarget.id) {
        setDetailShop(null);
      }
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('toast.failedToDelete', 'Failed to delete'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Compute KPI Statistics
  const stats = useMemo(() => {
    const total = shops.length;
    let active = 0;
    let suspended = 0;
    let expired = 0;
    let totalProducts = 0;
    let totalOrders = 0;

    shops.forEach((s) => {
      const exp = isExpired(s);
      if (exp) {
        expired++;
      } else if (s.status === 'active') {
        active++;
      } else {
        suspended++;
      }
      totalProducts += s.product_count || 0;
      totalOrders += s.order_count || 0;
    });

    return {
      total,
      active,
      suspended,
      expired,
      totalProducts,
      totalOrders,
      activeRate: total > 0 ? Math.round((active / total) * 100) : 0,
    };
  }, [shops]);

  // Extract unique plans for plan filter
  const uniquePlans = useMemo(() => {
    const plans = new Set<string>();
    shops.forEach((s) => {
      if (s.plan) plans.add(s.plan);
    });
    return Array.from(plans);
  }, [shops]);

  // Filtered & Sorted shops
  const filteredShops = useMemo(() => {
    return shops
      .filter((shop) => {
        // Search filter
        const q = search.trim().toLowerCase();
        if (q) {
          const name = (shop.shop_name || '').toLowerCase();
          const user = (shop.username || '').toLowerCase();
          const email = (shop.email || '').toLowerCase();
          if (!name.includes(q) && !user.includes(q) && !email.includes(q)) {
            return false;
          }
        }

        // Status filter
        const expired = isExpired(shop);
        if (statusFilter === 'active') {
          return shop.status === 'active' && !expired;
        }
        if (statusFilter === 'suspended') {
          return shop.status === 'suspended' && !expired;
        }
        if (statusFilter === 'expired') {
          return expired;
        }

        // Plan filter
        if (planFilter !== 'all' && (shop.plan || '').toLowerCase() !== planFilter.toLowerCase()) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any;
        let valB: any;

        if (sortBy === 'products') {
          valA = a.product_count || 0;
          valB = b.product_count || 0;
        } else if (sortBy === 'orders') {
          valA = a.order_count || 0;
          valB = b.order_count || 0;
        } else if (sortBy === 'expiry') {
          valA = a.expires_at ? new Date(a.expires_at).getTime() : 0;
          valB = b.expires_at ? new Date(b.expires_at).getTime() : 0;
        } else {
          valA = (a.shop_name || a.username || '').toLowerCase();
          valB = (b.shop_name || b.username || '').toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [shops, search, statusFilter, planFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredShops.length / pageSize) || 1;
  const paginatedShops = filteredShops.slice((page - 1) * pageSize, page * pageSize);

  // Table Columns Definition
  const shopColumns = useMemo<Column<Shop>[]>(
    () => [
      {
        key: 'name',
        title: t('shops.tableHeader.shop', 'Shop'),
        sortable: true,
        width: 280,
        render: (shop) => (
          <div className="flex items-center gap-3">
            <Avatar className="size-10 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shrink-0 shadow-2xs">
              {shop.logo ? (
                <img
                  src={fullUrl(shop.logo)}
                  alt={shop.shop_name}
                  className="size-full object-cover rounded-xl"
                />
              ) : (
                <AvatarFallback className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm">
                  {(shop.shop_name || shop.username || 'S')[0].toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="min-w-0">
              <span
                onClick={() => navigate(`/shops/${shop.id}`)}
                className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate block cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {shop.shop_name || shop.username}
              </span>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-1">
                <span className="font-mono">@{shop.username}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => copyStoreLink(shop.username, shop.id)}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      {copiedShopId === shop.id ? (
                        <Check className="size-3 text-emerald-500" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>{t('shops.copyStorefrontLink', 'Copy Storefront Link')}</span>
                  </TooltipContent>
                </Tooltip>

                <a
                  href={`${STORE_URL}/${shop.username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition-colors"
                  title={t('shops.visitStorefront', 'Visit Storefront')}
                >
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'plan',
        title: t('shops.tableHeader.plan', 'Plan'),
        width: 140,
        render: (shop) => (
          <div>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${
                (shop.plan || '').toLowerCase() === 'pro'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/50'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {shop.plan || t('shops.freePlan', 'Free')}
            </span>
            {Number(shop.plan_price) > 0 ? (
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                ${Number(shop.plan_price).toFixed(2)}
                <span className="text-[11px] text-slate-400">/{t('common.perMonth', 'mo')}</span>
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 mt-1">
                {t('shops.freePlan', 'Free')}
              </div>
            )}
            {shop.reseller_id && (
              <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium block mt-0.5">
                {t('shops.viaReseller', 'via reseller')}
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'products',
        title: t('shops.tableHeader.products', 'Products & Quota'),
        sortable: true,
        width: 180,
        render: (shop) => {
          const productOverLimit =
            shop.max_products && (shop.product_count || 0) > shop.max_products;
          const categoryOverLimit =
            shop.max_categories && (shop.category_count || 0) > shop.max_categories;

          return (
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm font-mono text-slate-900 dark:text-slate-100">
                  {shop.product_count || 0}
                </span>
                {shop.max_products ? (
                  <span className="text-xs text-slate-400 font-mono">
                    / {shop.max_products}
                  </span>
                ) : null}
                {productOverLimit && (
                  <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 px-1.5 py-0.2 rounded-full">
                    {t('shops.overLimit', 'លើស')}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                <span>
                  {shop.category_count || 0} {t('shops.categoriesCount', 'ប្រភេទ')}
                  {shop.max_categories ? ` (Max ${shop.max_categories})` : ''}
                </span>
                {categoryOverLimit && (
                  <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 px-1 py-0.2 rounded-full ml-1">
                    {t('shops.overLimit', 'លើស')}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        key: 'orders',
        title: t('shops.tableHeader.orders', 'Orders'),
        sortable: true,
        width: 120,
        render: (shop) => (
          <div>
            <span className="font-semibold text-sm font-mono text-slate-900 dark:text-slate-100">
              {shop.order_count || 0}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
              {t('shops.ordersUnit', 'ការកុម្ម៉ង់')}
            </span>
          </div>
        ),
      },
      {
        key: 'expiry',
        title: t('shops.tableHeader.expiry', 'Expiry'),
        sortable: true,
        width: 160,
        render: (shop) => {
          const expired = isExpired(shop);
          const daysRemaining = getDaysRemaining(shop.expires_at);
          const isExpiringSoon = !expired && daysRemaining !== null && daysRemaining <= 14;

          return (
            <div>
              <span className="font-mono text-xs font-medium text-slate-700 dark:text-slate-300 block">
                {shop.expires_at ? new Date(shop.expires_at).toLocaleDateString() : t('shops.never', 'Never')}
              </span>
              {expired ? (
                <span className="inline-flex items-center mt-1 text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 px-2 py-0.5 rounded-full">
                  {t('shops.expired', 'Expired')}
                </span>
              ) : isExpiringSoon ? (
                <span className="inline-flex items-center mt-1 text-[10px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 px-2 py-0.5 rounded-full">
                  {t('shops.daysRemaining', { count: daysRemaining, defaultValue: `${daysRemaining} days left` })}
                </span>
              ) : shop.expires_at ? (
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                  {t('shops.daysRemaining', { count: daysRemaining, defaultValue: `${daysRemaining} days left` })}
                </span>
              ) : null}
            </div>
          );
        },
      },
      {
        key: 'status',
        title: t('shops.tableHeader.status', 'Status'),
        align: 'center',
        width: 120,
        render: (shop) => {
          const expired = isExpired(shop);
          const isActive = shop.status === 'active' && !expired;

          return (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40'
                  : expired
                  ? 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40'
                  : 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40'
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  isActive ? 'bg-emerald-500 animate-pulse' : expired ? 'bg-rose-500' : 'bg-amber-500'
                }`}
              />
              {expired
                ? t('common.expired', 'Expired')
                : shop.status === 'active'
                ? t('common.active', 'Active')
                : t('common.suspended', 'Suspended')}
            </span>
          );
        },
      },
      {
        key: 'actions',
        title: '',
        align: 'right',
        width: 50,
        render: (shop) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="iconSm"
                className="size-8 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <MoreVertical className="size-4" />
                <span className="sr-only">{t('shops.openMenu', 'Open menu')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs font-semibold text-slate-400 truncate">
                {shop.shop_name || shop.username}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => navigate(`/shops/${shop.id}`)}
                className="gap-2.5 cursor-pointer text-xs"
              >
                <Settings2 className="size-3.5 text-slate-500" />
                <span>{t('shops.manageData', 'Manage Shop Data')}</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setDetailShop(shop)}
                className="gap-2.5 cursor-pointer text-xs"
              >
                <Eye className="size-3.5 text-slate-500" />
                <span>{t('shops.detailAndSubscription', 'Details & Subscription')}</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => window.open(`${STORE_URL}/${shop.username}`, '_blank')}
                className="gap-2.5 cursor-pointer text-xs"
              >
                <ExternalLink className="size-3.5 text-slate-500" />
                <span>{t('shops.visitStorefront', 'Visit Storefront')}</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => toggleStatus(shop)}
                className="gap-2.5 cursor-pointer text-xs"
              >
                {shop.status === 'active' ? (
                  <>
                    <PauseCircle className="size-3.5 text-amber-500" />
                    <span>{t('shops.suspend', 'Suspend')}</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="size-3.5 text-emerald-500" />
                    <span>{t('shops.activate', 'Activate')}</span>
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setDeleteTarget(shop)}
                className="gap-2.5 text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40 cursor-pointer text-xs"
              >
                <Trash2 className="size-3.5" />
                <span>{t('shops.deleteShop', 'Delete Shop')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [copiedShopId, navigate, t]
  );

  const displayedShopColumns = useMemo(() => {
    return shopColumns.filter(
      (c) => c.key === 'actions' || visibleColumns[c.key] !== false
    );
  }, [shopColumns, visibleColumns]);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPlanFilter('all');
    setPage(1);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6 w-full pb-12">
        {/* Top Header & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t('shops.title', 'Shops Management')}
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t('shops.subtitle', 'Manage all registered tenant shops, domains, and subscriptions')}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => load()}
              disabled={loading}
              className="h-9 px-4 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm gap-2 shadow-2xs cursor-pointer"
              title={t('shops.refreshTooltip', 'Refresh shops list')}
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
              <span>{t('buttons.refresh', 'Reload')}</span>
            </Button>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm gap-2 shadow-xs cursor-pointer transition-all"
            >
              <Plus className="size-4" />
              <span>{t('shops.createShop', 'Create Shop')}</span>
            </Button>
          </div>
        </div>

        {/* KPI Stats Cards - Matching AccentStatCard from /products */}
        <AccentStatGrid columns={4} className="mb-0">
          <AccentStatCard
            variant="sky"
            label={t('shops.totalShops', 'Total Shops')}
            value={stats.total}
            useCounter={true}
            icon={<Store className="size-5" />}
            subtitle={t('shops.totalShopsSubtitle', {
              active: stats.active,
              defaultValue: `${stats.active} active • on Platform`,
            })}
          />

          <AccentStatCard
            variant="emerald"
            label={t('shops.activeShops', 'Active Shops')}
            value={stats.active}
            useCounter={true}
            icon={<CheckCircle2 className="size-5" />}
            subtitle={t('shops.activeShopsSubtitle', {
              rate: stats.activeRate,
              defaultValue: `${stats.activeRate}% of total • Normal operation`,
            })}
          />

          <AccentStatCard
            variant="amber"
            label={t('shops.suspendedOrExpired', 'Suspended / Expired')}
            value={stats.suspended + stats.expired}
            useCounter={true}
            icon={<AlertTriangle className="size-5" />}
            subtitle={t('shops.suspendedOrExpiredSubtitle', {
              suspended: stats.suspended,
              expired: stats.expired,
              defaultValue: `Suspended: ${stats.suspended} • Expired: ${stats.expired}`,
            })}
          />

          <AccentStatCard
            variant="purple"
            label={t('shops.inventoryOrders', 'Products & Orders')}
            value={stats.totalProducts}
            useCounter={true}
            icon={<Package className="size-5" />}
            subtitle={t('shops.inventoryOrdersSubtitle', {
              products: stats.totalProducts,
              orders: stats.totalOrders,
              defaultValue: `${stats.totalProducts} Products • ${stats.totalOrders} Orders`,
            })}
          />
        </AccentStatGrid>

        {/* Unified SmartHR-Style Filter Toolbar */}
        <UnifiedFilterToolbar
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          searchPlaceholder={t('shops.searchPlaceholder', 'Search by shop name or @username...')}
          filters={[
            {
              id: 'status',
              value: statusFilter,
              onChange: (val) => {
                setStatusFilter((val as any) || 'all');
                setPage(1);
              },
              options: [
                { value: 'all', label: `${t('common.all', 'All Status')} (${shops.length})` },
                { value: 'active', label: `${t('common.active', 'Active')} (${stats.active})` },
                { value: 'suspended', label: `${t('common.suspended', 'Suspended')} (${stats.suspended})` },
                { value: 'expired', label: `${t('common.expired', 'Expired')} (${stats.expired})` },
              ],
            },
            ...(uniquePlans.length > 0
              ? [
                  {
                    id: 'plan',
                    value: planFilter,
                    onChange: (val: string) => {
                      setPlanFilter(val || 'all');
                      setPage(1);
                    },
                    options: [
                      { value: 'all', label: t('shops.allPlans', 'All Plans') },
                      ...uniquePlans.map((p) => ({
                        value: p,
                        label: t('shops.planOption', { plan: p, defaultValue: `Plan: ${p}` }),
                      })),
                    ],
                  },
                ]
              : []),
          ]}
          onApply={() => setPage(1)}
          onReset={resetFilters}
          columns={[
            { key: 'name', label: t('shops.tableHeader.shop', 'Shop'), disabled: true },
            { key: 'plan', label: t('shops.tableHeader.plan', 'Plan') },
            { key: 'products', label: t('shops.tableHeader.products', 'Products & Quota') },
            { key: 'orders', label: t('shops.tableHeader.orders', 'Orders') },
            { key: 'expiry', label: t('shops.tableHeader.expiry', 'Expiry') },
            { key: 'status', label: t('shops.tableHeader.status', 'Status') },
          ]}
          visibleColumns={visibleColumns}
          onColumnChange={setVisibleColumns}
          columnSettingsTitle={t('shops.manageColumns', 'Manage Columns')}
        />

        {/* Global Reusable Table */}
        <Table<Shop>
          columns={displayedShopColumns}
          data={paginatedShops}
          loading={loading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={(key, order) => {
            setSortBy(key as any);
            setSortOrder(order);
          }}
          pagination={{
            currentPage: page,
            pageSize,
            totalItems: filteredShops.length,
            totalPages,
            pageSizeOptions: [10, 25, 50],
            onPageChange: setPage,
            onPageSizeChange: (newSize) => {
              setPageSize(newSize);
              setPage(1);
            },
            itemLabel: t('shops.shopsCount', 'shops'),
          }}
          emptyState={{
            icon: <Store className="size-6" />,
            title: t('shops.notFound', 'Shop not found'),
            description: t('shops.noMatchingShops', 'No shop records matching your search criteria.'),
            onReset: search || statusFilter !== 'all' || planFilter !== 'all' ? resetFilters : undefined,
            resetLabel: t('common.resetFilters', 'Reset filters'),
          }}
        />

        {/* ─── CREATE SHOP MODAL (Global Unified) ────────────────────────── */}
        <Modal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title={t('shops.createShop', 'Create Shop')}
          subtitle={t('shops.createShopDescription', 'Fill in the details below to register a new shop on the platform')}
          icon={<Plus className="size-5" />}
          iconVariant="primary"
          size="md"
          onSubmit={submitCreate}
          submitLabel={t('shops.createShopBtn', 'Create Shop')}
          submitIcon={<Plus className="size-4" />}
          isSubmitting={isCreating}
          cancelLabel={t('buttons.cancel', 'Cancel')}
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="shop_username">
                {t('forms.username', 'Username')} <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="shop_username"
                placeholder="e.g. boutique-kh"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
              <p className="text-xs text-slate-400 font-mono">
                {t('shops.storefrontUrlPreview', 'Storefront URL:')} {STORE_URL}/{form.username || 'shop-username'}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shop_name">{t('forms.shopName', 'Shop Name')}</Label>
              <Input
                id="shop_name"
                placeholder={t('shops.shopNamePlaceholder', 'e.g. Boutique Fashion Cambodia')}
                value={form.shop_name}
                onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shop_email">
                {t('shops.ownerEmail', 'Owner Email')}
              </Label>
              <Input
                id="shop_email"
                type="email"
                placeholder="owner@boutique.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shop_password">
                {t('shops.ownerPassword', 'Owner Password')}{' '}
                <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="shop_password"
                type="password"
                placeholder={t('shops.passwordPlaceholder', 'Password for Shop Owner')}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>
        </Modal>

        {/* ─── SHOP DETAIL & SUBSCRIPTION MODAL (Global Unified) ─────────── */}
        <Modal
          open={Boolean(detailShop)}
          onClose={() => setDetailShop(null)}
          size="2xl"
          header={
            detailShop ? (
              <Modal.Header
                title={detailShop.shop_name || detailShop.username}
                subtitle={`@${detailShop.username} · ${t('shops.currencyLabel', 'Currency:')} ${detailShop.currency || 'USD'}`}
                icon={
                  <Avatar className="size-10 rounded-xl border border-slate-200 dark:border-slate-800">
                    {detailShop.logo ? (
                      <img
                        src={fullUrl(detailShop.logo)}
                        alt={detailShop.shop_name}
                        className="size-full object-cover rounded-xl"
                      />
                    ) : (
                      <AvatarFallback className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm">
                        {(detailShop.shop_name || detailShop.username || 'S')[0].toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                }
                badge={
                  <Badge
                    variant={detailShop.status === 'active' ? 'success' : 'destructive'}
                    className="capitalize text-xs font-semibold"
                  >
                    {detailShop.status}
                  </Badge>
                }
                onClose={() => setDetailShop(null)}
                actions={
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`${STORE_URL}/${detailShop.username}`, '_blank')}
                      className="h-7 text-xs gap-1 cursor-pointer"
                    >
                      <ExternalLink className="size-3" />
                      <span>{t('shops.storefront', 'Storefront')}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const targetId = detailShop.id;
                        setDetailShop(null);
                        navigate(`/shops/${targetId}`);
                      }}
                      className="h-7 text-xs gap-1 cursor-pointer"
                    >
                      <Settings2 className="size-3" />
                      <span>{t('shops.manageDataShort', 'Manage Data')}</span>
                    </Button>
                  </div>
                }
              />
            ) : undefined
          }
          footer={
            detailShop ? (
              <Modal.Footer>
                <div className="flex items-center justify-between w-full">
                  <Button
                    variant="outline"
                    onClick={() => {
                      toggleStatus(detailShop);
                      setDetailShop(null);
                    }}
                    className={
                      detailShop.status === 'active'
                        ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer'
                        : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer'
                    }
                  >
                    {detailShop.status === 'active'
                      ? t('shops.suspend', 'Suspend')
                      : t('shops.activate', 'Activate')}
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => {
                      const target = detailShop;
                      setDetailShop(null);
                      setDeleteTarget(target);
                    }}
                    className="gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                    <span>{t('shops.deleteShop', 'Delete Shop')}</span>
                  </Button>
                </div>
              </Modal.Footer>
            ) : undefined
          }
        >
          {detailShop && (
            <div className="space-y-4 py-1 text-sm">
              {/* Mini Stats Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                  <div className="text-xl font-extrabold font-mono text-slate-900 dark:text-white">
                    {detailShop.product_count || 0}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{t('shops.products', 'Products')}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                  <div className="text-xl font-extrabold font-mono text-slate-900 dark:text-white">
                    {detailShop.order_count || 0}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{t('shops.orders', 'Orders')}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                  <div className="text-xl font-extrabold font-mono text-slate-900 dark:text-white">
                    {detailShop.user_count || 1}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{t('shops.users', 'Users')}</p>
                </div>
              </div>

              {/* Plan & Info */}
              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">{t('shops.plan', 'Plan')}:</span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="capitalize font-semibold">
                      {detailShop.plan || t('shops.freePlan', 'Free')}
                    </Badge>
                    {Number(detailShop.plan_price) > 0 && (
                      <span className="font-mono text-slate-600 dark:text-slate-300">
                        ${Number(detailShop.plan_price).toFixed(2)}/{t('common.perMonth', 'mo')}
                      </span>
                    )}
                    {detailShop.reseller_id && (
                      <Badge variant="secondary" className="text-[10px]">
                        {t('shops.referred', 'Referred')}
                      </Badge>
                    )}
                  </div>
                </div>

                {detailShop.bio && (
                  <div className="text-xs">
                    <span className="text-slate-500 font-medium block mb-0.5">{t('shops.bio', 'Bio')}:</span>
                    <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      {detailShop.bio}
                    </p>
                  </div>
                )}

                {/* Theme Swatch */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500 font-medium">{t('shops.themePalette', 'Theme Palette:')}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span
                        className="size-4.5 rounded-full border border-white dark:border-slate-800 shadow-2xs"
                        style={{ background: detailShop.theme?.primary || '#4f46e5' }}
                        title={t('shops.primaryColor', 'Primary color')}
                      />
                      <span
                        className="size-4.5 rounded-full border border-white dark:border-slate-800 shadow-2xs"
                        style={{ background: detailShop.theme?.secondary || '#ec4899' }}
                        title={t('shops.secondaryColor', 'Secondary color')}
                      />
                    </div>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {detailShop.theme?.font_family || 'Inter'}
                    </span>
                  </div>
                </div>

                {/* ABA Settings */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500 font-medium">{t('shops.abaPayKhqr', 'ABA Pay KHQR:')}</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {detailShop.aba_settings?.profile_id ? (
                      <Badge variant="success" className="text-[10px]">
                        {t('shops.profile', 'Profile:')} {detailShop.aba_settings.profile_id}
                        {detailShop.aba_settings.test_mode ? ` ${t('shops.sandboxMode', '(Sandbox)')}` : ''}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-slate-400">
                        {t('shops.notConfigured', 'Not configured')}
                      </Badge>
                    )}
                  </span>
                </div>
              </div>

              {/* Subscription Expiry Management */}
              <Card className="border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    <span>{t('shops.subscriptionExpiry', 'Subscription / Expiry')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{t('shops.currentExpiryDate', 'Current Expiry:')}</span>
                    <span
                      className={`font-mono font-bold ${
                        isExpired(detailShop)
                          ? 'text-rose-600'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {detailShop.expires_at
                        ? new Date(detailShop.expires_at).toLocaleString()
                        : `${t('shops.never', 'Never')} (${t('shops.permanent', 'Permanent')})`}
                      {isExpired(detailShop) && ` · ${t('shops.expired', 'EXPIRED')}`}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpiry(detailShop, 30)}
                      className="h-8 text-xs bg-white dark:bg-slate-900 cursor-pointer"
                    >
                      {t('shops.add1Month', '+ 1 Month')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpiry(detailShop, 365)}
                      className="h-8 text-xs bg-white dark:bg-slate-900 cursor-pointer"
                    >
                      {t('shops.add1Year', '+ 1 Year')}
                    </Button>

                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min="1"
                        value={expiryDays}
                        onChange={(e) => setExpiryDays(Number(e.target.value) || 1)}
                        className="w-18 h-8 text-xs font-mono bg-white dark:bg-slate-900"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpiry(detailShop, expiryDays)}
                        className="h-8 text-xs bg-white dark:bg-slate-900 cursor-pointer"
                      >
                        {t('shops.addCustomDays', '+ Custom days')}
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpiry(detailShop, 0)}
                      className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-auto cursor-pointer"
                    >
                      {t('shops.clearExpiry', 'Clear Expiry')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </Modal>

        {/* ─── CONFIRM DELETE MODAL ─────────────────────────────────────── */}
        <ConfirmModal
          open={Boolean(deleteTarget)}
          title={t('shops.deleteShopTitle', 'Delete Shop')}
          message={t('shops.deleteShopConfirm', {
            name: deleteTarget?.shop_name || deleteTarget?.username,
          })}
          itemName={
            deleteTarget
              ? `${deleteTarget.shop_name || deleteTarget.username} (@${deleteTarget.username})`
              : undefined
          }
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
    </TooltipProvider>
  );
}
