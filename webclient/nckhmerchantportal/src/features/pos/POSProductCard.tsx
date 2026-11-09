import React from 'react';
import { POSProduct } from './types';
import { SquareDot } from './posIcons';
import { getLocalizedText, formatUSD } from './posUtils';
import { useLanguage } from '../../i18n';

interface POSProductCardProps {
  product: POSProduct;
  countInCart: number;
  isActive: boolean;
  isKhmer: boolean;
  onAddToCart: (product: POSProduct) => void;
}

export const POSProductCard: React.FC<POSProductCardProps> = ({
  product,
  countInCart,
  isActive,
  isKhmer,
  onAddToCart,
}) => {
  const { t } = useLanguage();
  const isOutOfStock = typeof product.stock === 'number' && product.stock <= 0;
  const isLowStock = typeof product.stock === 'number' && product.stock > 0 && product.stock <= 5;
  const displayName = getLocalizedText(product, isKhmer);

  const dietaryColor =
    product.dietary === 'Veg'
      ? '#16a34a'
      : product.dietary === 'Egg'
      ? '#d97706'
      : '#dc2626';

  const dietaryLabel =
    product.dietary === 'Veg'
      ? t('pos.veg', 'Veg')
      : product.dietary === 'Egg'
      ? t('pos.egg', 'Egg')
      : t('pos.nonVeg', 'Non-Veg');

  return (
    <div
      onClick={() => {
        if (!isOutOfStock) onAddToCart(product);
      }}
      className={`relative rounded-2xl bg-white dark:bg-slate-900 p-2.5 sm:p-3 flex flex-col justify-between transition-all duration-150 overflow-hidden select-none ${
        isOutOfStock
          ? 'opacity-60 cursor-not-allowed border-dashed border-red-300 dark:border-red-900/60'
          : isActive
          ? 'border-2 border-[#ea580c] shadow-sm cursor-pointer'
          : 'border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs cursor-pointer'
      }`}
    >
      {/* Badge count on top-left of image */}
      {countInCart > 0 && (
        <span className="absolute top-2 left-2 size-5 rounded-full bg-[#ea580c] text-white text-[11px] font-bold flex items-center justify-center shadow-sm z-10 animate-in zoom-in-50">
          {countInCart}
        </span>
      )}

      {/* Stock Out or Low Stock Badge on top-right */}
      {isOutOfStock ? (
        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-red-600/90 text-white text-[9px] font-bold shadow-xs z-10">
          {t('pos.outOfStock', 'Out of Stock')}
        </span>
      ) : isLowStock ? (
        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-amber-500/90 text-white text-[9px] font-bold shadow-xs z-10">
          {t('pos.stockQty', { count: product.stock, defaultValue: `Stock: ${product.stock}` })}
        </span>
      ) : null}

      {/* Clean Food Image on white background */}
      <div className="h-24 sm:h-28 w-full flex items-center justify-center overflow-hidden mb-2">
        <img
          src={product.image || '/images/default-product.svg'}
          alt={displayName}
          className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/images/default-product.svg';
          }}
        />
      </div>

      {/* Dietary badge & Stock info */}
      <div className="mb-1 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-[10px] text-slate-600 dark:text-slate-400 font-medium">
          <SquareDot color={dietaryColor} />
          <span>{dietaryLabel}</span>
        </span>

        {typeof product.stock === 'number' && product.stock > 5 && (
          <span className="text-[10px] text-slate-400 font-medium">
            {t('pos.qty', { count: product.stock, defaultValue: `Qty ${product.stock}` })}
          </span>
        )}
      </div>

      {/* Product Name (Clean localized name!) */}
      <h4
        className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate leading-snug"
        title={displayName}
      >
        {displayName}
      </h4>

      {/* Price & Action */}
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs font-bold text-[#ea580c]">
          {formatUSD(product.price)}
        </span>

        {/* Orange circular + button */}
        {isActive && !isOutOfStock && (
          <button
            type="button"
            className="size-5 rounded-full bg-[#ea580c] text-white flex items-center justify-center text-xs font-bold shadow-xs hover:scale-110 transition-transform"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
};
