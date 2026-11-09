import React from 'react';
import { POSProduct } from './types';
import { POSProductCard } from './POSProductCard';
import { FiInbox } from 'react-icons/fi';
import { useLanguage } from '../../i18n';

interface POSProductGridProps {
  products: POSProduct[];
  activeCardId: string;
  isKhmer: boolean;
  isLoading: boolean;
  getCartCount: (id: string) => number;
  onAddToCart: (product: POSProduct) => void;
}

export const POSProductGrid: React.FC<POSProductGridProps> = ({
  products,
  activeCardId,
  isKhmer,
  isLoading,
  getCartCount,
  onAddToCart,
}) => {
  const { t } = useLanguage();

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar p-3">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse p-3 flex flex-col justify-between"
              >
                <div className="w-full h-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                <div className="space-y-1.5">
                  <div className="w-16 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 text-center p-6">
            <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <FiInbox className="size-7 text-slate-400" />
            </div>
            <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
              {t('pos.noItemsFound', 'No items found')}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {t('pos.noItemsDesc', 'Try searching with a different term or select another category.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
            {products.map((product) => (
              <POSProductCard
                key={product.id}
                product={product}
                countInCart={getCartCount(product.id)}
                isActive={activeCardId === product.id}
                isKhmer={isKhmer}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer of Left Card: Total items count */}
      <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2 text-xs text-slate-400 dark:text-slate-500 shrink-0">
        {t('pos.itemsCount', { count: products.length, defaultValue: `${products.length} items` })}
      </div>
    </>
  );
};
