import React, { useEffect, useRef, useState } from 'react';
import toast from '../../utils/toast';
import { useTranslation } from 'react-i18next';
import {
  Check,
  Zap,
  Crown,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  QrCode,
  Smartphone,
  Loader2,
  Clock,
  Package,
  FolderTree,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Layers,
  Store,
  BadgeCheck,
  Bell,
  Receipt,
  Percent,
} from 'lucide-react';
import { confirmPlan, fullUrl, getPlans, getShopDetail, upgradePlan } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { Loading } from '../../components/ui';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface PlanItem {
  id: string;
  name: string;
  price: number;
  days: number;
  max_products: number;
  max_categories: number;
  free?: boolean;
  offer_ends?: string;
}

const fmtPeriod = (days: number, t: any) => {
  if (days >= 365) return t('upgrade.plans.periods.oneYear', '1 year');
  if (days >= 60) return t('upgrade.plans.periods.sixMonths', '6 months');
  return t('upgrade.plans.periods.oneMonth', '1 month');
};

const getMonthlyRate = (price: number, days: number) => {
  const months = Math.max(1, Math.round(days / 30));
  return (price / months).toFixed(2);
};

const getPlanFeatures = (plan: PlanItem, t: any) => {
  const f = (k: string, options?: any, fallback?: string) =>
    t(`upgrade.plans.features.${k}`, { ...options, defaultValue: fallback });

  if (plan.id === 'growth') {
    return [
      f('productsLimit', { count: plan.max_products }, `Up to ${plan.max_products} active products`),
      f('categoriesLimit', { count: plan.max_categories }, `Up to ${plan.max_categories} categories`),
      f('telegramAlerts', {}, 'Telegram instant order notifications'),
      f('floorPlanTables', {}, 'Floor Plan & Table Management'),
      f('multichannelOrders', {}, 'Multi-channel orders (Dine-in, Takeaway)'),
      f('uninterruptedGrowth', {}, '6 Months uninterrupted store validity'),
      f('posReceipts', {}, 'Full Cloud POS & thermal receipt printing'),
    ];
  }

  if (plan.id === 'premium') {
    return [
      f('productsLimit', { count: plan.max_products }, `Up to ${plan.max_products} active products`),
      f('categoriesLimit', { count: plan.max_categories }, `Up to ${plan.max_categories} categories`),
      f('annualValidity', {}, 'Full 1 Year store validity (365 days)'),
      f('kdsSystem', {}, 'Kitchen Display System (KDS)'),
      f('telegramSound', {}, 'Telegram instant order alerts & sound'),
      f('advancedAnalytics', {}, 'Advanced sales analytics & CSV export'),
      f('allChannels', {}, 'Multi-channel orders (Dine-in, Takeaway, Delivery)'),
      f('prioritySupport', {}, 'Priority merchant assistance & onboarding'),
    ];
  }

  return [
    f('productsLimit', { count: plan.max_products }, `Up to ${plan.max_products} active products`),
    f('categoriesLimit', { count: plan.max_categories }, `Up to ${plan.max_categories} categories`),
    f('storefrontCatalog', {}, 'Standard Storefront & online catalog'),
    f('khqrCashCheckout', {}, 'KHQR & Cash payment at checkout'),
    f('posReceipts', {}, 'Full Cloud POS & thermal receipt printing'),
    f('salesOverview', {}, 'Daily sales overview & order tracking'),
  ];
};

const getPlanDescription = (id: string, t: any) => {
  switch (id) {
    case 'growth':
      return t(
        'upgrade.plans.descriptions.growth',
        'Best for expanding stores with active daily orders and growing inventory.'
      );
    case 'premium':
      return t(
        'upgrade.plans.descriptions.premium',
        'Maximum product limits, kitchen display, and complete annual coverage for high-volume stores.'
      );
    case 'starter':
    default:
      return t(
        'upgrade.plans.descriptions.starter',
        'Essential tools to launch your store online and start accepting orders.'
      );
  }
};

const getRenewalCycleLabel = (planKey: string, t: any) => {
  if (planKey === 'premium') return t('upgrade.currentPlan.annual', 'Annual');
  if (planKey === 'growth') return t('upgrade.currentPlan.sixMonths', '6 Months');
  return t('upgrade.currentPlan.monthly', 'Monthly');
};

