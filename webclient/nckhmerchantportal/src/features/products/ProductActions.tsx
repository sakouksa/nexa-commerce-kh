import React from 'react';
import { MoreHorizontal, Edit2, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from './product.types';
import { useLanguage } from '../../i18n';

interface ProductRowActionsProps {
  product: Product;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: (product: Product) => void;
}

export const ProductRowActions: React.FC<ProductRowActionsProps> = ({
  product,
  isOpen,
  onToggle,
  onDelete,
}) => {
  const { t } = useLanguage();

  return (
    <div className="relative flex justify-end action-dropdown-container">
      <button
        type="button"
        onClick={onToggle}
        className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
      >
        <MoreHorizontal className="size-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-7 z-20 w-36 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-100">
          <Link
            to={`/products/${product.id}/edit`}
            className="w-full px-3 py-1.5 text-xs text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
          >
            <Edit2 className="size-3.5 text-slate-400" />
            <span>{t('common.edit', 'Edit')}</span>
          </Link>
          <button
            type="button"
            onClick={() => onDelete(product)}
            className="w-full px-3 py-1.5 text-xs text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
          >
            <Trash2 className="size-3.5" />
            <span>{t('common.delete', 'Delete')}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export const ProductHeaderActions: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Link
      to="/products/new"
      style={{
        backgroundColor: 'var(--btn-primary-hex, var(--primary-hex, #ec4899))',
      }}
      className="h-9 px-4 rounded-lg hover:brightness-90 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:shadow active:scale-[0.98]"
    >
      <Plus className="size-3.5" />
      <span>{t('products.addProduct', 'Add Product')}</span>
    </Link>
  );
};

export default ProductRowActions;
