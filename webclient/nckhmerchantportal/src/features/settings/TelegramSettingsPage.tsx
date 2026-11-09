import React, { useEffect, useState } from 'react';
import toast from '../../utils/toast';
import {
  Send,
  Link2,
  RefreshCw,
  Copy,
  Check,
  MessageSquare,
  Bot,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Globe,
  Bell,
  Eye,
  EyeOff,
  Save,
  Radio,
  Sparkles,
  Terminal,
  ShoppingBag,
} from 'lucide-react';
import {
  getShopDetail,
  getTelegramSettings,
  setTelegramWebhook,
  testTelegram,
  updateShop,
} from '../../api';
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
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function TelegramSettings() {
  const { user, shop } = useAuth();
  const { t } = useLanguage();

  const [tg, setTg] = useState({ bot_token: '', chat_id: '', enabled: false });
  const [profile, setProfile] = useState<{
    profile_id: string;
    secret_key: string;
    linked_chats: (string | number)[];
    bot_username: string;
  }>({
    profile_id: '',
    secret_key: '',
    linked_chats: [],
    bot_username: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [webhookBusy, setWebhookBusy] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  const shopName =
    shop?.shop_name ||
    shop?.name ||
    user?.shop_name ||
    'MiniStore';

  const isConfigured = Boolean(tg.bot_token.trim());

  const load = () => {
    if (!user?.shop_id) return;
    setLoading(true);
    Promise.all([
      getShopDetail(user.shop_id),
      getTelegramSettings(user.shop_id).catch(() => null),
    ])
      .then(([s, st]) => {
        setTg({
          bot_token: s.telegram_settings?.bot_token || '',
          chat_id: s.telegram_settings?.chat_id || '',
          enabled: s.telegram_settings?.enabled ?? false,
        });
        if (st) {
          setProfile({
            profile_id: st.profile_id || '',
            secret_key: st.secret_key || '',
            linked_chats: st.linked_chats || [],
            bot_username: st.bot_username || '',
          });
        }
      })
      .catch((err) => {
        console.error('Failed to load shop telegram settings:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [user?.shop_id]);

  const save = async () => {
    sound.playClick();
    setSaving(true);
    try {
      await updateShop(user.shop_id, { telegram_settings: tg });
      sound.playSuccess();
      toast.success(t('telegram.saveSuccess', 'Telegram settings saved successfully!'));
    } catch (err: any) {
      sound.playError();
      toast.error(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          t('telegram.saveFailed', 'Failed to save Telegram settings')
      );
    } finally {
      setSaving(false);
    }
  };

  const runTest = async () => {
    sound.playClick();
    setTesting(true);
    try {
      const res = await testTelegram({ shop_id: user.shop_id });
      if (res?.ok) {
        sound.playSuccess();
        toast.success(
          t('telegram.testSuccess', 'Test notification sent! Check your Telegram chat.')
        );
      } else {
        sound.playError();
        toast.error(res?.detail || t('telegram.testFailed', 'Failed to send test notification'));
      }
    } catch (err: any) {
      sound.playError();
      toast.error(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          t('telegram.testFailed', 'Failed to send test notification')
      );
    } finally {
      setTesting(false);
    }
  };

  const runWebhook = async () => {
    sound.playClick();
    setWebhookBusy(true);
    try {
      await setTelegramWebhook(user.shop_id);
      sound.playSuccess();
      toast.success(
        t('telegram.webhookSuccess', 'Webhook registered! You can now /start the bot and LINK this shop.')
      );
      load();
    } catch (err: any) {
      sound.playError();
      toast.error(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          t('telegram.webhookFailed', 'Failed to register webhook')
      );
    } finally {
      setWebhookBusy(false);
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        sound.playClick();
        setCopiedField(fieldId);
        setTimeout(() => setCopiedField(null), 2000);
        toast.success(t('telegram.copiedToClipboard', 'Copied to clipboard!'));
      })
      .catch(() => {
        sound.playError();
        toast.error(t('telegram.copyFailed', 'Failed to copy to clipboard'));
      });
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Breadcrumbs />
        <Card className="p-8 flex flex-col items-center justify-center min-h-[300px] space-y-3">
          <RefreshCw className="size-6 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">
            {t('telegram.loading', 'Loading Telegram configurations...')}
          </p>
        </Card>
      </div>
    );
  }

  const linkCommand =
    profile.profile_id && profile.secret_key
      ? `LINK ${profile.profile_id} ${profile.secret_key}`
      : '';

  const canTest = Boolean(tg.bot_token && (tg.chat_id || profile.linked_chats.length > 0));

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      {/* ─── Breadcrumbs & Header ────────────────────────────────────── */}
      <div className="space-y-2">
        <Breadcrumbs />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {t('telegram.title', 'Telegram Bot')}
              </h1>

              {isConfigured ? (
                tg.enabled ? (
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-bold gap-1"
                  >
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t('telegram.statusActive', 'Connected & Active')}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs font-bold gap-1"
                  >
                    <span className="size-1.5 rounded-full bg-amber-500" />
                    {t('telegram.statusDisabled', 'Notifications Disabled')}
                  </Badge>
                )
              ) : (
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs font-bold gap-1"
                >
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  {t('telegram.statusNotConfigured', 'Setup Incomplete')}
                </Badge>
              )}

              {profile.linked_chats.length > 0 && (
                <Badge variant="secondary" className="text-xs font-medium bg-muted text-muted-foreground border">
                  {profile.linked_chats.length} {t('telegram.linkedBadge', 'linked')}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t(
                'telegram.subtitle',
                'Connect your Telegram bot to receive real-time order and payment notifications directly in your groups or channels.'
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
                  <span>{t('telegram.saving', 'Saving...')}</span>
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  <span>{t('telegram.saveSettings', 'Save Settings')}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Main Two-Column Layout ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Configuration Cards */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Card 1: Link Your Shop to a Telegram Chat */}
          <Card className="rounded-2xl border shadow-xs">
            <CardHeader className="space-y-1.5 pb-4 border-b border-border/80 flex flex-row items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-primary">
                  <Link2 className="size-5 text-primary" />
                  <CardTitle className="text-base font-bold">
                    {t('telegram.card1Title', 'Link Your Shop to a Telegram Chat')}
                  </CardTitle>
                </div>
                <CardDescription className="text-xs leading-relaxed text-muted-foreground mt-1">
                  {t(
                    'telegram.card1Desc',
                    'The shop bot receives order & payment notifications in any chat that links to this shop.'
                  )}
                </CardDescription>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  sound.playClick();
                  load();
                }}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground shrink-0"
              >
                <RefreshCw className="size-3.5" />
                <span>{t('telegram.refresh', 'Refresh')}</span>
              </Button>
            </CardHeader>

            <CardContent className="space-y-5 pt-5">
              {/* Inset Stepper Box */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3.5">
                <p className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" />
                  <span>{t('telegram.howToLinkTitle', 'How to link your group (3 steps):')}</span>
                </p>

                <div className="space-y-2.5 text-xs text-muted-foreground">
                  {/* Step 1 */}
                  <div className="flex items-start gap-2.5">
                    <span className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="leading-relaxed">
                      <span>{t('telegram.step1', 'Add the bot to your group from Telegram:')} </span>
                      {profile.bot_username ? (
                        <a
                          href={`https://t.me/${profile.bot_username}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-600 dark:text-sky-400 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          @{profile.bot_username}
                          <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground font-medium">
                          {t('telegram.step1SaveFirst', 'save the Bot Token below first, then refresh')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-2.5">
                    <span className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="leading-relaxed">
                      <span>
                        {t('telegram.step2', 'In that group, press Start (or send /start).')}
                      </span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-2.5">
                    <span className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="leading-relaxed">
                      <span>{t('telegram.step3', 'Send the command below in the group (or copy it):')}</span>
                    </div>
                  </div>
                </div>

                {/* Command Terminal Box */}
                {linkCommand ? (
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 bg-slate-950 dark:bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-xs px-3.5 py-2.5 rounded-xl break-all flex items-center gap-2 shadow-inner">
                      <Terminal className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="select-all">{linkCommand}</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(linkCommand, 'link_command')}
                      className="size-9 rounded-xl shrink-0"
                      title={t('telegram.copyCommand', 'Copy command')}
                    >
                      {copiedField === 'link_command' ? (
                        <Check className="size-4 text-emerald-500" />
                      ) : (
                        <Copy className="size-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground italic pt-1">
                    {t(
                      'telegram.profileIdNotSet',
                      'Profile ID / Secret Key will appear here once the bot token is saved.'
                    )}
                  </p>
                )}

                {/* Profile ID & Secret Key Inset Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border">
                  {/* Profile ID */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-muted-foreground">
                      {t('telegram.profileIdLabel', 'Profile ID')}
                    </Label>
                    <div className="flex items-center gap-1.5">
                      <Input
                        readOnly
                        value={profile.profile_id || '—'}
                        className="h-9 text-xs font-mono bg-background"
                      />
                      {profile.profile_id && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(profile.profile_id, 'profile_id')}
                          className="size-9 rounded-xl shrink-0"
                        >
                          {copiedField === 'profile_id' ? (
                            <Check className="size-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="size-3.5 text-muted-foreground" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Secret Key */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] font-bold text-muted-foreground">
                        {t('telegram.secretKeyLabel', 'Secret Key')}
                      </Label>
                      {profile.secret_key && (
                        <button
                          type="button"
                          onClick={() => setShowSecretKey(!showSecretKey)}
                          className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1 cursor-pointer"
                        >
                          {showSecretKey ? (
                            <>
                              <EyeOff className="size-3" />
                              <span>{t('telegram.hide', 'Hide')}</span>
                            </>
                          ) : (
                            <>
                              <Eye className="size-3" />
                              <span>{t('telegram.reveal', 'Reveal')}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Input
                        readOnly
                        type={showSecretKey ? 'text' : 'password'}
                        value={profile.secret_key || '—'}
                        className="h-9 text-xs font-mono bg-background"
                      />
                      {profile.secret_key && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(profile.secret_key, 'secret_key')}
                          className="size-9 rounded-xl shrink-0"
                        >
                          {copiedField === 'secret_key' ? (
                            <Check className="size-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="size-3.5 text-muted-foreground" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Webhook Register Button */}
                <div className="pt-2 border-t border-border space-y-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={runWebhook}
                    disabled={webhookBusy || !tg.bot_token}
                    className="gap-2 text-xs font-bold"
                  >
                    {webhookBusy ? (
                      <>
                        <RefreshCw className="size-3.5 animate-spin text-primary" />
                        <span>{t('telegram.registeringWebhook', 'Registering Webhook...')}</span>
                      </>
                    ) : (
                      <>
                        <Globe className="size-3.5 text-primary" />
                        <span>{t('telegram.registerWebhookBtn', 'Register Webhook (enables /start + LINK)')}</span>
                      </>
                    )}
                  </Button>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {t(
                      'telegram.webhookHelp',
                      'Required before any chat can link. Press it again after any update to re-register (also enables the bot to auto-reply with LINK instructions when added to a group).'
                    )}
                  </p>
                </div>
              </div>

              {/* Linked Chats Container */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground">
                    {t('telegram.linkedChatsTitle', 'Linked Chats')} ({profile.linked_chats.length})
                  </Label>
                </div>

                {profile.linked_chats.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-border bg-muted/20 text-center space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t(
                        'telegram.noLinkedChats',
                        'No chats linked yet. Follow the steps above to link the first one.'
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {profile.linked_chats.map((cid) => (
                      <div
                        key={cid}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border bg-card shadow-2xs"
                      >
                        <div className="size-7 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                          <MessageSquare className="size-3.5" />
                        </div>
                        <span className="font-mono text-xs text-foreground font-semibold truncate">
                          {cid}
                        </span>
                        <Badge
                          variant="outline"
                          className="ml-auto text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        >
                          ● {t('telegram.linkedBadge', 'linked')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Payment & Order Alerts Configuration */}
          <Card className="rounded-2xl border shadow-xs">
            <CardHeader className="space-y-1.5 pb-4 border-b border-border/80">
              <div className="flex items-center gap-2 text-primary">
                <Bell className="size-5 text-primary" />
                <CardTitle className="text-base font-bold">
                  {t('telegram.card2Title', 'Payment & Order Alerts')}
                </CardTitle>
              </div>
              <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                {t(
                  'telegram.card2Desc',
                  'Receive automatic notifications when a customer places an order or pays successfully. Create a bot with @BotFather and add it to your group to get the chat ID.'
                )}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pt-5">
              {/* Bot Token Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tg_bot_token" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Bot className="size-3.5 text-muted-foreground" />
                    <span>{t('telegram.botTokenLabel', 'Bot Token')}</span>
                    <span className="text-rose-500">*</span>
                  </Label>
                  {tg.bot_token && (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1 cursor-pointer"
                      >
                        {showToken ? (
                          <>
                            <EyeOff className="size-3" />
                            <span>{t('telegram.hide', 'Hide')}</span>
                          </>
                        ) : (
                          <>
                            <Eye className="size-3" />
                            <span>{t('telegram.reveal', 'Reveal')}</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(tg.bot_token, 'bot_token')}
                        className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'bot_token' ? (
                          <>
                            <Check className="size-3 text-emerald-500" />
                            <span className="text-emerald-500 font-semibold">{t('telegram.copied', 'Copied')}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" />
                            <span>{t('telegram.copyCommand', 'Copy')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="tg_bot_token"
                    type={showToken ? 'text' : 'password'}
                    value={tg.bot_token}
                    onChange={(e) => setTg({ ...tg, bot_token: e.target.value })}
                    placeholder={t('telegram.botTokenPlaceholder', '123456789:ABCdefGHI...')}
                    className="h-10 text-xs font-mono pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    <ShieldCheck className="size-4 opacity-50" />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {t(
                    'telegram.botTokenHelp',
                    'Create your bot with @BotFather, then paste its token here. Tokens are stored per-shop on the server.'
                  )}
                </p>
              </div>

              {/* Chat ID Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tg_chat_id" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <MessageSquare className="size-3.5 text-muted-foreground" />
                    <span>{t('telegram.chatIdLabel', 'Chat ID (group / channel)')}</span>
                  </Label>
                  {tg.chat_id && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(tg.chat_id, 'chat_id')}
                      className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'chat_id' ? (
                        <>
                          <Check className="size-3 text-emerald-500" />
                          <span className="text-emerald-500 font-semibold">{t('telegram.copied', 'Copied')}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" />
                          <span>{t('telegram.copyCommand', 'Copy')}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <Input
                  id="tg_chat_id"
                  value={tg.chat_id}
                  onChange={(e) => setTg({ ...tg, chat_id: e.target.value })}
                  placeholder={t('telegram.chatIdPlaceholder', '-1001234567890')}
                  className="h-10 text-xs font-mono"
                />
                <p className="text-[11px] text-muted-foreground">
                  {t(
                    'telegram.chatIdHelp',
                    'Negative IDs are supergroups; private chats use positive IDs.'
                  )}
                </p>
              </div>

              {/* Enable Notifications Switch Inset */}
              <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="tg_enabled"
                    className="text-xs font-bold text-foreground cursor-pointer flex items-center gap-2"
                  >
                    <span>{t('telegram.enableNotificationsLabel', 'Enable Telegram notifications')}</span>
                    {tg.enabled ? (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      >
                        {t('telegram.statusEnabled', 'Notifications Active')}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold bg-muted text-muted-foreground border-border"
                      >
                        {t('telegram.statusDisabled', 'Notifications Disabled')}
                      </Badge>
                    )}
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    {t(
                      'telegram.enableNotificationsDesc',
                      'When turned on, the system sends instant alerts for every store activity.'
                    )}
                  </p>
                </div>
                <Switch
                  id="tg_enabled"
                  checked={tg.enabled}
                  onCheckedChange={(checked) => {
                    sound.playClick();
                    setTg({ ...tg, enabled: checked });
                  }}
                />
              </div>

              {/* Send Test Notification Button */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={runTest}
                  disabled={testing || !canTest}
                  className="gap-2 text-xs font-bold"
                >
                  {testing ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin text-primary" />
                      <span>{t('telegram.sendingTest', 'Sending Test Notification...')}</span>
                    </>
                  ) : (
                    <>
                      <Send className="size-3.5 text-primary" />
                      <span>{t('telegram.sendTestBtn', 'Send Test Notification')}</span>
                    </>
                  )}
                </Button>

                {!canTest && (
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                    <AlertCircle className="size-3.5 shrink-0" />
                    {t(
                      'telegram.missingConfigWarning',
                      'Enter Bot Token and at least one Chat ID to send test alerts'
                    )}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 3: What Gets Sent */}
          <Card className="rounded-2xl border shadow-xs bg-muted/20">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                <span>{t('telegram.whatGetsSentTitle', 'What gets sent:')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2 text-xs">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-card border border-border shadow-2xs">
                <div className="size-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <ShoppingBag className="size-3.5" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground text-[11px]">
                    {t('telegram.whatGetsSent1', 'New order notification when a customer checks out.')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-card border border-border shadow-2xs">
                <div className="size-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="size-3.5" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground text-[11px]">
                    {t(
                      'telegram.whatGetsSent2',
                      'Payment-success notification (with order number, amount, customer) once ABA Pay confirms.'
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Telegram Notification Simulation & Setup Guide */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          {/* Mockup Preview Card */}
          <Card className="rounded-2xl border shadow-sm overflow-hidden sticky top-20 bg-card">
            <CardHeader className="p-4 bg-muted/40 border-b border-border/80 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Bot className="size-4 text-primary" />
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {t('telegram.previewTitle', 'Telegram Notification Preview')}
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold">
                {t('telegram.liveSimulation', 'Live Simulation')}
              </Badge>
            </CardHeader>

            <CardContent className="p-5 flex flex-col items-center">
              {/* Telegram Phone Simulation Frame */}
              <div className="w-full max-w-[300px] rounded-2xl border border-border bg-[#EFEFEF] dark:bg-slate-950 shadow-md overflow-hidden relative">
                {/* Telegram Header Bar */}
                <div className="bg-[#2AABEE] text-white p-3 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-white text-[#2AABEE] flex items-center justify-center font-bold text-xs shadow-xs">
                      <Send className="size-4 -rotate-45" />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                        <span>{profile.bot_username ? `@${profile.bot_username}` : `${shopName} Bot`}</span>
                        <span className="bg-white/20 text-[9px] px-1 rounded uppercase font-semibold">bot</span>
                      </div>
                      <div className="text-[10px] text-sky-100">online</div>
                    </div>
                  </div>
                </div>

                {/* Telegram Chat Message Bubble */}
                <div className="p-3.5 space-y-2">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl rounded-tl-xs shadow-sm space-y-2 text-left">
                    <div className="text-xs font-black text-foreground">
                      {t('telegram.orderMockTitle', '🔔 New Order Placed!')}
                    </div>
                    <Separator />
                    <div className="space-y-1 font-mono text-[11px] text-muted-foreground">
                      <div className="flex justify-between">
                        <span className="font-semibold text-foreground/80">
                          {t('telegram.orderMockNumber', 'Order:')}
                        </span>
                        <span className="text-foreground font-bold">#ORD-2049</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-foreground/80">
                          {t('telegram.orderMockCustomer', 'Customer:')}
                        </span>
                        <span className="text-foreground">Sok Dara</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-foreground/80">
                          {t('telegram.orderMockAmount', 'Amount:')}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">$24.50</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-foreground/80">
                          {t('telegram.orderMockPayment', 'Payment:')}
                        </span>
                        <span className="text-foreground text-[10px]">ABA KHQR</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-border/40">
                        <span className="text-[10px] text-emerald-600 font-bold">
                          {t('telegram.orderMockStatus', 'Paid ✅')}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {t('telegram.orderMockTime', 'Just now')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BotFather Quick Setup Guide */}
              <div className="mt-4 w-full text-left p-3.5 rounded-xl border border-border/80 bg-muted/30 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Bot className="size-4 text-primary" />
                  <span>{t('telegram.botFatherHelpTitle', 'Create Bot with @BotFather')}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t(
                    'telegram.botFatherHelpDesc',
                    'Quick guide to generate your own Telegram bot token in 30 seconds:'
                  )}
                </p>
                <ol className="text-[11px] text-muted-foreground space-y-1.5 list-decimal list-inside">
                  <li>{t('telegram.botFatherStep1', 'Open Telegram and message @BotFather')}</li>
                  <li>
                    {t(
                      'telegram.botFatherStep2',
                      "Send /newbot and choose a display name & username ending with 'bot'"
                    )}
                  </li>
                  <li>
                    {t(
                      'telegram.botFatherStep3',
                      'Copy the provided HTTP API token and paste it into the Bot Token field'
                    )}
                  </li>
                </ol>

                <div className="pt-1">
                  <a
                    href="https://t.me/BotFather"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    <span>{t('telegram.openBotFather', 'Open @BotFather')}</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
