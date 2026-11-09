export type TabType = 'templates' | 'typography' | 'layout' | 'widgets';

export type TemplateCategory = 'all' | 'dark' | 'light' | 'corporate' | 'luxury' | 'vibrant';

export interface UnifiedThemeTemplate {
  id: string;
  nameKey: string;
  defaultName: string;
  descKey: string;
  defaultDesc: string;
  badge: string;
  badgeKey?: string;
  category: TemplateCategory[];
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  sidebarBg: string;
  sidebarText: string;
  activeBg: string;
  activeText: string;
  navbarBg: string;
  navbarText: string;
  navbarBorder: string;
  navbarShadow?: 'none' | 'sm' | 'md' | 'lg';
  roundedStyle?: string;
  sidebarWidth?: number;
  hasCustomHeader?: boolean;
  palette: string[]; // [SidebarBg, ActiveAccent, NavbarBg, ModeAccent]
}

export interface ThemeTemplate {
  id: string;
  nameKey: string;
  defaultName: string;
  descKey: string;
  defaultDesc: string;
  primaryColor: string;
  mode: 'light' | 'dark' | 'system';
  gradient: string;
  badgeColor: string;
}

export interface PanelTemplate {
  id: string;
  nameKey: string;
  defaultName: string;
  descKey: string;
  defaultDesc: string;
  badgeKey?: string;
  defaultBadge?: string;
  sidebarBg: string;
  sidebarText: string;
  activeBg: string;
  activeText: string;
  navbarBg: string;
  navbarText: string;
  navbarBorder: string;
}

