import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Check,
  Palette,
  Search,
  Sun,
  Moon,
  Laptop,
  Paintbrush,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  UNIFIED_THEME_TEMPLATES,
  type UnifiedThemeTemplate,
  type TemplateCategory,
} from '../types/settings.types';
import { sound } from '@/utils/sound';
import { useLanguage } from '@/i18n';

interface TemplatesTabProps {
  customizer: any;
  handleApplyUnifiedTemplate?: (tpl: UnifiedThemeTemplate) => void;
}

const QUICK_ACCENT_SWATCHES = [
  { name: 'Neon Coral', hex: '#ec4899' },
  { name: 'Royal Blue', hex: '#2563eb' },
  { name: 'Emerald Mint', hex: '#10b981' },
  { name: 'Violet VIP', hex: '#8b5cf6' },
  { name: 'Sunset Amber', hex: '#f59e0b' },
  { name: 'Cyan Frost', hex: '#06b6d4' },
  { name: 'Matrix Green', hex: '#22c55e' },
  { name: 'Crimson Red', hex: '#ef4444' },
  { name: 'Indigo Electric', hex: '#6366f1' },
];

export const TemplatesTab: React.FC<TemplatesTabProps> = ({
  customizer,
  handleApplyUnifiedTemplate,
}) => {
  const { t } = useLanguage();
  const [activeViewMode, setActiveViewMode] = useState<'gallery' | 'custom'>('gallery');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const currentSidebar = customizer.sidebar || {};
  const currentNavbar = customizer.navbar || {};
  const currentPrimaryColor = customizer.primaryColor || '#ec4899';
  const currentThemeMode = customizer.themeMode || 'light';

  // Apply unified template
  const applyTemplate = (tpl: UnifiedThemeTemplate) => {
    if (handleApplyUnifiedTemplate) {
      handleApplyUnifiedTemplate(tpl);
    } else {
      customizer.updatePrimaryColor(tpl.primaryColor);
      customizer.updateThemeMode(tpl.mode);
      customizer.updateSidebar({
        bgColor: tpl.sidebarBg,
        textColor: tpl.sidebarText,
        activeBgColor: tpl.activeBg,
        activeTextColor: tpl.activeText,
        roundedStyle: tpl.roundedStyle || 'rounded-xl',
        width: tpl.sidebarWidth || 260,
      });
      customizer.updateNavbar({
        bgColor: tpl.navbarBg,
        textColor: tpl.navbarText,
        borderColor: tpl.navbarBorder,
        shadow: tpl.navbarShadow || 'sm',
      });
      sound.playSuccess();
    }
  };

  // Check if a template is active
  const isTemplateActive = (tpl: UnifiedThemeTemplate) => {
    const isPrimaryMatch =
      currentPrimaryColor?.toLowerCase() === tpl.primaryColor?.toLowerCase();
    const isSidebarMatch =
      currentSidebar.bgColor?.toLowerCase() === tpl.sidebarBg?.toLowerCase();
    const isNavbarMatch =
      currentNavbar.bgColor?.toLowerCase() === tpl.navbarBg?.toLowerCase();
    const isActiveBgMatch =
      currentSidebar.activeBgColor?.toLowerCase() === tpl.activeBg?.toLowerCase();
    return (
      (isSidebarMatch && isActiveBgMatch && isNavbarMatch) ||
      (isPrimaryMatch && isSidebarMatch)
    );
  };

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return UNIFIED_THEME_TEMPLATES.filter((tpl) => {
      // Category filter
      const matchesCategory =
        selectedCategory === 'all' ||
        tpl.category.includes(selectedCategory) ||
        (selectedCategory === 'dark' && tpl.mode === 'dark') ||
        (selectedCategory === 'light' && tpl.mode === 'light');

      if (!matchesCategory) return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const name = t(`settings.${tpl.nameKey}`, tpl.defaultName).toLowerCase();
      const desc = t(`settings.${tpl.descKey}`, tpl.defaultDesc).toLowerCase();
      const badge = tpl.badge.toLowerCase();
      return name.includes(q) || desc.includes(q) || badge.includes(q) || tpl.id.includes(q);
    });
  }, [selectedCategory, searchQuery, t]);

  const handleWidthChange = (width: number) => {
    customizer.updateSidebar({ width });
    sound.playClick();
  };

  const handleRoundedChange = (roundedStyle: string) => {
    customizer.updateSidebar({ roundedStyle });
    sound.playClick();
  };

  const handleShadowChange = (shadow: 'none' | 'sm' | 'md' | 'lg') => {
    customizer.updateNavbar({ shadow });
    sound.playClick();
  };

  const handleQuickAccent = (hex: string) => {
    customizer.updateSidebar({ activeBgColor: hex });
    customizer.updatePrimaryColor(hex);
    sound.playSuccess();
  };

  const handleThemeModeChange = (mode: 'light' | 'dark' | 'system') => {
    customizer.updateThemeMode(mode);
    sound.playClick();
  };

  const applyHeaderPreset = (
    type: 'match_sidebar' | 'brand_accent' | 'crisp_white' | 'slate_dark' | 'soft_tint'
  ) => {
    switch (type) {
      case 'match_sidebar':
        customizer.updateNavbar({
          bgColor: currentSidebar.bgColor || '#0b1329',
          textColor: currentSidebar.textColor || '#94a3b8',
          borderColor: 'rgba(255,255,255,0.1)',
        });
        break;
      case 'brand_accent':
        customizer.updateNavbar({
          bgColor: currentPrimaryColor || '#ec4899',
          textColor: '#ffffff',
          borderColor: 'rgba(0,0,0,0.15)',
        });
        break;
      case 'crisp_white':
        customizer.updateNavbar({
          bgColor: '#ffffff',
          textColor: '#0f172a',
          borderColor: '#e2e8f0',
        });
        break;
      case 'slate_dark':
        customizer.updateNavbar({
          bgColor: '#0f172a',
          textColor: '#f8fafc',
          borderColor: '#1e293b',
        });
        break;
      case 'soft_tint':
        customizer.updateNavbar({
          bgColor: '#fff1f2',
          textColor: '#881337',
          borderColor: '#fecdd3',
        });
        break;
    }
    sound.playSuccess();
  };

  return (
    <div className="space-y-6 pb-6">
      {/* ─── 1. TOP HEADER & NAVIGATION ─────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5 border-b border-border">
        <div>
          <h3 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2.5 tracking-tight">
            <Palette size={22} className="text-primary" />
            <span>{t('settings.themeAndColorTitle', 'Theme, Sidebar & Navbar Customizer')}</span>
          </h3>
          <p className="text-muted-foreground text-xs mt-1 leading-relaxed max-w-2xl">
            {t(
              'settings.themeAndColorSub',
              'Choose from 12+ curated full-system design templates with custom executive headers or customize sidebar, navbar, and primary accents with 100% flexibility.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Theme Mode Switcher */}
          <div className="flex items-center p-1 bg-muted/60 border border-border rounded-xl shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={() => handleThemeModeChange('light')}
              title={t('settings.modeLight', 'Light Mode')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentThemeMode === 'light'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sun size={14} />
              <span>{t('settings.modeLight', 'Light')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleThemeModeChange('dark')}
              title={t('settings.modeDark', 'Dark Mode')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentThemeMode === 'dark'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Moon size={14} />
              <span>{t('settings.modeDark', 'Dark')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleThemeModeChange('system')}
              title={t('settings.modeSystem', 'System Preference')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentThemeMode === 'system'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Laptop size={14} />
              <span>{t('settings.modeSystem', 'System')}</span>
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 bg-muted/60 border border-border rounded-xl shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setActiveViewMode('gallery');
                sound.playClick();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeViewMode === 'gallery'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles size={14} />
              <span>{t('settings.galleryMode', '12 Curated Templates')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveViewMode('custom');
                sound.playClick();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeViewMode === 'custom'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Paintbrush size={14} />
              <span>{t('settings.customStudioMode', 'Custom Studio')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. UNIFIED TEMPLATE GALLERY ────────────────────────────────── */}
      {activeViewMode === 'gallery' && (
        <div className="space-y-6">
          {/* Category Filter Pills & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {[
                { id: 'all', label: t('settings.catAll', 'All Templates (12)') },
                { id: 'dark', label: t('settings.catDark', 'Dark Mode') },
                { id: 'light', label: t('settings.catLight', 'Light Mode') },
                { id: 'corporate', label: t('settings.catCorporate', 'Corporate') },
                { id: 'luxury', label: t('settings.catLuxury', 'Luxury VIP') },
                { id: 'vibrant', label: t('settings.catVibrant', 'Vibrant') },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id as TemplateCategory);
                    sound.playClick();
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                    selectedCategory === cat.id
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-card text-muted-foreground hover:text-foreground border-border hover:bg-muted/40'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 12 Unified Template Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredTemplates.map((tpl) => {
              const active = isTemplateActive(tpl);

              return (
                <motion.div
                  whileHover={{ y: -3 }}
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl)}
                  className={`group relative rounded-2xl sm:rounded-3xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    active
                      ? 'border-primary ring-2 ring-primary/30 bg-card shadow-lg scale-[1.01]'
                      : 'border-border hover:border-primary/50 bg-card/70 hover:bg-card shadow-xs'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-muted/60 text-muted-foreground border-border">
                          {tpl.badgeKey ? t(`settings.${tpl.badgeKey}`, tpl.badge) : tpl.badge}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {tpl.mode === 'dark'
                            ? t('settings.modeDark', 'Dark')
                            : t('settings.modeLight', 'Light')}
                        </span>
                      </div>
                      {active ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground shadow-xs">
                          <Check size={11} strokeWidth={3} />
                          {t('settings.activeTemplateBadge', 'Active')}
                        </span>
                      ) : null}
                    </div>

                    {/* ─── Interactive Mini UI Mockup ─── */}
                    <div className="h-32 w-full rounded-2xl border border-border/80 overflow-hidden flex shadow-inner bg-muted/20 relative">
                      {/* Mini Sidebar */}
                      <div
                        className="w-1/3 h-full p-2.5 flex flex-col justify-between shrink-0 border-r transition-colors"
                        style={{
                          backgroundColor: tpl.sidebarBg,
                          borderColor:
                            tpl.mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
                        }}
                      >
                        <div className="space-y-2">
                          {/* Mini Brand Dot */}
                          <div
                            className="flex items-center gap-1.5 pb-1.5 border-b"
                            style={{
                              borderColor:
                                tpl.mode === 'light'
                                  ? 'rgba(0,0,0,0.08)'
                                  : 'rgba(255,255,255,0.1)',
                            }}
                          >
                            <div
                              className="w-3.5 h-3.5 rounded-md flex items-center justify-center shadow-xs"
                              style={{ backgroundColor: tpl.activeBg }}
                            >
                              <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    tpl.activeText === '#000000' ? '#000000' : '#ffffff',
                                }}
                              />
                            </div>
                            <div
                              className="w-10 h-1.5 rounded-full"
                              style={{ backgroundColor: tpl.sidebarText, opacity: 0.6 }}
                            />
                          </div>

                          {/* Mini Active Menu Item */}
                          <div
                            className="w-full h-4 rounded-lg px-1.5 flex items-center gap-1.5 shadow-xs transition-transform"
                            style={{
                              backgroundColor: tpl.activeBg,
                              color: tpl.activeText,
                            }}
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor:
                                  tpl.activeText === '#000000' ? '#000000' : '#ffffff',
                                opacity: 0.9,
                              }}
                            />
                            <div
                              className="w-8 h-1.5 rounded-full"
                              style={{
                                backgroundColor:
                                  tpl.activeText === '#000000' ? '#000000' : '#ffffff',
                                opacity: 0.9,
                              }}
                            />
                          </div>

                          {/* Mini Inactive Menu Items */}
                          <div className="w-full h-3 rounded-md px-1.5 flex items-center gap-1.5 opacity-60">
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: tpl.sidebarText }}
                            />
                            <div
                              className="w-7 h-1 rounded-full"
                              style={{ backgroundColor: tpl.sidebarText }}
                            />
                          </div>
                          <div className="w-full h-3 rounded-md px-1.5 flex items-center gap-1.5 opacity-60">
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: tpl.sidebarText }}
                            />
                            <div
                              className="w-6 h-1 rounded-full"
                              style={{ backgroundColor: tpl.sidebarText }}
                            />
                          </div>
                        </div>

                        {/* Mini User Profile Footer */}
                        <div
                          className="w-full pt-1.5 border-t flex items-center gap-1.5"
                          style={{
                            borderColor:
                              tpl.mode === 'light'
                                ? 'rgba(0,0,0,0.08)'
                                : 'rgba(255,255,255,0.1)',
                          }}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: tpl.sidebarText, opacity: 0.5 }}
                          />
                          <div
                            className="w-5 h-1 rounded-full"
                            style={{ backgroundColor: tpl.sidebarText, opacity: 0.4 }}
                          />
                        </div>
                      </div>

                      {/* Mini Content Area & Navbar */}
                      <div className="flex-1 flex flex-col h-full bg-background/80">
                        {/* Mini Custom Navbar Header */}
                        <div
                          className="h-8 w-full px-2.5 border-b flex items-center justify-between shrink-0 shadow-2xs transition-colors"
                          style={{
                            backgroundColor: tpl.navbarBg,
                            borderColor: tpl.navbarBorder,
                            color: tpl.navbarText,
                          }}
                        >
                          <div
                            className="w-12 h-2 rounded-full opacity-60"
                            style={{ backgroundColor: tpl.navbarText }}
                          />
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 rounded-full opacity-40"
                              style={{ backgroundColor: tpl.navbarText }}
                            />
                            <div
                              className="w-3.5 h-3.5 rounded-full shadow-xs"
                              style={{ backgroundColor: tpl.activeBg }}
                            />
                          </div>
                        </div>

                        {/* Mini Main Content View */}
                        <div className="p-2 space-y-1.5 flex-1 flex flex-col justify-center">
                          {/* Top stat cards row */}
                          <div className="grid grid-cols-2 gap-1.5">
                            <div className="h-6 rounded-md bg-card border border-border/80 p-1 flex items-center gap-1 shadow-2xs">
                              <div
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: tpl.activeBg }}
                              />
                              <div className="w-8 h-1.5 rounded-full bg-muted-foreground/30" />
                            </div>
                            <div className="h-6 rounded-md bg-card border border-border/80 p-1 flex items-center gap-1 shadow-2xs">
                              <div
                                className="w-2 h-2 rounded-full shrink-0 opacity-60"
                                style={{ backgroundColor: tpl.palette[3] || tpl.activeBg }}
                              />
                              <div className="w-7 h-1.5 rounded-full bg-muted-foreground/30" />
                            </div>
                          </div>

                          {/* Decorative Chart Banner */}
                          <div
                            className="h-7 rounded-md p-1.5 flex items-center justify-between shadow-2xs"
                            style={{
                              backgroundColor:
                                tpl.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                              border: `1px solid ${tpl.navbarBorder}`,
                            }}
                          >
                            <div
                              className="w-10 h-1.5 rounded-full"
                              style={{ backgroundColor: tpl.activeBg, opacity: 0.8 }}
                            />
                            <div
                              className="w-3.5 h-3.5 rounded-md flex items-center justify-center text-[8px] font-bold"
                              style={{
                                backgroundColor: tpl.activeBg,
                                color: tpl.activeText,
                              }}
                            >
                              ✓
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Template Name & Description */}
                    <div>
                      <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {t(`settings.${tpl.nameKey}`, tpl.defaultName)}
                      </h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                        {t(`settings.${tpl.descKey}`, tpl.defaultDesc)}
                      </p>
                    </div>
                  </div>

                  {/* Template Swatches & Hex */}
                  <div className="pt-3 border-t border-border/60 flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {t('settings.paletteLabel', 'Palette')}:
                      </span>
                      <div className="flex items-center -space-x-1">
                        {tpl.palette.map((color, idx) => (
                          <div
                            key={idx}
                            className="w-3.5 h-3.5 rounded-full border border-card shadow-2xs"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-muted-foreground">
                      {tpl.primaryColor}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="p-12 text-center border border-dashed border-border rounded-3xl bg-muted/20">
              <p className="text-sm font-bold text-muted-foreground">
                {t('settings.noTemplatesFound', 'No templates match your search criteria.')}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="mt-3 px-4 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-xl"
              >
                {t('settings.resetFilters', 'Reset Filters')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── 3. CUSTOM STUDIO & ADVANCED COLOR BUILDER ───────────────────── */}
      {activeViewMode === 'custom' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Theme Mode Selector in Custom Studio */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Sun size={14} className="text-primary" />
              <span>{t('settings.themeModeLabel', 'Theme Mode (Light / Dark / System)')}</span>
            </h4>
            <div className="flex flex-wrap items-center gap-2.5">
              {[
                {
                  id: 'light',
                  label: t('settings.modeLight', 'Light Mode'),
                  icon: <Sun size={15} className="text-amber-500" />,
                  desc: 'Clean & Bright',
                },
                {
                  id: 'dark',
                  label: t('settings.modeDark', 'Dark Mode'),
                  icon: <Moon size={15} className="text-indigo-400" />,
                  desc: 'Modern Slate',
                },
                {
                  id: 'system',
                  label: t('settings.modeSystem', 'System Mode'),
                  icon: <Laptop size={15} className="text-sky-500" />,
                  desc: 'Auto Detect',
                },
              ].map((m) => {
                const isSelected = currentThemeMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleThemeModeChange(m.id as any)}
                    className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/10 shadow-xs'
                        : 'border-border bg-card hover:border-border/80'
                    }`}
                  >
                    {m.icon}
                    <div className="text-left">
                      <div className="text-xs font-bold text-foreground">{m.label}</div>
                      <div className="text-[10px] text-muted-foreground">{m.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Accent Swatches */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Sparkles size={14} className="text-primary" />
              <span>{t('settings.quickAccentPresets', 'Quick Accent Color Presets')}</span>
            </h4>
            <div className="flex flex-wrap items-center gap-2.5">
              {QUICK_ACCENT_SWATCHES.map((swatch) => {
                const isSelected =
                  currentPrimaryColor.toLowerCase() === swatch.hex.toLowerCase();
                return (
                  <button
                    key={swatch.hex}
                    type="button"
                    onClick={() => handleQuickAccent(swatch.hex)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/10 shadow-xs'
                        : 'border-border bg-card hover:border-border/80'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <span className="text-xs font-bold text-foreground">{swatch.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Navbar Presets */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Palette size={14} className="text-primary" />
              <span>
                {t(
                  'settings.quickHeaderPresetsTitle',
                  'Top Navbar Header Styles (1-Click Presets)'
                )}
              </span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {[
                { id: 'match_sidebar', label: t('settings.headerMatchSidebar', 'Match Sidebar') },
                { id: 'brand_accent', label: t('settings.headerBrandAccent', 'Brand Accent') },
                { id: 'crisp_white', label: t('settings.headerCrispWhite', 'Crisp White') },
                { id: 'slate_dark', label: t('settings.headerSlateDark', 'Slate Dark') },
                { id: 'soft_tint', label: t('settings.headerSoftTint', 'Soft Tint') },
              ].map((hp) => (
                <button
                  key={hp.id}
                  type="button"
                  onClick={() => applyHeaderPreset(hp.id as any)}
                  className="px-3 py-2 rounded-xl text-xs font-bold border border-border bg-muted/40 hover:bg-muted text-foreground transition-all cursor-pointer text-center"
                >
                  {hp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Layout Controls: Width, Radius, Shadow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sidebar Width */}
            <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wide">
                {t('settings.sidebarWidth', 'Sidebar Width')}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { width: 220, label: t('settings.widthCompact', '220px') },
                  { width: 260, label: t('settings.widthStandard', '260px') },
                  { width: 300, label: t('settings.widthSpacious', '300px') },
                ].map((w) => (
                  <button
                    key={w.width}
                    type="button"
                    onClick={() => handleWidthChange(w.width)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      (currentSidebar.width || 260) === w.width
                        ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Radius */}
            <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wide">
                {t('settings.menuItemRadius', 'Menu Corner Radius')}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { val: 'rounded-md', label: 'Square' },
                  { val: 'rounded-xl', label: t('settings.radiusSmooth', 'Smooth') },
                  { val: 'rounded-full', label: t('settings.radiusPill', 'Pill') },
                ].map((r) => (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => handleRoundedChange(r.val)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      (currentSidebar.roundedStyle || 'rounded-xl') === r.val
                        ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Navbar Shadow */}
            <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wide">
                {t('settings.navbarShadow', 'Navbar Elevation')}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['none', 'sm', 'md', 'lg'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleShadowChange(s)}
                    className={`py-1.5 text-xs font-bold uppercase rounded-lg border transition-all ${
                      (currentNavbar.shadow || 'sm') === s
                        ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Color Pickers */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Sliders size={14} className="text-primary" />
              <span>{t('settings.customColorOverrides', 'Detailed Color Overrides')}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t('settings.sidebarBg', 'Sidebar Background')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentSidebar.bgColor || '#0b1329'}
                    onChange={(e) => customizer.updateSidebar({ bgColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-border bg-transparent p-0.5"
                  />
                  <input
                    type="text"
                    value={currentSidebar.bgColor || '#0b1329'}
                    onChange={(e) => customizer.updateSidebar({ bgColor: e.target.value })}
                    className="form-input text-xs font-mono uppercase w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t('settings.activeBg', 'Active Menu Background')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentSidebar.activeBgColor || '#ec4899'}
                    onChange={(e) => {
                      customizer.updateSidebar({ activeBgColor: e.target.value });
                      customizer.updatePrimaryColor(e.target.value);
                    }}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-border bg-transparent p-0.5"
                  />
                  <input
                    type="text"
                    value={currentSidebar.activeBgColor || '#ec4899'}
                    onChange={(e) => {
                      customizer.updateSidebar({ activeBgColor: e.target.value });
                      customizer.updatePrimaryColor(e.target.value);
                    }}
                    className="form-input text-xs font-mono uppercase w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t('settings.sidebarText', 'Sidebar Text Color')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentSidebar.textColor || '#94a3b8'}
                    onChange={(e) => customizer.updateSidebar({ textColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-border bg-transparent p-0.5"
                  />
                  <input
                    type="text"
                    value={currentSidebar.textColor || '#94a3b8'}
                    onChange={(e) => customizer.updateSidebar({ textColor: e.target.value })}
                    className="form-input text-xs font-mono uppercase w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t('settings.navbarBg', 'Navbar Background')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentNavbar.bgColor || '#0f172a'}
                    onChange={(e) => customizer.updateNavbar({ bgColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-border bg-transparent p-0.5"
                  />
                  <input
                    type="text"
                    value={currentNavbar.bgColor || '#0f172a'}
                    onChange={(e) => customizer.updateNavbar({ bgColor: e.target.value })}
                    className="form-input text-xs font-mono uppercase w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t('settings.navbarBorder', 'Navbar Border')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentNavbar.borderColor || '#1e293b'}
                    onChange={(e) => customizer.updateNavbar({ borderColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-border bg-transparent p-0.5"
                  />
                  <input
                    type="text"
                    value={currentNavbar.borderColor || '#1e293b'}
                    onChange={(e) => customizer.updateNavbar({ borderColor: e.target.value })}
                    className="form-input text-xs font-mono uppercase w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t('settings.navbarText', 'Navbar Text Color')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentNavbar.textColor || '#f8fafc'}
                    onChange={(e) => customizer.updateNavbar({ textColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-border bg-transparent p-0.5"
                  />
                  <input
                    type="text"
                    value={currentNavbar.textColor || '#f8fafc'}
                    onChange={(e) => customizer.updateNavbar({ textColor: e.target.value })}
                    className="form-input text-xs font-mono uppercase w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesTab;

