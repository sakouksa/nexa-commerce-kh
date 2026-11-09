import React, { useState } from 'react';
import {
  Sliders,
  Check,
  Sparkles,
} from 'lucide-react';
import { panelTemplates, type PanelTemplate } from '../types/settings.types';
import { sound } from '@/utils/sound';
import { useLanguage } from '@/i18n';

interface PanelsTabProps {
  customizer: any;
  handleApplyPanelTemplate: (tpl: PanelTemplate) => void;
}

export const PanelsTab: React.FC<PanelsTabProps> = ({
  customizer,
  handleApplyPanelTemplate,
}) => {
  const { t } = useLanguage();
  const [showAdvancedColors, setShowAdvancedColors] = useState(false);

  const currentSidebar = customizer.sidebar || {};
  const currentNavbar = customizer.navbar || {};

  const isTemplateActive = (tpl: PanelTemplate) => {
    return (
      currentSidebar.bgColor?.toLowerCase() === tpl.sidebarBg.toLowerCase() &&
      currentSidebar.activeBgColor?.toLowerCase() === tpl.activeBg.toLowerCase()
    );
  };

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sliders size={18} className="text-primary" />
            <span>{t('settings.tabPanels', 'Sidebar & Navbar Layout & Presets')}</span>
          </h3>
          <p className="text-muted-foreground text-xs mt-0.5">
            {t(
              'settings.panelsSubtitle',
              'Choose pre-built templates for your sidebar and navigation bar or customize dimensions and colors'
            )}
          </p>
        </div>
      </div>

      {/* ─── PRE-BUILT SIDEBAR & NAVBAR TEMPLATES GALLERY ─────────────────── */}
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Sparkles size={14} className="text-amber-500" />
            <span>{t('settings.panelTemplatesGallery', 'Sidebar & Navbar Templates')}</span>
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {t(
              'settings.panelTemplatesGalleryDesc',
              'Click any template to instantly transform the sidebar and top navigation'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {panelTemplates.map((tpl) => {
            const active = isTemplateActive(tpl);
            return (
              <div
                key={tpl.id}
                onClick={() => handleApplyPanelTemplate(tpl)}
                className={`group relative rounded-2xl border p-4 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between ${
                  active
                    ? 'border-primary ring-2 ring-primary/30 bg-card shadow-md scale-[1.02]'
                    : 'border-border hover:border-primary/50 bg-card/60 hover:bg-card shadow-xs'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header with Badges */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-muted/60 text-muted-foreground border-border">
                      {tpl.defaultBadge}
                    </span>
                    {active ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary text-primary-foreground shadow-xs">
                        <Check size={10} strokeWidth={3} />
                        {t('settings.activeTemplateBadge', 'Active')}
                      </span>
                    ) : null}
                  </div>

                  {/* ─── Interactive Mini UI Mockup ─── */}
                  <div className="h-28 w-full rounded-xl border border-border/80 overflow-hidden flex shadow-inner bg-muted/30 relative">
                    {/* Mini Sidebar */}
                    <div
                      className="w-1/3 h-full p-2 flex flex-col justify-between shrink-0 border-r transition-colors"
                      style={{
                        backgroundColor: tpl.sidebarBg,
                        borderColor: 'rgba(255,255,255,0.08)',
                      }}
                    >
                      <div className="space-y-1.5">
                        {/* Mini Brand Dot */}
                        <div className="flex items-center gap-1 mb-2">
                          <div
                            className="w-2.5 h-2.5 rounded-md"
                            style={{ backgroundColor: tpl.activeBg }}
                          />
                          <div className="w-8 h-1 rounded-full bg-white/20" />
                        </div>
                        {/* Mini Menu Items */}
                        <div
                          className="w-full h-3 rounded-md px-1 flex items-center gap-1 shadow-xs"
                          style={{ backgroundColor: tpl.activeBg, color: tpl.activeText }}
                        >
                          <div
                            className="w-1 h-1 rounded-full"
                            style={{ backgroundColor: tpl.activeText }}
                          />
                          <div
                            className="w-5 h-1 rounded-full"
                            style={{ backgroundColor: tpl.activeText }}
                          />
                        </div>
                        <div className="w-full h-2 rounded px-1 flex items-center gap-1 opacity-50">
                          <div
                            className="w-1 h-1 rounded-full"
                            style={{ backgroundColor: tpl.sidebarText }}
                          />
                          <div
                            className="w-6 h-1 rounded-full"
                            style={{ backgroundColor: tpl.sidebarText }}
                          />
                        </div>
                        <div className="w-full h-2 rounded px-1 flex items-center gap-1 opacity-50">
                          <div
                            className="w-1 h-1 rounded-full"
                            style={{ backgroundColor: tpl.sidebarText }}
                          />
                          <div
                            className="w-4 h-1 rounded-full"
                            style={{ backgroundColor: tpl.sidebarText }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mini Header + Content */}
                    <div className="flex-1 flex flex-col h-full bg-muted/10">
                      <div
                        className="h-6 w-full px-2 border-b flex items-center justify-between shrink-0 shadow-2xs"
                        style={{
                          backgroundColor: tpl.navbarBg,
                          borderColor: tpl.navbarBorder,
                          color: tpl.navbarText,
                        }}
                      >
                        <div
                          className="w-8 h-1.5 rounded-full opacity-60"
                          style={{ backgroundColor: tpl.navbarText }}
                        />
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: tpl.activeBg }}
                        />
                      </div>
                      <div className="p-2 space-y-1.5 flex-1 flex flex-col justify-center">
                        <div className="w-full h-3 rounded bg-muted/40 border border-border/40" />
                        <div className="w-3/4 h-2 rounded bg-muted/30" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-foreground">
                      {t(`settings.${tpl.nameKey}`, tpl.defaultName)}
                    </h5>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                      {t(`settings.${tpl.descKey}`, tpl.defaultDesc)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sizing & Dimension Controls */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
          {t('settings.dimensionsAndLayout', 'Dimensions & Sizing Presets')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
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

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
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

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
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
      </div>
    </div>
  );
};

export default PanelsTab;

