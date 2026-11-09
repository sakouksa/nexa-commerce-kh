import React from 'react';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { AlertCircle } from 'lucide-react';
import { CartItem } from './types';
import { SquareDot } from './posIcons';
import { getLocalizedText, formatUSD } from './posUtils';
import { useLanguage } from '../../i18n';

interface POSCartItemRowProps {
  item: CartItem;
  isKhmer: boolean;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
}

export const POSCartItemRow: React.FC<POSCartItemRowProps> = ({
  item,
  isKhmer,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const { t } = useLanguage();
  const displayName = getLocalizedText(item, isKhmer);
  const isOverStock =
    typeof item.stock === 'number' && (item.stock <= 0 || item.quantity > item.stock);

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-900 shadow-2xs space-y-2 select-none">
      {/* Item row header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Thumbnail */}
          <div className="size-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
            <img
              src={item.image || '/images/default-product.svg'}
              alt={displayName}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/default-product.svg';
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <SquareDot color={item.dietary === 'Veg' ? '#16a34a' : '#dc2626'} />
              <p
                className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate"
                title={displayName}
              >
                {displayName}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <p className="text-[10px] text-slate-400">
                {formatUSD(item.price)} {t('pos.each', 'each')}
              </p>
              {typeof item.stock === 'number' && (
                <span className="text-[10px] text-slate-400">
                  ({t('pos.stockQty', { count: item.stock, defaultValue: `Stock ${item.stock}` })})
                </span>
              )}
            </div>

            {/* Insufficient Stock Warning Alert */}
            {isOverStock && (
              <p className="text-[10px] text-red-500 font-semibold flex items-center gap-1 ml-4 mt-0.5 animate-pulse">
                <AlertCircle className="size-3 shrink-0" />
                <span>
                  {t('pos.insufficientItemStock', {
                    count: item.stock,
                    defaultValue: `Insufficient! Only ${item.stock} in stock`,
                  })}
                </span>
              </p>
            )}
          </div>
        </div>

        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 shrink-0">
          {formatUSD(item.price * item.quantity)}
        </span>
      </div>

      {/* Stepper & Trash row */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
        {/* Pill Stepper: [-]  qty  [+] */}
        <div className="rounded-full border border-slate-200 dark:border-slate-700 px-2 py-0.5 inline-flex items-center gap-2.5 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, -1)}
            className="size-4 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <FiMinus className="size-2.5" />
          </button>
          <span className="text-xs font-medium text-slate-900 dark:text-slate-100 min-w-3 text-center">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, 1)}
            className="size-4 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <FiPlus className="size-2.5" />
          </button>
        </div>

        {/* Red Trash Icon */}
        <button
          type="button"
          onClick={() => onRemoveItem(item.id)}
          className="text-rose-500 hover:text-rose-700 p-1 transition-colors cursor-pointer"
          title={t('pos.remove', 'Remove')}
        >
          <FiTrash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
};
