import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  PieChart,
  ShoppingBag,
  AlertTriangle,
  DollarSign,
  Activity,
  Zap,
  Clock,
  Bell,
  Smartphone,
  UserCheck,
} from 'lucide-react';

export type SupportedLang = 'kh' | 'en';

export interface MultiLangString {
  kh: string;
  en: string;
}

export interface WidgetDefinition {
  id: string;
  name: MultiLangString;
  description: MultiLangString;
  category: 'kpi' | 'analytics' | 'inventory' | 'finance' | 'system';
  categoryLabel: MultiLangString;
  icon: LucideIcon | React.ComponentType<{ className?: string; size?: number | string }>;
  gradient: string;
  badgeColor: string;
  defaultSize: 'small' | 'medium' | 'large';
  defaultOrder: number;
}

export const DASHBOARD_WIDGET_REGISTRY: Record<string, WidgetDefinition> = {
  business_alerts: {
    id: 'business_alerts',
    name: {
      kh: 'ដំណឹង និងការជូនដំណឹងអាជីវកម្ម',
      en: 'Business Alerts & Feeds',
    },
    description: {
      kh: 'បង្ហាញការជូនដំណឹងសំខាន់ៗ ដំណឹងស្តុក និងសកម្មភាពមិនប្រក្រតី',
      en: 'Displays high-priority business alerts, low stock warnings, and unusual transactions',
    },
    category: 'system',
    categoryLabel: {
      kh: 'ប្រព័ន្ធ & ការជូនដំណឹង',
      en: 'System & Alerts',
    },
    icon: Bell,
    gradient: 'from-amber-500 to-rose-500',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    defaultSize: 'large',
    defaultOrder: 0,
  },
  today_sales: {
    id: 'today_sales',
    name: {
      kh: 'ការលក់ប្រចាំថ្ងៃ',
      en: 'Today Sales Revenue',
    },
    description: {
      kh: 'បង្ហាញចំណូលសរុបបានមកពីការលក់ប្រចាំថ្ងៃ',
      en: 'Displays today total sales revenue and trend',
    },
    category: 'kpi',
    categoryLabel: {
      kh: 'ពាណិជ្ជកម្ម & KPI',
      en: 'Commerce & KPI',
    },
    icon: TrendingUp,
    gradient: 'from-blue-500 to-indigo-600',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    defaultSize: 'medium',
    defaultOrder: 1,
  },
  today_orders: {
    id: 'today_orders',
    name: {
      kh: 'ការកុម្ម៉ង់ប្រចាំថ្ងៃ',
      en: 'Today Orders Count',
    },
    description: {
      kh: 'ចំនួនប្រតិបត្តិការវិក្កយបត្រលក់ដែលបានចេញថ្ងៃនេះ',
      en: 'Total count of sales invoices processed today',
    },
    category: 'kpi',
    categoryLabel: {
      kh: 'ពាណិជ្ជកម្ម & KPI',
      en: 'Commerce & KPI',
    },
    icon: ShoppingCart,
    gradient: 'from-purple-500 to-violet-600',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    defaultSize: 'medium',
    defaultOrder: 2,
  },
  total_customers: {
    id: 'total_customers',
    name: {
      kh: 'អតិថិជនសរុប',
      en: 'Total Customers',
    },
    description: {
      kh: 'ចំនួនអតិថិជនដែលបានចុះឈ្មោះ និងកំណើនអតិថិជន',
      en: 'Registered customer count and growth metrics',
    },
    category: 'kpi',
    categoryLabel: {
      kh: 'ពាណិជ្ជកម្ម & KPI',
      en: 'Commerce & KPI',
    },
    icon: Users,
    gradient: 'from-sky-500 to-cyan-600',
    badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    defaultSize: 'medium',
    defaultOrder: 3,
  },
  total_products: {
    id: 'total_products',
    name: {
      kh: 'ទំនិញសរុប',
      en: 'Total Products in Catalog',
    },
    description: {
      kh: 'ចំនួនមុខទំនិញសរុបក្នុងកាតាឡុកប្រព័ន្ធ',
      en: 'Total number of catalog items in system database',
    },
    category: 'inventory',
    categoryLabel: {
      kh: 'ស្តុក & ទំនិញ',
      en: 'Inventory & Catalog',
    },
    icon: Package,
    gradient: 'from-emerald-500 to-teal-600',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    defaultSize: 'medium',
    defaultOrder: 4,
  },
  sales_overview: {
    id: 'sales_overview',
    name: {
      kh: 'ក្រាហ្វិកវិភាគការលក់',
      en: 'Sales Analytics Charts',
    },
    description: {
      kh: 'គំនូសតាងបន្ទាត់វិភាគប្រាក់ចំណូល និងប្រតិបត្តិការប្រចាំសប្តាហ៍',
      en: 'Visual weekly and monthly revenue trajectory comparison charts',
    },
    category: 'analytics',
    categoryLabel: {
      kh: 'ការវិភាគ & ក្រាហ្វិក',
      en: 'Analytics & Charts',
    },
    icon: BarChart3,
    gradient: 'from-indigo-500 to-purple-600',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    defaultSize: 'large',
    defaultOrder: 5,
  },
  category_sales: {
    id: 'category_sales',
    name: {
      kh: 'ការលក់តាមផ្នែកទំនិញ',
      en: 'Category Sales Breakdown',
    },
    description: {
      kh: 'សមាមាត្រចំណូលតាមប្រភេទកាតាឡុកទំនិញនីមួយៗ',
      en: 'Doughnut chart distribution of revenue per item category',
    },
    category: 'analytics',
    categoryLabel: {
      kh: 'ការវិភាគ & ក្រាហ្វិក',
      en: 'Analytics & Charts',
    },
    icon: PieChart,
    gradient: 'from-rose-500 to-pink-600',
    badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    defaultSize: 'medium',
    defaultOrder: 6,
  },
  recent_orders: {
    id: 'recent_orders',
    name: {
      kh: 'ការបញ្ជាទិញថ្មីៗបំផុត',
      en: 'Recent Orders Stream',
    },
    description: {
      kh: 'បញ្ជីរាយនាមវិក្កយបត្រថ្មីៗ ស្ថានភាពទូទាត់ និងអតិថិជន',
      en: 'Real-time ledger feed of latest finalized order transactions',
    },
    category: 'kpi',
    categoryLabel: {
      kh: 'ពាណិជ្ជកម្ម & KPI',
      en: 'Commerce & KPI',
    },
    icon: ShoppingBag,
    gradient: 'from-cyan-500 to-blue-600',
    badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    defaultSize: 'large',
    defaultOrder: 7,
  },
  low_stock: {
    id: 'low_stock',
    name: {
      kh: 'ទំនិញជិតអស់ពីស្តុក',
      en: 'Low Stock Alert Table',
    },
    description: {
      kh: 'បញ្ជីមុខទំនិញដែលនៅសល់ក្រោមចំនួនកំណត់សុវត្ថិភាព',
      en: 'Critical inventory reorder warnings below safety thresholds',
    },
    category: 'inventory',
    categoryLabel: {
      kh: 'ស្តុក & ទំនិញ',
      en: 'Inventory & Catalog',
    },
    icon: AlertTriangle,
    gradient: 'from-amber-500 to-orange-600',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    defaultSize: 'medium',
    defaultOrder: 8,
  },
  quick_actions: {
    id: 'quick_actions',
    name: {
      kh: 'សកម្មភាពរហ័ស',
      en: 'Quick Actions Bar',
    },
    description: {
      kh: 'ប៊ូតុងផ្លូវកាត់សម្រាប់បង្កើតការលក់ថ្មី បន្ថែមទំនិញ ឬមើលរបាយការណ៍',
      en: 'Shortcut launchpad to quickly initiate sales, add products, or check reports',
    },
    category: 'kpi',
    categoryLabel: {
      kh: 'ពាណិជ្ជកម្ម & KPI',
      en: 'Commerce & KPI',
    },
    icon: Zap,
    gradient: 'from-amber-500 to-yellow-600',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    defaultSize: 'medium',
    defaultOrder: 9,
  },
  system_health: {
    id: 'system_health',
    name: {
      kh: 'ស្ថានភាពប្រព័ន្ធ & សុខភាព',
      en: 'System Health Diagnostics',
    },
    description: {
      kh: 'ត្រួតពិនិត្យល្បឿន Server, Database Connection, និងសេវាកម្ម',
      en: 'Server performance monitor, database status, and API health response times',
    },
    category: 'system',
    categoryLabel: {
      kh: 'ប្រព័ន្ធ & ការជូនដំណឹង',
      en: 'System & Alerts',
    },
    icon: Activity,
    gradient: 'from-teal-500 to-cyan-600',
    badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    defaultSize: 'large',
    defaultOrder: 10,
  },
  recent_activities: {
    id: 'recent_activities',
    name: {
      kh: 'កំណត់ហេតុសកម្មភាពថ្មីៗ',
      en: 'Recent Activity Timeline',
    },
    description: {
      kh: 'បន្ទាត់ពេលវេលានៃសកម្មភាពអ្នកប្រើប្រាស់ និងប្រតិបត្តិការចុងក្រោយ',
      en: 'Chronological timeline of real-time user updates and audit logs',
    },
    category: 'system',
    categoryLabel: {
      kh: 'ប្រព័ន្ធ & ការជូនដំណឹង',
      en: 'System & Alerts',
    },
    icon: Clock,
    gradient: 'from-slate-600 to-slate-800',
    badgeColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    defaultSize: 'medium',
    defaultOrder: 11,
  },
};

