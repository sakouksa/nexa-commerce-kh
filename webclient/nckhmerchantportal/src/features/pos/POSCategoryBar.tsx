import React from 'react';
import { getLocalizedText } from './posUtils';
import { useLanguage } from '../../i18n';

interface POSCategoryBarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  isKhmer: boolean;
}

export const POSCategoryBar: React.FC<POSCategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  isKhmer,
}) => {
  const { t } = useLanguage();

  return (
    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
      <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-[3px] inline-flex items-center gap-1 h-8 my-px overflow-x-auto no-scrollbar max-w-full">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const displayLabel = cat === 'All' ? t('pos.allCategories', 'All') : getLocalizedText(cat, isKhmer);

          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-0.5 rounded-2xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {displayLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
};
