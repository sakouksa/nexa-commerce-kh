import React from 'react';
import { MoreHorizontal, Edit2, Trash2, Plus } from 'lucide-react';
import { Category } from './category.types';
import { useLanguage } from '../../i18n';

interface CategoryRowActionsProps {
  category: Category;
  isOpen: boolean;
  onToggle: () => void;
  onEdit: (category: Category) => void;
  onDelete: (id: number, name: string) => void;
}

export const CategoryRowActions: React.FC<CategoryRowActionsProps> = ({
  category,
  isOpen,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const { t } = useLanguage();

  return (
    <div className="relative flex items-center justify-end gap-1">
      {/* Quick Edit Icon Button */}
      <button
        type="button"
        onClick={() => onEdit(category)}
        title={t('categories.edit', t('buttons.edit', 'Edit'))}
        className="size-7.5 rounded-lg flex items-center justify-center text-[#71817e] hover:text-[#ea580c] hover:bg-[#fff7ed] dark:hover:bg-[#1a3437] transition-colors cursor-pointer"
      >
        <Edit2 className="size-3.5" />
      </button>

      {/* More / Delete Menu */}
      <div className="relative">
        <button
          type="button"
          onClick={onToggle}
          title={t('common.more', 'More Options')}
          className="size-7.5 rounded-lg flex items-center justify-center text-[#71817e] hover:text-[#16292e] dark:hover:text-[#e7ede9] hover:bg-[#eef2ee] dark:hover:bg-[#1f373b] transition-colors cursor-pointer"
        >
          <MoreHorizontal className="size-3.5" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-8 z-30 w-36 py-1 bg-white dark:bg-[#16292e] rounded-xl shadow-lg border border-[#dfe7df] dark:border-[#2a4245] animate-in fade-in zoom-in-95 duration-100">
            <button
              type="button"
              onClick={() => {
                onToggle();
                onEdit(category);
              }}
              className="w-full px-3 py-1.5 text-xs text-left text-[#16292e] dark:text-[#e7ede9] hover:bg-[#f7f8f2] dark:hover:bg-[#1d3539] flex items-center gap-2 cursor-pointer"
            >
              <Edit2 className="size-3.5 text-[#71817e]" />
              <span>{t('categories.edit', t('buttons.edit', 'Edit'))}</span>
            </button>
            <div className="my-1 border-t border-[#dfe7df] dark:border-[#2a4245]" />
            <button
              type="button"
              onClick={() => {
                onToggle();
                onDelete(category.id, category.name);
              }}
              className="w-full px-3 py-1.5 text-xs text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              <span>{t('categories.delete', t('buttons.delete', 'Delete'))}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface CategoryHeaderActionsProps {
  onAddCategory: () => void;
}

export const CategoryHeaderActions: React.FC<CategoryHeaderActionsProps> = ({
  onAddCategory,
}) => {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={onAddCategory}
      style={{
        backgroundColor: 'var(--btn-primary-hex, var(--primary-hex, #ec4899))',
      }}
      className="h-9 px-3.5 rounded-lg hover:brightness-90 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:shadow active:scale-[0.98]"
    >
      <Plus className="size-3.5 stroke-[2.5]" />
      <span>{t('categories.addCategory', t('restaurant.addCategory', 'Add Category'))}</span>
    </button>
  );
};

export default CategoryRowActions;