export const DEFAULT_WIDGETS_LIST = Object.values(DASHBOARD_WIDGET_REGISTRY).map((w) => ({
  id: w.id,
  visible: true,
  size: w.defaultSize,
  order: w.defaultOrder,
}));

export const PRESET_LAYOUTS = [
  {
    id: 'default',
    name: {
      kh: 'ទម្រង់ដើមប្រព័ន្ធ',
      en: 'Standard Default',
    },
    desc: {
      kh: 'បង្ហាញ widgets ទាំងអស់តាមលំដាប់លំដោយស្តង់ដារ',
      en: 'Shows all widgets in balanced standard order',
    },
  },
  {
    id: 'sales_focus',
    name: {
      kh: 'ផ្តោតលើការលក់ & KPI',
      en: 'Sales & KPI Focus',
    },
    desc: {
      kh: 'បង្ហាញតែ widgets ការលក់ ចំណូល វិក្កយបត្រ និងក្រាហ្វិកវិភាគ',
      en: 'Prioritizes sales metrics, orders, revenue charts, and top items',
    },
  },
  {
    id: 'inventory_focus',
    name: {
      kh: 'ផ្តោតលើស្តុក & ឃ្លាំង',
      en: 'Inventory Focus',
    },
    desc: {
      kh: 'បង្ហាញ widgets ទំនិញ ស្តុកជិតអស់ ឃ្លាំង និងដំណឹងអាជីវកម្ម',
      en: 'Prioritizes product catalog, low stock alerts, and warehouse analytics',
    },
  },
  {
    id: 'compact',
    name: {
      kh: 'ទម្រង់បង្រួមតូច',
      en: 'Compact Minimal',
    },
    desc: {
      kh: 'លាក់ widgets មិនចាំបាច់ ដើម្បីមើលតែ metrics សំខាន់ៗបំផុត',
      en: 'Hides low priority widgets for a clutter-free executive view',
    },
  },
];

export function getWidgetLocalizedString(
  strObj: MultiLangString | undefined,
  lang: string
): string {
  if (!strObj) return '';
  const validLang: SupportedLang = lang.startsWith('en') ? 'en' : 'kh';
  return strObj[validLang] || strObj.kh || strObj.en || '';
}
