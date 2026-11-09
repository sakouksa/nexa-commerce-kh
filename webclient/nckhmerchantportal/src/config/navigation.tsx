import React, { ReactNode } from 'react';
import {
  LayoutDashboard,
  CreditCard,
  LayoutGrid,
  CookingPot,
  ShoppingCart,
  CalendarDays,
  Tag,
  Package,
  Boxes,
  Users,
  BarChart3,
  Receipt,
  Send,
  Smartphone,
  User,
  Settings,
  Database,
  TrendingUp,
} from 'lucide-react';

export interface NavItemConfig {
  to: string;
  labelKey: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
  external?: boolean;
  badge?: string;
  hasSubmenu?: boolean;
  children?: {
    to: string;
    labelKey: string;
    label: string;
    badge?: string;
  }[];
}

export interface NavGroupConfig {
  groupKey: string;
  groupLabel: string;
  items: NavItemConfig[];
}

export const MERCHANT_NAV_GROUPS: NavGroupConfig[] = [
  {
    groupKey: 'nav.groupOverview',
    groupLabel: 'OVERVIEW',
    items: [
      { to: '/dashboard', labelKey: 'nav.dashboard', label: 'Dashboard', icon: <LayoutDashboard className="size-4" />, end: true },
      { to: '/pos', labelKey: 'nav.pos', label: 'POS Sale', icon: <CreditCard className="size-4" /> },
      { to: '/floor-plan', labelKey: 'nav.floorPlan', label: 'Floor Plan', icon: <LayoutGrid className="size-4" /> },
      { to: '/kitchen-display', labelKey: 'nav.kitchenDisplay', label: 'Kitchen Display', icon: <CookingPot className="size-4" /> },
      { to: '/reservations', labelKey: 'nav.reservations', label: 'Reservations', icon: <CalendarDays className="size-4" /> },
    ],
  },
  {
    groupKey: 'nav.groupCommerce',
    groupLabel: 'COMMERCE',
    items: [
      { to: '/orders', labelKey: 'nav.orders', label: 'Orders', icon: <ShoppingCart className="size-4" />, badge: '12' },
      { to: '/products', labelKey: 'nav.products', label: 'Products', icon: <Package className="size-4" /> },
      { to: '/menu/category', labelKey: 'nav.categories', label: 'Categories', icon: <Tag className="size-4" /> },
      { to: '/stock', labelKey: 'nav.stock', label: 'Inventory', icon: <Boxes className="size-4" /> },
      { to: '/customers', labelKey: 'nav.customers', label: 'Customers', icon: <Users className="size-4" /> },
      { to: '/receipts', labelKey: 'nav.receipts', label: 'Invoices', icon: <Receipt className="size-4" /> },
    ],
  },
  {
    groupKey: 'nav.groupChannels',
    groupLabel: 'CHANNELS & INTEGRATIONS',
    items: [
      { to: '/reports', labelKey: 'nav.reports', label: 'Analytics', icon: <BarChart3 className="size-4" /> },
      { to: '/telegram', labelKey: 'nav.telegram', label: 'Telegram Bot', icon: <Send className="size-4" /> },
      { to: '/payment', labelKey: 'nav.payment', label: 'Payment (ABA Pay)', icon: <Smartphone className="size-4" /> },
    ],
  },
  {
    groupKey: 'nav.groupSystem',
    groupLabel: 'SYSTEM & SETTINGS',
    items: [
      { to: '/profile', labelKey: 'nav.profile', label: 'My Profile', icon: <User className="size-4" /> },
      { to: '/settings', labelKey: 'nav.settings', label: 'Shop Settings', icon: <Settings className="size-4" /> },
      { to: '/backup', labelKey: 'nav.backup', label: 'Backup & Import', icon: <Database className="size-4" /> },
      { to: '/upgrade', labelKey: 'nav.upgrade', label: 'Upgrade Plan', icon: <TrendingUp className="size-4" /> },
    ],
  },
];

export const MERCHANT_NAV_ITEMS: NavItemConfig[] = MERCHANT_NAV_GROUPS.flatMap((g) => g.items);

export default MERCHANT_NAV_ITEMS;
