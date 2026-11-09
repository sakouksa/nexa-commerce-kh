import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPlatformSettings } from '../../api';
import { Loading, inputCls } from '../../components/ui';
import { useLanguage } from '../../i18n';
import { Sliders, Palette, Shield, CreditCard, Send, Lock } from 'lucide-react';
import { AppearanceSettings } from '@/features/settings/appearance/AppearanceSettings';
import { sound } from '@/utils/sound';

type MainTab = 'platform' | 'appearance';

export default function Settings() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as MainTab) || 'platform';
  const [activeTab, setActiveTabState] = useState<MainTab>(
    initialTab === 'appearance' ? 'appearance' : 'platform'
  );

  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as MainTab;
    if (tabParam && (tabParam === 'platform' || tabParam === 'appearance')) {
      setActiveTabState(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: MainTab) => {
    sound.playClick();
    setActiveTabState(tab);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', tab);
        return next;
      },
      { replace: true }
    );
  };

  useEffect(() => {
    getPlatformSettings()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Page Title & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {activeTab === 'appearance'
              ? t('settings.tabAppearance', 'Appearance & Themes')
              : t('settings.title', 'Platform Settings')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {activeTab === 'appearance'
              ? t(
                  'settings.themeAndColorSub',
                  'Customize system theme templates, sidebar, navbar, typography, and widgets.'
                )
              : t(
                  'settings.subtitle',
                  'Configure global platform parameters, integrations, and default security policies'
                )}
          </p>
        </div>

        {/* Top-Level Tabs Switcher */}
        <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shrink-0 self-start sm:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => handleTabChange('platform')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'platform'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="size-4" />
            <span>{t('settings.tabPlatform', 'Platform Settings')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('appearance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'appearance'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Palette className="size-4" />
            <span>{t('settings.tabAppearance', 'Appearance & Themes')}</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'appearance' ? (
        <AppearanceSettings />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Contact & Accounts */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="size-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Send className="size-4" />
                </div>
                <h2 className="font-bold text-base text-slate-900 dark:text-white">
                  {t('settings.contactAndAccounts', 'Contact & Account Creation')}
                </h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('settings.telegramContact', 'Telegram Contact')}
                  </label>
                  <input
                    value={settings?.contact_telegram || ''}
                    readOnly
                    className={`${inputCls} bg-gray-50 dark:bg-slate-800`}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    {t(
                      'settings.telegramContactHelp',
                      'Users contact this Telegram account to get shop accounts created.'
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('settings.defaultAdmin', 'Default Admin Username')}
                  </label>
                  <input
                    value={settings?.default_admin || ''}
                    readOnly
                    className={`${inputCls} bg-gray-50 dark:bg-slate-800`}
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Default Telegram Bot */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Send className="size-4" />
                </div>
                <h2 className="font-bold text-base text-slate-900 dark:text-white">
                  {t('settings.defaultTelegramBot', 'Default Telegram Bot')}
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                {t(
                  'settings.telegramBotDesc',
                  'Used for platform-level notifications. Each shop configures its own bot token and chat ID in the Shop Dashboard.'
                )}
              </p>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('settings.botToken', 'Bot Token')}
                </label>
                <input
                  value="•••••••••••••••• (configured securely on the server)"
                  readOnly
                  className={`${inputCls} bg-gray-50 dark:bg-slate-800 font-mono text-xs`}
                />
                <p className="text-xs text-slate-400 mt-1">
                  {t(
                    'settings.botTokenHelp',
                    'Tokens are stored securely on the server and never exposed in the frontend bundle.'
                  )}
                </p>
              </div>
            </div>

            {/* Card 3: Security */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Lock className="size-4" />
                </div>
                <h2 className="font-bold text-base text-slate-900 dark:text-white">
                  {t('settings.security', 'Security')}
                </h2>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span>JWT authentication</span>
                  <span className="text-emerald-600 font-semibold">✓ {t('common.enabled', 'Enabled')}</span>
                </li>
                <li className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span>Rate limiting</span>
                  <span className="text-emerald-600 font-semibold">✓ 60 req/min</span>
                </li>
                <li className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span>Password hashing</span>
                  <span className="text-emerald-600 font-semibold">✓ bcrypt</span>
                </li>
                <li className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span>Self-registration</span>
                  <span className="text-rose-600 font-semibold">✗ {t('common.disabled', 'Disabled')}</span>
                </li>
                <li className="flex justify-between">
                  <span>{t('settings.fileUploadRestrictions', 'File upload restrictions')}</span>
                  <span className="text-emerald-600 font-semibold">
                    ✓ {t('settings.imagesOnly', 'Images only (max 8MB)')}
                  </span>
                </li>
              </ul>
            </div>

            {/* Card 4: Payment */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="size-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <CreditCard className="size-4" />
                </div>
                <h2 className="font-bold text-base text-slate-900 dark:text-white">
                  {t('settings.payment', 'Payment')}
                </h2>
              </div>
              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <p className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span>{t('settings.khqrIntegration', 'ABA KHQR Integration')}</span>
                  <span className="text-emerald-600 font-semibold">✓ {t('common.active', 'Active')}</span>
                </p>
                <p className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span>Per-shop profile ID & secret key</span>
                  <span className="text-emerald-600 font-semibold">✓ Supported</span>
                </p>
                <p className="flex justify-between">
                  <span>Sandbox mode (no credentials)</span>
                  <span className="text-amber-600 font-semibold">✓ Auto-enabled</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
            <span className="font-bold shrink-0">Note:</span>
            <span>
              For security, secret values (ABA secret keys, Telegram tokens) are stored per-shop in the
              Shop Dashboard and never exposed through the public admin API. Rate-limit tuning is done in the
              backend config (<code className="font-mono font-bold">Backend_API/config.py</code>).
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
