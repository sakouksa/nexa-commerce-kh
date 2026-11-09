import React, { useEffect, useState, useMemo } from 'react';
import usePageTab from '@/hooks/usePageTab';
import toast from '../../utils/toast';
import {
  Store,
  Clock,
  Receipt,
  Palette,
  Share2,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Sparkles,
  Phone,
  MapPin,
  Smartphone,
  Save,
  RefreshCw,
  UtensilsCrossed,
  ShoppingBag,
  Truck,
  Globe,
  MessageCircle,
  Wifi,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { changePassword, getShopDetail, updateShop, uploadImage, fullUrl } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import AppearanceSettings from './AppearanceSettings';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const COLOR_PRESETS = [
  { name: 'Royal Indigo', primary: '#6366f1', secondary: '#ec4899', class: 'bg-indigo-500' },
  { name: 'Emerald Fresh', primary: '#10b981', secondary: '#06b6d4', class: 'bg-emerald-500' },
  { name: 'Sunset Amber', primary: '#f59e0b', secondary: '#ef4444', class: 'bg-amber-500' },
  { name: 'Ocean Cyan', primary: '#0ea5e9', secondary: '#6366f1', class: 'bg-sky-500' },
  { name: 'Rose Berry', primary: '#f43f5e', secondary: '#8b5cf6', class: 'bg-rose-500' },
  { name: 'Modern Slate', primary: '#0f172a', secondary: '#475569', class: 'bg-slate-900' },
];

const RAW_BUSINESS_CATEGORIES = [
  { id: 'cafe', defaultLabel: 'Cafe & Coffee Shop' },
  { id: 'restaurant', defaultLabel: 'Restaurant & Eatery' },
  { id: 'retail', defaultLabel: 'Retail & Grocery' },
  { id: 'bakery', defaultLabel: 'Bakery & Pastry' },
  { id: 'fashion', defaultLabel: 'Fashion & Apparel' },
  { id: 'electronics', defaultLabel: 'Electronics & Tech' },
  { id: 'cosmetics', defaultLabel: 'Health & Beauty' },
  { id: 'other', defaultLabel: 'General / Other' },
];

const DAYS_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (Default Modern)' },
  { value: 'Kantumruy Pro', label: 'Kantumruy Pro (Khmer Modern)' },
  { value: 'Battambang', label: 'Battambang (Khmer Classic)' },
  { value: 'Poppins', label: 'Poppins (Geometric)' },
  { value: 'Roboto', label: 'Roboto (Clean)' },
  { value: 'Montserrat', label: 'Montserrat (Bold)' },
  { value: 'Nunito', label: 'Nunito (Friendly)' },
];

const VALID_SETTINGS_TABS = ['general', 'operations', 'pos', 'appearance', 'theme', 'social', 'security'] as const;
type SettingsTab = typeof VALID_SETTINGS_TABS[number];

