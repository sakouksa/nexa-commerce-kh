import React from 'react';
import { User, CreditCard, ShoppingBag, FileText, MapPin, Phone, Mail, Store, ShieldCheck } from 'lucide-react';
import { Order } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n';

export interface ReceiptPrintDocumentProps {
  order: Order | null;
}

export const ReceiptPrintDocument: React.FC<ReceiptPrintDocumentProps> = ({ order }) => {
  const { t, isKhmer } = useLanguage();
  const { shop, user } = useAuth();

  if (!order) return null;

  // Format Date dynamically based on active language
  const formatDisplayDate = (d: string | Date | null | undefined): string => {
    if (!d) return '—';
    const date = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(date.getTime())) return typeof d === 'string' ? d : '—';

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    if (isKhmer) {
      const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
      return `ថ្ងៃទី ${date.getDate()} ខែ${khmerMonths[date.getMonth()]} ឆ្នាំ${date.getFullYear()} ${hours}:${minutes}`;
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} ${hours}:${minutes}`;
  };

  const formatTimestampNow = (): string => {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    if (isKhmer) {
      const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
      return `ថ្ងៃទី ${d.getDate()} ខែ${khmerMonths[d.getMonth()]} ឆ្នាំ${d.getFullYear()} ${hours}:${minutes}`;
    }

    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()} ${hours}:${minutes}`;
  };

  const items = order.items || [];
  const totalItemsCount = items.length;
  const totalUnits = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  // Dynamic dual currency calculation
  const formatDual = (amountUsd: number = 0) => {
    const usd = Number(amountUsd) || 0;
    const khr = Math.round(usd * 4100);
    return {
      usdStr: `$${usd.toFixed(2)}`,
      khrStr: `៛${new Intl.NumberFormat('en-US').format(khr)}`,
    };
  };

  const isOrderKhr = (order.currency || 'USD').toUpperCase() === 'KHR';
  const subtotalUsd = isOrderKhr ? (order.items_total || 0) / 4100 : (order.items_total || 0);
  const discountUsd = isOrderKhr ? (order.discount || 0) / 4100 : (order.discount || 0);
  const shippingUsd = isOrderKhr ? (order.shipping_fee || 0) / 4100 : (order.shipping_fee || 0);
  const grandTotalUsd = isOrderKhr ? (order.total || 0) / 4100 : (order.total || 0);

  const subtotalDual = formatDual(subtotalUsd);
  const discountDual = formatDual(discountUsd);
  const shippingDual = formatDual(shippingUsd);
  const grandTotalDual = formatDual(grandTotalUsd);

  // Dynamic store data
  const resolvedStoreName = shop?.shop_name || shop?.username || 'MiniStore KH';
  const resolvedTagline = shop?.bio || shop?.description || t('receipts.taglineDefault');
  const resolvedBranch = (shop as any)?.branch_name || (user as any)?.branch?.name || t('receipts.mainBranch');
  const resolvedAddress = shop?.address || shop?.description || t('receipts.defaultAddress');
  const resolvedPhone = shop?.contact || (shop as any)?.phone || '—';
  const resolvedEmail = (shop as any)?.email || (shop?.username ? `${shop.username}@ministorekh.com` : 'info@ministorekh.com');
  const resolvedLogo = shop?.logo || '/logo.png';

  // Dynamic order channel
  const num = (order.order_number || '').toUpperCase();
  const isPos = num.startsWith('POS');
  const isTelegram = Boolean(order.customer_telegram || (order.customer_note || '').toLowerCase().includes('telegram'));
  const channelLabel = isPos
    ? t('receipts.channels.pos')
    : isTelegram
    ? t('receipts.channels.telegram')
    : t('receipts.channels.storefront');

  // Dynamic payment method
  const payMethod = (order.payment_method || 'cash').toLowerCase();
  const paymentLabel =
    payMethod === 'cash'
      ? t('receipts.cash')
      : payMethod === 'bank' || payMethod === 'aba' || payMethod === 'khqr'
      ? t('receipts.bank')
      : (order.payment_method || '').toUpperCase();

  // Dynamic cashier & customer
  const cashierName = (user as any)?.name || user?.username || t('receipts.mainCashier');
  const customerName = order.customer_name || t('receipts.walkInCustomer');

  return (
    <div
      id="direct-print-voucher-root"
      className="w-full bg-white text-slate-900 font-['Kantumruy_Pro',sans-serif] text-xs p-4 sm:p-6 leading-normal select-none [print-color-adjust:exact] [-webkit-print-color-adjust:exact]"
    >
      {/* ─── 1. Enterprise Letterhead Header ───────────────────────────────── */}
      <div className="w-full select-none pb-3 mb-3 border-b border-slate-300">
        <div className="flex justify-between items-start gap-4">
          {/* Left Column: Brand Logo + Clean Store Identity */}
          <div className="flex items-start gap-3 max-w-[54%]">
            <div className="w-[48px] h-[48px] min-w-[48px] min-h-[48px] rounded-lg border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src={resolvedLogo}
                alt={resolvedStoreName}
                className="w-full h-full object-contain block shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.fallback-monogram')) {
                    const mono = document.createElement('div');
                    mono.className =
                      'fallback-monogram w-full h-full bg-slate-900 text-white rounded flex items-center justify-center font-black text-sm';
                    mono.innerText = resolvedStoreName.charAt(0).toUpperCase() || 'M';
                    parent.appendChild(mono);
                  }
                }}
              />
            </div>

            <div className="space-y-0.5 text-xs text-slate-800">
              <div>
                <h1 className="font-black text-sm sm:text-base tracking-tight text-slate-950 uppercase leading-none">
                  {resolvedStoreName}
                </h1>
                <p className="text-[9.5px] text-slate-500 font-medium tracking-normal mt-0.5">
                  {resolvedTagline}
                </p>
              </div>

              <div className="text-[9px] space-y-0.5 text-slate-500 leading-tight pt-0.5">
                <p className="flex items-center gap-1">
                  <MapPin size={8.5} className="text-slate-400 shrink-0" />
                  <span>{resolvedAddress}</span>
                </p>
                <div className="flex items-center gap-2 flex-wrap font-mono">
                  <span className="flex items-center gap-1">
                    <Phone size={8.5} className="text-slate-400 shrink-0" />
                    <span>{resolvedPhone}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mail size={8.5} className="text-slate-400 shrink-0" />
                    <span>{resolvedEmail}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Prominent Document Title & Clean Reference Details */}
          <div className="text-right space-y-1 min-w-[220px] max-w-[46%] shrink-0">
            <div>
              <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-slate-950 leading-tight">
                {t('receipts.officialReceiptTitle')}
              </h2>
              <p className="text-[8.5px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">
                {t('receipts.officialReceiptSubtitle')}
              </p>
            </div>

            <div className="space-y-0.5 pt-0.5 text-[10px]">
              <div className="flex justify-end items-baseline gap-1.5">
                <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider">
                  {t('receipts.receiptNo')}:
                </span>
                <span className="font-mono font-bold text-xs text-slate-950">
                  #{order.order_number || order.id}
                </span>
              </div>

              <div className="flex justify-end items-baseline gap-1.5 text-slate-600">
                <span className="text-[9px] uppercase font-medium text-slate-500 tracking-wider">
                  {t('receipts.dateCol')}:
                </span>
                <span className="font-medium text-slate-800 text-[9.5px]">
                  {formatDisplayDate(order.paid_at || order.created_at)}
                </span>
              </div>

              <div className="flex justify-end items-baseline gap-1.5 pt-0.5">
                <span className="text-[9px] uppercase font-medium text-slate-500 tracking-wider">
                  {t('receipts.paymentStatus')}:
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[8.5px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
                  {order.payment_status?.toLowerCase() === 'paid'
                    ? t('receipts.paid')
                    : order.payment_status?.toLowerCase() === 'pending'
                    ? t('receipts.pending')
                    : (order.payment_status || '').toUpperCase()}
                </span>
              </div>

              <div className="flex justify-end items-baseline gap-1.5 text-[9px]">
                <span className="text-slate-500">{t('receipts.salesChannel')}:</span>
                <span className="font-semibold text-slate-900">{channelLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. Metadata 2-Column Section ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 my-2.5">
        {/* Customer Information Card */}
        <div className="border border-slate-300 rounded-lg p-2.5 space-y-1 bg-slate-50/40">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <p className="text-[9.5px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <User size={11} className="text-slate-500 shrink-0" />
              <span>{t('receipts.customerInfo')}</span>
            </p>
            <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-700 font-semibold">
              {channelLabel}
            </span>
          </div>

          <div className="space-y-0.5 text-[10px] text-slate-600 pt-0.5">
            <p className="flex items-center justify-between">
              <span className="font-medium text-slate-700">{t('receipts.customer')}:</span>
              <span className="font-semibold text-slate-900">{customerName}</span>
            </p>
            <p className="flex items-center justify-between">
              <span className="font-medium text-slate-700">{t('receipts.phone')}:</span>
              <span className="font-mono font-medium text-slate-900">{order.customer_phone || '—'}</span>
            </p>
            {order.customer_telegram && (
              <p className="flex items-center justify-between">
                <span className="font-medium text-slate-700">{t('receipts.telegram')}:</span>
                <span className="font-mono font-medium text-slate-900">@{order.customer_telegram.replace('@', '')}</span>
              </p>
            )}
            <p className="flex items-center justify-between">
              <span className="font-medium text-slate-700">{t('receipts.address')}:</span>
              <span className="text-slate-800 text-right truncate max-w-[200px]">
                {order.customer_address || '—'}
              </span>
            </p>
          </div>
        </div>

        {/* Transaction & Payment Details Card */}
        <div className="border border-slate-300 rounded-lg p-2.5 space-y-1 bg-slate-50/40">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <p className="text-[9.5px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <CreditCard size={11} className="text-slate-500 shrink-0" />
              <span>{t('receipts.transactionDetails')}</span>
            </p>
            <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold uppercase">
              {order.payment_status?.toLowerCase() === 'paid'
                ? t('receipts.paid')
                : order.payment_status?.toLowerCase() === 'pending'
                ? t('receipts.pending')
                : (order.payment_status || '').toUpperCase()}
            </span>
          </div>

          <div className="space-y-0.5 text-[10px] text-slate-600 pt-0.5">
            <p className="flex items-center justify-between">
              <span className="font-medium text-slate-700">{t('receipts.paymentMethod')}:</span>
              <span className="font-semibold text-slate-900">{paymentLabel}</span>
            </p>
            <p className="flex items-center justify-between">
              <span className="font-medium text-slate-700">{t('receipts.orderNumber')}:</span>
              <span className="font-mono font-medium text-slate-900">{order.order_number}</span>
            </p>
            <p className="flex items-center justify-between">
              <span className="font-medium text-slate-700">{t('receipts.salesChannel')}:</span>
              <span className="font-medium text-slate-900">{channelLabel}</span>
            </p>
            <p className="flex items-center justify-between">
              <span className="font-medium text-slate-700">{t('receipts.orderStatus')}:</span>
              <span className="font-medium text-slate-900">
                {order.order_status
                  ? t(`receipts.statuses.${order.order_status.toLowerCase()}`, order.order_status)
                  : t('receipts.statuses.confirmed')}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ─── 3. Ordered Items Breakdown Table ─────────────────────────────── */}
      <div className="my-2.5">
        <div className="flex items-center justify-between pb-1 border-b border-slate-300">
          <h3 className="font-bold text-[10.5px] uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <ShoppingBag size={11} className="text-slate-600 shrink-0" />
            <span>{t('receipts.orderedItemsBreakdown')}</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-600">
            {totalItemsCount} {t('receipts.itemsCount')} ({totalUnits} {t('receipts.unitsCount')})
          </span>
        </div>

        <table className="w-full text-left text-xs border-collapse mt-1 border border-slate-300">
          <thead>
            <tr className="bg-slate-100 text-slate-800 text-[9.5px] font-bold uppercase tracking-wider border-b border-slate-300">
              <th className="py-1.5 px-2 text-center w-7 border-r border-slate-200">#</th>
              <th className="py-1.5 px-2.5 border-r border-slate-200">
                {t('receipts.productDescription')}
              </th>
              <th className="py-1.5 px-2 text-center w-16 border-r border-slate-200">
                {t('receipts.quantity')}
              </th>
              <th className="py-1.5 px-2.5 text-right w-24 border-r border-slate-200">
                {t('receipts.unitPrice')}
              </th>
              <th className="py-1.5 px-2 text-right w-20 border-r border-slate-200">
                {t('receipts.discount')}
              </th>
              <th className="py-1.5 px-2.5 text-right w-24">
                {t('receipts.lineTotal')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item, idx) => {
              const qty = Number(item.quantity) || 1;
              const unitPriceUsd = Number(item.price) || 0;
              const lineTotalUsd = unitPriceUsd * qty;
              const unitDual = formatDual(unitPriceUsd);
              const totalDual = formatDual(lineTotalUsd);

              const vars = item.variations;
              let varStr = '';
              if (vars && typeof vars === 'object' && Object.keys(vars).length > 0) {
                varStr = Object.entries(vars)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(', ');
              }

              return (
                <tr key={item.id || idx} className="even:bg-slate-50/50">
                  <td className="py-1.5 px-2 text-center text-slate-500 font-mono text-[9.5px] border-r border-slate-200">
                    {idx + 1}
                  </td>
                  <td className="py-1.5 px-2.5 border-r border-slate-200">
                    <div>
                      <span className="font-bold text-slate-900 block text-[11px] leading-tight">
                        {item.name || item.product_name || `${t('receipts.product')} #${item.product_id}`}
                      </span>
                      {varStr && (
                        <span className="text-[9px] font-mono text-slate-500 block">
                          {varStr}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-1.5 px-2 text-center font-mono font-semibold text-slate-900 border-r border-slate-200 text-[11px]">
                    {qty}
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-mono text-[10.5px] text-slate-800 border-r border-slate-200">
                    <div className="font-medium">{unitDual.usdStr}</div>
                    <div className="text-[8.5px] text-slate-500">{unitDual.khrStr}</div>
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono text-[10.5px] text-slate-700 border-r border-slate-200">
                    <span className="text-slate-400">—</span>
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-mono text-[11px] font-bold text-slate-950">
                    <div>{totalDual.usdStr}</div>
                    <div className="text-[8.5px] text-slate-500 font-normal">{totalDual.khrStr}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ─── 4. Totals & Notes Section ─────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-3 my-2.5 pt-1">
        {/* Left: Notes & Operational Summary */}
        <div className="col-span-6 space-y-2">
          <div className="border border-slate-300 rounded-lg p-2 bg-slate-50/40 space-y-0.5">
            <p className="font-bold text-[9px] uppercase tracking-wider text-slate-700 flex items-center gap-1">
              <FileText size={10} className="text-slate-500 shrink-0" />
              <span>{t('receipts.notesTerms')}:</span>
            </p>
            <p className="text-[10px] text-slate-600 leading-relaxed pl-3.5">
              {order.customer_note || t('receipts.defaultReceiptNote')}
            </p>
          </div>

          <div className="border border-slate-200 rounded-lg p-2 bg-slate-50/30 text-slate-700 text-[10px] space-y-0.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">{t('receipts.totalItems')}:</span>
              <span className="font-mono font-bold text-slate-900">{totalItemsCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">{t('receipts.totalUnitsSold')}:</span>
              <span className="font-mono font-bold text-slate-900">{totalUnits}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">{t('receipts.paymentStatus')}:</span>
              <span className="font-mono font-bold text-emerald-700 uppercase">
                {order.payment_status?.toLowerCase() === 'paid'
                  ? t('receipts.paid')
                  : order.payment_status?.toLowerCase() === 'pending'
                  ? t('receipts.pending')
                  : (order.payment_status || '').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Clean Financial Breakdown Card */}
        <div className="col-span-6 border border-slate-300 rounded-lg p-2.5 bg-slate-50/40 text-slate-800 space-y-1">
          <div className="flex justify-between items-center text-[10.5px]">
            <span className="text-slate-600">{t('receipts.subtotal')}:</span>
            <span className="font-mono font-medium text-slate-900">{subtotalDual.usdStr}</span>
          </div>

          {discountUsd > 0 && (
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="text-slate-600">{t('receipts.discount')}:</span>
              <span className="font-mono font-medium text-rose-600">-{discountDual.usdStr}</span>
            </div>
          )}

          {shippingUsd > 0 && (
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="text-slate-600">{t('receipts.shipping')}:</span>
              <span className="font-mono font-medium text-slate-900">+{shippingDual.usdStr}</span>
            </div>
          )}

          <div className="pt-1.5 border-t border-slate-300 flex justify-between items-center">
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-900 tracking-wider block">
                {t('receipts.grandTotal')}:
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold font-mono text-slate-950">
                {grandTotalDual.usdStr}
              </div>
              <div className="text-[9px] font-mono text-slate-600">
                {grandTotalDual.khrStr}
              </div>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-200 grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="text-[8.5px] uppercase font-semibold text-slate-600 block">
                {t('receipts.paidAmount')}
              </span>
              <span className="font-mono font-bold text-emerald-700">
                {grandTotalDual.usdStr}
              </span>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="text-[8.5px] uppercase font-semibold text-slate-600 block">
                {t('receipts.balanceDue')}
              </span>
              <span className="font-mono font-bold text-slate-900">
                $0.00
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 5. Thank You & Customer Note Footer ─────────────────────────── */}
      <div className="w-full pt-3 mt-3 border-t border-slate-200 select-none text-center space-y-0.5 print:break-inside-avoid">
        <p className="font-bold text-slate-900 text-[11px] tracking-tight">
          ♥ {t('receipts.thankYouTitle')}
        </p>
        <p className="text-[9.5px] text-slate-500 font-medium">
          {t('receipts.thankYouSubtitle')}
        </p>
      </div>

      {/* System Watermark / Footer Timestamp */}
      <div className="flex justify-between items-center text-[8.5px] text-slate-400 pt-2 border-t border-slate-200 font-mono">
          <div className="flex items-center gap-1">
            <ShieldCheck size={10} className="text-slate-400 shrink-0" />
            <span>
              {t('receipts.auditWatermark')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>
              {t('receipts.printedOn')}: {formatTimestampNow()}
            </span>
            <span>
              {t('receipts.page')} 1 / 1
            </span>
          </div>
        </div>
    </div>
  );
};

export default ReceiptPrintDocument;
