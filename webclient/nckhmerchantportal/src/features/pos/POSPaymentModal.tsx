import React, { useState } from 'react';
import { FiDollarSign, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { formatUSD, formatKHR } from './posUtils';
import { useLanguage } from '../../i18n';
import { Modal } from '../../components/ui';

interface POSPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  selectedTable: string;
  isKhmer?: boolean;
  isSubmitting: boolean;
  onCompleteSale: (method: 'cash' | 'khqr', cashReceived?: number) => void;
}

export const POSPaymentModal: React.FC<POSPaymentModalProps> = ({
  isOpen,
  onClose,
  total,
  selectedTable,
  isSubmitting,
  onCompleteSale,
}) => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'cash' | 'khqr'>('cash');
  const [cashReceived, setCashReceived] = useState<string>(total.toFixed(2));

  if (!isOpen) return null;

  const numCashReceived = Number(cashReceived || 0);
  const changeDue = Math.max(0, numCashReceived - total);
  const isCashSufficient = numCashReceived >= total;

  const quickAmounts = [
    total,
    Math.ceil(total / 5) * 5 || 5,
    Math.ceil(total / 10) * 10 || 10,
    20,
    50,
    100,
  ].filter((v, i, a) => v >= total && a.indexOf(v) === i);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={t('pos.paymentCheckout', 'Payment Checkout')}
      subtitle={`${selectedTable} · ${t('pos.totalDue', 'Total Due')}: ${formatUSD(total)} (${formatKHR(total)})`}
      icon={<FiDollarSign className="size-5" />}
      iconVariant="emerald"
    >
      <div className="p-5 space-y-4">
        {/* Payment Tabs: Cash vs Bakong KHQR */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setTab('cash')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'cash'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FiDollarSign className="size-4" />
            <span>{t('pos.cash', 'Cash')}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('khqr')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'khqr'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Bakong KHQR</span>
          </button>
        </div>

        {tab === 'cash' ? (
          <>
            {/* Cash Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('pos.cashReceived', 'Cash Received ($ USD)')}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-base font-bold">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-lg font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Quick cash amounts */}
            <div className="flex flex-wrap gap-1.5">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setCashReceived(amt.toFixed(2))}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  ${amt.toFixed(2)}
                </button>
              ))}
            </div>

            {/* Change Due Display */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-medium">
                  {t('pos.changeDue', 'Change Due')}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({formatKHR(changeDue)})
                </span>
              </div>
              <span
                className={`font-mono text-lg font-bold ${
                  changeDue > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500'
                }`}
              >
                {formatUSD(changeDue)}
              </span>
            </div>

            {/* Complete Sale Button */}
            <button
              type="button"
              onClick={() => onCompleteSale('cash', numCashReceived)}
              disabled={!isCashSufficient || isSubmitting}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <FiRefreshCw className="size-4 animate-spin" />
              ) : (
                <FiCheck className="size-4" />
              )}
              <span>{t('pos.completeSale', 'Complete Cash Sale')}</span>
            </button>
          </>
        ) : (
          <>
            {/* KHQR Tab */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center flex flex-col items-center">
              <div className="size-44 bg-white p-2 rounded-2xl border-2 border-rose-500 shadow-md flex items-center justify-center mb-3">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    `BAKONG_KHQR_MERCHANT_${total}_USD`
                  )}`}
                  alt="Bakong KHQR"
                  className="size-full object-contain"
                />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-xs text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                  {t('pos.scanKHQRDesc', 'Scan with any Banking App (ABA, Wing, Acleda...)')}
                </p>
                <p className="text-[11px] text-slate-500">
                  {t('pos.scanKHQRSub', 'Scan to pay via Bakong KHQR network')}
                </p>
              </div>
            </div>

            {/* Complete KHQR Button */}
            <button
              type="button"
              onClick={() => onCompleteSale('khqr')}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <FiRefreshCw className="size-4 animate-spin" />
              ) : (
                <FiCheck className="size-4" />
              )}
              <span>
                {t('pos.confirmKHQR', 'Confirm KHQR Payment')}
              </span>
            </button>
          </>
        )}
      </div>
    </Modal>
  );
};

export default POSPaymentModal;
