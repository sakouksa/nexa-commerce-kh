import React from 'react';
import { FiShoppingCart, FiTrash2, FiTag, FiChevronDown } from 'react-icons/fi';
import { Utensils, ShoppingBag, Bike, AlertTriangle } from 'lucide-react';
import { CartItem, OrderType } from './types';
import { DEFAULT_TABLES } from './posConstants';
import { POSCartItemRow } from './POSCartItemRow';
import { formatUSD, formatKHR } from './posUtils';
import { useLanguage } from '../../i18n';

interface POSCartSidebarProps {
  cart: CartItem[];
  orderType: OrderType;
  setOrderType: (t: OrderType) => void;
  selectedTable: string;
  setSelectedTable: (t: string) => void;
  customerName: string;
  setCustomerName: (n: string) => void;
  couponCode: string;
  setCouponCode: (c: string) => void;
  couponDiscount: number;
  onApplyCoupon: () => void;
  subtotal: number;
  tax: number;
  total: number;
  hasStockError: boolean;
  isKhmer: boolean;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onProceedPayment: () => void;
}

export const POSCartSidebar: React.FC<POSCartSidebarProps> = ({
  cart,
  orderType,
  setOrderType,
  selectedTable,
  setSelectedTable,
  customerName,
  setCustomerName,
  couponCode,
  setCouponCode,
  couponDiscount,
  onApplyCoupon,
  subtotal,
  tax,
  total,
  hasStockError,
  isKhmer,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedPayment,
}) => {
  const { t } = useLanguage();
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <aside className="w-80 sm:w-96 xl:w-[380px] 2xl:w-[410px] shrink-0 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between overflow-hidden">
      <div>
        {/* Ticket Header: New Order (Count) + Red Trash */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              {t('pos.newOrder', 'New Order')}
            </span>
            {cart.length > 0 && (
              <span className="size-5 rounded-full bg-[#ea580c] text-white text-xs font-bold flex items-center justify-center animate-in zoom-in-50">
                {totalItemCount}
              </span>
            )}
          </div>

          {cart.length > 0 && (
            <button
              type="button"
              onClick={onClearCart}
              className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1.5 rounded-lg transition-colors cursor-pointer"
              title={t('pos.clearCart', 'Clear Cart')}
            >
              <FiTrash2 className="size-4" />
            </button>
          )}
        </div>

        {/* Order Type Toggle: Dine-in, Takeaway, Delivery */}
        <div className="p-1 mx-4 mt-3 bg-slate-100 dark:bg-slate-800 rounded-2xl grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => setOrderType('dine-in')}
            className={`py-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              orderType === 'dine-in'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Utensils className="size-3.5" />
            <span>{t('pos.dineIn', 'Dine-in')}</span>
          </button>

          <button
            type="button"
            onClick={() => setOrderType('takeaway')}
            className={`py-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              orderType === 'takeaway'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="size-3.5" />
            <span>{t('pos.takeaway', 'Takeaway')}</span>
          </button>

          <button
            type="button"
            onClick={() => setOrderType('delivery')}
            className={`py-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              orderType === 'delivery'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Bike className="size-3.5" />
            <span>{t('pos.delivery', 'Delivery')}</span>
          </button>
        </div>

        {/* Dynamic Table / Customer Field */}
        {orderType === 'dine-in' ? (
          <div className="px-4 mt-3">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
              {t('pos.table', 'Table')}
            </span>
            <div className="relative">
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600"
              >
                {DEFAULT_TABLES.map((tbl) => (
                  <option key={tbl} value={tbl}>
                    {tbl}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        ) : (
          <div className="px-4 mt-3">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
              {t('pos.customerNamePhone', 'Customer Name / Phone')}
            </span>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t('pos.walkInPlaceholder', 'Walk-in Customer...')}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-300"
            />
          </div>
        )}

        {/* Cart Items List */}
        <div className="px-4 mt-3 space-y-2.5 max-h-[38vh] overflow-y-auto no-scrollbar">
          {cart.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-2">
                <FiShoppingCart className="size-5" />
              </div>
              <p className="font-medium text-xs text-slate-700 dark:text-slate-300">
                {t('pos.emptyCart', 'Cart is empty')}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {t('pos.emptyCartDesc', 'Tap items on the left to add them here')}
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <POSCartItemRow
                key={item.id}
                item={item}
                isKhmer={isKhmer}
                onUpdateQuantity={onUpdateQuantity}
                onRemoveItem={onRemoveItem}
              />
            ))
          )}
        </div>
      </div>

      {/* Bottom Area: Coupon + Totals + Proceed to Payment */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
        {/* Coupon Code Input */}
        <div className="mx-4 bg-slate-100/70 dark:bg-slate-800/60 rounded-xl p-1.5 flex items-center justify-between border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-2 min-w-0 flex-1 pl-1">
            <FiTag className="size-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder={t('pos.couponCode', 'COUPON CODE')}
              className="w-full bg-transparent text-xs uppercase placeholder:text-slate-400 font-mono tracking-wider focus:outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
          <button
            type="button"
            onClick={onApplyCoupon}
            className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold px-3 py-1 text-slate-800 dark:text-slate-200 shadow-2xs hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
          >
            {t('pos.apply', 'Apply')}
          </button>
        </div>

        {/* Totals Breakdown */}
        <div className="mx-4 space-y-1 text-xs">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>{t('pos.subtotal', 'Sub total')}</span>
            <span>{formatUSD(subtotal)}</span>
          </div>

          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>{t('pos.tax', 'TAX (5%)')}</span>
            <span>{formatUSD(tax)}</span>
          </div>

          {couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>{t('pos.discount', 'Discount')}</span>
              <span>-{formatUSD(couponDiscount)}</span>
            </div>
          )}

          <div className="flex justify-between items-baseline text-base font-bold text-slate-900 dark:text-slate-100 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col">
              <span>{t('pos.total', 'Total')}</span>
              <span className="text-[11px] font-normal text-slate-400">
                ≈ {formatKHR(total)}
              </span>
            </div>
            <span className="text-lg font-black text-[#ea580c]">{formatUSD(total)}</span>
          </div>
        </div>

        {/* Proceed to Payment Button with Insufficient Stock Blocking */}
        <button
          type="button"
          onClick={onProceedPayment}
          disabled={cart.length === 0 || hasStockError}
          className={`mx-4 mb-4 w-[calc(100%-32px)] text-white font-semibold py-3 rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-2 ${
            hasStockError
              ? 'bg-red-600/90 hover:bg-red-700 cursor-not-allowed shadow-none'
              : 'bg-[#ea580c] hover:bg-[#c2410c] active:scale-[0.99] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
        >
          {hasStockError ? (
            <>
              <AlertTriangle className="size-4 shrink-0" />
              <span>
                {t('pos.insufficientStockError', 'Cannot Checkout (Insufficient Stock)')}
              </span>
            </>
          ) : (
            <span>{t('pos.proceedPayment', 'Proceed to Payment')}</span>
          )}
        </button>
      </div>
    </aside>
  );
};
