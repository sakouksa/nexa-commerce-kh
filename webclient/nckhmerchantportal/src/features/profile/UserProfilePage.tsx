import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiBriefcase,
  FiShield,
  FiLayers,
  FiBell,
  FiGlobe,
  FiCpu,
  FiUpload,
  FiSave,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCopy,
  FiExternalLink,
  FiCheck,
  FiSmartphone,
  FiMonitor,
  FiCheckCircle,
  FiArrowRight,
  FiShoppingBag,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n';
import toast from '../../utils/toast';
import { getShopDetail, updateShop, changePassword, uploadImage, fullUrl } from '../../api';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function UserProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, setAuth } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  // Active view: general | roles | workflow | notifications | localization | system
  const activeView = searchParams.get('view') || 'general';

  const [shop, setShop] = useState<any>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar_url || '');

  // Form states for Organization Information
  const [orgName, setOrgName] = useState(user?.full_name || user?.username || 'FieldForce Operations');
  const [industry, setIndustry] = useState('Field Service & Maintenance');
  const [website, setWebsite] = useState('https://fieldforce.io');
  const [phone, setPhone] = useState(user?.phone || '+1 (512) 555-0148');
  const [email, setEmail] = useState(user?.email || 'ops@fieldforce.io');
  const [postalCode, setPostalCode] = useState('78701');
  const [address, setAddress] = useState('900 Congress Ave, Suite 200');
  const [city, setCity] = useState('Austin');
  const [stateRegion, setStateRegion] = useState('Texas');
  const [country, setCountry] = useState('United States');
  const [description, setDescription] = useState(
    user?.bio ||
      'FieldForce Operations delivers field service, dispatch, and HR management for multi-site service teams.'
  );
  const [savingGeneral, setSavingGeneral] = useState(false);

  // Security Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  // Notifications state
  const [telegramAlerts, setTelegramAlerts] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [stockAlerts, setStockAlerts] = useState(true);

  // Currency & Region
  const [currency, setCurrency] = useState('USD');

  // Load shop details
  useEffect(() => {
    if (user?.shop_id) {
      getShopDetail(user.shop_id)
        .then((data) => {
          setShop(data);
          if (data?.name) setOrgName(data.name);
          if (data?.address) setAddress(data.address);
          if (data?.phone) setPhone(data.phone);
          if (data?.description) setDescription(data.description);
          if (data?.logo_url) setAvatarUrl(data.logo_url);
        })
        .catch(() => {});
    } else if (user) {
      setOrgName(user.full_name || user.username || 'FieldForce Operations');
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
      if (user.bio) setDescription(user.bio);
      if (user.avatar_url) setAvatarUrl(user.avatar_url);
    }
  }, [user]);

  const handleTabChange = (val: string) => {
    setSearchParams({ view: val });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const res = await uploadImage(file);
      setAvatarUrl(res.url);
      if (user) {
        const updated = { ...user, avatar_url: res.url };
        const token = localStorage.getItem('ms_token') || '';
        setAuth(token, updated);
      }
      if (shop?.id) {
        await updateShop(shop.id, { logo_url: res.url });
      }
      toast.success(t('toast.avatarUpdated', 'Logo updated successfully!'));
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to upload photo');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveGeneral = async () => {
    setSavingGeneral(true);
    try {
      if (user) {
        const updated = {
          ...user,
          full_name: orgName,
          email,
          phone,
          bio: description,
        };
        const token = localStorage.getItem('ms_token') || '';
        setAuth(token, updated);
      }
      if (shop?.id) {
        await updateShop(shop.id, {
          name: orgName,
          phone,
          address,
          description,
        });
      }
      toast.success(t('toast.profileUpdated', 'Organization information saved successfully!'));
    } catch (err: any) {
      toast.error('Failed to update organization details.');
    } finally {
      setSavingGeneral(false);
    }
  };

  const handleResetGeneral = () => {
    if (shop) {
      setOrgName(shop.name || '');
      setAddress(shop.address || '');
      setPhone(shop.phone || '');
      setDescription(shop.description || '');
    } else if (user) {
      setOrgName(user.full_name || user.username || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setDescription(user.bio || '');
    }
    toast.success('Form reset to saved values');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Current password is required.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success(t('toast.passwordChanged', 'Password has been changed successfully!'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to change password. Please verify current password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const copyStorefrontUrl = () => {
    const storeUrl = `https://store.ministorekh.com/${shop?.slug || user?.username || 'shop'}`;
    navigator.clipboard.writeText(storeUrl);
    toast.success('Storefront URL copied to clipboard!', { icon: '📋' });
  };

  // Exact 6 settings items matching SmartHR Settings Menu
  const settingsMenuItems = [
    {
      id: 'general',
      title: 'General',
      subtitle: 'Organization & preferences',
      icon: FiBriefcase,
    },
    {
      id: 'roles',
      title: 'Roles & Permissions',
      subtitle: 'Access control',
      icon: FiShield,
    },
    {
      id: 'workflow',
      title: 'Workflow',
      subtitle: 'Approval automation',
      icon: FiLayers,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Alerts & channels',
      icon: FiBell,
    },
    {
      id: 'localization',
      title: 'Localization',
      subtitle: 'Language & region',
      icon: FiGlobe,
    },
    {
      id: 'system',
      title: 'System',
      subtitle: 'Security & maintenance',
      icon: FiCpu,
    },
  ];

  return (
    <div className="space-y-4 pb-16 w-full font-sans">
      {/* 1. GLOBAL BREADCRUMBS */}
      <Breadcrumbs />

      {/* 2. COMPACT PAGE HEADER */}
      <div className="space-y-0.5">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          General Settings
        </h1>
        <p className="text-[12px] text-slate-500 dark:text-slate-400">
          Configure organization details and application preferences.
        </p>
      </div>

      {/* 3. COMPACT 2-COLUMN LAYOUT (Compact Left Menu + Full Width Right Card) */}
      <div className="flex flex-col lg:flex-row items-start gap-4 sm:gap-5 w-full">
        {/* LEFT COLUMN: COMPACT SETTINGS MENU (w-60 or w-64) */}
        <Card className="w-full lg:w-60 xl:w-64 shrink-0 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2 sm:p-2.5 shadow-2xs">
          <div className="px-2 pt-1 pb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Settings
            </span>
          </div>

          <div className="space-y-0.5">
            {settingsMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 select-none ${
                    isActive
                      ? 'bg-orange-50/85 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200 border border-orange-200/70 dark:border-orange-900/50 border-l-[3.5px] border-l-orange-600 dark:border-l-orange-500 shadow-2xs font-semibold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-transparent border-l-[3.5px] border-l-slate-200/90 dark:border-l-slate-700/80 hover:border-l-slate-400/80 dark:hover:border-l-slate-500'
                  }`}
                >
                  <div
                    className={`size-7 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-orange-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-semibold truncate leading-tight">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5 leading-tight">
                      {item.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* RIGHT COLUMN: MAIN FORM CARD (COMPACT SCALE) */}
        <div className="flex-1 min-w-0 w-full">
          {/* TAB 1: GENERAL / ORGANIZATION INFORMATION */}
          {activeView === 'general' && (
            <Card className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
              {/* Header with small rounded icon box */}
              <div className="flex items-start gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="size-7 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/50 flex items-center justify-center shrink-0 shadow-2xs">
                  <FiBriefcase className="size-3.5" />
                </div>
                <div>
                  <h2 className="text-[13px] sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    Organization Information
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    Basic company details shown across the app and on customer documents.
                  </p>
                </div>
              </div>

              {/* Logo Upload Row */}
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center gap-3.5 border-b border-slate-100 dark:border-slate-800/80">
                <div className="size-12 sm:size-13 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-sm shrink-0 overflow-hidden shadow-2xs">
                  {avatarUrl ? (
                    <img src={fullUrl(avatarUrl)} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span>{(orgName || 'FF').slice(0, 2).toUpperCase()}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold rounded-lg cursor-pointer transition-colors shadow-2xs bg-white dark:bg-slate-900">
                    <FiUpload className="size-3 text-slate-500" />
                    <span>{avatarUploading ? 'Uploading...' : 'Upload Logo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={avatarUploading}
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    PNG or SVG, at least 256×256px. Max 2MB.
                  </p>
                </div>
              </div>

              {/* Form Grid (Compact Sizing: h-8.5 inputs, text-xs) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 pt-3.5">
                {/* Row 1: Organization Name * | Industry */}
                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                    Organization Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="FieldForce Operations"
                    className="h-8.5 text-xs border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg px-3"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                    Industry
                  </label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger className="h-8.5 text-xs border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg px-3">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Field Service & Maintenance">Field Service & Maintenance</SelectItem>
                      <SelectItem value="Retail & MiniStore Commerce">Retail & MiniStore Commerce</SelectItem>
                      <SelectItem value="Food & Beverage">Food & Beverage / Restaurant</SelectItem>
                      <SelectItem value="Fashion & Apparel">Fashion & Apparel</SelectItem>
                      <SelectItem value="Technology & Electronics">Technology & Electronics</SelectItem>
                      <SelectItem value="General Merchant">General Merchant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Row 2: Website | Phone */}
                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                    Website
                  </label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://fieldforce.io"
                    className="h-8.5 text-xs border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg px-3"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                    Phone
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (512) 555-0148"
                    className="h-8.5 text-xs border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg px-3"
                  />
                </div>

                {/* Row 3: Email * | Postal Code */}
                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ops@fieldforce.io"
                    className="h-8.5 text-xs border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg px-3"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                    Postal Code
                  </label>
                  <Input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="78701"
                    className="h-8.5 text-xs border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg px-3"
                  />
                </div>

                {/* Row 4: Address (col-span-2) */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                    Address
                  </label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="900 Congress Ave, Suite 200"
                    className="h-8.5 text-xs border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg px-3"
                  />
                </div>

                {/* Row 5: City | State */}
                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                    City
                  </label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Austin"
                    className="h-8.5 text-xs border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg px-3"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                    State
                  </label>
                  <Input
                    value={stateRegion}
                    onChange={(e) => setStateRegion(e.target.value)}
                    placeholder="Texas"
                    className="h-8.5 text-xs border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg px-3"
                  />
                </div>

                {/* Row 6: Country (col-span-2) */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                    Country
                  </label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="h-8.5 text-xs border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg px-3">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="Cambodia">Cambodia</SelectItem>
                      <SelectItem value="Singapore">Singapore</SelectItem>
                      <SelectItem value="Thailand">Thailand</SelectItem>
                      <SelectItem value="Vietnam">Vietnam</SelectItem>
                      <SelectItem value="Malaysia">Malaysia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Row 7: Organization Description (col-span-2) */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                    Organization Description
                  </label>
                  <Textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="FieldForce Operations delivers field service, dispatch, and HR management for multi-site service teams."
                    className="text-xs border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg resize-none leading-relaxed p-2.5"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetGeneral}
                  className="h-8 px-4 text-xs font-medium border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveGeneral}
                  disabled={savingGeneral}
                  style={{
                    backgroundColor: 'var(--btn-primary-hex, var(--primary-hex, #ec4899))',
                  }}
                  className="h-8 px-4 text-xs font-semibold hover:brightness-90 text-white rounded-lg shadow-2xs flex items-center gap-1.5"
                >
                  {savingGeneral ? (
                    <>
                      <span className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FiSave className="size-3" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* TAB 2: ROLES & PERMISSIONS */}
          {activeView === 'roles' && (
            <Card className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-start gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="size-7 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/50 flex items-center justify-center shrink-0 shadow-2xs">
                  <FiShield className="size-3.5" />
                </div>
                <div>
                  <h2 className="text-[13px] sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    Roles & Permissions
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    Manage role permissions, login credentials, and account authentication.
                  </p>
                </div>
              </div>

              {/* Password Change Form */}
              <form onSubmit={handlePasswordSubmit} className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                      Current Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type={showCurrentPw ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-8.5 text-xs border-slate-200/90 dark:border-slate-700 pr-8 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showCurrentPw ? <FiEyeOff className="size-3.5" /> : <FiEye className="size-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                      New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPw ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="h-8.5 text-xs border-slate-200/90 dark:border-slate-700 pr-8 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPw ? <FiEyeOff className="size-3.5" /> : <FiEye className="size-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                      Confirm New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPw ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="h-8.5 text-xs border-slate-200/90 dark:border-slate-700 pr-8 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPw ? <FiEyeOff className="size-3.5" /> : <FiEye className="size-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    disabled={savingPassword}
                    style={{
                      backgroundColor: 'var(--btn-primary-hex, var(--primary-hex, #ec4899))',
                    }}
                    className="h-8 px-4 text-xs font-semibold hover:brightness-90 text-white rounded-lg shadow-2xs flex items-center gap-1.5"
                  >
                    <FiLock className="size-3" />
                    <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
                  </Button>
                </div>
              </form>

              {/* 2FA switch */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Two-Factor Authentication (2FA)
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Add two-step verification code when signing in from unrecognized browsers.
                    </div>
                  </div>
                  <Switch
                    checked={twoFactorAuth}
                    onCheckedChange={(val) => {
                      setTwoFactorAuth(val);
                      toast.success(val ? '2FA enabled' : '2FA disabled');
                    }}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* TAB 3: WORKFLOW (Matching SmartHR settings-workflow) */}
          {activeView === 'workflow' && (
            <Card className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-start gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="size-7 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/50 flex items-center justify-center shrink-0 shadow-2xs">
                  <FiLayers className="size-3.5" />
                </div>
                <div>
                  <h2 className="text-[13px] sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    Workflow Configuration
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    Design approval chains and automation for service, store operations, and orders.
                  </p>
                </div>
              </div>

              {/* SmartHR Workflow List */}
              <div className="space-y-2.5">
                {[
                  {
                    title: 'Service Request Approval',
                    status: 'Active',
                    dept: 'Field Service',
                    trigger: 'Triggered by Service Request Created',
                    approvals: '1 approvals',
                  },
                  {
                    title: 'Work Order Assignment',
                    status: 'Active',
                    dept: 'Field Service',
                    trigger: 'Triggered by Work Order Created',
                    approvals: '0 approvals',
                  },
                  {
                    title: 'POS Order Auto-Fulfillment',
                    status: 'Active',
                    dept: 'Store Operations',
                    trigger: 'Triggered by Payment Confirmation',
                    approvals: 'Direct POS',
                  },
                  {
                    title: 'Purchase Order Approval',
                    status: 'Paused',
                    dept: 'Inventory',
                    trigger: 'Triggered by Low Stock Threshold',
                    approvals: '1 approvals',
                  },
                  {
                    title: 'Staff Onboarding',
                    status: 'Active',
                    dept: 'Management',
                    trigger: 'Triggered by New Merchant Employee',
                    approvals: '2 steps',
                  },
                ].map((wf, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-lg border border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                        <FiLayers className="size-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {wf.title}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                              wf.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                            }`}
                          >
                            {wf.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {wf.dept} • {wf.trigger}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      <span className="text-[10px] text-slate-400">{wf.approvals}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2.5 text-xs text-slate-700 dark:text-slate-200 hover:text-orange-600 gap-1 rounded-md"
                        onClick={() => toast.success(`Managing ${wf.title}`)}
                      >
                        <span>Manage</span>
                        <FiArrowRight className="size-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeView === 'notifications' && (
            <Card className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3.5">
              <div className="flex items-start gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="size-7 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/50 flex items-center justify-center shrink-0 shadow-2xs">
                  <FiBell className="size-3.5" />
                </div>
                <div>
                  <h2 className="text-[13px] sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    Notifications & Channels
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    Configure Telegram order slips, acoustic sound alerts, and threshold triggers.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Telegram Order Alerts
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Send direct receipt slips to Telegram merchant channel in real-time.
                    </div>
                  </div>
                  <Switch
                    checked={telegramAlerts}
                    onCheckedChange={(val) => {
                      setTelegramAlerts(val);
                      toast.success(val ? 'Telegram alerts enabled' : 'Telegram alerts disabled');
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      New Order Audio Chime
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Play acoustic chime when an incoming order arrives at the POS.
                    </div>
                  </div>
                  <Switch
                    checked={orderAlerts}
                    onCheckedChange={(val) => {
                      setOrderAlerts(val);
                      toast.success(val ? 'Audio chime enabled' : 'Audio chime disabled');
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Low Stock Threshold Alerts
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Notify store management whenever product inventory falls below 5 items.
                    </div>
                  </div>
                  <Switch
                    checked={stockAlerts}
                    onCheckedChange={(val) => {
                      setStockAlerts(val);
                      toast.success(val ? 'Stock alert enabled' : 'Stock alert disabled');
                    }}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* TAB 5: LOCALIZATION */}
          {activeView === 'localization' && (
            <Card className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-start gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="size-7 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/50 flex items-center justify-center shrink-0 shadow-2xs">
                  <FiGlobe className="size-3.5" />
                </div>
                <div>
                  <h2 className="text-[13px] sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    Localization & Regional Preferences
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    Select your preferred language, currency representation, and timezone format.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                    Language
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLanguage('kh')}
                      className={`h-9 px-3 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        language === 'kh'
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>🇰🇭 ភាសាខ្មែរ</span>
                      {language === 'kh' && <FiCheck className="size-3" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      className={`h-9 px-3 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        language === 'en'
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>🇺🇸 English</span>
                      {language === 'en' && <FiCheck className="size-3" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                    Primary Currency
                  </label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="h-9 text-xs border-slate-200/90 dark:border-slate-700 rounded-lg">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                      <SelectItem value="KHR">KHR (៛) - Khmer Riel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 6: SYSTEM & DEVICES */}
          {activeView === 'system' && (
            <Card className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-start gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="size-7 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/50 flex items-center justify-center shrink-0 shadow-2xs">
                  <FiCpu className="size-3.5" />
                </div>
                <div>
                  <h2 className="text-[13px] sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    System & Connected Devices
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    Review active web sessions, device authentication tokens, and application status.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                      <FiMonitor className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>Chrome on macOS (Current Session)</span>
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[9px] py-0 px-1">
                          Active
                        </Badge>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Phnom Penh, Cambodia • IP: 127.0.0.1 • Last active just now
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                      <FiSmartphone className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        Safari on iOS (POS Tablet)
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Phnom Penh, Cambodia • IP: 192.168.1.45 • Last active 2 hours ago
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md"
                    onClick={() => toast.success('Device revoked')}
                  >
                    Revoke
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