export default function ShopSettings() {
  const { user } = useAuth();
  const { t, isKhmer } = useLanguage();
  const [activeTab, setActiveTab] = usePageTab<SettingsTab>({
    paramKey: 'tab',
    defaultTab: 'general',
    validTabs: VALID_SETTINGS_TABS,
    transform: (raw) => {
      const lower = raw.toLowerCase() as SettingsTab;
      return VALID_SETTINGS_TABS.includes(lower) ? lower : 'general';
    },
    storageKey: 'merchant_shop_settings_tab',
  });
  const [shop, setShop] = useState<any>(null);
  const [initialShopState, setInitialShopState] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [previewMode, setPreviewMode] = useState<'storefront' | 'receipt'>('storefront');

  // Password state
  const [pw, setPw] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwBusy, setPwBusy] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });

  useEffect(() => {
    if (!user?.shop_id) return;
    getShopDetail(user.shop_id)
      .then((data) => {
        const sanitized = {
          ...data,
          theme: {
            primary: '#6366f1',
            secondary: '#ec4899',
            font_family: 'Inter',
            exchange_rate_khr: 4100,
            tax_percentage: 0,
            service_charge: 0,
            receipt_header: 'Welcome to our store',
            receipt_footer: 'Thank you for your visit!',
            wifi_name: '',
            wifi_password: '',
            show_khqr_on_receipt: true,
            show_cashier: true,
            open_for_orders: true,
            maintenance_message: '',
            business_category: 'retail',
            order_channels: {
              dine_in: true,
              takeaway: true,
              delivery: true,
            },
            business_hours: {
              monday: { is_open: true, open: '08:00', close: '21:00' },
              tuesday: { is_open: true, open: '08:00', close: '21:00' },
              wednesday: { is_open: true, open: '08:00', close: '21:00' },
              thursday: { is_open: true, open: '08:00', close: '21:00' },
              friday: { is_open: true, open: '08:00', close: '21:00' },
              saturday: { is_open: true, open: '08:00', close: '22:00' },
              sunday: { is_open: true, open: '08:00', close: '22:00' },
            },
            ...(data.theme || {}),
          },
          social_media: {
            telegram: '',
            facebook: '',
            tiktok: '',
            instagram: '',
            whatsapp: '',
            youtube: '',
            google_maps: '',
            ...(data.social_media || {}),
          },
          slideshow: Array.isArray(data.slideshow) ? data.slideshow : [],
          status: data.status || 'active',
          currency: data.currency || 'USD',
        };
        setShop(sanitized);
        setInitialShopState(JSON.stringify(sanitized));
      })
      .catch(() => {
        toast.error(t('settings.shop.toast.loadFailed', 'Failed to load shop details'));
      })
      .finally(() => setLoading(false));
  }, [user?.shop_id, t]);

  const hasUnsavedChanges = useMemo(() => {
    if (!shop || !initialShopState) return false;
    return JSON.stringify(shop) !== initialShopState;
  }, [shop, initialShopState]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">
          {t('settings.shop.saving', 'Loading...')}
        </p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border/80">
        <Store className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-semibold">{t('shops.notFound', 'Shop Not Found')}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('settings.shop.toast.loadFailed', 'Unable to load information for this shop.')}
        </p>
      </div>
    );
  }

  const setField = (field: string) => (e: any) => {
    const val = e?.target ? e.target.value : e;
    setShop({ ...shop, [field]: val });
  };

  const setThemeField = (field: string, val: any) => {
    setShop({
      ...shop,
      theme: {
        ...(shop.theme || {}),
        [field]: val,
      },
    });
  };

  const setSocialField = (platform: string, val: string) => {
    setShop({
      ...shop,
      social_media: {
        ...(shop.social_media || {}),
        [platform]: val,
      },
    });
  };

  const setBusinessHour = (day: string, field: 'is_open' | 'open' | 'close', val: any) => {
    const currentHours = shop.theme?.business_hours || {};
    const dayConfig = currentHours[day] || { is_open: true, open: '08:00', close: '21:00' };

    setThemeField('business_hours', {
      ...currentHours,
      [day]: {
        ...dayConfig,
        [field]: val,
      },
    });
  };

  const setOrderChannel = (channel: 'dine_in' | 'takeaway' | 'delivery', val: boolean) => {
    const currentChannels = shop.theme?.order_channels || { dine_in: true, takeaway: true, delivery: true };
    setThemeField('order_channels', {
      ...currentChannels,
      [channel]: val,
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadImage(file);
      setShop({ ...shop, [field]: res.url });
      toast.success(
        field === 'logo'
          ? t('settings.shop.toast.logoUploaded', 'Shop logo uploaded!')
          : t('settings.shop.toast.bannerUploaded', 'Store banner uploaded!')
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('settings.shop.toast.uploadFailed', 'Upload failed'));
    }
  };

  const handleSlideUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? (Array.from(e.target.files) as File[]) : [];
    if (files.length === 0) return;
    const urls: string[] = [];
    try {
      for (const f of files) {
        const res = await uploadImage(f);
        urls.push(res.url);
      }
      setShop({ ...shop, slideshow: [...(shop.slideshow || []), ...urls] });
      toast.success(t('settings.shop.toast.slidesUploaded', 'Slideshow image(s) uploaded'));
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('settings.shop.toast.uploadFailed', 'Slideshow upload failed'));
    }
  };

  const removeSlide = (idx: number) => {
    setShop({ ...shop, slideshow: (shop.slideshow || []).filter((_: any, i: number) => i !== idx) });
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateShop(user.shop_id, {
        shop_name: shop.shop_name,
        logo: shop.logo,
        banner: shop.banner,
        bio: shop.bio,
        description: shop.description,
        slideshow: shop.slideshow || [],
        social_media: shop.social_media || {},
        theme: shop.theme || {},
        contact: shop.contact,
        currency: shop.currency,
        status: shop.status || 'active',
      });
      setInitialShopState(JSON.stringify(shop));
      toast.success(t('settings.shop.toast.saved', 'Shop settings saved successfully!'));
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('settings.shop.toast.saveFailed', 'Failed to save settings'));
    } finally {
      setSaving(false);
    }
  };

  const copyStorefrontLink = () => {
    if (!shop.username) return;
    const url = `${window.location.origin}/${shop.username}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success(t('settings.shop.toast.linkCopied', 'Storefront link copied!'));
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw.current_password || !pw.new_password || !pw.confirm_password) {
      toast.error(t('settings.shop.toast.fillPassword', 'Please fill in all password fields'));
      return;
    }
    if (pw.new_password !== pw.confirm_password) {
      toast.error(t('settings.shop.toast.passwordMismatch', 'New passwords do not match'));
      return;
    }
    if (pw.new_password.length < 6) {
      toast.error(t('settings.shop.toast.passwordMinLength', 'Password must be at least 6 characters'));
      return;
    }
    setPwBusy(true);
    try {
      await changePassword({ current_password: pw.current_password, new_password: pw.new_password });
      toast.success(t('settings.shop.toast.passwordUpdated', 'Password updated successfully!'));
      setPw({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('settings.shop.toast.passwordFailed', 'Failed to change password'));
    } finally {
      setPwBusy(false);
    }
  };

  const themePrimary = shop.theme?.primary || '#6366f1';
  const exchangeRate = Number(shop.theme?.exchange_rate_khr) || 4100;
  const isOpenForOrders = shop.theme?.open_for_orders !== false && shop.status === 'active';
  const currentCategoryLabel = RAW_BUSINESS_CATEGORIES.find((c) => c.id === (shop.theme?.business_category || 'retail'))?.defaultLabel || 'Retail';

  return (
    <div className="w-full space-y-6 pb-24">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs />

      {/* 1. Header Area with Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t('settings.shop.title', 'Shop Settings')}
            </h1>
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-[11px] font-medium bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400">
                {isKhmer ? 'មានការផ្លាស់ប្តូរមិនទាន់រក្សាទុក' : 'Unsaved changes'}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {t('settings.shop.subtitle', 'Configure your storefront identity, operational hours, POS receipts, and theme preferences.')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/${shop.username}`, '_blank')}
            className="gap-2 h-9 text-xs font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{t('settings.shop.liveStorefront', 'Live Storefront')}</span>
          </Button>

          <Button
            onClick={save}
            disabled={saving}
            className="gap-2 h-9 min-w-[135px] text-xs font-semibold shadow-xs"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{t('settings.shop.saving', 'Saving...')}</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{t('settings.shop.saveSettings', 'Save Settings')}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 2. Store Identity Hero Card (Modern SaaS Banner) */}
      <Card className="overflow-hidden border border-border/80 shadow-xs bg-card">
        <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left: Avatar, Name, Badges & Store URL */}
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            <div className="relative group shrink-0">
              <Avatar className="w-14 h-14 rounded-2xl border-2 border-border shadow-xs object-cover bg-muted">
                <AvatarImage src={shop.logo ? fullUrl(shop.logo) : ''} alt={shop.shop_name} />
                <AvatarFallback className="rounded-2xl font-bold text-lg bg-primary/10 text-primary">
                  {shop.shop_name?.charAt(0) || '🏪'}
                </AvatarFallback>
              </Avatar>
              <label
                className="absolute inset-0 bg-black/50 text-white rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity duration-150"
                title={t('settings.shop.brandAssets.change', 'Change')}
              >
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUpload(e, 'logo')}
                />
              </label>
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-lg text-foreground tracking-tight truncate max-w-[240px] sm:max-w-md">
                  {shop.shop_name || 'My Store'}
                </h2>

                <Badge
                  variant="outline"
                  className={`text-[11px] font-medium px-2 py-0.5 shrink-0 ${
                    isOpenForOrders
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-400 dark:border-emerald-800'
                      : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-400 dark:border-rose-800'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${isOpenForOrders ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  {isOpenForOrders
                    ? t('settings.shop.openForOrders', 'Open for Orders')
                    : t('settings.shop.storeClosed', 'Store Closed')}
                </Badge>

                {shop.plan && (
                  <Badge variant="secondary" className="capitalize text-[11px] font-medium shrink-0">
                    {shop.plan} {t('settings.shop.planSuffix', 'Plan')}
                  </Badge>
                )}

                <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground shrink-0 hidden sm:inline-flex">
                  {t(`settings.shop.categories.${shop.theme?.business_category || 'retail'}`, currentCategoryLabel)}
                </Badge>
              </div>

              {/* Public Storefront URL Pill */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 border border-border/60 text-muted-foreground font-mono text-[11px]">
                  <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="text-foreground font-medium">/{shop.username}</span>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={copyStorefrontLink}
                  className="h-7 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground gap-1"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? t('settings.shop.copied', 'Copied!') : t('settings.shop.copyLink', 'Copy Link')}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Quick Online Toggle Card */}
          <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-border/60 md:pl-6 shrink-0">
            <div className="space-y-0.5 text-left md:text-right">
              <p className="text-xs font-semibold text-foreground">
                {isOpenForOrders ? t('settings.shop.storeActive', 'Store Active') : t('settings.shop.storePaused', 'Store Paused')}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {isOpenForOrders ? t('settings.shop.acceptingOrders', 'Accepting customer orders') : t('settings.shop.pausedOrders', 'Closed for orders')}
              </p>
            </div>
            <Switch
              checked={isOpenForOrders}
              onCheckedChange={(checked) => {
                setThemeField('open_for_orders', checked);
                setShop({ ...shop, status: checked ? 'active' : 'inactive' });
              }}
            />
          </div>
        </div>
      </Card>

      {/* 3. Settings Tabs & Responsive 2-Column Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Modern Tabs Navigation Bar */}
        <div className="overflow-x-auto pb-1 -mx-1 px-1">
          <TabsList className="w-full justify-start h-auto p-1 bg-muted/60 rounded-xl gap-1 border border-border/50">
            <TabsTrigger value="general" className="gap-2 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg">
              <Store className="w-4 h-4 shrink-0" />
              <span>{t('settings.shop.tabs.general', 'General & Identity')}</span>
            </TabsTrigger>
            <TabsTrigger value="operations" className="gap-2 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg">
              <Clock className="w-4 h-4 shrink-0" />
              <span>{t('settings.shop.tabs.operations', 'Operations & Hours')}</span>
            </TabsTrigger>
            <TabsTrigger value="pos" className="gap-2 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg">
              <Receipt className="w-4 h-4 shrink-0" />
              <span>{t('settings.shop.tabs.pos', 'POS & Receipt')}</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg">
              <Sparkles className="w-4 h-4 shrink-0 text-primary" />
              <span>{t('settings.tabAppearance', 'រូបរាងប្រព័ន្ធ (Appearance & Color)')}</span>
            </TabsTrigger>
            <TabsTrigger value="theme" className="gap-2 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg">
              <Palette className="w-4 h-4 shrink-0" />
              <span>{t('settings.shop.tabs.theme', 'Branding & Slideshow')}</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg">
              <Share2 className="w-4 h-4 shrink-0" />
              <span>{t('settings.shop.tabs.social', 'Social & Channels')}</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{t('settings.shop.tabs.security', 'Security')}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Appearance Settings Tab Content */}
        {activeTab === 'appearance' ? (
          <div className="mt-6">
            <AppearanceSettings />
          </div>
        ) : (
          /* Content Grid: Form (Left) & Live Preview (Right) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
          {/* Left Column: Focused Settings Cards */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* TAB 1: GENERAL & IDENTITY */}
            <TabsContent value="general" className="m-0 space-y-6">
              {/* Card 1: Brand Assets (Logo & Banner) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    {t('settings.shop.brandAssets.title', 'Shop Brand Assets')}
                  </CardTitle>
                  <CardDescription>
                    {t('settings.shop.brandAssets.description', 'Upload your official shop logo and promotional cover banner.')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                    {/* Logo Section */}
                    <div className="sm:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left gap-2.5">
                      <Label className="text-xs font-semibold text-foreground">
                        {t('settings.shop.brandAssets.logo', 'Shop Logo (1:1)')}
                      </Label>
                      <div className="relative group">
                        <Avatar className="w-24 h-24 rounded-2xl border-2 border-border shadow-sm object-cover bg-muted">
                          <AvatarImage src={shop.logo ? fullUrl(shop.logo) : ''} alt={shop.shop_name} />
                          <AvatarFallback className="rounded-2xl text-2xl font-bold bg-muted text-muted-foreground">
                            {shop.shop_name?.charAt(0) || '🏪'}
                          </AvatarFallback>
                        </Avatar>
                        <label className="absolute inset-0 bg-black/50 text-white rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity duration-150">
                          <Upload className="w-5 h-5 mb-1" />
                          <span className="text-[10px] font-semibold">{t('settings.shop.brandAssets.change', 'Change')}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleUpload(e, 'logo')}
                          />
                        </label>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <label className="cursor-pointer">
                          <Button variant="outline" size="sm" asChild className="h-7 text-xs font-medium pointer-events-none">
                            <span>
                              <Upload className="w-3 h-3 mr-1" />
                              <span>{t('settings.shop.brandAssets.change', 'Change')}</span>
                            </span>
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleUpload(e, 'logo')}
                          />
                        </label>
                        {shop.logo && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShop({ ...shop, logo: '' })}
                            className="h-7 px-2 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {t('settings.shop.brandAssets.logoHint', 'Recommended: 400x400 PNG or JPG')}
                      </p>
                    </div>

                    {/* Banner Section */}
                    <div className="sm:col-span-8 flex flex-col gap-2.5">
                      <Label className="text-xs font-semibold text-foreground">
                        {t('settings.shop.brandAssets.banner', 'Store Cover Banner (16:9 or 3:1)')}
                      </Label>
                      <div className="relative group h-32 w-full rounded-2xl overflow-hidden border border-dashed border-border/80 bg-muted/40 flex items-center justify-center transition-colors hover:border-primary/50">
                        {shop.banner ? (
                          <>
                            <img
                              src={fullUrl(shop.banner)}
                              alt="Shop Banner"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <label className="cursor-pointer">
                                <Button variant="secondary" size="sm" asChild className="h-8 text-xs font-medium pointer-events-none gap-1.5 shadow-sm">
                                  <span>
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>{t('settings.shop.brandAssets.change', 'Change')}</span>
                                  </span>
                                </Button>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleUpload(e, 'banner')}
                                />
                              </label>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setShop({ ...shop, banner: '' })}
                                className="h-8 text-xs font-medium gap-1.5 shadow-sm"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>{isKhmer ? 'លុប' : 'Remove'}</span>
                              </Button>
                            </div>
                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground gap-1.5 p-4 text-center">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-0.5">
                              <Upload className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-semibold">
                              {t('settings.shop.brandAssets.uploadBanner', 'Upload Cover Banner')}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {t('settings.shop.brandAssets.noBanner', 'No banner uploaded yet')}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleUpload(e, 'banner')}
                            />
                          </label>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {t('settings.shop.brandAssets.bannerHint', 'Appears at the top of your Telegram Mini App & Storefront')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Core Store Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    {isKhmer ? 'ព័ត៌មានមូលដ្ឋាននៃហាង' : 'Basic Store Details'}
                  </CardTitle>
                  <CardDescription>
                    {isKhmer
                      ? 'ព័ត៌មានចម្បងដែលត្រូវបង្ហាញដល់អតិថិជន និងការទំនាក់ទំនង។'
                      : 'Essential shop information displayed to your customers and staff.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="shop_name" className="text-xs font-semibold">
                        {t('settings.shop.general.shopName', 'Shop Display Name *')}
                      </Label>
                      <Input
                        id="shop_name"
                        value={shop.shop_name || ''}
                        onChange={setField('shop_name')}
                        placeholder={t('settings.shop.general.shopNamePlaceholder', 'e.g. Phnom Penh Coffee Roasters')}
                        className="h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="category" className="text-xs font-semibold">
                        {t('settings.shop.general.category', 'Business Category')}
                      </Label>
                      <Select
                        value={shop.theme?.business_category || 'retail'}
                        onValueChange={(val) => setThemeField('business_category', val)}
                      >
                        <SelectTrigger id="category" className="h-9 text-sm">
                          <SelectValue placeholder={t('settings.shop.general.categoryPlaceholder', 'Select business type')} />
                        </SelectTrigger>
                        <SelectContent>
                          {RAW_BUSINESS_CATEGORIES.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {t(`settings.shop.categories.${c.id}`, c.defaultLabel)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="username" className="text-xs font-semibold">
                        {t('settings.shop.general.username', 'Store Username (Slug)')}
                      </Label>
                      <div className="relative">
                        <Input
                          id="username"
                          value={shop.username || ''}
                          disabled
                          className="bg-muted/50 font-mono text-xs pr-8 h-9 text-muted-foreground"
                        />
                        <Lock className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {t('settings.shop.general.usernameHint', 'Unique handle for your public URL. Contact support to modify.')}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="contact" className="text-xs font-semibold">
                        {t('settings.shop.general.contact', 'Primary Phone / Hotline')}
                      </Label>
                      <Input
                        id="contact"
                        value={shop.contact || ''}
                        onChange={setField('contact')}
                        placeholder={t('settings.shop.general.contactPlaceholder', 'e.g. +855 12 345 678')}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Bio & Store Story */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    {isKhmer ? 'ការណែនាំ និងប្រវត្តិហាង' : 'Store Bio & Story'}
                  </CardTitle>
                  <CardDescription>
                    {isKhmer
                      ? 'រៀបរាប់ពីចំណុចពិសេស និងប្រវត្តិសង្ខេបនៃហាងរបស់អ្នកដើម្បីទាក់ទាញអតិថិជន។'
                      : 'Tell your story and highlight your specialty products to delight customers.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bio" className="text-xs font-semibold">
                        {t('settings.shop.general.bio', 'Short Tagline (Bio)')}
                      </Label>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {(shop.bio || '').length}/140
                      </span>
                    </div>
                    <Input
                      id="bio"
                      value={shop.bio || ''}
                      onChange={setField('bio')}
                      placeholder={t('settings.shop.general.bioPlaceholder', 'e.g. Freshly roasted artisan coffee & bakery in BKK1')}
                      maxLength={140}
                      className="h-9 text-sm"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {t('settings.shop.general.bioHint', 'Visible under your shop header and in social previews.')}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-xs font-semibold">
                      {t('settings.shop.general.description', 'About Store & Story')}
                    </Label>
                    <Textarea
                      id="description"
                      value={shop.description || ''}
                      onChange={setField('description')}
                      rows={3}
                      placeholder={t('settings.shop.general.descriptionPlaceholder', 'Provide full details about your store, specialty products, or brand story...')}
                      className="text-sm resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: OPERATIONS & HOURS */}
            <TabsContent value="operations" className="m-0 space-y-6">
              {/* Card 1: Operational Status Toggle */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    {t('settings.shop.operations.title', 'Operational Status')}
                  </CardTitle>
                  <CardDescription>
                    {t('settings.shop.operations.description', 'Control whether your online storefront accepts live customer orders.')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-muted/30">
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-semibold">
                          {t('settings.shop.operations.acceptOrders', 'Accept Online Orders')}
                        </Label>
                        <Badge
                          variant={isOpenForOrders ? 'default' : 'destructive'}
                          className="text-[10px] font-semibold"
                        >
                          {isOpenForOrders
                            ? t('settings.shop.operations.onlineActive', 'Online & Active')
                            : t('settings.shop.operations.ordersPaused', 'Orders Paused')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('settings.shop.operations.pauseNotice', 'Turn this off if you need to pause new incoming orders for stocktaking or vacation.')}
                      </p>
                    </div>
                    <Switch
                      checked={isOpenForOrders}
                      onCheckedChange={(checked) => {
                        setThemeField('open_for_orders', checked);
                        setShop({ ...shop, status: checked ? 'active' : 'inactive' });
                      }}
                    />
                  </div>

                  {!isOpenForOrders && (
                    <div className="space-y-2 p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 animate-in fade-in-50 duration-200">
                      <Label htmlFor="maintenance_msg" className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                        {t('settings.shop.operations.maintenanceNotice', 'Closed / Maintenance Notice to Customers')}
                      </Label>
                      <Input
                        id="maintenance_msg"
                        value={shop.theme?.maintenance_message || ''}
                        onChange={(e) => setThemeField('maintenance_message', e.target.value)}
                        placeholder={t('settings.shop.operations.maintenancePlaceholder', 'e.g. We are currently closed for restock')}
                        className="h-9 text-xs bg-white dark:bg-slate-900"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Card 2: Enabled Order Channels */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    {t('settings.shop.operations.orderChannels', 'Enabled Order Channels')}
                  </CardTitle>
                  <CardDescription>
                    {isKhmer
                      ? 'ជ្រើសរើសប្រភេទនៃការទទួលការកុម្ម៉ង់ដែលហាងអ្នកគាំទ្រ។'
                      : 'Enable or disable fulfillment methods for dining and takeaway orders.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Dine-In */}
                    <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                      shop.theme?.order_channels?.dine_in !== false
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border/80 bg-muted/20 opacity-75'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <UtensilsCrossed className="w-4 h-4" />
                        </div>
                        <Switch
                          checked={shop.theme?.order_channels?.dine_in !== false}
                          onCheckedChange={(checked) => setOrderChannel('dine_in', checked)}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{t('settings.shop.operations.dineIn', 'Dine-In')}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{t('settings.shop.operations.dineInSubtitle', 'On-premise dining')}</p>
                      </div>
                    </div>

                    {/* Takeaway */}
                    <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                      shop.theme?.order_channels?.takeaway !== false
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border/80 bg-muted/20 opacity-75'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <Switch
                          checked={shop.theme?.order_channels?.takeaway !== false}
                          onCheckedChange={(checked) => setOrderChannel('takeaway', checked)}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{t('settings.shop.operations.takeaway', 'Takeaway / Pickup')}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{t('settings.shop.operations.takeawaySubtitle', 'Customer pickup')}</p>
                      </div>
                    </div>

                    {/* Delivery */}
                    <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                      shop.theme?.order_channels?.delivery !== false
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border/80 bg-muted/20 opacity-75'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <Truck className="w-4 h-4" />
                        </div>
                        <Switch
                          checked={shop.theme?.order_channels?.delivery !== false}
                          onCheckedChange={(checked) => setOrderChannel('delivery', checked)}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{t('settings.shop.operations.delivery', 'Delivery')}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{t('settings.shop.operations.deliverySubtitle', 'Doorstep delivery')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Weekly Business Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    {t('settings.shop.operations.businessHours', 'Weekly Business Hours')}
                  </CardTitle>
                  <CardDescription>
                    {t('settings.shop.operations.hoursDescription', 'Customers will see whether you are open based on these times.')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border border-border/80 rounded-xl divide-y divide-border/60 overflow-hidden">
                    {DAYS_KEYS.map((key) => {
                      const dayConfig = (shop.theme?.business_hours || {})[key] || {
                        is_open: true,
                        open: '08:00',
                        close: '21:00',
                      };
                      const dayLabel = t(`settings.shop.operations.days.${key}`, key);
                      return (
                        <div
                          key={key}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-3 text-xs bg-card hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3 w-40">
                            <Switch
                              checked={dayConfig.is_open}
                              onCheckedChange={(checked) => setBusinessHour(key, 'is_open', checked)}
                            />
                            <span className="font-semibold text-foreground capitalize">
                              {dayLabel}
                            </span>
                          </div>

                          {dayConfig.is_open ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-muted-foreground text-[11px]">{t('settings.shop.operations.from', 'From:')}</span>
                              <Input
                                type="time"
                                value={dayConfig.open || '08:00'}
                                onChange={(e) => setBusinessHour(key, 'open', e.target.value)}
                                className="w-28 h-8 text-xs font-mono"
                              />
                              <span className="text-muted-foreground text-[11px]">{t('settings.shop.operations.to', 'To:')}</span>
                              <Input
                                type="time"
                                value={dayConfig.close || '21:00'}
                                onChange={(e) => setBusinessHour(key, 'close', e.target.value)}
                                className="w-28 h-8 text-xs font-mono"
                              />
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground border-dashed w-fit text-[11px]">
                              {t('settings.shop.operations.closed', 'Closed')}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: POS & RECEIPT */}
            <TabsContent value="pos" className="m-0 space-y-6">
              {/* Card 1: Currency & Exchange Rates */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    {t('settings.shop.pos.currencyTitle', 'Currency & Exchange Rates')}
                  </CardTitle>
                  <CardDescription>
                    {t('settings.shop.pos.currencyDescription', 'Configure default operational currency and KHR exchange rate for KHQR payments.')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="currency" className="text-xs font-semibold">
                        {t('settings.shop.pos.baseCurrency', 'Base Currency')}
                      </Label>
                      <Select value={shop.currency || 'USD'} onValueChange={(val) => setShop({ ...shop, currency: val })}>
                        <SelectTrigger id="currency" className="h-9 text-sm">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($ - US Dollar)</SelectItem>
                          <SelectItem value="KHR">KHR (៛ - Khmer Riel)</SelectItem>
                          <SelectItem value="THB">THB (฿ - Thai Baht)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-muted-foreground">
                        {t('settings.shop.pos.baseCurrencyHint', 'Primary currency for product pricing & sales.')}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="exchange_rate" className="text-xs font-semibold">
                        {t('settings.shop.pos.exchangeRate', 'KHR Exchange Rate (1 USD = ? KHR)')}
                      </Label>
                      <div className="relative">
                        <Input
                          id="exchange_rate"
                          type="number"
                          value={shop.theme?.exchange_rate_khr || 4100}
                          onChange={(e) => setThemeField('exchange_rate_khr', Number(e.target.value))}
                          className="pr-14 font-mono font-medium h-9 text-sm"
                          placeholder="4100"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground font-mono">
                          KHR
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {t('settings.shop.pos.exchangeRateHint', 'Used on POS receipts and Bakong KHQR conversion.')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="tax_rate" className="text-xs font-semibold">
                        {t('settings.shop.pos.taxRate', 'Default Tax / VAT (%)')}
                      </Label>
                      <div className="relative">
                        <Input
                          id="tax_rate"
                          type="number"
                          min="0"
                          max="100"
                          value={shop.theme?.tax_percentage ?? 0}
                          onChange={(e) => setThemeField('tax_percentage', Number(e.target.value))}
                          className="pr-8 font-mono h-9 text-sm"
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                          %
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {t('settings.shop.pos.taxHint', 'Auto-calculated during POS checkout (e.g. 10% VAT).')}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="service_charge" className="text-xs font-semibold">
                        {t('settings.shop.pos.serviceCharge', 'Service Charge (%)')}
                      </Label>
                      <div className="relative">
                        <Input
                          id="service_charge"
                          type="number"
                          min="0"
                          max="100"
                          value={shop.theme?.service_charge ?? 0}
                          onChange={(e) => setThemeField('service_charge', Number(e.target.value))}
                          className="pr-8 font-mono h-9 text-sm"
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                          %
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {t('settings.shop.pos.serviceChargeHint', 'Optional dine-in service fee for restaurants/cafes.')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Thermal Receipt Customization */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    {t('settings.shop.pos.receiptTitle', 'Thermal Receipt Customization')}
                  </CardTitle>
                  <CardDescription>
                    {t('settings.shop.pos.receiptDescription', 'Customize the header, footer, and Wi-Fi credentials printed on customer receipts.')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="receipt_header" className="text-xs font-semibold">
                      {t('settings.shop.pos.receiptHeader', 'Receipt Slogan / Header')}
                    </Label>
                    <Input
                      id="receipt_header"
                      value={shop.theme?.receipt_header || ''}
                      onChange={(e) => setThemeField('receipt_header', e.target.value)}
                      placeholder={t('settings.shop.pos.receiptHeaderPlaceholder', 'e.g. Welcome to our store')}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="receipt_footer" className="text-xs font-semibold">
                      {t('settings.shop.pos.receiptFooter', 'Receipt Thank You Note / Policy')}
                    </Label>
                    <Input
                      id="receipt_footer"
                      value={shop.theme?.receipt_footer || ''}
                      onChange={(e) => setThemeField('receipt_footer', e.target.value)}
                      placeholder={t('settings.shop.pos.receiptFooterPlaceholder', 'e.g. Items non-refundable')}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="wifi_name" className="text-xs font-semibold">
                        {t('settings.shop.pos.wifiName', 'Wi-Fi Network Name (SSID)')}
                      </Label>
                      <Input
                        id="wifi_name"
                        value={shop.theme?.wifi_name || ''}
                        onChange={(e) => setThemeField('wifi_name', e.target.value)}
                        placeholder={t('settings.shop.pos.wifiNamePlaceholder', 'e.g. Cafe_Free_Guest')}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="wifi_pw" className="text-xs font-semibold">
                        {t('settings.shop.pos.wifiPassword', 'Wi-Fi Password')}
                      </Label>
                      <Input
                        id="wifi_pw"
                        value={shop.theme?.wifi_password || ''}
                        onChange={(e) => setThemeField('wifi_password', e.target.value)}
                        placeholder={t('settings.shop.pos.wifiPasswordPlaceholder', 'e.g. 88889999')}
                        className="h-9 text-sm font-mono"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{t('settings.shop.pos.printKhqr', 'Print Bakong KHQR on Receipts')}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {t('settings.shop.pos.printKhqrHint', 'Allows customers to scan and pay directly on paper receipt.')}
                        </p>
                      </div>
                      <Switch
                        checked={shop.theme?.show_khqr_on_receipt !== false}
                        onCheckedChange={(checked) => setThemeField('show_khqr_on_receipt', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{t('settings.shop.pos.printCashier', 'Print Cashier / Server Name')}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {t('settings.shop.pos.printCashierHint', 'Shows which staff member processed the bill.')}
                        </p>
                      </div>
                      <Switch
                        checked={shop.theme?.show_cashier !== false}
                        onCheckedChange={(checked) => setThemeField('show_cashier', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 4: THEME & BRANDING */}
            <TabsContent value="theme" className="m-0 space-y-6">
              {/* Card 1: Color Palette & Typography */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    {t('settings.shop.theme.paletteTitle', 'Color Palette & Typography')}
                  </CardTitle>
                  <CardDescription>
                    {t('settings.shop.theme.paletteDescription', 'Tailor your storefront and mini app brand identity with curated palettes.')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Preset Colors */}
                  <div className="space-y-2.5">
                    <Label className="text-xs font-semibold text-foreground">
                      {t('settings.shop.theme.quickPresets', 'Quick Color Presets')}
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setShop({
                              ...shop,
                              theme: {
                                ...(shop.theme || {}),
                                primary: preset.primary,
                                secondary: preset.secondary,
                              },
                            });
                          }}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                            shop.theme?.primary === preset.primary
                              ? 'border-primary ring-2 ring-primary/20 bg-primary/5 text-foreground'
                              : 'border-border/80 hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full shadow-2xs shrink-0"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <span className="truncate">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Hex Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="primary_color" className="text-xs font-semibold">
                        {t('settings.shop.theme.primaryColor', 'Primary Brand Color')}
                      </Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="primary_color"
                          value={shop.theme?.primary || '#6366f1'}
                          onChange={(e) => setThemeField('primary', e.target.value)}
                          className="w-10 h-9 p-0.5 rounded-lg border border-border cursor-pointer shrink-0 bg-card"
                        />
                        <Input
                          value={shop.theme?.primary || '#6366f1'}
                          onChange={(e) => setThemeField('primary', e.target.value)}
                          className="font-mono text-xs uppercase h-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="secondary_color" className="text-xs font-semibold">
                        {t('settings.shop.theme.secondaryAccent', 'Secondary Accent')}
                      </Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="secondary_color"
                          value={shop.theme?.secondary || '#ec4899'}
                          onChange={(e) => setThemeField('secondary', e.target.value)}
                          className="w-10 h-9 p-0.5 rounded-lg border border-border cursor-pointer shrink-0 bg-card"
                        />
                        <Input
                          value={shop.theme?.secondary || '#ec4899'}
                          onChange={(e) => setThemeField('secondary', e.target.value)}
                          className="font-mono text-xs uppercase h-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="font_family" className="text-xs font-semibold">
                        {t('settings.shop.theme.fontFamily', 'Font Family')}
                      </Label>
                      <Select
                        value={shop.theme?.font_family || 'Inter'}
                        onValueChange={(val) => setThemeField('font_family', val)}
                      >
                        <SelectTrigger id="font_family" className="h-9 text-sm">
                          <SelectValue placeholder="Select font" />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_OPTIONS.map((f) => (
                            <SelectItem key={f.value} value={f.value}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Slideshow Manager */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {t('settings.shop.theme.slideshowTitle', 'Homepage Slideshow Banners')}
                    </CardTitle>
                    <CardDescription>
                      {t('settings.shop.theme.slideshowDescription', 'Upload promotional slider banners for your customer storefront.')}
                    </CardDescription>
                  </div>
                  <label className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild className="gap-1.5 pointer-events-none h-8 text-xs font-medium">
                      <span>
                        <Upload className="w-3.5 h-3.5" />
                        <span>{t('settings.shop.theme.addSlide', 'Add Slide')}</span>
                      </span>
                    </Button>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleSlideUpload}
                    />
                  </label>
                </CardHeader>
                <CardContent>
                  {(shop.slideshow || []).length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-border/80 rounded-2xl bg-muted/20">
                      <Palette className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">
                        {t('settings.shop.theme.noSlideshow', 'No slideshow banners added')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t('settings.shop.theme.slideshowHint', 'Add eye-catching seasonal promotions or daily specials.')}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {shop.slideshow.map((img: string, i: number) => (
                        <div key={i} className="relative group rounded-xl overflow-hidden border border-border/80 aspect-video bg-muted">
                          <img
                            src={fullUrl(img)}
                            alt={`Slide ${i + 1}`}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                          <button
                            type="button"
                            onClick={() => removeSlide(i)}
                            className="absolute top-1.5 right-1.5 p-1 bg-white/95 dark:bg-slate-900/90 text-rose-600 rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove slide"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                            #{i + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 5: SOCIAL & CHANNELS */}
            <TabsContent value="social" className="m-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    {t('settings.shop.social.title', 'Social Media & Contacts')}
                  </CardTitle>
                  <CardDescription>
                    {t('settings.shop.social.description', 'Provide direct links so customers can easily contact you on Telegram, Facebook, and more.')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="sm_telegram" className="text-xs font-semibold">
                        {t('settings.shop.social.telegram', 'Telegram')}
                      </Label>
                      <Input
                        id="sm_telegram"
                        value={shop.social_media?.telegram || ''}
                        onChange={(e) => setSocialField('telegram', e.target.value)}
                        placeholder="https://t.me/yourstore or @username"
                        className="h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="sm_facebook" className="text-xs font-semibold">
                        {t('settings.shop.social.facebook', 'Facebook')}
                      </Label>
                      <Input
                        id="sm_facebook"
                        value={shop.social_media?.facebook || ''}
                        onChange={(e) => setSocialField('facebook', e.target.value)}
                        placeholder="https://facebook.com/yourpage"
                        className="h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="sm_tiktok" className="text-xs font-semibold">
                        {t('settings.shop.social.tiktok', 'TikTok')}
                      </Label>
                      <Input
                        id="sm_tiktok"
                        value={shop.social_media?.tiktok || ''}
                        onChange={(e) => setSocialField('tiktok', e.target.value)}
                        placeholder="https://tiktok.com/@yourshop"
                        className="h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="sm_instagram" className="text-xs font-semibold">
                        {t('settings.shop.social.instagram', 'Instagram')}
                      </Label>
                      <Input
                        id="sm_instagram"
                        value={shop.social_media?.instagram || ''}
                        onChange={(e) => setSocialField('instagram', e.target.value)}
                        placeholder="https://instagram.com/yourshop"
                        className="h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="sm_whatsapp" className="text-xs font-semibold">
                        {t('settings.shop.social.whatsapp', 'WhatsApp')}
                      </Label>
                      <Input
                        id="sm_whatsapp"
                        value={shop.social_media?.whatsapp || ''}
                        onChange={(e) => setSocialField('whatsapp', e.target.value)}
                        placeholder="https://wa.me/855..."
                        className="h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="sm_gmap" className="text-xs font-semibold">
                        {t('settings.shop.social.googleMaps', 'Google Maps')}
                      </Label>
                      <Input
                        id="sm_gmap"
                        value={shop.social_media?.google_maps || ''}
                        onChange={(e) => setSocialField('google_maps', e.target.value)}
                        placeholder="https://maps.app.goo.gl/..."
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 6: SECURITY */}
            <TabsContent value="security" className="m-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    {t('settings.shop.security.title', 'Change Shop Account Password')}
                  </CardTitle>
                  <CardDescription>
                    {t('settings.shop.security.description', 'Ensure your account stays secure by using a strong combination of characters.')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={changePw} className="space-y-4 max-w-md">
                    <div className="space-y-1.5">
                      <Label htmlFor="curr_pw" className="text-xs font-semibold">{t('settings.shop.security.currentPassword', 'Current Password')}</Label>
                      <div className="relative">
                        <Input
                          id="curr_pw"
                          type={showPw.current ? 'text' : 'password'}
                          value={pw.current_password}
                          onChange={(e) => setPw({ ...pw, current_password: e.target.value })}
                          className="pr-10 h-9 text-sm"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((p) => ({ ...p, current: !p.current }))}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPw.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="new_pw" className="text-xs font-semibold">{t('settings.shop.security.newPassword', 'New Password')}</Label>
                      <div className="relative">
                        <Input
                          id="new_pw"
                          type={showPw.next ? 'text' : 'password'}
                          value={pw.new_password}
                          onChange={(e) => setPw({ ...pw, new_password: e.target.value })}
                          className="pr-10 h-9 text-sm"
                          placeholder={t('settings.shop.security.newPasswordPlaceholder', 'At least 6 characters')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((p) => ({ ...p, next: !p.next }))}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPw.next ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="conf_pw" className="text-xs font-semibold">{t('settings.shop.security.confirmPassword', 'Confirm New Password')}</Label>
                      <div className="relative">
                        <Input
                          id="conf_pw"
                          type={showPw.confirm ? 'text' : 'password'}
                          value={pw.confirm_password}
                          onChange={(e) => setPw({ ...pw, confirm_password: e.target.value })}
                          className="pr-10 h-9 text-sm"
                          placeholder={t('settings.shop.security.confirmPasswordPlaceholder', 'Repeat new password')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPw.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" disabled={pwBusy} className="gap-2 h-9 text-xs font-semibold">
                      {pwBusy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                      <span>{pwBusy ? t('settings.shop.security.updating', 'Updating...') : t('settings.shop.security.updatePassword', 'Update Password')}</span>
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* System Metadata Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    {t('settings.shop.security.metadataTitle', 'Subscription & System Metadata')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2.5 text-muted-foreground">
                  <div className="flex justify-between py-1.5 border-b border-border/60">
                    <span>{t('settings.shop.security.shopId', 'Shop ID:')}</span>
                    <span className="font-mono font-medium text-foreground">{shop.id}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/60">
                    <span>{t('settings.shop.security.createdDate', 'Created Date:')}</span>
                    <span className="font-medium text-foreground">
                      {shop.created_at ? new Date(shop.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span>{t('settings.shop.security.currentPlan', 'Current Subscription Plan:')}</span>
                    <Badge variant="outline" className="capitalize font-semibold text-primary">
                      {shop.plan || 'Free'} {t('settings.shop.planSuffix', 'Plan')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          {/* Right Column: Sticky Live Customer Preview Mockup */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6 space-y-4">
            <Card className="overflow-hidden border border-border/80 shadow-md bg-card">
              <CardHeader className="p-3.5 bg-muted/40 border-b border-border/60 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    {t('settings.shop.preview.livePreview', 'Live Preview')}
                  </span>
                </div>
                {/* Switcher: Mobile Web vs Receipt */}
                <div className="flex items-center bg-muted p-0.5 rounded-lg text-[11px] font-semibold border border-border/50">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('storefront')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      previewMode === 'storefront' ? 'bg-card text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t('settings.shop.preview.mobileWeb', 'Mobile Web')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('receipt')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      previewMode === 'receipt' ? 'bg-card text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t('settings.shop.preview.receipt', 'Receipt')}
                  </button>
                </div>
              </CardHeader>

              <CardContent className="p-4 flex justify-center bg-muted/20 overflow-hidden">
                {previewMode === 'storefront' ? (
                  /* ========================================================
                     Clean & Modern Mobile Storefront Mockup
                     ======================================================== */
                  <div className="w-[290px] rounded-[42px] p-[6px] bg-slate-900 border-2 border-slate-800 shadow-xl relative mx-auto my-1 select-none">
                    <div className="w-full rounded-[36px] overflow-hidden bg-slate-950 text-slate-100 flex flex-col h-[520px] relative font-sans">
                      {/* Top Island & Status Bar */}
                      <div className="h-8 px-5 flex items-center justify-between text-[10px] text-slate-400 font-mono shrink-0 select-none bg-slate-950 z-20">
                        <span>9:41</span>
                        <div className="w-18 h-3.5 bg-black rounded-full border border-slate-800" />
                        <div className="flex items-center gap-1 text-slate-300">
                          <Wifi className="w-2.5 h-2.5" />
                          <div className="w-4 h-2 border border-slate-400 rounded-xs p-[1px] flex items-center">
                            <div className="w-full h-full bg-emerald-400 rounded-2xs" />
                          </div>
                        </div>
                      </div>

                      {/* Storefront Content */}
                      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col justify-between scrollbar-none pb-12">
                        <div>
                          {/* Banner Header */}
                          <div className="relative h-24 w-full shrink-0 overflow-hidden bg-slate-900">
                            {shop.banner ? (
                              <img
                                src={fullUrl(shop.banner)}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-full h-full opacity-70"
                                style={{
                                  background: `linear-gradient(135deg, ${themePrimary} 0%, #0f172a 100%)`,
                                }}
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                            {/* Store Avatar */}
                            <div className="absolute -bottom-4 left-3 z-10">
                              <Avatar className="w-12 h-12 rounded-xl border-2 border-slate-950 shadow-md bg-slate-900 object-cover">
                                <AvatarImage src={shop.logo ? fullUrl(shop.logo) : ''} alt={shop.shop_name} />
                                <AvatarFallback className="text-sm font-bold text-white" style={{ backgroundColor: themePrimary }}>
                                  {shop.shop_name?.charAt(0) || '🏪'}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          </div>

                          {/* Store Details */}
                          <div className="pt-5 px-3 space-y-2">
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="font-bold text-xs text-white truncate max-w-[160px]">
                                  {shop.shop_name || 'My Store'}
                                </h4>
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${
                                    isOpenForOrders
                                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                                      : 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
                                  }`}
                                >
                                  {isOpenForOrders ? (isKhmer ? 'បើកទទួលការកុម្ម៉ង់' : 'Open') : (isKhmer ? 'ហាងបានបិទ' : 'Closed')}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                                {shop.bio || (isKhmer ? 'សូមស្វាគមន៍មកកាន់ហាងយើងខ្ញុំ! សេវាកម្មរហ័សទាន់ចិត្ត។' : 'Welcome to our store!')}
                              </p>
                            </div>

                            {/* Sample Category Chips */}
                            <div className="flex items-center gap-1 overflow-x-auto text-[9px] scrollbar-none py-0.5">
                              <span
                                className="px-2 py-0.5 rounded-full text-white font-semibold shrink-0"
                                style={{ backgroundColor: themePrimary }}
                              >
                                {isKhmer ? 'ពេញនិយម' : 'Popular'}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
                                {isKhmer ? 'ភេសជ្ជៈ' : 'Drinks'}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
                                {isKhmer ? 'នំ & អាហារ' : 'Food'}
                              </span>
                            </div>

                            {/* Products Sample List */}
                            <div className="space-y-1.5 pt-0.5">
                              <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center text-sm shrink-0">
                                    ☕
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-semibold text-white truncate">Iced Spanish Latte</p>
                                    <p className="text-[9px] text-slate-400 font-mono">
                                      $2.80 <span className="text-[8px] text-slate-500">({(2.8 * exchangeRate).toLocaleString()} ៛)</span>
                                    </p>
                                  </div>
                                </div>
                                <span
                                  className="w-5 h-5 rounded-md text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs"
                                  style={{ backgroundColor: themePrimary }}
                                >
                                  +
                                </span>
                              </div>

                              <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center text-sm shrink-0">
                                    🥐
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-semibold text-white truncate">Caramel Croissant</p>
                                    <p className="text-[9px] text-slate-400 font-mono">
                                      $2.20 <span className="text-[8px] text-slate-500">({(2.2 * exchangeRate).toLocaleString()} ៛)</span>
                                    </p>
                                  </div>
                                </div>
                                <span
                                  className="w-5 h-5 rounded-md text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs"
                                  style={{ backgroundColor: themePrimary }}
                                >
                                  +
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Social Links in Storefront */}
                        <div className="px-3 py-1 flex items-center justify-center gap-2 text-[9px] text-slate-400 border-t border-slate-900">
                          {shop.social_media?.telegram && <span className="text-sky-400">Telegram</span>}
                          {shop.social_media?.facebook && <span className="text-blue-400">Facebook</span>}
                          <span className="font-mono text-slate-500">/{shop.username}</span>
                        </div>
                      </div>

                      {/* Bottom Sticky Action Bar */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-30">
                        <div className="p-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/10 shadow-lg flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 pl-1">
                            <ShoppingBag className="w-3.5 h-3.5 text-white/80" />
                            <span className="text-[10px] text-white font-mono font-bold">$5.00</span>
                          </div>
                          <button
                            type="button"
                            className="py-1.5 px-3 rounded-lg text-white font-semibold text-[10px] shadow-xs"
                            style={{ backgroundColor: themePrimary }}
                          >
                            {t('settings.shop.preview.orderNow', 'Order Now')}
                          </button>
                        </div>
                      </div>

                      {/* Bottom Home Indicator */}
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-white/30 rounded-full z-40 pointer-events-none" />
                    </div>
                  </div>
                ) : (
                  /* ========================================================
                     Thermal Receipt Mockup
                     ======================================================== */
                  <div className="w-full max-w-[270px] bg-amber-50/90 dark:bg-slate-900 border border-dashed border-amber-300 dark:border-slate-700 rounded-lg p-3 text-slate-800 dark:text-slate-200 font-mono text-[10px] space-y-2 shadow-sm my-2">
                    <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 dark:border-slate-700 pb-2">
                      <p className="font-bold text-xs uppercase">{shop.shop_name || 'SHOP NAME'}</p>
                      <p className="text-[9px] text-muted-foreground">{shop.contact || '+855 12 345 678'}</p>
                      {shop.theme?.receipt_header && (
                        <p className="text-[9px] italic text-slate-600 dark:text-slate-400">"{shop.theme.receipt_header}"</p>
                      )}
                    </div>

                    <div className="flex justify-between text-[9px] text-muted-foreground">
                      <span>ORD: #0042</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>

                    <div className="border-b border-dashed border-slate-300 dark:border-slate-700 py-1 space-y-1">
                      <div className="flex justify-between">
                        <span>1x {t('settings.shop.preview.sampleItem1', 'Iced Latte')}</span>
                        <span>$2.50</span>
                      </div>
                      <div className="flex justify-between">
                        <span>1x {t('settings.shop.preview.sampleItem2', 'Croissant')}</span>
                        <span>$2.00</span>
                      </div>
                    </div>

                    <div className="space-y-0.5 pt-1 text-right">
                      <div className="flex justify-between font-bold text-[11px]">
                        <span>{t('settings.shop.preview.total', 'TOTAL:')}</span>
                        <span>$4.50</span>
                      </div>
                      <div className="text-[9px] text-muted-foreground font-mono">
                        (KHR: {(4.5 * exchangeRate).toLocaleString()} ៛)
                      </div>
                    </div>

                    {shop.theme?.wifi_name && (
                      <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-1 text-center text-[9px]">
                        <p className="font-semibold">Wi-Fi: {shop.theme.wifi_name}</p>
                        {shop.theme.wifi_password && <p>PW: {shop.theme.wifi_password}</p>}
                      </div>
                    )}

                    <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 text-center text-[9px] text-muted-foreground">
                      <p>{shop.theme?.receipt_footer || t('settings.shop.preview.receiptThankYou', 'Thank you for your visit!')}</p>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="py-2.5 px-4 bg-muted/40 border-t border-border/60 flex justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t('settings.shop.preview.simulation', 'Real-time layout simulation')}</span>
                </span>
                <span className="font-semibold text-primary">{t('settings.shop.preview.responsive', 'Responsive')}</span>
              </CardFooter>
            </Card>
          </div>
        </div>
        )}
      </Tabs>
    </div>
  );
}