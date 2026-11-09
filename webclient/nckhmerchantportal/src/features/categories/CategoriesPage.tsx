import React, { useEffect, useState, useMemo } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../i18n';
import toast from '../../utils/toast';
import { DataTableViewOptions, Breadcrumbs } from '../../components/common';
import { Category } from './category.types';
import { categoryService } from '../../services/categoryService';
import {
  CategoryTable,
  getCategoryEmoji,
  getCategoryDescription,
  localizeCategoryName,
} from './CategoryTable';
import { CategoryModal } from './CategoryModal';
import { CategoryHeaderActions } from './CategoryActions';

const RESTRO_DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: 'Pizza', slug: 'pizza', sort_order: 1 },
  { id: 2, name: 'Burgers', slug: 'burgers', sort_order: 2 },
  { id: 3, name: 'Salads', slug: 'salads', sort_order: 3 },
  { id: 4, name: 'Soups', slug: 'soups', sort_order: 4 },
  { id: 5, name: 'Desserts', slug: 'desserts', sort_order: 5 },
  { id: 6, name: 'Drinks', slug: 'drinks', sort_order: 6 },
];

export default function CategoriesPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isKhmer = language === 'kh';

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(true);

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    description: true,
    status: true,
  });

  const toggleColumn = (id: string) => {
    setVisibleColumns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmoji, setFormEmoji] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSortOrder, setFormSortOrder] = useState<number>(1);
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Load from API
  const loadCategories = () => {
    if (!user?.shop_id) {
      setCategories(RESTRO_DEFAULT_CATEGORIES);
      setLoading(false);
      return;
    }
    setLoading(true);
    categoryService
      .list(user.shop_id)
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setCategories(res);
        } else {
          setCategories(RESTRO_DEFAULT_CATEGORIES);
        }
      })
      .catch(() => {
        setCategories(RESTRO_DEFAULT_CATEGORIES);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, [user?.shop_id]);

  // Open Create
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormName('');
    setFormEmoji('');
    setFormDesc('');
    setFormSortOrder(categories.length + 1);
    setFormStatus('active');
    setIsModalOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormEmoji('');
    const cleanName = cat.name.replace(/^[\p{Emoji}\s]+/u, '');
    setFormName(localizeCategoryName(cleanName, isKhmer, false));
    setFormDesc(getCategoryDescription(cat.name, cat.description, t));
    setFormSortOrder(cat.sort_order || 1);
    setFormStatus((cat.status as 'active' | 'inactive') || 'active');
    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  // Submit Save
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error(
        t('categories.categoryNameRequired', t('restaurant.categoryNameRequired', 'Category name is required'))
      );
      return;
    }

    setIsSubmitting(true);
    const fullName = formName.trim();
    const payload = {
      shop_id: user?.shop_id || 1,
      name: fullName,
      slug: formName.trim().toLowerCase().replace(/\s+/g, '-'),
      sort_order: Number(formSortOrder) || 1,
    };

    try {
      if (editingCategory) {
        if (user?.shop_id) {
          await categoryService.update(editingCategory.id, payload).catch(() => {});
        }
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id ? { ...c, ...payload, id: editingCategory.id } : c
          )
        );
        toast.success(
          t('categories.categoryUpdated', t('restaurant.categoryUpdated', 'Category updated successfully!'))
        );
      } else {
        let createdId = Date.now();
        if (user?.shop_id) {
          const res = await categoryService.create(payload).catch(() => null);
          if (res?.id) createdId = res.id;
        }
        setCategories((prev) => [...prev, { ...payload, id: createdId }]);
        toast.success(
          t('categories.categoryCreated', t('restaurant.categoryCreated', 'Category created successfully!'))
        );
      }
      setIsModalOpen(false);
    } catch {
      toast.error(
        t('categories.categorySaveFailed', t('restaurant.categorySaveFailed', 'Failed to save category'))
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete
  const handleDeleteCategory = async (id: number, name: string) => {
    setOpenDropdownId(null);
    const localizedName = localizeCategoryName(name, isKhmer, true);
    if (
      !window.confirm(
        t(
          'categories.confirmDelete',
          t('restaurant.confirmDeleteCategory', `Are you sure you want to delete "${localizedName}"?`, {
            name: localizedName,
          }),
          { name: localizedName }
        )
      )
    )
      return;

    try {
      if (user?.shop_id) {
        await categoryService.delete(id).catch(() => {});
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success(
        t('categories.categoryDeleted', t('restaurant.categoryDeleted', 'Category deleted'))
      );
    } catch {
      toast.error(
        t('categories.categoryDeleteFailed', t('restaurant.categoryDeleteFailed', 'Failed to delete category'))
      );
    }
  };

  // Filtered & Sorted Data
  const filteredData = useMemo(() => {
    let list = categories.filter((c) => {
      const q = search.trim().toLowerCase();
      const localizedName = localizeCategoryName(c.name, isKhmer, false).toLowerCase();
      const rawName = (c.name || '').toLowerCase();
      const matchSearch =
        !q ||
        rawName.includes(q) ||
        localizedName.includes(q) ||
        (c.slug && c.slug.toLowerCase().includes(q)) ||
        getCategoryDescription(c.name, c.description, t).toLowerCase().includes(q);

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && (c.status || 'active') === 'active') ||
        (statusFilter === 'inactive' && c.status === 'inactive');

      return matchSearch && matchStatus;
    });

    list.sort((a, b) => {
      const orderA = a.sort_order ?? 0;
      const orderB = b.sort_order ?? 0;
      return sortAsc ? orderA - orderB : orderB - orderA;
    });

    return list;
  }, [categories, search, statusFilter, sortAsc, isKhmer, t]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <Breadcrumbs />
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('categories.title', t('restaurant.categories', 'Categories'))}
          </h1>
          <p className="text-xs text-slate-500">
            {t(
              'categories.subtitle',
              t('restaurant.categoriesSubtitle', 'Manage menu categories shown in the POS')
            )}
          </p>
        </div>

        <CategoryHeaderActions onAddCategory={handleOpenCreate} />
      </div>

      {/* SmartHR Employee Table Filter Bar */}
      <div className="flex flex-wrap items-center gap-2.5 p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-panel font-sans">
        {/* Search Input */}
        <div className="relative w-full sm:w-64 md:w-72">
          <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={t(
              'categories.searchCategories',
              t('restaurant.searchCategories', 'Search categories...')
            )}
            className="h-9 w-full pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
        </div>

        {/* Status Filter Dropdown */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 pl-3 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 appearance-none cursor-pointer focus:outline-none focus:border-orange-500 transition-all"
          >
            <option value="all">
              {t('categories.allStatuses', t('common.allStatuses', 'All Status'))}
            </option>
            <option value="active">
              {t('categories.active', t('common.active', 'Active'))}
            </option>
            <option value="inactive">
              {t('categories.inactive', t('common.inactive', 'Inactive'))}
            </option>
          </select>
          <ChevronDown className="size-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Apply Button */}
        <button
          type="button"
          onClick={() => {
            loadCategories();
            setCurrentPage(1);
          }}
          style={{
            backgroundColor: 'var(--btn-primary-hex, var(--primary-hex, #ec4899))',
          }}
          className="h-9 px-3.5 rounded-lg hover:brightness-90 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Check className="size-3.5 stroke-[2.5]" />
          <span>{t('buttons.apply', t('common.apply', 'Apply'))}</span>
        </button>

        {/* Reset Button */}
        <button
          type="button"
          onClick={() => {
            setSearch('');
            setStatusFilter('all');
            setCurrentPage(1);
          }}
          className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {t('buttons.reset', t('common.reset', 'Reset'))}
        </button>

        {/* Column Visibility Options (Placed at the very far right) */}
        <div className="ml-auto">
          <DataTableViewOptions
            columns={[
              {
                id: 'description',
                label: t('categories.description', t('restaurant.description', 'Description')),
                visible: Boolean(visibleColumns.description),
              },
              {
                id: 'status',
                label: t('categories.status', t('restaurant.status', 'Status')),
                visible: Boolean(visibleColumns.status),
              },
            ]}
            onToggleColumn={toggleColumn}
          />
        </div>
      </div>

      {/* Categories Table Component */}
      <CategoryTable
        categories={paginatedData}
        totalEntries={filteredData.length}
        loading={loading}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        sortAsc={sortAsc}
        visibleColumns={visibleColumns}
        openDropdownId={openDropdownId}
        onSortToggle={() => setSortAsc(!sortAsc)}
        onDropdownToggle={(id) => setOpenDropdownId(openDropdownId === id ? null : id)}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteCategory}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
      />

      {/* Category Modal Component */}
      <CategoryModal
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        editingCategory={editingCategory}
        formName={formName}
        formEmoji={formEmoji}
        formDesc={formDesc}
        formSortOrder={formSortOrder}
        formStatus={formStatus}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveCategory}
        setFormName={setFormName}
        setFormEmoji={setFormEmoji}
        setFormDesc={setFormDesc}
        setFormSortOrder={setFormSortOrder}
        setFormStatus={setFormStatus}
      />
    </div>
  );
}
