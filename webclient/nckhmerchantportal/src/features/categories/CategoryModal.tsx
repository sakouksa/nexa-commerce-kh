import React from 'react';
import { Tag } from 'lucide-react';
import { Category } from './category.types';
import { useLanguage } from '../../i18n';
import { Modal, ModalFooter } from '../../components/ui';

export interface CategoryModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  editingCategory: Category | null;
  formName: string;
  formEmoji?: string;
  formDesc: string;
  formSortOrder: number;
  formStatus: 'active' | 'inactive';
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  setFormName: (val: string) => void;
  setFormEmoji?: (val: string) => void;
  setFormDesc: (val: string) => void;
  setFormSortOrder: (val: number) => void;
  setFormStatus: (val: 'active' | 'inactive') => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  isSubmitting,
  editingCategory,
  formName,
  formDesc,
  formSortOrder,
  formStatus,
  onClose,
  onSubmit,
  setFormName,
  setFormDesc,
  setFormSortOrder,
  setFormStatus,
}) => {
  const { t } = useLanguage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      icon={<Tag className="size-5" />}
      iconVariant="indigo"
      title={
        editingCategory
          ? t('categories.editCategory', t('restaurant.editCategory', 'Edit Category'))
          : t('categories.createCategory', t('restaurant.createCategory', 'Create Category'))
      }
      subtitle={
        editingCategory
          ? t('categories.editCategoryDesc', t('restaurant.editCategoryDesc', 'Modify category details for this shop'))
          : t('categories.createCategoryDesc', t('restaurant.createCategoryDesc', 'Add a new category to group your menu items'))
      }
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          isEdit={!!editingCategory}
          cancelLabel={t('common.cancel', 'Cancel')}
          submitLabel={
            editingCategory
              ? t('common.saveChanges', t('buttons.saveChanges', 'Save Changes'))
              : t('categories.create', t('common.create', 'Create Category'))
          }
        />
      }
    >
      <form id="category-modal-form" onSubmit={onSubmit} className="p-6 space-y-4">
        {/* Category Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t('categories.categoryName', t('restaurant.categoryName', 'Category Name'))}{' '}
            <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder={t('categories.namePlaceholder', t('restaurant.categoryNamePlaceholder', 'e.g. Pizza, Burgers, Cold Drinks'))}
            required
            className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 px-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t('categories.description', t('restaurant.description', 'Description'))}
          </label>
          <textarea
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
            placeholder={t('categories.descPlaceholder', t('restaurant.categoryDescriptionPlaceholder', 'Brief description of items in this category'))}
            rows={2}
            className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
          />
        </div>

        {/* Sort Order & Status */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('categories.sortOrder', t('restaurant.sortOrder', 'Sort Order (#)'))}
            </label>
            <input
              type="number"
              min={1}
              value={formSortOrder}
              onChange={(e) => setFormSortOrder(Number(e.target.value))}
              className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 px-3.5 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('categories.status', t('restaurant.status', 'Status'))}
            </label>
            <div className="flex items-center justify-between h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/50">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  formStatus === 'active'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {formStatus === 'active'
                  ? t('common.active', 'Active')
                  : t('common.inactive', 'Inactive')}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={formStatus === 'active'}
                onClick={() =>
                  setFormStatus(formStatus === 'active' ? 'inactive' : 'active')
                }
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                  formStatus === 'active'
                    ? 'bg-indigo-600'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block size-3.5 transform rounded-full bg-white transition-transform ${
                    formStatus === 'active' ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

// Aliased export to prevent breakage if referenced as CategoryForm
export const CategoryForm = CategoryModal;
export default CategoryModal;
