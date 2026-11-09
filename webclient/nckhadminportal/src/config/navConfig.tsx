import React, { ReactNode } from 'react';
import {
  LayoutDashboard,
  Store,
  Users,
  BadgePercent,
  Database,
  Activity,
  Settings,
} from 'lucide-react';

export interface NavSubItemConfig {
  to: string;
  labelKey: string;
  label: string;
  badge?: string;
}

export interface NavItemConfig {
  to: string;
  labelKey: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
  badge?: string;
  description?: string;
  children?: NavSubItemConfig[];
}

export interface NavGroupConfig {
  id: string;
  groupKey: string;
  groupLabel: string;
  items: NavItemConfig[];
}

export const ADMIN_NAV_GROUPS: NavGroupConfig[] = [
  {
    id: 'overview',
    groupKey: 'nav.groupOverview',
    groupLabel: 'Overview',
    items: [
      {
        to: '/',
        labelKey: 'nav.dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard className="size-4 shrink-0" />,
        end: true,
        description: 'Platform statistics and sales metrics',
      },
    ],
  },
  {
    id: 'management',
    groupKey: 'nav.groupManagement',
    groupLabel: 'Management',
    items: [
      {
        to: '/shops',
        labelKey: 'nav.shops',
        label: 'Shops',
        icon: <Store className="size-4 shrink-0" />,
        description: 'Active merchant stores and configurations',
      },
      {
        to: '/users',
        labelKey: 'nav.users',
        label: 'Users',
        icon: <Users className="size-4 shrink-0" />,
        description: 'Admins, shop owners, and staff members',
      },
      {
        to: '/resellers',
        labelKey: 'nav.resellers',
        label: 'Resellers',
        icon: <BadgePercent className="size-4 shrink-0" />,
        description: 'Affiliates, partners, and commission tiers',
      },
    ],
  },
  {
    id: 'system',
    groupKey: 'nav.groupSystem',
    groupLabel: 'System & Tools',
    items: [
      {
        to: '/backup',
        labelKey: 'nav.backup',
        label: 'Backup',
        icon: <Database className="size-4 shrink-0" />,
        description: 'Database snapshot and disaster recovery',
      },
      {
        to: '/activity',
        labelKey: 'nav.activity',
        label: 'Activity Logs',
        icon: <Activity className="size-4 shrink-0" />,
        description: 'Audit trails and administrative operations',
      },
      {
        to: '/settings',
        labelKey: 'nav.settings',
        label: 'Settings',
        icon: <Settings className="size-4 shrink-0" />,
        description: 'Global system variables and platform settings',
      },
    ],
  },
];

// Flat list for breadcrumb matching, quick search, and backwards compatibility
export const ADMIN_NAV_ITEMS: NavItemConfig[] = ADMIN_NAV_GROUPS.flatMap((group) => group.items);
