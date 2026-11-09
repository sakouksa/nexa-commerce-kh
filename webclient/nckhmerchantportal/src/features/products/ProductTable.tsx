import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown, ChevronLeft, ChevronRight, Package, ZoomIn, ExternalLink } from 'lucide-react';
import { Product } from './product.types';
import { ProductRowActions } from './ProductActions';
import { useLanguage } from '../../i18n';
import { GlobalFormat } from '../../utils/GlobalFormat';
import { fullUrl } from '../../api';
import { localizeCategoryName } from '../categories/category.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Pagination } from '../../components/common/Pagination';

interface ProductTableProps {
  products: Product[];
  totalEntries: number;
  loading: boolean;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  sortAsc: boolean;
  sortField: 'index' | 'name' | 'price' | 'stock';
  visibleColumns: Record<string, boolean>;
  openDropdownId: number | null;
  onSort: (field: 'index' | 'name' | 'price' | 'stock') => void;
  onDropdownToggle: (id: number) => void;
  onDelete: (product: Product) => void;
  onPageChange: (page: number) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  totalEntries,
  loading,
  currentPage,
  pageSize,
  totalPages,
  sortAsc,
  sortField,
  visibleColumns,
  openDropdownId,
  onSort,
  onDropdownToggle,
  onDelete,
  onPageChange,
}) => {
  const { t, language } = useLanguage();
  const isKhmer = language === 'kh';
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    title: string;
    category?: string;
    price?: number;
  } | null>(null);

  return (
    <div className="rounded-xl border border-[#dfe7df] dark:border-[#2a4245] bg-white dark:bg-[#142629] shadow-panel overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#dfe7df] dark:border-[#2a4245] bg-[#f7f8f2] dark:bg-[#17282b] text-[#71817e] dark:text-[#9fb0ac] font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-12">#</th>
              <th className="py-3 px-4 min-w-[220px]">
                <button
                  type="button"
                  onClick={() => onSort('name')}
                  className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <span>{t('products.product', 'Product')}</span>
                  <ArrowUpDown className="size-3" />
                </button>
              </th>
              {visibleColumns.category && (
                <th className="py-3 px-4 min-w-[130px]">{t('products.category', 'Category')}</th>
              )}
              {visibleColumns.price && (
                <th className="py-3 px-4 w-28">
                  <button
                    type="button"
                    onClick={() => onSort('price')}
                    className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <span>{t('products.price', 'Price')}</span>
                    <ArrowUpDown className="size-3" />
                  </button>
                </th>
              )}
              {visibleColumns.stock && (
                <th className="py-3 px-4 w-28">
                  <button
                    type="button"
                    onClick={() => onSort('stock')}
                    className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <span>{t('products.stock', 'Stock')}</span>
                    <ArrowUpDown className="size-3" />
                  </button>
                </th>
              )}
              {visibleColumns.status && (
                <th className="py-3 px-4 w-24">{t('products.status', 'Status')}</th>
              )}
              <th className="py-3 px-4 w-16 text-right">{t('common.actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <div className="size-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <span>{t('common.loading', 'Loading products...')}</span>
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="size-8 text-slate-300 stroke-[1.5]" />
                    <span>{t('products.noProductsFound', 'No products found')}</span>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((p, idx) => {
                const rowNum = (currentPage - 1) * pageSize + idx + 1;
                const thumb = p.images?.[0] || p.image;
                const isOutOfStock = p.quantity <= 0;
                const isLowStock = p.quantity > 0 && p.quantity <= 5;
                const isActive = p.is_active !== false;

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{rowNum}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {thumb ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewImage({
                                url: fullUrl(thumb),
                                title: p.name,
                                category: p.category_name,
                                price: p.sale_price ?? p.price,
                              })
                            }
                            className="size-10 rounded-lg overflow-hidden border border-slate-200/60 dark:border-slate-700/60 shrink-0 relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40 bg-slate-100 dark:bg-slate-800"
                            title={isKhmer ? 'ចុចដើម្បីមើលរូបភាពធំ' : 'Click to preview image'}
                          >
                            <img
                              src={fullUrl(thumb)}
                              alt={p.name}
                              className="size-full object-cover transition-transform duration-200 group-hover:scale-110"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/default-product.svg';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ZoomIn className="size-3.5 text-white drop-shadow-xs" />
                            </div>
                          </button>
                        ) : (
                          <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 overflow-hidden flex items-center justify-center shrink-0">
                            <Package className="size-4 text-slate-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            to={`/products/${p.id}/edit`}
                            className="font-semibold text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 truncate block"
                          >
                            {p.name}
                          </Link>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                            {p.sku && <span>SKU: {p.sku}</span>}
                            {p.barcode && <span>• Barcode: {p.barcode}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    {visibleColumns.category && (
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {p.category_name ? (
                          localizeCategoryName(p.category_name, isKhmer, true)
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">
                            {t('products.uncategorized', t('categories.uncategorized', 'Uncategorized'))}
                          </span>
                        )}
                      </td>
                    )}
                    {visibleColumns.price && (
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white font-mono">
                          {GlobalFormat.currency(p.sale_price ?? p.price)}
                        </div>
                        {p.sale_price && p.sale_price < p.price && (
                          <div className="text-[10px] text-slate-400 line-through font-mono">
                            {GlobalFormat.currency(p.price)}
                          </div>
                        )}
                      </td>
                    )}
                    {visibleColumns.stock && (
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-medium ${
                            isOutOfStock
                              ? 'text-rose-600 dark:text-rose-400'
                              : isLowStock
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span>{p.quantity}</span>
                          {isOutOfStock && <span className="text-[10px]">(Out)</span>}
                          {isLowStock && <span className="text-[10px]">(Low)</span>}
                        </span>
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                        </span>
                      </td>
                    )}
                    <td className="py-3 px-4 text-right">
                      <ProductRowActions
                        product={p}
                        isOpen={openDropdownId === p.id}
                        onToggle={() => onDropdownToggle(p.id)}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer (SmartHR Employee Table Style) */}
      {!loading && totalEntries > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalEntries}
          pageSize={pageSize}
          onPageChange={onPageChange}
          itemLabel="products"
        />
      )}

      {/* Product Image Preview Dialog - Modern Shadcn UI */}
      <Dialog open={!!previewImage} onOpenChange={(open) => { if (!open) setPreviewImage(null); }}>
        <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
          <DialogHeader className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800/80 pr-12">
            <div className="flex items-center gap-2 flex-wrap">
              <DialogTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {previewImage?.title}
              </DialogTitle>
              {previewImage?.category && (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium bg-slate-50 dark:bg-slate-800">
                  {localizeCategoryName(previewImage.category, isKhmer, true)}
                </Badge>
              )}
            </div>
            {previewImage?.price !== undefined && (
              <DialogDescription className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                ${Number(previewImage.price).toFixed(2)}
              </DialogDescription>
            )}
          </DialogHeader>

          {previewImage && (
            <div className="p-4 flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/40 min-h-[300px] max-h-[70vh] overflow-hidden">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[60vh] max-w-full w-auto h-auto object-contain rounded-xl shadow-xs border border-slate-200/60 dark:border-slate-800"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-product.svg';
                }}
              />
            </div>
          )}

          <DialogFooter className="p-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex sm:items-center sm:justify-between gap-2">
            <a
              href={previewImage?.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium px-2 py-1"
            >
              <ExternalLink className="size-3.5" />
              <span>{isKhmer ? 'បើករូបភាពទំហំដើម ↗' : 'Open original image ↗'}</span>
            </a>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewImage(null)}
              className="h-8 text-xs font-medium"
            >
              {t('buttons.close', isKhmer ? 'បិទ' : 'Close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductTable;
