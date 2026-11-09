import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from '../../utils/toast';
import { FiDownload, FiPrinter, FiArrowLeft, FiPackage, FiFileText } from 'react-icons/fi';
import { orderService } from '../../services/orderService';
import { fullUrl } from '../../api/client';
import { useLanguage } from '../../i18n';
import { Order, OrderItem } from '../../types';
import { Table, Column } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Empty } from '../../components/common/Empty';
import { Loading } from '../../components/common/Loading';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import HttpErrorPage from '../../components/shared/HttpErrorPage';

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [generatingReceipt, setGeneratingReceipt] = useState(false);

  const load = () => {
    if (!id) return;
    setLoading(true);
    setErrorStatus(null);
    orderService
      .getOrder(id)
      .then(setOrder)
      .catch((err) => {
        setOrder(null);
        const status = err?.status || err?.response?.status || 500;
        setErrorStatus(status);
        toast.error(err?.message || err?.detail || 'Failed to load order');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const setOrderStatus = async (val: string) => {
    if (!id) return;
    try {
      await orderService.updateOrderStatus(id, { order_status: val });
      toast.success(language === 'kh' ? `បានកែប្រែស្ថានភាព: ${val}` : `Order status: ${val}`);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to update order status');
    }
  };

  const setPaymentStatus = async (val: string) => {
    if (!id) return;
    try {
      await orderService.updateOrderStatus(id, { payment_status: val });
      toast.success(language === 'kh' ? `បានកែប្រែការទូទាត់: ${val}` : `Payment status: ${val}`);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to update payment status');
    }
  };

  const makeReceipt = async () => {
    if (!id) return;
    const lang = language === 'kh' ? 'km' : 'en';
    window.open(fullUrl(`/api/orders/${id}/receipt?lang=${lang}`), '_blank');
  };

  const printReceipt = () => {
    if (!order) return;
    const lang = language === 'kh' ? 'km' : 'en';
    const win = window.open(fullUrl(`/api/orders/${order.id}/receipt?lang=${lang}`), '_blank');
    if (win) win.onload = () => win.print();
  };

  if (loading) return <Loading />;

  if (errorStatus || !order) {
    const code = errorStatus === 404 ? 404 : errorStatus === 403 ? 403 : 500;
    return (
      <div className="py-8">
        <HttpErrorPage
          code={code}
          fullPage={false}
          title={code === 404 ? (language === 'kh' ? 'រកមិនឃើញការបញ្ជាទិញទេ' : 'Order Not Found') : undefined}
          description={
            code === 404
              ? (language === 'kh'
                  ? 'ការបញ្ជាទិញដែលអ្នកកំពុងស្វែងរកមិនមាន ឬត្រូវបានលុបចេញហើយ។'
                  : 'The requested order does not exist or may have been deleted.')
              : undefined
          }
          onRetry={load}
          showRetryButton={code !== 404}
        />
      </div>
    );
  }

  const itemColumns: Column<OrderItem>[] = [
    {
      key: 'product_name',
      title: t('tables.products', 'Product'),
      render: (item) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">{item.product_name}</span>
      ),
    },
    {
      key: 'variations',
      title: language === 'kh' ? 'លក្ខណៈពិសេស' : 'Variations',
      render: (item) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {item.variations && Object.keys(item.variations).length > 0
            ? Object.entries(item.variations)
                .map(([k, v]) => `${k}: ${v}`)
                .join(' · ')
            : '—'}
        </span>
      ),
    },
    {
      key: 'price',
      title: t('tables.price', 'Price'),
      render: (item) => (
        <span className="font-medium text-slate-700 dark:text-slate-300">
          ${item.price.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'quantity',
      title: t('tables.qty', 'Quantity'),
      align: 'center',
      render: (item) => (
        <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full text-xs">
          {item.quantity}
        </span>
      ),
    },
    {
      key: 'subtotal',
      title: language === 'kh' ? 'សរុបរង' : 'Subtotal',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-slate-900 dark:text-slate-100">
          ${(item.price * item.quantity).toFixed(2)}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Breadcrumbs />
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/orders')}
            className="p-2 h-auto rounded-xl"
          >
            <FiArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{language === 'kh' ? 'ការបញ្ជាទិញ' : 'Order'} #{order.order_number}</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {order.created_at ? new Date(order.created_at).toLocaleString() : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={makeReceipt} loading={generatingReceipt} variant="primary">
            <FiDownload className="w-4 h-4 mr-1.5" />
            {language === 'kh' ? 'បង្កើត PDF Receipt' : 'Generate PDF Receipt'}
          </Button>
          {order.receipt_url && (
            <Button onClick={printReceipt} variant="outline">
              <FiPrinter className="w-4 h-4 mr-1.5" />
              {language === 'kh' ? 'បោះពុម្ព' : 'Print'}
            </Button>
          )}
        </div>
      </div>

      {/* 2-Column Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
            {language === 'kh' ? 'ព័ត៌មានអតិថិជន (Customer)' : 'Customer Details'}
          </h2>
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">{language === 'kh' ? 'ឈ្មោះ:' : 'Name:'}</dt>
              <dd className="font-semibold text-slate-800 dark:text-slate-200">{order.customer_name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">{language === 'kh' ? 'ទូរស័ព្ទ:' : 'Phone:'}</dt>
              <dd className="font-mono text-slate-700 dark:text-slate-300">{order.customer_phone || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Telegram:</dt>
              <dd className="text-slate-700 dark:text-slate-300">{order.customer_telegram || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Email:</dt>
              <dd className="text-slate-700 dark:text-slate-300">{order.customer_email || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500 dark:text-slate-400 shrink-0">{language === 'kh' ? 'អាសយដ្ឋាន:' : 'Address:'}</dt>
              <dd className="text-right text-slate-700 dark:text-slate-300 text-xs">
                {[order.customer_address, order.customer_city, order.customer_country]
                  .filter(Boolean)
                  .join(', ') || '—'}
              </dd>
            </div>
            {order.customer_note && (
              <div className="flex justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <dt className="text-slate-500 dark:text-slate-400 shrink-0">{language === 'kh' ? 'ចំណាំ:' : 'Note:'}</dt>
                <dd className="text-right text-xs text-amber-600 dark:text-amber-400 font-medium">
                  {order.customer_note}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Status & Processing Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
            {language === 'kh' ? 'ស្ថានភាព & ការទូទាត់' : 'Order & Payment Status'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase">
                {language === 'kh' ? 'ស្ថានភាពបញ្ជាទិញ' : 'Order Status'}
              </label>
              <select
                value={order.order_status}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium capitalize text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase">
                {language === 'kh' ? 'ស្ថានភាពទូទាត់' : 'Payment Status'}
              </label>
              <select
                value={order.payment_status}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium capitalize text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Transaction ID</span>
                <span className="font-mono text-slate-600 dark:text-slate-300">
                  {order.transaction_id || '—'}
                </span>
              </div>
              {order.receipt_url && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">{language === 'kh' ? 'វិក្កយបត្រ' : 'Receipt PDF'}</span>
                  <a
                    href={fullUrl(order.receipt_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    {language === 'kh' ? 'ទាញយក / មើល' : 'Download / View'}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Items Table using Table Component */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {language === 'kh' ? 'មុខទំនិញក្នុង Order' : 'Order Items'}
          </h2>
        </div>

        <Table<OrderItem>
          columns={itemColumns}
          data={order.items || []}
          rowKey={(item, idx) => item.id || idx}
          emptyIcon={<FiPackage className="size-6 text-slate-400" />}
          emptyTitle={language === 'kh' ? 'គ្មានទំនិញ' : 'No items'}
          className="border-0 shadow-none rounded-none"
        />

        {/* Financial Breakdown */}
        <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 space-y-2 text-sm">
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>{language === 'kh' ? 'សរុបរង' : 'Subtotal'}</span>
            <span>${Number(order.items_total || 0).toFixed(2)}</span>
          </div>
          {order.shipping_fee > 0 && (
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>{language === 'kh' ? 'សេវាដឹកជញ្ជូន' : 'Shipping'}</span>
              <span>+${Number(order.shipping_fee).toFixed(2)}</span>
            </div>
          )}
          {order.discount > 0 && (
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>{language === 'kh' ? 'បញ្ចុះតម្លៃ' : 'Discount'}</span>
              <span className="text-rose-600">-${Number(order.discount).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-3 border-t border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
            <span>{language === 'kh' ? 'សរុបចុងក្រោយ (Total)' : 'Total'}</span>
            <span className="text-indigo-600 dark:text-indigo-400">
              ${Number(order.total || 0).toFixed(2)} {order.currency || 'USD'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
