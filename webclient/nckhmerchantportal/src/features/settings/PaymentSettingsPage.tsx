import React, { useEffect, useState } from 'react';
import toast from '../../utils/toast';
import {
  FiSend,
} from 'react-icons/fi';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  QrCode,
  Building,
  KeyRound,
  Radio,
  CheckCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { getShopDetail, testPayment, updateShop } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { sound } from '@/utils/sound';

// shadcn UI Components
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface AbaSettings {
  profile_id: string;
  secret_key: string;
  test_mode: boolean;
}

interface TestResult {
  ok?: boolean;
  profile_id?: string;
  transaction_id?: string;
  amount?: string;
  hash?: string;
  checkout_url?: string;
}

export default function PaymentSettings() {
  const { user, shop } = useAuth();
  const { t } = useLanguage();

  const [aba, setAba] = useState<AbaSettings>({
    profile_id: '',
    secret_key: '',
    test_mode: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const shopName =
    shop?.shop_name ||
    shop?.name ||
    user?.shop_name ||
    'MiniStore';

  const isConfigured = Boolean(aba.profile_id.trim() && aba.secret_key.trim());

  useEffect(() => {
    if (!user?.shop_id) return;
    getShopDetail(user.shop_id)
      .then((s) => {
        setAba({
          profile_id: s.aba_settings?.profile_id || '',
          secret_key: s.aba_settings?.secret_key || '',
          test_mode: s.aba_settings?.test_mode ?? true,
        });
      })
      .catch((err) => {
        console.error('Failed to load shop ABA settings:', err);
      })
      .finally(() => setLoading(false));
  }, [user?.shop_id]);

  const save = async () => {
    sound.playClick();
    setSaving(true);
    try {
      await updateShop(user.shop_id, { aba_settings: aba });
      sound.playSuccess();
      toast.success(t('payment.saveSuccess', 'Payment settings saved successfully!'));
    } catch (err: any) {
      sound.playError();
      toast.error(err?.response?.data?.detail || err?.response?.data?.message || t('payment.saveFailed', 'Failed to save settings'));
    } finally {
      setSaving(false);
    }
  };

  const runTest = async () => {
    sound.playClick();
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testPayment(user.shop_id);
      sound.playSuccess();
      toast.success(t('payment.testSuccess', 'ABA Payway configuration is valid & connected!'));
      setTestResult(res);
    } catch (err: any) {
      sound.playError();
      toast.error(err?.response?.data?.detail || err?.response?.data?.message || t('payment.testFailed', 'Test connection failed'));
      setTestResult(null);
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    sound.playClick();
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success(t('payment.copiedToClipboard', 'Copied to clipboard!'));
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Breadcrumbs />
        <Card className="p-8 flex flex-col items-center justify-center min-h-[300px] space-y-3">
          <RefreshCw className="size-6 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">{t('payment.loading', 'Loading payment configurations...')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      {/* ─── Breadcrumbs & Header ────────────────────────────────────── */}
      <div className="space-y-2">
        <Breadcrumbs />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {t('payment.title', 'Payment Settings (ABA Pay)')}
              </h1>
              {isConfigured ? (
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-bold gap-1"
                >
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t('payment.statusConnected', 'Connected & Active')}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs font-bold gap-1"
                >
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  {t('payment.statusIncomplete', 'Setup Incomplete')}
                </Badge>
              )}

              {aba.test_mode ? (
                <Badge variant="secondary" className="text-xs font-medium bg-muted text-muted-foreground border">
                  {t('payment.badgeSandbox', 'Sandbox Test Mode')}
                </Badge>
              ) : (
                <Badge className="text-xs font-bold bg-[#004B87] text-white">
                  {t('payment.badgeLive', 'Live Production')}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t(
                'payment.subtitle',
                'Manage your ABA Payway merchant profile, KHQR gateway credentials, and automated checkout verification.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              onClick={save}
              disabled={saving}
              className="gap-2 font-bold px-5 shadow-sm"
            >
              {saving ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  <span>{t('payment.saving', 'Saving...')}</span>
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  <span>{t('payment.saveSettings', 'Save Settings')}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Contact Telegram Banner ─────────────────────────────────── */}
      <Card className="overflow-hidden border border-sky-500/20 bg-gradient-to-br from-[#011F46] via-[#052d5e] to-[#011F46] text-white shadow-sm rounded-2xl">
        <div className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="size-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner text-[#38bdf8]">
              <FiSend className="size-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base sm:text-lg text-white tracking-tight leading-tight">
                {t('payment.telegramBannerTitle', 'Contact us on Telegram to request ABA Payway for your shop')}
              </h3>
              <p className="text-xs sm:text-sm text-sky-200/90 leading-relaxed max-w-2xl">
                {t('payment.telegramBannerDesc', 'Contact us on Telegram to request or set up ABA Payway (KHQR) for your shop — our team will assist you in acquiring your Merchant Profile ID & Secret Key credentials.')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <a
              href="https://t.me/your_telegram"
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#FB6E08] hover:bg-[#e05f03] active:scale-95 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <FiSend className="size-4" />
              <span>{t('payment.telegramButton', 't.me/your_telegram')}</span>
              <ExternalLink className="size-3.5 opacity-80" />
            </a>
          </div>
        </div>
      </Card>

      {/* ─── Main Two-Column Layout ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form & Actions */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Card className="rounded-2xl border shadow-xs">
            <CardHeader className="space-y-1.5 pb-4 border-b border-border/80">
              <div className="flex items-center gap-2 text-primary">
                <CreditCard className="size-5 text-primary" />
                <CardTitle className="text-base font-bold">
                  {t('payment.configTitle', 'ABA Pay (KHQR) Configuration')}
                </CardTitle>
              </div>
              <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                {t('payment.configDesc', 'Each shop uses its own ABA Pay profile (KHQRcc gateway). Enter the Profile ID and Secret Key from KHQRcc Settings. Until a valid Profile ID + Secret Key are saved, customers will NOT see a QR code — the checkout page shows "Online payment unavailable" instead.')}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pt-5">
              {/* Profile ID Input */}
              <div className="space-y-1.5">
                <Label htmlFor="aba_profile_id" className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building className="size-3.5 text-muted-foreground" />
                    <span>{t('payment.profileIdLabel', 'ABA Pay Profile ID (Merchant ID)')}</span>
                    <span className="text-rose-500">*</span>
                  </span>
                  {aba.profile_id && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(aba.profile_id, 'profile_id')}
                      className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'profile_id' ? (
                        <>
                          <Check className="size-3 text-emerald-500" />
                          <span className="text-emerald-500 font-semibold">{t('payment.copied', 'Copied')}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" />
                          <span>{t('payment.copy', 'Copy')}</span>
                        </>
                      )}
                    </button>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id="aba_profile_id"
                    value={aba.profile_id}
                    onChange={(e) => setAba({ ...aba, profile_id: e.target.value })}
                    placeholder={t('payment.profileIdPlaceholder', 'e.g. 102001234567890')}
                    className="h-10 text-xs font-mono pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    <CreditCard className="size-4 opacity-50" />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {t('payment.profileIdHelp', 'Provided in your ABA Payway merchant onboarding credentials.')}
                </p>
              </div>

              {/* Secret Key Input */}
              <div className="space-y-1.5">
                <Label htmlFor="aba_secret_key" className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="size-3.5 text-muted-foreground" />
                    <span>{t('payment.secretKeyLabel', 'ABA Pay Secret Key')}</span>
                    <span className="text-rose-500">*</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1 cursor-pointer"
                    >
                      {showSecretKey ? (
                        <>
                          <EyeOff className="size-3" />
                          <span>{t('payment.hide', 'Hide')}</span>
                        </>
                      ) : (
                        <>
                          <Eye className="size-3" />
                          <span>{t('payment.reveal', 'Reveal')}</span>
                        </>
                      )}
                    </button>
                    {aba.secret_key && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(aba.secret_key, 'secret_key')}
                        className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'secret_key' ? (
                          <>
                            <Check className="size-3 text-emerald-500" />
                            <span className="text-emerald-500 font-semibold">{t('payment.copied', 'Copied')}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" />
                            <span>{t('payment.copy', 'Copy')}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </Label>
                <div className="relative">
                  <Input
                    id="aba_secret_key"
                    type={showSecretKey ? 'text' : 'password'}
                    value={aba.secret_key}
                    onChange={(e) => setAba({ ...aba, secret_key: e.target.value })}
                    placeholder={t('payment.secretKeyPlaceholder', 'Your ABA secret key')}
                    className="h-10 text-xs font-mono pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    <ShieldCheck className="size-4 opacity-50" />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {t('payment.hashFormat', 'Hash format: sha1(secret + transaction_id + amount + success_url + remark)')}
                </p>
              </div>

              {/* Sandbox / Test Mode Toggle Inset */}
              <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor="aba_test_mode" className="text-xs font-bold text-foreground cursor-pointer flex items-center gap-2">
                    <span>{t('payment.sandboxToggleTitle', 'Sandbox / Test Mode')}</span>
                    {aba.test_mode ? (
                      <Badge variant="outline" className="text-[10px] font-bold bg-amber-500/10 text-amber-600 border-amber-500/20">
                        {t('payment.testModeActive', 'Test Mode Active')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] font-bold bg-blue-500/10 text-blue-600 border-blue-500/20">
                        {t('payment.liveProduction', 'Live Production')}
                      </Badge>
                    )}
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    {t('payment.sandboxToggleDesc', 'When enabled, mock payments auto-succeed without debiting real bank accounts or charging customer cards.')}
                  </p>
                </div>
                <Switch
                  id="aba_test_mode"
                  checked={aba.test_mode}
                  onCheckedChange={(checked) => {
                    sound.playClick();
                    setAba({ ...aba, test_mode: checked });
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={runTest}
                  disabled={testing || !isConfigured}
                  className="gap-2 text-xs font-bold"
                >
                  {testing ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin text-primary" />
                      <span>{t('payment.testingConfig', 'Testing Configuration...')}</span>
                    </>
                  ) : (
                    <>
                      <Radio className="size-3.5 text-primary" />
                      <span>{t('payment.testBtn', 'Test Payment Settings')}</span>
                    </>
                  )}
                </Button>

                {!isConfigured && (
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                    <AlertCircle className="size-3.5 shrink-0" />
                    {t('payment.testDisabledWarning', 'Enter Profile ID & Secret Key to enable testing')}
                  </span>
                )}
              </div>

              {/* Test Result Container */}
              {testResult && (
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-900 dark:text-emerald-200 space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        {t('payment.testSuccessTitle', 'ABA Payway Configuration Valid!')}
                      </span>
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold">
                      {t('payment.statusOk', '200 OK')}
                    </Badge>
                  </div>

                  <div className="space-y-1 font-mono text-[11px] text-muted-foreground bg-card/60 p-2.5 rounded-lg border border-border/60">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/80 font-bold">{t('payment.transactionId', 'Transaction ID:')}</span>
                      <span className="text-foreground select-all">{testResult.transaction_id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/80 font-bold">{t('payment.amount', 'Amount:')}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">${testResult.amount || '1.00'} USD</span>
                    </div>
                    <div className="text-[10px] truncate opacity-70 mt-1 pt-1 border-t border-border/40">
                      {t('payment.hashLabel', 'Hash:')} {testResult.hash}
                    </div>
                  </div>

                  {testResult.checkout_url && (
                    <a
                      href={testResult.checkout_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-0.5"
                    >
                      <span>{t('payment.openCheckoutUrl', 'Open Live Test Checkout URL')}</span>
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Flow Guide Card */}
          <Card className="rounded-2xl border shadow-xs bg-muted/20">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                <span>{t('payment.flowTitle', 'Payment Processing Flow')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-card border border-border flex flex-col items-center justify-center space-y-1 shadow-2xs">
                  <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">1</div>
                  <span className="font-semibold text-foreground text-[11px]">{t('payment.step1Title', 'Place Order')}</span>
                  <span className="text-[10px] text-muted-foreground">{t('payment.step1Desc', 'Customer orders')}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-card border border-border flex flex-col items-center justify-center space-y-1 shadow-2xs">
                  <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">2</div>
                  <span className="font-semibold text-foreground text-[11px]">{t('payment.step2Title', 'KHQR Code')}</span>
                  <span className="text-[10px] text-muted-foreground">{t('payment.step2Desc', 'Dynamic QR shown')}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-card border border-border flex flex-col items-center justify-center space-y-1 shadow-2xs">
                  <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">3</div>
                  <span className="font-semibold text-foreground text-[11px]">{t('payment.step3Title', 'ABA Mobile')}</span>
                  <span className="text-[10px] text-muted-foreground">{t('payment.step3Desc', 'Customer scans')}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-card border border-border flex flex-col items-center justify-center space-y-1 shadow-2xs">
                  <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">4</div>
                  <span className="font-semibold text-foreground text-[11px]">{t('payment.step4Title', 'Webhook')}</span>
                  <span className="text-[10px] text-muted-foreground">{t('payment.step4Desc', 'Instant callback')}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-card border border-border flex flex-col items-center justify-center space-y-1 shadow-2xs">
                  <div className="size-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-[10px]">5</div>
                  <span className="font-semibold text-foreground text-[11px]">{t('payment.step5Title', 'PDF Receipt')}</span>
                  <span className="text-[10px] text-muted-foreground">{t('payment.step5Desc', 'Auto Telegram ping')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Customer KHQR Checkout Mockup */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <Card className="rounded-2xl border shadow-sm overflow-hidden sticky top-20 bg-card">
            <CardHeader className="p-4 bg-muted/40 border-b border-border/80 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <QrCode className="size-4 text-primary" />
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {t('payment.previewTitle', 'Customer Checkout Preview')}
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold">
                {t('payment.liveSimulation', 'Live Simulation')}
              </Badge>
            </CardHeader>

            <CardContent className="p-5 flex flex-col items-center text-center">
              {/* Payment Receipt / Ticket Shape */}
              <div className="w-full max-w-[280px] rounded-2xl border border-border bg-card shadow-md overflow-hidden relative">
                {/* ABA Header Ribbon */}
                <div className="bg-[#004B87] text-white p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="tracking-wider uppercase">{t('payment.paywayHeader', 'ABA Payway')}</span>
                    <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold">
                      {t('payment.khqrBadge', 'KHQR')}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-sky-100 truncate pt-1">
                    {shopName}
                  </div>
                </div>

                {/* Amount Section */}
                <div className="p-3 bg-muted/30 border-b border-dashed border-border text-center">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    {t('payment.totalAmountDue', 'Total Amount Due')}
                  </span>
                  <div className="text-xl font-black text-foreground">
                    $1.00 <span className="text-xs font-semibold text-muted-foreground">USD</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">≈ 4,100 KHR</div>
                </div>

                {/* QR Code Container */}
                <div className="p-5 flex flex-col items-center justify-center bg-white dark:bg-slate-950">
                  {isConfigured ? (
                    <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white shadow-xs inline-block">
                      <div className="size-36 bg-slate-900 rounded-lg flex flex-col items-center justify-center p-2 relative overflow-hidden">
                        {/* Stylized QR Code Mock */}
                        <div className="w-full h-full border-2 border-white/80 rounded flex items-center justify-center relative">
                          <QrCode className="size-24 text-white" strokeWidth={1.5} />
                          {/* Central Bakong/ABA Badge */}
                          <div className="absolute size-7 rounded-full bg-[#E1251B] border-2 border-white flex items-center justify-center shadow-md">
                            <span className="text-[8px] font-black text-white">{t('payment.khqrBadge', 'KHQR')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="size-36 rounded-xl border border-dashed border-border bg-muted/40 flex flex-col items-center justify-center p-3 text-center space-y-2">
                      <AlertCircle className="size-8 text-amber-500" />
                      <span className="text-[11px] font-bold text-muted-foreground leading-tight">
                        {t('payment.onlineUnavailable', 'Online payment unavailable')}
                      </span>
                    </div>
                  )}

                  <div className="mt-3 space-y-0.5">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t('payment.scanWithAba', 'Scan with ABA Mobile')}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {t('payment.scanWithAnyApp', 'or any Bakong KHQR banking application')}
                    </p>
                  </div>
                </div>

                {/* Ticket Punched Notch Effect */}
                <div className="p-3 bg-muted/40 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{t('payment.merchantIdLabel', 'Merchant ID:')}</span>
                  <span className="font-mono font-bold text-foreground">
                    {aba.profile_id ? `${aba.profile_id.substring(0, 4)}...${aba.profile_id.slice(-4)}` : t('payment.notSet', 'Not Set')}
                  </span>
                </div>
              </div>

              {/* Status Note */}
              <div className="mt-4 w-full text-left p-3 rounded-xl border border-border/80 bg-muted/30 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <ShieldCheck className="size-4 text-primary" />
                  <span>{t('payment.webhookSecurityTitle', 'Webhook Security')}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t('payment.webhookSecurityDesc', 'ABA Payway webhooks are cryptographically authenticated via SHA-1 HMAC hashing to prevent spoofed transactions.')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
