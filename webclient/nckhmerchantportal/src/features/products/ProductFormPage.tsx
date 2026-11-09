import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from '../../utils/toast';
import {
  ArrowLeft,
  Loader2,
  Package,
  Trash2,
  Upload,
  Sparkles,
} from 'lucide-react';
import {
  createProduct,
  getProduct,
  listCategories,
  updateProduct,
  uploadImages,
  fullUrl,
} from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { localizeCategoryName } from '../categories/category.types';
import AttributeBuilder from './AttributeBuilder';
import VariationBuilder from './VariationBuilder';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { productSchema, type ProductFormValues } from '@/lib/validations';
import HttpErrorPage from '@/components/shared/HttpErrorPage';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isKhmer = language === 'kh';

  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [customAttributes, setCustomAttributes] = useState<any[]>([]);
  const [variations, setVariations] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [loadErrorStatus, setLoadErrorStatus] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const isEdit = !!id;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      sale_price: '',
      quantity: 0,
      category_id: '',
      featured: false,
      status: 'active',
    },
    mode: 'onBlur',
  });

  const { isSubmitting } = form.formState;

  // Watch fields for real-time live preview
  const watchedName = form.watch('name');
  const watchedPrice = form.watch('price');
  const watchedSalePrice = form.watch('sale_price');
  const watchedCategoryId = form.watch('category_id');
  const watchedFeatured = form.watch('featured');
  const watchedStatus = form.watch('status');

  const selectedCategoryName = useMemo(() => {
    return categories.find((c) => String(c.id) === String(watchedCategoryId))?.name;
  }, [categories, watchedCategoryId]);

  const discountPercent = useMemo(() => {
    const reg = Number(watchedPrice) || 0;
    const sale = Number(watchedSalePrice) || 0;
    if (reg > 0 && sale > 0 && sale < reg) {
      return Math.round(((reg - sale) / reg) * 100);
    }
    return 0;
  }, [watchedPrice, watchedSalePrice]);

  useEffect(() => {
    if (user?.shop_id) {
      listCategories(user.shop_id).then(setCategories).catch(() => {});
    }

    if (isEdit) {
      setInitialLoading(true);
      getProduct(id)
        .then((p) => {
          form.reset({
            name: p.name || '',
            description: p.description || '',
            price: Number(p.price) || 0,
            sale_price:
              p.sale_price !== null && p.sale_price !== undefined ? Number(p.sale_price) : '',
            quantity: Number(p.quantity) || 0,
            category_id: p.category_id ? String(p.category_id) : '',
            featured: Boolean(p.featured),
            status: p.status === 'hidden' ? 'hidden' : 'active',
          });
          setImages(p.images || []);
          setCustomAttributes(p.custom_attributes || []);
          setVariations(p.variations || []);
        })
        .catch((err) => {
          const status = err?.status || err?.response?.status || 500;
          setLoadErrorStatus(status);
          toast.error(err?.message || err?.detail || 'Failed to load product details');
        })
        .finally(() => {
          setInitialLoading(false);
        });
    }
  }, [id, isEdit, user?.shop_id, form]);

  const handleUploadFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      const res = await uploadImages(files);
      setImages((prev) => [...prev, ...res.urls]);
      toast.success(t('products.toast.uploadSuccess', 'Images uploaded successfully'));
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('products.toast.uploadFailed', 'Image upload failed'));
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleUploadFiles(files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
      handleUploadFiles(files);
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const setPrimaryImage = (idx: number) => {
    if (idx === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const selected = copy.splice(idx, 1)[0];
      return [selected, ...copy];
    });
    toast.success(t('products.toast.setCoverSuccess', 'Set as primary cover image'));
  };

  const onSubmit = async (values: ProductFormValues) => {
    const payload = {
      shop_id: user?.shop_id,
      name: values.name.trim(),
      description: values.description?.trim() || '',
      price: Number(values.price),
      sale_price:
        values.sale_price === '' || values.sale_price === null || values.sale_price === undefined
          ? null
          : Number(values.sale_price),
      quantity: Number(values.quantity),
      category_id:
        values.category_id === '' || values.category_id === null || values.category_id === undefined
          ? null
          : Number(values.category_id),
      images: images,
      custom_attributes: customAttributes.filter((a) => a.name?.trim()),
      variations: variations.map((v) => ({
        ...v,
        price: Number(v.price) || 0,
        quantity: Number(v.quantity) || 0,
      })),
      featured: values.featured,
      status: values.status,
    };

    try {
      if (isEdit) {
        await updateProduct(id!, payload);
        toast.success(t('products.toast.updateSuccess', 'Product updated successfully!'));
      } else {
        await createProduct(payload);
        toast.success(t('products.toast.createSuccess', 'Product created successfully!'));
      }
      navigate('/products');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('products.toast.saveFailed', 'Failed to save product. Please try again.'));
    }
  };

  if (initialLoading) {
    return (
      <div className="py-24">
        <LoadingSpinner text={t('products.loadingInfo', 'Loading product information...')} size="lg" />
      </div>
    );
  }

  if (loadErrorStatus) {
    const code = loadErrorStatus === 404 ? 404 : loadErrorStatus === 403 ? 403 : 500;
    return (
      <div className="py-12">
        <HttpErrorPage
          code={code}
          fullPage={false}
          title={code === 404 ? (isKhmer ? 'រកមិនឃើញផលិតផលនេះទេ' : 'Product Not Found') : undefined}
          description={
            code === 404
              ? (isKhmer
                  ? 'ផលិតផលដែលអ្នកកំពុងកែសម្រួលមិនមាន ឬត្រូវបានលុបចេញហើយ។'
                  : 'The product you are trying to edit does not exist or may have been deleted.')
              : undefined
          }
          onRetry={() => {
            setLoadErrorStatus(null);
            setInitialLoading(true);
            if (id) {
              getProduct(id)
                .then((p) => {
                  form.reset({
                    name: p.name || '',
                    description: p.description || '',
                    price: Number(p.price) || 0,
                    sale_price:
                      p.sale_price !== null && p.sale_price !== undefined ? Number(p.sale_price) : '',
                    quantity: Number(p.quantity) || 0,
                    category_id: p.category_id ? String(p.category_id) : '',
                    featured: Boolean(p.featured),
                    status: p.status === 'hidden' ? 'hidden' : 'active',
                  });
                  setImages(p.images || []);
                  setCustomAttributes(p.custom_attributes || []);
                  setVariations(p.variations || []);
                })
                .catch((err) => {
                  const status = err?.status || err?.response?.status || 500;
                  setLoadErrorStatus(status);
                })
                .finally(() => setInitialLoading(false));
            }
          }}
          showRetryButton={code !== 404}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-20">
      <Breadcrumbs />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Clean Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isEdit
                    ? t('products.editTitle', 'Edit Product')
                    : t('products.createTitle', 'Add New Product')}
                </h1>
                <Badge
                  variant={watchedStatus === 'active' ? 'success' : 'secondary'}
                  className="text-[10px] uppercase font-bold py-0.5"
                >
                  {watchedStatus === 'active'
                    ? t('products.active', 'Active')
                    : t('products.hidden', 'Hidden')}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {isEdit
                  ? t('products.editSubtitle', 'Update catalog item details, pricing, media, and variants.')
                  : t('products.createSubtitle', 'Create a new item in your inventory with pricing and variants.')}
              </p>
            </div>

            {/* Back Button on Right Side */}
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/products')}
              className="h-9 px-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs self-start sm:self-center"
            >
              <ArrowLeft className="size-3.5 text-slate-400" />
              <span>{t('products.backToProducts', 'Back to Products')}</span>
            </Button>
          </div>

          {/* 2-Column Shadcn Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Main Form Content (8 Columns) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Card 1: Basic Information */}
              <Card className="rounded-xl border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('products.generalInfo', 'General Information')}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {t('products.generalInfoDesc', 'Provide essential product details visible across your customer storefront and POS.')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {t('products.productNameRequired', 'Product Name *')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('products.productNamePlaceholder', 'e.g. Classic Cotton T-Shirt')}
                            className="text-xs h-10 rounded-lg"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-[11px] text-slate-400">
                          {t('products.productNameHelp', 'A descriptive name customers see in search, menus, and printed receipts.')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {t('products.description', 'Description')}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            placeholder={t('products.descriptionPlaceholder', 'Describe key features, materials, ingredients, or sizing...')}
                            className="text-xs rounded-lg resize-y"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Card 2: Product Images & Media Dropzone */}
              <Card className="rounded-xl border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                      {t('products.media', 'Product Media')}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {t('products.mediaDesc', 'Upload high-resolution images to showcase your product in store.')}
                    </CardDescription>
                  </div>

                  <label className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-lg cursor-pointer transition-colors shadow-2xs">
                    <span>{uploading ? t('products.uploading', 'Uploading...') : t('products.browseFiles', 'Browse Files')}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </label>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Dropzone Box */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                      isDragOver
                        ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50'
                    }`}
                  >
                    <div className="size-10 rounded-full bg-white dark:bg-slate-800 shadow-2xs border border-slate-200/80 dark:border-slate-700 mx-auto flex items-center justify-center mb-2.5 text-slate-400">
                      <Upload className="size-5 text-orange-600" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t('products.dragDropText', 'Drag and drop image files here, or browse from computer')}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {t('products.supportedFormats', 'Supports PNG, JPG, WebP up to 5MB each.')}
                    </p>
                  </div>

                  {/* Gallery Grid */}
                  {images.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{images.length} {t('products.imagesAttached', 'images attached')}</span>
                        <span className="text-[11px] text-slate-400">
                          {t('products.coverNotice', '* First image is used as primary cover')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {images.map((img, i) => (
                          <div
                            key={i}
                            className={`group relative rounded-xl overflow-hidden border aspect-square bg-slate-100 dark:bg-slate-800 transition-all ${
                              i === 0
                                ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-xs'
                                : 'border-slate-200/80 dark:border-slate-800'
                            }`}
                          >
                            <img
                              src={fullUrl(img)}
                              alt={`Product ${i + 1}`}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />

                            {/* Cover Badge */}
                            {i === 0 && (
                              <div
                                style={{
                                  backgroundColor:
                                    'var(--btn-primary-hex, var(--primary-hex, #ec4899))',
                                }}
                                className="absolute top-1.5 left-1.5 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-md shadow-xs"
                              >
                                {t('products.cover', 'Cover')}
                              </div>
                            )}

                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              {i !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => setPrimaryImage(i)}
                                  title={t('products.setCover', 'Set as Cover')}
                                  className="p-1.5 bg-white text-slate-800 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors shadow-md cursor-pointer"
                                >
                                  <Sparkles className="size-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(i)}
                                title={t('products.deleteImage', 'Delete image')}
                                className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors shadow-md cursor-pointer"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Card 3: Pricing & Inventory */}
              <Card className="rounded-xl border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('products.pricingAndStock', 'Pricing & Inventory')}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {t('products.pricingAndStockDesc', 'Set standard pricing, promotional discount price, and current stock quantity.')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Regular Price */}
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {t('products.regularPrice', 'Regular Price ($) *')}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                                $
                              </span>
                              <Input
                                type="number"
                                step="0.01"
                                className="pl-7 text-xs h-10 rounded-lg font-semibold"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Sale Price */}
                    <FormField
                      control={form.control}
                      name="sale_price"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {t('products.salePrice', 'Sale Price ($)')}
                            </FormLabel>
                            {discountPercent > 0 && (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md">
                                -{discountPercent}%
                              </span>
                            )}
                          </div>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                                $
                              </span>
                              <Input
                                type="number"
                                step="0.01"
                                className="pl-7 text-xs h-10 rounded-lg text-emerald-600 dark:text-emerald-400 font-semibold"
                                placeholder={t('products.optional', 'Optional')}
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </div>
                          </FormControl>
                          <FormDescription className="text-[11px] text-slate-400">
                            {t('products.salePriceHelp', 'Leave empty if no promotion')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Stock Quantity */}
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {t('products.stockQuantity', 'Stock Quantity *')}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                step="1"
                                placeholder="0"
                                className="text-xs h-10 rounded-lg font-bold"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </div>
                          </FormControl>
                          <FormDescription className="text-[11px] text-slate-400">
                            {Number(field.value) <= 0 ? (
                              <span className="text-rose-500 font-semibold">
                                {t('products.outOfStock', '● Out of stock')}
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-semibold">
                                {t('products.inStock', '● Available')}
                              </span>
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Card 4: Variants & Multi-option SKUs */}
              <Card className="rounded-xl border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('products.variants', 'Variants & Options')}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {t('products.variantsDesc', 'Configure multi-option SKUs such as sizes, colors, flavors, or toppings.')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VariationBuilder
                    variations={variations}
                    onChange={setVariations}
                  />
                </CardContent>
              </Card>

              {/* Card 5: Custom Specifications */}
              <Card className="rounded-xl border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('products.specifications', 'Specifications & Attributes')}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {t('products.specificationsDesc', 'Add custom key-value specifications like Brand, Material, Origin, or Care notes.')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AttributeBuilder
                    attributes={customAttributes}
                    onChange={setCustomAttributes}
                  />
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN: Sidebar Configuration & Live Preview (4 Columns) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-18">
              {/* Sidebar Card 1: Status & Visibility */}
              <Card className="rounded-xl border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs uppercase tracking-wider font-bold text-slate-500">
                    {t('products.statusAndVisibility', 'Status & Visibility')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status Select */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {t('products.productStatus', 'Product Status')}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="text-xs h-10 rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">
                              <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-emerald-500" />
                                <span>{t('products.active', 'Active')}</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="hidden">
                              <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-slate-400" />
                                <span>{t('products.hidden', 'Hidden')}</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-[11px] text-slate-400">
                          {watchedStatus === 'active'
                            ? t('products.statusActiveDesc', 'Item is live and orderable on Storefront and POS.')
                            : t('products.statusHiddenDesc', 'Item is hidden from customers.')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  {/* Featured Product Toggle with Shadcn Switch */}
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-xl bg-slate-50/70 dark:bg-slate-800/50 p-3 border border-slate-200/60 dark:border-slate-700/60 space-y-0">
                        <div className="space-y-0.5 pr-2">
                          <FormLabel className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                            {t('products.featured', 'Featured Product')}
                          </FormLabel>
                          <FormDescription className="text-[11px] text-slate-400">
                            {t('products.featuredDesc', 'Pin prominently on customer storefront')}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Sidebar Card 2: Categorization */}
              <Card className="rounded-xl border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs uppercase tracking-wider font-bold text-slate-500">
                      {t('products.categorization', 'Product Category')}
                    </CardTitle>
                    <Link
                      to="/categories"
                      className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 hover:underline"
                    >
                      {t('products.newCategory', '+ Manage')}
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {t('products.category', 'Category')}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ? String(field.value) : 'none'}
                        >
                          <FormControl>
                            <SelectTrigger className="text-xs h-10 rounded-lg">
                              <SelectValue placeholder={t('products.selectCategory', 'Select category')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">
                              {t('products.noCategory', 'No category')}
                            </SelectItem>
                            {categories.map((c) => (
                              <SelectItem key={c.id} value={String(c.id)}>
                                {localizeCategoryName(c.name, isKhmer, true)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Sidebar Card 3: Real-Time Live Storefront Preview */}
              <Card className="rounded-xl border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
                <CardHeader className="pb-3 bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs uppercase tracking-wider font-bold text-slate-500">
                      {t('products.storefrontPreview', 'Storefront Preview')}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] py-0 font-medium">
                      {t('products.live', 'Live')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                    {/* Preview Image */}
                    <div className="relative aspect-4/3 bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                      {images[0] ? (
                        <img
                          src={fullUrl(images[0])}
                          alt="Product preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 p-4">
                          <Package className="size-8 stroke-1 text-slate-300 mb-1" />
                          <span className="text-[10px]">
                            {t('products.noImage', 'No image')}
                          </span>
                        </div>
                      )}

                      {/* Featured Badge */}
                      {watchedFeatured && (
                        <div className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                          <Sparkles className="size-2.5" />
                          <span>{t('products.featuredBadge', 'Featured')}</span>
                        </div>
                      )}

                      {/* Discount Badge */}
                      {discountPercent > 0 && (
                        <div className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                          -{discountPercent}%
                        </div>
                      )}
                    </div>

                    {/* Preview Info */}
                    <div className="p-3 space-y-1.5">
                      <div className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                        {selectedCategoryName
                          ? localizeCategoryName(selectedCategoryName, isKhmer, true)
                          : t('products.generalCategory', 'General')}
                      </div>

                      <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                        {watchedName?.trim() || t('products.sampleTitle', 'Sample Product Title...')}
                      </p>

                      <div className="flex items-center gap-2 pt-0.5">
                        {watchedSalePrice && Number(watchedSalePrice) > 0 ? (
                          <>
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              ${Number(watchedSalePrice).toFixed(2)}
                            </span>
                            <span className="text-xs text-slate-400 line-through">
                              ${Number(watchedPrice || 0).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            ${Number(watchedPrice || 0).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center mt-3">
                    {t('products.previewFooterNote', 'This is an accurate live rendering of how customers will see this item.')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom Action Footer - Clean & Convenient */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200/80 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/products')}
              disabled={isSubmitting}
              className="h-9 px-4 rounded-lg text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs cursor-pointer"
            >
              {t('products.cancel', 'Cancel')}
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: 'var(--btn-primary-hex, var(--primary-hex, #ec4899))',
              }}
              className="h-9 px-5 rounded-lg hover:brightness-90 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
              <span>
                {isSubmitting
                  ? t('products.saving', 'Saving...')
                  : isEdit
                  ? t('products.saveChanges', 'Save Changes')
                  : t('products.createProduct', 'Create Product')}
              </span>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