export default function UpgradePlan() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [shop, setShop] = useState<any>(null);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [pay, setPay] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [qrFailed, setQrFailed] = useState(false);
  const timer = useRef<any>(null);

  useEffect(() => {
    Promise.all([getShopDetail(user.shop_id), getPlans()])
      .then(([s, p]) => {
        setShop(s);
        setPlans(Array.isArray(p) ? p : []);
      })
      .finally(() => setLoading(false));

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [user.shop_id]);

  const loadShop = () => {
    return getShopDetail(user.shop_id)
      .then((s) => setShop(s))
      .catch(() => {});
  };

  const startPoll = (orderId: number | string, transactionId = '') => {
    if (timer.current) clearInterval(timer.current);
    let attempts = 0;
    setChecking(true);

    const c = setInterval(() => {
      attempts += 1;
      confirmPlan({
        order_id: orderId,
        shop_id: user.shop_id,
        transaction_id: transactionId,
      })
        .then((r) => {
          if (r?.ok || r?.verified || r?.status === 'paid') {
            clearInterval(c);
            timer.current = null;
            setChecking(false);
            setPay(null);
            toast.success(
              t(
                'upgrade.toast.paymentSuccess',
                'Payment confirmed! Your plan has been upgraded successfully.'
              )
            );
            loadShop();
          } else if (attempts >= 60) {
            clearInterval(c);
            timer.current = null;
            setChecking(false);
          }
        })
        .catch(() => {});
    }, 3000);

    timer.current = c;
  };

  const closeModal = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    setPay(null);
    setChecking(false);
  };

  const doUpgrade = async (planId: string) => {
    setBusy(planId);
    try {
      const res = await upgradePlan({ shop_id: user.shop_id, plan: planId });
      if (res?.applied) {
        toast.success(
          t('upgrade.toast.freeApplied', {
            name: res.plan?.name || planId,
            defaultValue: `Plan ${res.plan?.name || planId} applied (FREE)! Your shop is extended by 1 month.`,
          })
        );
        loadShop();
        return;
      }

      setQrFailed(false);
      const selectedPlan = plans.find((p) => p.id === planId);
      const payData = {
        ...res,
        plan: res.plan || selectedPlan,
        payment: res.payment || res,
      };
      setPay(payData);

      // Auto start polling for instant confirmation
      if (payData.order_id) {
        startPoll(payData.order_id, payData.payment?.transaction_id || payData.transaction_id || '');
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
          err?.message ||
          t('upgrade.toast.upgradeFailed', 'Upgrade failed. Please try again.')
      );
    } finally {
      setBusy(null);
    }
  };

  const alreadyPaid = async () => {
    if (!pay) return;
    setChecking(true);
    try {
      const tx = pay.payment?.transaction_id || pay.transaction_id || '';
      const r = await confirmPlan({
        order_id: pay.order_id,
        shop_id: user.shop_id,
        transaction_id: tx,
      });

      if (r?.ok || r?.verified || r?.status === 'paid') {
        closeModal();
        toast.success(
          t(
            'upgrade.toast.paymentSuccess',
            'Payment confirmed! Your plan has been upgraded successfully.'
          )
        );
        loadShop();
      } else {
        toast.error(
          t('upgrade.toast.notConfirmedYet', {
            status: r?.status || 'pending',
            defaultValue: `Payment not confirmed yet (status: ${r?.status || 'pending'}). Please wait a few seconds.`,
          })
        );
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
          err?.message ||
          t('upgrade.toast.verificationFailed', 'Verification failed. Please retry.')
      );
    } finally {
      setChecking(false);
    }
  };

  if (loading) return <Loading />;

  const currentPlanKey = shop?.plan?.toLowerCase() || 'starter';
  const isShopExpired = shop?.is_expired;
  const isKhmer = i18n.language === 'kh';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 px-2 sm:px-4">
      {/* Top Breadcrumb & Page Header */}
      <div className="space-y-2">
        <Breadcrumbs />
        <div className="space-y-1.5 pt-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('upgrade.badge', 'Subscription & Billing')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t('upgrade.title', 'Upgrade Your Store Plan')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            {t(
              'upgrade.subtitle',
              'Scale your products, unlock multi-channel dining orders, and power your store with real-time KHQR & Telegram alerts.'
            )}
          </p>
        </div>
      </div>

      {/* Current Subscription Hero Banner */}
      <Card className="overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-panel rounded-2xl">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Plan Info */}
            <div className="flex items-center gap-4 min-w-[280px]">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Crown className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {t('upgrade.currentPlan.label', 'Current Active Plan')}
                  </span>
                  {isShopExpired ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800">
                      <AlertCircle className="w-3 h-3" />
                      {t('upgrade.currentPlan.expired', 'Expired')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {t('upgrade.currentPlan.active', 'Active')}
                    </span>
                  )}
                  {shop?.plan_price > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      ${shop.plan_price} USD
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
                      {t('upgrade.currentPlan.freeOffer', 'Free Offer')}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white capitalize tracking-tight">
                  {shop?.plan
                    ? shop.plan.charAt(0).toUpperCase() + shop.plan.slice(1)
                    : 'Starter'}{' '}
                  {t('upgrade.currentPlan.planSuffix', 'Plan')}
                </h2>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {shop?.expires_at
                      ? t('upgrade.currentPlan.validUntil', {
                          date: new Date(shop.expires_at).toLocaleDateString(
                            isKhmer ? 'km-KH' : 'en-US',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            }
                          ),
                          defaultValue: `Valid until: ${new Date(shop.expires_at).toLocaleDateString()}`,
                        })
                      : t(
                          'upgrade.currentPlan.noExpiry',
                          'No expiry set · Lifetime / Unlimited access'
                        )}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Quota Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 lg:max-w-2xl border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800/80 pt-4 lg:pt-0 lg:pl-6">
              {/* Product Limit */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                <div className="w-9 h-9 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                    {t('upgrade.currentPlan.productLimit', 'Product Limit')}
                  </p>
                  <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {shop?.max_products || 20}{' '}
                    <span className="text-xs font-normal text-slate-400">
                      {t('upgrade.currentPlan.items', 'items')}
                    </span>
                  </p>
                </div>
              </div>

              {/* Category Limit */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <FolderTree className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                    {t('upgrade.currentPlan.categoryLimit', 'Category Limit')}
                  </p>
                  <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {shop?.max_categories || 10}{' '}
                    <span className="text-xs font-normal text-slate-400">
                      {t('upgrade.currentPlan.groups', 'groups')}
                    </span>
                  </p>
                </div>
              </div>

              {/* Renewal Cycle */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                    {t('upgrade.currentPlan.renewalCycle', 'Renewal Cycle')}
                  </p>
                  <p className="text-base font-bold text-slate-900 dark:text-white leading-tight capitalize">
                    {getRenewalCycleLabel(shop?.plan, t)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Options Pricing Grid */}
      <div className="space-y-4">
        <div className="text-center md:text-left">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('upgrade.plans.sectionTitle', 'Select a Plan to Upgrade')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t(
              'upgrade.plans.sectionSubtitle',
              'Choose the subscription that matches your business size. Instant activation via ABA KHQR.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-2">
          {plans.map((p) => {
            const active = currentPlanKey === p.id.toLowerCase();
            const isRecommended = p.id.toLowerCase() === 'growth';
            const isPremium = p.id.toLowerCase() === 'premium';
            const features = getPlanFeatures(p, t);
            const periodLabel = fmtPeriod(p.days, t);
            const monthlyEquivalent = getMonthlyRate(p.price, p.days);

            return (
              <Card
                key={p.id}
                className={cn(
                  'relative flex flex-col transition-all duration-200 rounded-2xl overflow-hidden',
                  isRecommended &&
                    'border-primary shadow-xl ring-2 ring-primary/25 dark:border-primary bg-card',
                  active &&
                    'border-emerald-500/80 ring-2 ring-emerald-500/20 bg-emerald-50/[0.04] dark:bg-emerald-950/[0.08]',
                  !isRecommended &&
                    !active &&
                    'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                )}
              >
                {/* Floating Top Badges */}
                {isRecommended && (
                  <div className="absolute top-0 right-0 left-0 bg-primary text-white text-[11px] font-extrabold uppercase tracking-wider text-center py-1 flex items-center justify-center gap-1.5 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t('upgrade.plans.mostPopular', 'Most Popular Choice')}</span>
                  </div>
                )}

                {isPremium && (
                  <div className="absolute top-0 right-0 left-0 bg-slate-900 dark:bg-slate-800 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider text-center py-1 flex items-center justify-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('upgrade.plans.bestValue', 'Best Value · Save 17%')}</span>
                  </div>
                )}

                <CardHeader className={cn('p-6 pb-4', (isRecommended || isPremium) && 'pt-8')}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold',
                          isRecommended
                            ? 'bg-primary/10 text-primary'
                            : isPremium
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        )}
                      >
                        {isPremium ? (
                          <Crown className="w-5 h-5" />
                        ) : isRecommended ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : (
                          <Store className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                          {p.name}
                        </CardTitle>
                      </div>
                    </div>

                    {active && (
                      <Badge variant="success" className="text-[11px] font-bold px-2.5 py-0.5">
                        {t('upgrade.plans.currentBadge', 'CURRENT')}
                      </Badge>
                    )}
                  </div>

                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400 min-h-[32px] mt-1">
                    {getPlanDescription(p.id, t)}
                  </CardDescription>

                  {/* Price Block */}
                  <div className="pt-3 pb-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        ${p.price}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {t('upgrade.plans.perPeriod', {
                          period: periodLabel,
                          defaultValue: `/ ${periodLabel}`,
                        })}
                      </span>
                    </div>

                    {p.days > 30 ? (
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                        {t('upgrade.plans.billedEvery', {
                          monthly: monthlyEquivalent,
                          period: periodLabel,
                          defaultValue: `~${monthlyEquivalent}/mo · billed every ${periodLabel}`,
                        })}
                      </p>
                    ) : (
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                        {t('upgrade.plans.standardMonthly', 'Standard monthly subscription')}
                      </p>
                    )}

                    {/* Free Trial Banner */}
                    {p.free && (
                      <div className="mt-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-2.5 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div className="text-xs">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">
                            {t('upgrade.plans.freeTrialBadge', 'FREE 1 MONTH TRIAL:')}
                          </span>{' '}
                          <span className="text-slate-600 dark:text-slate-300">
                            {t('upgrade.plans.freeTrialDesc', '$0 for first 30 days')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <div className="px-6">
                  <Separator className="bg-slate-100 dark:bg-slate-800" />
                </div>

                <CardContent className="p-6 pt-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                      {t('upgrade.plans.featuresIncluded', 'Features Included:')}
                    </p>
                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      {features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                          <div className="mt-0.5 rounded-full p-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0">
                  {active ? (
                    <Button
                      disabled
                      variant="outline"
                      className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 font-bold cursor-default select-none"
                    >
                      <Check className="w-4 h-4 mr-1.5" />
                      {t('upgrade.plans.activePlanBtn', 'Active Current Plan')}
                    </Button>
                  ) : p.free ? (
                    <Button
                      onClick={() => doUpgrade(p.id)}
                      disabled={busy !== null}
                      className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-all"
                    >
                      {busy === p.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('upgrade.plans.activatingFree', 'Activating Free Trial...')}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-1.5" />
                          {t('upgrade.plans.claimFreeBtn', 'Claim 1 Month FREE')}
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => doUpgrade(p.id)}
                      disabled={busy !== null}
                      variant={isRecommended ? 'default' : 'outline'}
                      className={cn(
                        'w-full h-11 rounded-xl font-bold transition-all shadow-xs',
                        isRecommended
                          ? 'bg-primary hover:bg-primary/90 text-white shadow-md'
                          : 'border-slate-300 dark:border-slate-700 hover:bg-slate-900 hover:text-white dark:hover:bg-slate-100 dark:hover:text-slate-900'
                      )}
                    >
                      {busy === p.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('upgrade.plans.preparingPayment', 'Preparing Payment...')}
                        </>
                      ) : (
                        <>
                          {t('upgrade.plans.upgradeToBtn', {
                            name: p.name,
                            defaultValue: `Upgrade to ${p.name}`,
                          })}
                          <ArrowRight className="w-4 h-4 ml-1.5" />
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Trust & Included Value Grid */}
      <div className="space-y-4 pt-4">
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t('upgrade.trust.title', 'Everything You Need to Power Your Store')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t(
              'upgrade.trust.subtitle',
              'Built natively for Cambodian retail businesses with ABA Pay and Bakong support.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-card border border-border shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('upgrade.trust.instantKhqrTitle', 'Instant KHQR Activation')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t(
                'upgrade.trust.instantKhqrDesc',
                'Your plan updates instantly upon completing scan payment. No manual approval required.'
              )}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('upgrade.trust.telegramTitle', 'Telegram Order Alerts')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t(
                'upgrade.trust.telegramDesc',
                'Receive real-time notifications with order details, receipts, and chime sound directly to Telegram.'
              )}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('upgrade.trust.posTitle', 'Cloud POS & Receipts')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t(
                'upgrade.trust.posDesc',
                'Fast order entry, barcode scanner support, and customizable 58mm / 80mm thermal receipt vouchers.'
              )}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('upgrade.trust.zeroFeeTitle', '0% Transaction Fee')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t(
                'upgrade.trust.zeroFeeDesc',
                'Customer payments go straight into your own ABA / Bakong account without middleman cuts.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <Card className="border-border rounded-2xl shadow-xs">
        <CardHeader className="p-5 sm:p-6 pb-2">
          <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            {t('upgrade.faq.title', 'Frequently Asked Questions')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 sm:p-6 pt-2 divide-y divide-slate-100 dark:divide-slate-800">
          <div className="py-3 first:pt-0">
            <h5 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t('upgrade.faq.q1', 'How do I pay for my subscription?')}
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {t(
                'upgrade.faq.a1',
                'Click "Pay & Upgrade" on any plan to open a KHQR payment modal. You can scan the QR code using ABA Mobile or any Bakong-compatible Cambodian banking app.'
              )}
            </p>
          </div>

          <div className="py-3">
            <h5 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t('upgrade.faq.q2', 'What happens if my subscription expires?')}
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {t(
                'upgrade.faq.a2',
                'Your store, existing products, order history, and customer records remain completely safe. You can renew your subscription at any time to resume adding products and taking new customer orders.'
              )}
            </p>
          </div>

          <div className="py-3 last:pb-0">
            <h5 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t('upgrade.faq.q3', 'Can I upgrade before my current plan finishes?')}
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {t(
                'upgrade.faq.a3',
                'Yes! Upgrading immediately expands your product and category capacity, and your new validity days are added smoothly to your existing account.'
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ABA / KHQR Payment Modal with Shadcn Dialog */}
      <Dialog open={!!pay} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-border">
          {/* Header Bar */}
          <div className="bg-[#011F46] text-white p-5 text-center relative">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 text-[11px] font-semibold mb-2">
              <QrCode className="w-3.5 h-3.5 text-red-400" />
              <span>{t('upgrade.modal.badge', 'KHQR · ABA Pay')}</span>
            </div>
            <DialogTitle className="text-lg font-bold text-white">
              {t('upgrade.modal.title', 'Scan to Pay & Upgrade')}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-300 mt-1">
              {t('upgrade.modal.subtitle', {
                name: pay?.plan?.name || 'Selected',
                defaultValue: `Upgrading to ${pay?.plan?.name || 'Selected'} Plan`,
              })}
            </DialogDescription>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-4">
            {/* Amount Summary */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <span>{t('upgrade.modal.amountDue', 'Total Amount Due')}</span>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {t('upgrade.modal.planAccess', {
                    period: fmtPeriod(pay?.plan?.days || 30, t),
                    defaultValue: `${fmtPeriod(pay?.plan?.days || 30, t)} Plan Access`,
                  })}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                  ${pay?.amount || pay?.payment?.amount || 0}
                </span>
                <span className="text-xs text-slate-400 ml-1">USD</span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              {pay?.payment?.qr_code_url && !qrFailed ? (
                <div className="relative inline-block bg-white p-3 rounded-xl shadow-xs">
                  <img
                    src={fullUrl(pay.payment.qr_code_url)}
                    alt="KHQR Code"
                    className="w-48 h-48 mx-auto rounded-lg object-contain"
                    onError={() => setQrFailed(true)}
                  />
                </div>
              ) : (
                <div className="w-48 h-48 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Smartphone className="w-10 h-10 text-slate-400" />
                  <span className="text-xs">
                    {t('upgrade.modal.qrUnavailable', 'QR Code unavailable')}
                  </span>
                </div>
              )}

              {/* Live Polling Status */}
              <div className="mt-3 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>
                  {t('upgrade.modal.waitingPayment', 'Listening for payment confirmation...')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {pay?.payment?.checkout_url && (
                <a
                  href={pay.payment.checkout_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-[#011F46] hover:bg-[#072a57] text-white font-bold text-sm transition-all shadow-xs"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{t('upgrade.modal.openAbaApp', 'Open ABA Mobile App')}</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
                </a>
              )}

              <Button
                onClick={alreadyPaid}
                disabled={checking}
                variant="outline"
                className="w-full h-11 rounded-xl font-bold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white"
              >
                {checking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />
                    {t('upgrade.modal.checkingStatus', 'Checking Payment Status...')}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
                    {t('upgrade.modal.alreadyPaidBtn', 'I have already paid — Confirm')}
                  </>
                )}
              </Button>

              <Button
                onClick={closeModal}
                variant="ghost"
                className="w-full h-9 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {t('upgrade.modal.cancelClose', 'Cancel & Close')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
