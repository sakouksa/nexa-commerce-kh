import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, CreditCard, ShoppingBag, FileText, Download } from 'lucide-react';
import { Order } from '@/types';
import {
  GlobalPrintContainer,
  GlobalPrintHeader,
  GlobalPrintFooter,
} from '@/components/shared/GlobalPrint';
import orderService from '@/services/orderService';
import toast from 'react-hot-toast';

export interface ReceiptPrintVoucherProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onPdfGenerated?: (receiptUrl: string) => void;
}

export const ReceiptPrintVoucher: React.FC<ReceiptPrintVoucherProps> = ({
  order,
  isOpen,
  onClose,
  onPdfGenerated,
}) => {
  const { t } = useTranslation();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  if (!order) return null;

  const items = order.items || [];
  const totalItemsCount = items.length;
  const totalUnits = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  // Dual Currency Helper
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

  // Determine Channel
  const num = (order.order_number || '').toUpperCase();
  const isPos = num.startsWith('POS');
  const isTelegram = Boolean(order.customer_telegram || (order.customer_note || '').toLowerCase().includes('telegram'));
  const channelLabel = isPos ? 'POS Terminal' : isTelegram ? 'Telegram Mini App' : 'Storefront Online';

  // Payment Method Display
  const payMethod = (order.payment_method || 'cash').toLowerCase();
  const paymentLabel = payMethod === 'cash' ? t('receipts.cash', 'សាច់ប្រាក់ (Cash)') : t('receipts.bank', 'ធនាគារ / KHQR (Bank/KHQR)');

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const res = await orderService.generateReceipt(order.id);
      if (res?.receipt_url) {
        onPdfGenerated?.(res.receipt_url);
        window.open(res.receipt_url, '_blank');
        toast.success(t('receipts.receiptGeneratedSuccess', 'Receipt PDF downloaded successfully'));
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('receipts.receiptGenerateFailed', 'PDF generation failed'));
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const extraMeta = [
    {
      label: t('receipts.channel', 'ប្រភព (Channel)'),
      value: channelLabel,
    },
    {
      label: t('receipts.payment', 'វិធីទូទាត់ (Payment)'),
      value: paymentLabel,
    },
  ];

  const voucherDocument = (
    <div className="w-full bg-white text-slate-900 font-sans text-xs p-1 sm:p-2 leading-normal select-none [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
      {/* ─── Enterprise Letterhead ────────────────────────────────────────── */}
      <GlobalPrintHeader
        title={t('receipts.officialReceiptTitle', 'បង្កាន់ដៃទទួលប្រាក់ផ្លូវការ')}
        subtitleEnglish="OFFICIAL RECEIPT / INVOICE VOUCHER"
        referenceNumber={`#${order.order_number || order.id}`}
        referenceLabel={t('receipts.receiptNo', 'Receipt / PO #')}
        date={order.paid_at || order.created_at}
        dateLabel={t('receipts.dateCol', 'កាលបរិច្ឆេទ (Date)')}
        status={t('orders.paid', 'PAID / បានទូទាត់')}
        extraMeta={extraMeta}
      />

      {/* ─── 2-Column Info Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 my-2.5">
        {/* Customer Information Card */}
        <div className="border border-slate-300 rounded-lg p-2.5 space-y-1 bg-slate-50/40">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <p className="text-[9.5px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <User size={11} className="text-slate-500 shrink-0" />
              <span>{t('receipts.customerInfo', 'ព័ត៌មានអតិថិជន (Customer Information)')}</span>
            </p>
            <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-700 font-semibold">
              {channelLabel}
            </span>
          </div>

          <div className="space-y-0.5 text-[10px] text-slate-600 pt-0.5">
            <p className="flex items-center justify-between">
              <span className="font-medium text-slate-700">{t('receipts.customer', 'អតិថិជន')}:</span>
              <span className="font-semibold text-slate-900">{order.customer_name || t('receipts.walkInCustomer', 'អតិថិជនទូទៅ')}</span>
            </p>
            <p className="flex items-center justify-between">
              <span className="font-medium text-slate-700">{t('receipts.phone', 'ទូរស័ព្ទ')}:</span>
              <span className="font-mono font-medium text-slate-900">{order.customer_phone || '—'}</span>
            </p>
            {order.customer_telegram && (
              <p className="flex items-center justify-between">
                <span className="font-medium text-slate-700">{t('customers.telegram', 'Telegram')}:</span>
                <span className="font-mono font-medium text-slate-900">@{order.customer_telegram.replace('@', '')}</span>
              </p>
            )}
            <p className="flex items-center justify-between">
              <span className="font-medium text-slate-700">{t('receipts.address', 'អាសយដ្ឋាន')}:</span>
              <span className="text-slate-800 text-right truncate max-w-[200px]">{order.customer_address || '—'}</span>
            </p>
          </div>
        </div>

        {/* Transaction & Payment Details Card */}
        <div className="border border-slate-300 rounded-lg p-2.5 space-y-1 bg-slate-50/40">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <p className="text-[9.5px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <CreditCard size={11} className="text-slate-500 shrink-0" />
              <span>{t('receipts.transactionDetails', 'ព័ត៌មានប្រតិបត្តិការ (Transaction & Payment)')}</span>
            </p>
            <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold uppercase">
              {order.payment_status || 'PAID'}
            </span>
          </div>

          <div className="space-y-0.5 text-[10px] text-slate-600 pt-0.5">
            <p className="flex items-center justify-between">
              <span className="font-medium text-slate-700">{t('receipts.paymentMethod', 'វិធីទូទាត់')}:</span>
              <span className="font-semibold text-slate-900">{paymentLabel}</span>
            </p>
            <p className="flex items-center justify-between">
              <span className="font-medium text-slate-700">{t('receipts.orderNumber', 'លេខបញ្ជាទិញ')}:</span>
              <span className="font-mono font-medium text-slate-900">{order.order_number}</span>
            </p>
            <p className="flex items-center justify-between">
              <span className="font-medium text-slate-700">{t('receipts.channel', 'ប្រភពលក់')}:</span>
              <span className="font-medium text-slate-900">{channelLabel}</span>
            </p>
            <p className="flex items-center justify-between">
              <span className="font-medium text-slate-700">{t('receipts.cashierStaff', 'បេឡាធិការ')}:</span>
              <span className="font-medium text-slate-900">Main Cashier</span>
            </p>
          </div>
        </div>
      </div>

      {/* ─── Ordered Items Breakdown Table ───────────────────────────────── */}
      <div className="my-2.5">
        <div className="flex items-center justify-between pb-1 border-b border-slate-300">
          <h3 className="font-bold text-[10.5px] uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <ShoppingBag size={11} className="text-slate-600 shrink-0" />
            <span>{t('receipts.orderedItemsBreakdown', 'បញ្ជីមុខទំនិញ (Ordered Items Breakdown)')}</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-600">
            {totalItemsCount} {t('receipts.itemsCount', 'មុខ')} ({totalUnits} {t('receipts.unitsSelected', 'ចំនួន')})
          </span>
        </div>

        <table className="w-full text-left text-xs border-collapse mt-1 border border-slate-300">
          <thead>
            <tr className="bg-slate-100 text-slate-800 text-[9.5px] font-bold uppercase tracking-wider border-b border-slate-300">
              <th className="py-1.5 px-2 text-center w-7 border-r border-slate-200">#</th>
              <th className="py-1.5 px-2.5 border-r border-slate-200">{t('receipts.productDescription', 'មុខទំនិញ (Product Description)')}</th>
              <th className="py-1.5 px-2 text-center w-16 border-r border-slate-200">{t('receipts.quantity', 'ចំនួន (Qty)')}</th>
              <th className="py-1.5 px-2.5 text-right w-24 border-r border-slate-200">{t('receipts.unitPrice', 'តម្លៃឯកតា (Price)')}</th>
              <th className="py-1.5 px-2 text-right w-20 border-r border-slate-200">{t('receipts.discount', 'បញ្ចុះតម្លៃ')}</th>
              <th className="py-1.5 px-2.5 text-right w-24">{t('receipts.lineTotal', 'សរុប (Total)')}</th>
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
                        {item.name || item.product_name || `Product #${item.product_id}`}
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

      {/* ─── Totals & Notes Section ───────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-3 my-2.5 pt-1">
        {/* Left: Notes & Operational Summary */}
        <div className="col-span-6 space-y-2">
          <div className="border border-slate-300 rounded-lg p-2 bg-slate-50/40 space-y-0.5">
            <p className="font-bold text-[9px] uppercase tracking-wider text-slate-700 flex items-center gap-1">
              <FileText size={10} className="text-slate-500 shrink-0" />
              <span>{t('receipts.notesTerms', 'កំណត់ចំណាំ (Notes / Terms)')}:</span>
            </p>
            <p className="text-[10px] text-slate-600 leading-relaxed pl-3.5">
              {order.customer_note || t('receipts.defaultReceiptNote', '* ទំនិញទិញហើយអាចប្តូរបានក្នុងរយៈពេល ៣ ថ្ងៃដោយភ្ជាប់ជាមួយវិក្កយបត្រនេះ (Please keep receipt for exchange within 3 days)')}
            </p>
          </div>

          <div className="border border-slate-200 rounded-lg p-2 bg-slate-50/30 text-slate-700 text-[10px] space-y-0.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">{t('receipts.totalItems', 'ចំនួនប្រភេទមុខទំនិញ')}:</span>
              <span className="font-mono font-bold text-slate-900">{totalItemsCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">{t('receipts.totalUnits', 'ចំនួនសរុបទំនិញ')}:</span>
              <span className="font-mono font-bold text-slate-900">{totalUnits}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">{t('receipts.paymentStatus', 'ស្ថានភាពទូទាត់')}:</span>
              <span className="font-mono font-bold text-emerald-700 uppercase">{order.payment_status || 'PAID'}</span>
            </div>
          </div>
        </div>

        {/* Right: Clean Financial Breakdown Card */}
        <div className="col-span-6 border border-slate-300 rounded-lg p-2.5 bg-slate-50/40 text-slate-800 space-y-1">
          <div className="flex justify-between items-center text-[10.5px]">
            <span className="text-slate-600">{t('receipts.subtotal', 'តម្លៃសរុបទំនិញ (Subtotal)')}:</span>
            <span className="font-mono font-medium text-slate-900">{subtotalDual.usdStr}</span>
          </div>

          {discountUsd > 0 && (
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="text-slate-600">{t('receipts.discount', 'បញ្ចុះតម្លៃ (Discount)')}:</span>
              <span className="font-mono font-medium text-rose-600">-{discountDual.usdStr}</span>
            </div>
          )}

          {shippingUsd > 0 && (
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="text-slate-600">{t('receipts.shipping', 'ថ្លៃដឹកជញ្ជូន (Shipping)')}:</span>
              <span className="font-mono font-medium text-slate-900">+{shippingDual.usdStr}</span>
            </div>
          )}

          <div className="pt-1.5 border-t border-slate-300 flex justify-between items-center">
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-900 tracking-wider block">
                {t('receipts.grandTotal', 'សរុបរួម (Grand Total)')}:
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
                {t('receipts.paidAmount', 'បានទូទាត់ (Paid)')}
              </span>
              <span className="font-mono font-bold text-emerald-700">
                {grandTotalDual.usdStr}
              </span>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="text-[8.5px] uppercase font-semibold text-slate-600 block">
                {t('receipts.balanceDue', 'នៅខ្វះ (Due)')}
              </span>
              <span className="font-mono font-bold text-slate-900">
                $0.00
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3-Party Signatures & Enterprise Footer ─────────────────────── */}
      <GlobalPrintFooter
        noticeText={`* ${t('receipts.receiptLegalNotice', 'វិក្កយបត្រនេះជាភស្តុតាងផ្លូវការនៃការទូទាត់ប្រាក់។ សូមរក្សាទុកដើម្បីផ្ទៀងផ្ទាត់ពេលមានបញ្ហា។ Official financial proof of transaction.')}`}
        signatures={[
          {
            titleLocalized: t('receipts.payerSignature', 'អតិថិជន / អ្នកទូទាត់'),
            titleEnglish: 'Customer / Payer',
            name: order.customer_name || 'អតិថិជនទូទៅ',
            role: 'Client / Buyer',
          },
          {
            titleLocalized: t('receipts.cashierSignature', 'អ្នកគិតលុយ / បេឡាធិការ'),
            titleEnglish: 'Cashier / Staff',
            name: 'Staff Member',
            role: 'Cashier / Accountant',
          },
          {
            titleLocalized: t('receipts.authorizedSignature', 'អ្នកអនុម័ត / ម្ចាស់ហាង'),
            titleEnglish: 'Manager / Store Owner',
            name: 'Store Manager',
            role: 'Authorized Signatory',
          },
        ]}
      />
    </div>
  );

  return (
    <GlobalPrintContainer
      isOpen={isOpen}
      onClose={onClose}
      modalTitle={t('receipts.receiptVoucherPreview', 'ការមើលវិក្កយបត្រផ្លូវការ (Official Receipt Voucher)')}
      documentSubtitle={`#${order.order_number || order.id} • ${order.customer_name || t('receipts.walkInCustomer', 'Walk-in Customer')}`}
      extraActions={
        <button
          type="button"
          disabled={isDownloadingPdf}
          onClick={handleDownloadPdf}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white border border-slate-300 hover:bg-slate-50 active:scale-95 rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-50 select-none"
        >
          <Download size={14} className={isDownloadingPdf ? 'animate-bounce' : ''} />
          <span>{isDownloadingPdf ? '...' : t('receipts.downloadPdf', 'ទាញយក PDF')}</span>
        </button>
      }
    >
      {voucherDocument}
    </GlobalPrintContainer>
  );
};

export default ReceiptPrintVoucher;