export const UNIFIED_THEME_TEMPLATES: UnifiedThemeTemplate[] = [
  {
    id: 'enterprise_midnight',
    nameKey: 'tplUnifiedEnterpriseMidnight',
    defaultName: 'Enterprise Midnight Pro',
    descKey: 'tplUnifiedEnterpriseMidnightDesc',
    defaultDesc: 'Midnight slate dark theme accented with vivid neon coral pink.',
    badge: 'Enterprise Dark',
    badgeKey: 'tplBadgeEnterpriseDark',
    category: ['dark', 'corporate'],
    mode: 'dark',
    primaryColor: '#ec4899',
    sidebarBg: '#0b1329',
    sidebarText: '#94a3b8',
    activeBg: '#ec4899',
    activeText: '#ffffff',
    navbarBg: '#0f172a',
    navbarText: '#f8fafc',
    navbarBorder: '#1e293b',
    navbarShadow: 'sm',
    roundedStyle: 'rounded-xl',
    sidebarWidth: 260,
    hasCustomHeader: true,
    palette: ['#0b1329', '#ec4899', '#0f172a', '#3b82f6'],
  },
  {
    id: 'royal_sapphire',
    nameKey: 'tplUnifiedRoyalSapphire',
    defaultName: 'Royal Sapphire Executive',
    descKey: 'tplUnifiedRoyalSapphireDesc',
    defaultDesc: 'Executive navy blue theme with polished contrast for corporate and finance.',
    badge: 'Corporate Blue',
    badgeKey: 'tplBadgeCorporateBlue',
    category: ['light', 'corporate'],
    mode: 'light',
    primaryColor: '#2563eb',
    sidebarBg: '#0a192f',
    sidebarText: '#93c5fd',
    activeBg: '#2563eb',
    activeText: '#ffffff',
    navbarBg: '#1e3a8a',
    navbarText: '#ffffff',
    navbarBorder: '#1d4ed8',
    navbarShadow: 'md',
    roundedStyle: 'rounded-xl',
    sidebarWidth: 260,
    hasCustomHeader: true,
    palette: ['#0a192f', '#2563eb', '#1e3a8a', '#60a5fa'],
  },
  {
    id: 'emerald_forest',
    nameKey: 'tplUnifiedEmeraldForest',
    defaultName: 'Emerald Aurora Green',
    descKey: 'tplUnifiedEmeraldForestDesc',
    defaultDesc: 'Fresh natural emerald theme designed for retail, pharmacy, and organics.',
    badge: 'Fresh Nature',
    badgeKey: 'tplBadgeFreshNature',
    category: ['light', 'vibrant', 'corporate'],
    mode: 'light',
    primaryColor: '#10b981',
    sidebarBg: '#042219',
    sidebarText: '#a7f3d0',
    activeBg: '#10b981',
    activeText: '#ffffff',
    navbarBg: '#064e3b',
    navbarText: '#ecfdf5',
    navbarBorder: '#047857',
    navbarShadow: 'md',
    roundedStyle: 'rounded-xl',
    sidebarWidth: 260,
    hasCustomHeader: true,
    palette: ['#042219', '#10b981', '#064e3b', '#34d399'],
  },
  {
    id: 'imperial_amethyst',
    nameKey: 'tplUnifiedImperialAmethyst',
    defaultName: 'Imperial Amethyst VIP',
    descKey: 'tplUnifiedImperialAmethystDesc',
    defaultDesc: 'High-end luxury VIP purple theme tailored for jewelry and premium boutiques.',
    badge: 'Luxury VIP',
    badgeKey: 'tplBadgeLuxuryVIP',
    category: ['dark', 'luxury'],
    mode: 'dark',
    primaryColor: '#8b5cf6',
    sidebarBg: '#130924',
    sidebarText: '#d8b4fe',
    activeBg: '#8b5cf6',
    activeText: '#ffffff',
    navbarBg: '#2e1065',
    navbarText: '#f5f3ff',
    navbarBorder: '#4c1d95',
    navbarShadow: 'lg',
    roundedStyle: 'rounded-2xl',
    sidebarWidth: 260,
    hasCustomHeader: true,
    palette: ['#130924', '#8b5cf6', '#2e1065', '#c084fc'],
  },
  {
    id: 'obsidian_gold',
    nameKey: 'tplUnifiedObsidianGold',
    defaultName: 'Cyberpunk Obsidian Gold',
    descKey: 'tplUnifiedObsidianGoldDesc',
    defaultDesc: 'Carbon obsidian dark theme accented with warm sunset gold.',
    badge: 'Dark Gold',
    badgeKey: 'tplBadgeFullDarkGold',
    category: ['dark', 'luxury'],
    mode: 'dark',
    primaryColor: '#f59e0b',
    sidebarBg: '#111215',
    sidebarText: '#fbbf24',
    activeBg: '#f59e0b',
    activeText: '#000000',
    navbarBg: '#18191e',
    navbarText: '#fef3c7',
    navbarBorder: '#272932',
    navbarShadow: 'md',
    roundedStyle: 'rounded-xl',
    sidebarWidth: 260,
    hasCustomHeader: true,
    palette: ['#111215', '#f59e0b', '#18191e', '#fbbf24'],
  },
  {
    id: 'pure_minimalist',
    nameKey: 'tplUnifiedPureMinimalist',
    defaultName: 'Pure Minimalist Snow',
    descKey: 'tplUnifiedPureMinimalistDesc',
    defaultDesc: 'Crisp minimalist pure white theme with refined modern typography.',
    badge: 'Minimalist Light',
    badgeKey: 'tplBadgeMinimalistLight',
    category: ['light'],
    mode: 'light',
    primaryColor: '#4f46e5',
    sidebarBg: '#ffffff',
    sidebarText: '#475569',
    activeBg: '#4f46e5',
    activeText: '#ffffff',
    navbarBg: '#ffffff',
    navbarText: '#0f172a',
    navbarBorder: '#e2e8f0',
    navbarShadow: 'sm',
    roundedStyle: 'rounded-xl',
    sidebarWidth: 260,
    hasCustomHeader: true,
    palette: ['#ffffff', '#4f46e5', '#ffffff', '#6366f1'],
  },
  {
    id: 'nordic_cyan',
    nameKey: 'tplUnifiedNordicCyan',
    defaultName: 'Nordic Frost Cyan',
    descKey: 'tplUnifiedNordicCyanDesc',
    defaultDesc: 'Clean Scandinavian slate theme accented with cool arctic cyan frost.',
    badge: 'Nordic Clean',
    badgeKey: 'tplBadgeNordicClean',
    category: ['dark', 'corporate'],
    mode: 'dark',
    primaryColor: '#06b6d4',
    sidebarBg: '#0f172a',
    sidebarText: '#94a3b8',
    activeBg: '#06b6d4',
    activeText: '#000000',
    navbarBg: '#0f172a',
    navbarText: '#f1f5f9',
    navbarBorder: '#1e293b',
    navbarShadow: 'md',
    roundedStyle: 'rounded-xl',
    sidebarWidth: 260,
    hasCustomHeader: true,
    palette: ['#0f172a', '#06b6d4', '#0f172a', '#22d3ee'],
  },
  {
    id: 'crimson_dynasty',
    nameKey: 'tplUnifiedCrimsonDynasty',
    defaultName: 'Crimson Dynasty Elite',
    descKey: 'tplUnifiedCrimsonDynastyDesc',
    defaultDesc: 'Sophisticated burgundy crimson theme for high-end luxury stores.',
    badge: 'Crimson Elite',
    badgeKey: 'tplBadgeCrimsonElite',
    category: ['dark', 'luxury'],
    mode: 'dark',
    primaryColor: '#ef4444',
    sidebarBg: '#1a050b',
    sidebarText: '#fca5a5',
    activeBg: '#ef4444',
    activeText: '#ffffff',
    navbarBg: '#450a0a',
    navbarText: '#fee2e2',
    navbarBorder: '#7f1d1d',
    navbarShadow: 'lg',
    roundedStyle: 'rounded-2xl',
    sidebarWidth: 260,
    hasCustomHeader: true,
    palette: ['#1a050b', '#ef4444', '#450a0a', '#f87171'],
  },
  {
    id: 'sunset_espresso',
    nameKey: 'tplUnifiedSunsetEspresso',
    defaultName: 'Sunset Espresso Cafe',
    descKey: 'tplUnifiedSunsetEspressoDesc',
    defaultDesc: 'Warm espresso amber theme ideal for restaurants, cafes, and hospitality.',
    badge: 'Warm Sunset',
    badgeKey: 'tplBadgeWarmSunset',
    category: ['light', 'luxury'],
    mode: 'light',
    primaryColor: '#d97706',
    sidebarBg: '#1c130c',
    sidebarText: '#fed7aa',
    activeBg: '#d97706',
    activeText: '#ffffff',
    navbarBg: '#78350f',
    navbarText: '#fef3c7',
    navbarBorder: '#92400e',
    navbarShadow: 'md',
    roundedStyle: 'rounded-xl',
    sidebarWidth: 260,
    hasCustomHeader: true,
    palette: ['#1c130c', '#d97706', '#78350f', '#f59e0b'],
  },
  {
    id: 'high_contrast_matrix',
    nameKey: 'tplUnifiedMatrixNeon',
    defaultName: 'Matrix Neon Cyber',
    descKey: 'tplUnifiedMatrixNeonDesc',
    defaultDesc: 'Pitch black cyberpunk theme highlighted with electric neon green.',
    badge: 'Cyber Neon',
    badgeKey: 'tplBadgeCyberNeon',
    category: ['dark', 'vibrant'],
    mode: 'dark',
    primaryColor: '#22c55e',
    sidebarBg: '#000000',
    sidebarText: '#86efac',
    activeBg: '#22c55e',
    activeText: '#000000',
    navbarBg: '#050505',
    navbarText: '#bbf7d0',
    navbarBorder: '#14532d',
    navbarShadow: 'sm',
    roundedStyle: 'rounded-md',
    sidebarWidth: 260,
    hasCustomHeader: true,
    palette: ['#000000', '#22c55e', '#050505', '#4ade80'],
  },
  {
    id: 'rose_champagne',
    nameKey: 'tplUnifiedRoseChampagne',
    defaultName: 'Rose Quartz Champagne',
    descKey: 'tplUnifiedRoseChampagneDesc',
    defaultDesc: 'Soft boutique theme accented with rose gold for beauty, cosmetics, and fashion.',
    badge: 'Rose Boutique',
    badgeKey: 'tplBadgeRoseBoutique',
    category: ['light', 'luxury'],
    mode: 'light',
    primaryColor: '#f43f5e',
    sidebarBg: '#f8fafc',
    sidebarText: '#475569',
    activeBg: '#f43f5e',
    activeText: '#ffffff',
    navbarBg: '#fff1f2',
    navbarText: '#881337',
    navbarBorder: '#fecdd3',
    navbarShadow: 'sm',
    roundedStyle: 'rounded-2xl',
    sidebarWidth: 260,
    hasCustomHeader: true,
    palette: ['#f8fafc', '#f43f5e', '#fff1f2', '#fb7185'],
  },
  {
    id: 'titanium_slate',
    nameKey: 'tplUnifiedTitaniumSlate',
    defaultName: 'Titanium Slate Modern',
    descKey: 'tplUnifiedTitaniumSlateDesc',
    defaultDesc: 'Modern titanium slate theme accented with sky blue for tech and engineering.',
    badge: 'Titanium Dark',
    badgeKey: 'tplBadgeTitaniumDark',
    category: ['dark', 'corporate'],
    mode: 'dark',
    primaryColor: '#0284c7',
    sidebarBg: '#18181b',
    sidebarText: '#a1a1aa',
    activeBg: '#0284c7',
    activeText: '#ffffff',
    navbarBg: '#0c4a6e',
    navbarText: '#f0f9ff',
    navbarBorder: '#0369a1',
    navbarShadow: 'md',
    roundedStyle: 'rounded-xl',
    sidebarWidth: 260,
    hasCustomHeader: true,
    palette: ['#18181b', '#0284c7', '#0c4a6e', '#38bdf8'],
  },
];

export const panelTemplates: PanelTemplate[] = UNIFIED_THEME_TEMPLATES.map((t) => ({
  id: t.id,
  nameKey: t.nameKey,
  defaultName: t.defaultName,
  descKey: t.descKey,
  defaultDesc: t.defaultDesc,
  defaultBadge: t.badge,
  sidebarBg: t.sidebarBg,
  sidebarText: t.sidebarText,
  activeBg: t.activeBg,
  activeText: t.activeText,
  navbarBg: t.navbarBg,
  navbarText: t.navbarText,
  navbarBorder: t.navbarBorder,
}));

