import React from 'react';
import {
  Grid,
  Eye,
  EyeOff,
  Search,
  RotateCcw,
  MoveUp,
  MoveDown,
  ChevronsUp,
  ChevronsDown,
} from 'lucide-react';
import type { WidgetConfig } from '@/stores/themeStore';
import {
  getWidgetLocalizedString,
  DASHBOARD_WIDGET_REGISTRY,
  PRESET_LAYOUTS,
} from '@/config/dashboardWidgets';
import { useLanguage } from '@/i18n';

interface WidgetsTabProps {
  fullWidgetsList: WidgetConfig[];
  widgetSearch: string;
  setWidgetSearch: (val: string) => void;
  widgetCategoryFilter: string;
  setWidgetCategoryFilter: (val: string) => void;
  handleWidgetToggle: (id: string) => void;
  handleWidgetSize: (id: string, size: 'small' | 'medium' | 'large') => void;
  moveWidget: (index: number, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  handleShowAllWidgets: () => void;
  handleHideAllWidgets: () => void;
  handleResetWidgetsToDefault: () => void;
  handleApplyPresetLayout: (presetId: string) => void;
}

export const WidgetsTab: React.FC<WidgetsTabProps> = ({
  fullWidgetsList = [],
  widgetSearch,
  setWidgetSearch,
  widgetCategoryFilter,
  setWidgetCategoryFilter,
  handleWidgetToggle,
  handleWidgetSize,
  moveWidget,
  handleShowAllWidgets,
  handleHideAllWidgets,
  handleResetWidgetsToDefault,
  handleApplyPresetLayout,
}) => {
  const { lang, t } = useLanguage();
  const currentLang = lang || 'kh';

  const filteredWidgets = fullWidgetsList.filter((w) => {
    const reg = DASHBOARD_WIDGET_REGISTRY[w.id];
    if (widgetCategoryFilter !== 'all' && reg?.category !== widgetCategoryFilter) return false;
    if (widgetSearch) {
      const q = widgetSearch.toLowerCase();
      const title = getWidgetLocalizedString(reg?.name, currentLang).toLowerCase();
      const desc = getWidgetLocalizedString(reg?.description, currentLang).toLowerCase();
      if (!title.includes(q) && !desc.includes(q) && !w.id.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Grid size={18} className="text-primary" />
          <span>{t('settings.tabWidgets', 'Dashboard Widgets Manager')}</span>
        </h3>
        <p className="text-muted-foreground text-xs mt-0.5">
          Enable, reorder, resize, and manage dynamic KPI cards on the home dashboard.
        </p>
      </div>

      {/* Preset Layouts & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3 rounded-2xl border border-border">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-muted-foreground mr-1">Presets:</span>
          {PRESET_LAYOUTS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleApplyPresetLayout(p.id)}
              className="px-2.5 py-1 text-xs font-semibold bg-card hover:bg-muted text-foreground rounded-lg border border-border transition-colors cursor-pointer"
            >
              {getWidgetLocalizedString(p.name, currentLang)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShowAllWidgets}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-600 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer"
          >
            <Eye size={13} />
            <span>Show All</span>
          </button>
          <button
            onClick={handleHideAllWidgets}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-rose-500/10 text-rose-600 rounded-lg border border-rose-500/20 hover:bg-rose-500/20 cursor-pointer"
          >
            <EyeOff size={13} />
            <span>Hide All</span>
          </button>
          <button
            onClick={handleResetWidgetsToDefault}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-card hover:bg-muted text-muted-foreground rounded-lg border border-border cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={widgetSearch}
            onChange={(e) => setWidgetSearch(e.target.value)}
            placeholder="Search widget name..."
            className="pl-9 text-xs w-full h-10 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <select
          value={widgetCategoryFilter}
          onChange={(e) => setWidgetCategoryFilter(e.target.value)}
          className="text-xs h-10 px-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-auto"
        >
          <option value="all">All Categories</option>
          <option value="kpi">KPI Summary</option>
          <option value="analytics">Analytics Charts</option>
          <option value="inventory">Inventory & Stock</option>
          <option value="finance">Finance Ledger</option>
          <option value="system">System & Quick Actions</option>
        </select>
      </div>

      {/* Widgets List */}
      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
        {filteredWidgets.map((widget, idx) => {
          const reg = DASHBOARD_WIDGET_REGISTRY[widget.id];
          const Icon = reg?.icon || Grid;
          return (
            <div
              key={widget.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                widget.visible
                  ? 'bg-card border-border shadow-2xs'
                  : 'bg-muted/30 border-border/50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => handleWidgetToggle(widget.id)}
                  className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                    widget.visible
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {widget.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-foreground truncate">
                    {getWidgetLocalizedString(reg?.name, currentLang) || widget.id}
                  </h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 truncate">
                    {getWidgetLocalizedString(reg?.description, currentLang)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center bg-muted/60 rounded-xl p-0.5 border border-border">
                  {(['small', 'medium', 'large'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => handleWidgetSize(widget.id, sz)}
                      className={`px-2 py-0.5 text-[10px] font-bold capitalize rounded-lg transition-all cursor-pointer ${
                        widget.size === sz
                          ? 'bg-card text-foreground shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {sz[0].toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => moveWidget(idx, 'top')}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Move to Top"
                  >
                    <ChevronsUp size={14} />
                  </button>
                  <button
                    onClick={() => moveWidget(idx, 'up')}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Move Up"
                  >
                    <MoveUp size={14} />
                  </button>
                  <button
                    onClick={() => moveWidget(idx, 'down')}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Move Down"
                  >
                    <MoveDown size={14} />
                  </button>
                  <button
                    onClick={() => moveWidget(idx, 'bottom')}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Move to Bottom"
                  >
                    <ChevronsDown size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WidgetsTab;

