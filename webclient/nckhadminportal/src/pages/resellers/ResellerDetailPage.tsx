import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from '../../utils';
import { FiArrowLeft, FiCopy, FiDollarSign, FiPercent, FiShoppingBag, FiTag, FiUsers } from 'react-icons/fi';
import { getReseller } from '../../api';
import { GlobalCard, Loading, Table } from '../../components/ui';
import HttpErrorPage from '../../components/shared/HttpErrorPage';
import { useLanguage } from '../../i18n';
import usePageTab from '../../hooks/usePageTab';

const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString() : '—');

const VALID_RESELLER_TABS = ['overview', 'shops', 'customers'] as const;
type ResellerTab = typeof VALID_RESELLER_TABS[number];

export default function ResellerDetail() {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [r, setR] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [tab, setTab] = usePageTab<ResellerTab>({
    paramKey: 'tab',
    defaultTab: 'overview',
    validTabs: VALID_RESELLER_TABS,
    transform: (raw) => {
      const lower = raw.toLowerCase() as ResellerTab;
      return VALID_RESELLER_TABS.includes(lower) ? lower : 'overview';
    },
    storageKey: `reseller_detail_tab_${id}`,
  });
  const [shopsPage, setShopsPage] = useState(1);
  const [shopsPageSize, setShopsPageSize] = useState(10);
  const [custPage, setCustPage] = useState(1);
  const [custPageSize, setCustPageSize] = useState(10);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setErrorStatus(null);
    getReseller(id)
      .then(setR)
      .catch((err) => {
        setR(null);
        setErrorStatus(err?.status || err?.response?.status || 500);
      })
      .finally(() => setLoading(false));
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).then(() => toast.success('Copied')).catch(() => {});
  };

  if (loading) return <Loading />;

  if (errorStatus || !r) {
    const code = errorStatus === 404 ? 404 : errorStatus === 403 ? 403 : 500;
    return (
      <HttpErrorPage
        code={code}
        fullPage={false}
        onRetry={load}
        showRetryButton={code !== 404}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/resellers')} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500" title={t('buttons.back')}>
          <FiArrowLeft />
        </button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><FiPercent /></span>
            {t('resellers.reseller')} · {r.username}
          </h1>
          <p className="text-sm text-gray-500">{r.email || '—'} · {t('resellers.referralCode')} <b>{r.referral_code}</b></p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <GlobalCard
          cardType="stats"
          title={t('resellers.shops')}
          value={r.shop_count || 0}
          variant="indigo"
          icon={<FiShoppingBag className="size-5" />}
        />
        <GlobalCard
          cardType="stats"
          title={t('resellers.customers')}
          value={r.customer_count || 0}
          variant="purple"
          icon={<FiUsers className="size-5" />}
        />
        <GlobalCard
          cardType="stats"
          title={t('resellers.planSales')}
          value={r.sales || 0}
          prefix="$"
          decimals={2}
          variant="amber"
          icon={<FiDollarSign className="size-5" />}
        />
        <GlobalCard
          cardType="stats"
          title={t('resellers.commission')}
          value={r.commission || 0}
          prefix="$"
          decimals={2}
          subtitle={`${r.commission_rate}% ${t('resellers.commission')}`}
          variant="emerald"
          icon={<FiPercent className="size-5" />}
        />
        <GlobalCard
          cardType="stats"
          title={t('resellers.maxDiscount')}
          value={Number(r.discount_max || 0)}
          prefix="$"
          decimals={2}
          variant="rose"
          icon={<FiTag className="size-5" />}
        />
        <GlobalCard
          cardType="stats"
          title={t('resellers.activePromo')}
          value={Number(r.promo_discount || 0)}
          prefix="$"
          decimals={2}
          variant="cyan"
          icon={<FiTag className="size-5" />}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'overview', label: t('resellers.tabs.overview', 'Overview') },
          { key: 'shops', label: t('resellers.tabs.shops', { count: r.shop_count || 0 }) },
          { key: 'customers', label: t('resellers.tabs.customers', { count: r.customer_count || 0 }) },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              tab === key
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlobalCard cardType="container" title={t('resellers.profileTitle')}>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">{t('resellers.username')}</span><span className="font-semibold text-slate-800 dark:text-slate-200">{r.username}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">{t('resellers.email')}</span><span className="font-semibold text-slate-800 dark:text-slate-200">{r.email || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">{t('common.status')}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-rose-950/40 dark:text-rose-300'}`}>{r.status}</span>
              </div>
              <div className="flex justify-between"><span className="text-gray-500 flex items-center gap-1"><FiPercent /> {t('resellers.commissionRate')}</span><span className="font-semibold text-slate-800 dark:text-slate-200">{r.commission_rate}%</span></div>
              <div className="flex justify-between"><span className="text-gray-500 flex items-center gap-1"><FiTag /> {t('resellers.promoCode')}</span><span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{r.referral_code}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">{t('resellers.maxDiscount')}</span><span className="font-semibold text-slate-800 dark:text-slate-200">${Number(r.discount_max || 0).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">{t('resellers.activePromoDiscount')}</span><span className="font-semibold text-sky-600 dark:text-sky-400">${Number(r.promo_discount || 0).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">{t('resellers.joined')}</span><span className="font-semibold text-slate-800 dark:text-slate-200">{fmtDate(r.created_at)}</span></div>
            </div>
          </GlobalCard>

          <GlobalCard cardType="container" title={t('resellers.referralLink')}>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-emerald-300 dark:border-emerald-700 rounded-xl px-4 py-3">
              <span className="font-mono text-xs text-emerald-700 dark:text-emerald-300 break-all flex-1">{r.signup_link}</span>
              <button onClick={() => copy(r.signup_link)} className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-gray-500 shrink-0" title={t('buttons.copy')}><FiCopy /></button>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
              {t('resellers.referralDescription', { discount: Number(r.promo_discount || 0).toFixed(2), rate: r.commission_rate })}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <p className="text-xl font-extrabold text-gray-900 dark:text-white">${(r.sales || 0).toFixed(2)}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{t('resellers.planSales')}</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3">
                <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">${(r.commission || 0).toFixed(2)}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{t('resellers.commissionEarned')}</p>
              </div>
            </div>
          </GlobalCard>
        </div>
      )}

      {tab === 'shops' && (() => {
        const shops = r.shops || [];
        const totalPages = Math.ceil(shops.length / shopsPageSize) || 1;
        const paginatedShops = shops.slice((shopsPage - 1) * shopsPageSize, shopsPage * shopsPageSize);

        const shopColumns = [
          {
            key: 'shop',
            title: t('tables.shop'),
            render: (s: any) => (
              <div className="flex items-center gap-2.5">
                <span className="size-8 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                  <FiShoppingBag />
                </span>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{s.shop_name || s.username}</p>
                  <p className="text-xs text-slate-400">@{s.username}</p>
                </div>
              </div>
            ),
          },
          {
            key: 'plan',
            title: t('tables.plan'),
            render: (s: any) => <span className="capitalize text-slate-700 dark:text-slate-300">{s.plan || '—'}</span>,
          },
          {
            key: 'plan_price',
            title: t('resellers.paid'),
            render: (s: any) => <span className="font-bold text-slate-800 dark:text-slate-100">${Number(s.plan_price || 0).toFixed(2)}</span>,
          },
          {
            key: 'product_count',
            title: t('tables.products'),
            render: (s: any) => <span className="text-slate-700 dark:text-slate-300">{s.product_count}</span>,
          },
          {
            key: 'order_count',
            title: t('tables.orders'),
            render: (s: any) => <span className="text-slate-700 dark:text-slate-300">{s.order_count}</span>,
          },
          {
            key: 'customer_count',
            title: t('tables.customer'),
            render: (s: any) => <span className="text-slate-700 dark:text-slate-300">{s.customer_count}</span>,
          },
          {
            key: 'revenue',
            title: t('tables.revenue'),
            render: (s: any) => <span className="font-semibold text-slate-800 dark:text-slate-100">${(s.revenue || 0).toFixed(2)}</span>,
          },
          {
            key: 'status',
            title: t('tables.status'),
            render: (s: any) => (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  s.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : s.status === 'pending'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                }`}
              >
                {s.status}
              </span>
            ),
          },
          {
            key: 'expires_at',
            title: t('tables.expiresAt'),
            render: (s: any) => <span className="text-slate-500 dark:text-slate-400">{fmtDate(s.expires_at)}</span>,
          },
          {
            key: 'actions',
            title: '',
            align: 'right' as const,
            render: (s: any) => (
              <Link to={`/shops/${s.id}`} className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:underline">
                {t('resellers.manage')}
              </Link>
            ),
          },
        ];

        return (
          <Table<any>
            columns={shopColumns}
            data={paginatedShops}
            emptyText={t('resellers.noShopsYet')}
            pagination={{
              currentPage: shopsPage,
              totalPages: totalPages,
              totalItems: shops.length,
              pageSize: shopsPageSize,
              onPageChange: (p) => setShopsPage(p),
              onPageSizeChange: (sz) => { setShopsPageSize(sz); setShopsPage(1); },
            }}
          />
        );
      })()}

      {tab === 'customers' && (() => {
        const customers = r.customers || [];
        const totalPages = Math.ceil(customers.length / custPageSize) || 1;
        const paginatedCustomers = customers.slice((custPage - 1) * custPageSize, custPage * custPageSize);

        const customerColumns = [
          {
            key: 'name',
            title: t('tables.customer'),
            render: (c: any) => <span className="font-semibold text-slate-800 dark:text-slate-100">{c.name || '—'}</span>,
          },
          {
            key: 'contact',
            title: t('resellers.contact'),
            render: (c: any) => <span className="text-slate-600 dark:text-slate-400">{c.phone || c.telegram || c.email || '—'}</span>,
          },
          {
            key: 'shop_username',
            title: t('tables.shop'),
            render: (c: any) => <span className="text-slate-600 dark:text-slate-400">@{c.shop_username}</span>,
          },
          {
            key: 'orders',
            title: t('tables.orders'),
            render: (c: any) => <span className="text-slate-700 dark:text-slate-300 font-medium">{c.orders}</span>,
          },
          {
            key: 'type',
            title: t('resellers.type'),
            render: (c: any) => (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  c.type === 'registered'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {c.type === 'registered' ? t('resellers.account') : t('resellers.guest')}
              </span>
            ),
          },
        ];

        return (
          <Table<any>
            columns={customerColumns}
            data={paginatedCustomers}
            emptyText={t('resellers.noCustomersYet')}
            pagination={{
              currentPage: custPage,
              totalPages: totalPages,
              totalItems: customers.length,
              pageSize: custPageSize,
              onPageChange: (p) => setCustPage(p),
              onPageSizeChange: (sz) => { setCustPageSize(sz); setCustPage(1); },
            }}
          />
        );
      })()}
    </div>
  );
}
