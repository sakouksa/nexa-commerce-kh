import React, { useEffect, useState, useMemo } from 'react';
import { Package, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../i18n';
import toast from '../../utils/toast';
import { Product } from './product.types';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Category, localizeCategoryName } from '../categories/category.types';
import { ProductFilters } from './ProductFilters';
import { ProductTable } from './ProductTable';
import { ProductHeaderActions } from './ProductActions';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

export default function ProductsPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isKhmer = language === 'kh';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Controls
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    category: true,
    price: true,
    stock: true,
    status: true,
  });

  const toggleColumn = (id: string) => {
    setVisibleColumns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Sorting
  const [sortAsc, setSortAsc] = useState(true);
  const [sortField, setSortField] = useState<'index' | 'name' | 'price' | 'stock'>('index');

  // Actions Dropdown
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Load products & categories
  const loadData = () => {
    if (!user?.shop_id) return;
    setLoading(true);

    Promise.all([
      productService.list(user.shop_id).catch(() => []),
      categoryService.list(user.shop_id).catch(() => []),
    ])
      .then(([productsRes, categoriesRes]) => {
        if (Array.isArray(productsRes)) setProducts(productsRes);
        if (Array.isArray(categoriesRes)) setCategories(categoriesRes);
      })
      .catch((err) =>
        toast.error(
          err?.response?.data?.detail ||
            t('products.toast.loadListFailed', 'Failed to load products')
        )
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [user?.shop_id]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.action-dropdown-container')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Delete product
  const remove = async (product: Product) => {
    setOpenDropdownId(null);
    if (
      !window.confirm(
        t('products.confirmDelete', `Are you sure you want to delete "${product.name}"?`, {
          name: product.name,
        })
      )
    )
      return;
    try {
      await productService.delete(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.success(t('products.toast.deleteSuccess', 'Product deleted successfully'));
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
          t('products.toast.deleteFailed', 'Failed to delete product')
      );
    }
  };

  // Reset to first page whenever search/filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, categoryFilter, pageSize]);

  // Sorting helper
  const handleSort = (field: 'index' | 'name' | 'price' | 'stock') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.category_name && p.category_name.toLowerCase().includes(q)) ||
        (p.category_name && localizeCategoryName(p.category_name, isKhmer, false).toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && p.is_active !== false) ||
        (statusFilter === 'inactive' && p.is_active === false);

      const matchCategory =
        categoryFilter === 'all' || String(p.category_id) === String(categoryFilter);

      return matchSearch && matchStatus && matchCategory;
    });

    list.sort((a, b) => {
      if (sortField === 'name') {
        return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      if (sortField === 'price') {
        const priceA = a.sale_price ?? a.price;
        const priceB = b.sale_price ?? b.price;
        return sortAsc ? priceA - priceB : priceB - priceA;
      }
      if (sortField === 'stock') {
        return sortAsc ? a.quantity - b.quantity : b.quantity - a.quantity;
      }
      return sortAsc ? a.id - b.id : b.id - a.id;
    });

    return list;
  }, [products, search, statusFilter, categoryFilter, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // KPI Metrics Summary
  const totalProducts = products.length;
  const activeProducts = useMemo(
    () => products.filter((p) => p.is_active !== false && (p.quantity ?? 0) > 0).length,
    [products]
  );
  const lowStockProducts = useMemo(
    () => products.filter((p) => (p.quantity ?? 0) <= 5).length,
    [products]
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <Breadcrumbs />
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('products.title', 'Products')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('products.subtitle', 'Manage catalog, inventory count, pricing, and variations')}
          </p>
        </div>

        <ProductHeaderActions />
      </div>

      {/* KPI Stat Cards (Matching Customers Page Clean Design) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Total Products */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center gap-3">
          <div className="size-9 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Package className="size-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">
              {t('products.totalProducts', 'Total Products')}
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {totalProducts}
            </div>
          </div>
        </div>

        {/* Card 2: Active & In Stock */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center gap-3">
          <div className="size-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="size-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">
              {t('products.inStock', 'Active / In Stock')}
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {activeProducts}
            </div>
          </div>
        </div>

        {/* Card 3: Low & Out of Stock */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center gap-3">
          <div className="size-9 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="size-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">
              {t('products.lowStock', 'Low / Out of Stock')}
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {lowStockProducts}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <ProductFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
        pageSize={pageSize}
        setPageSize={setPageSize}
        setCurrentPage={setCurrentPage}
        visibleColumns={visibleColumns}
        toggleColumn={toggleColumn}
      />

      {/* Product Table Component */}
      <ProductTable
        products={paginatedProducts}
        totalEntries={filteredProducts.length}
        loading={loading}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        sortAsc={sortAsc}
        sortField={sortField}
        visibleColumns={visibleColumns}
        openDropdownId={openDropdownId}
        onSort={handleSort}
        onDropdownToggle={(id) => setOpenDropdownId(openDropdownId === id ? null : id)}
        onDelete={remove}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
