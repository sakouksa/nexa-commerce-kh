import React from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import { useLanguage } from '../../i18n';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  homeHref?: string;
  homeLabel?: string;
}

// Global Route Mapping for automatic breadcrumb generation
const ROUTE_CONFIG: Record<string, { category: string; categoryHref?: string; title: string }> = {
  '/dashboard': { category: 'Overview', title: 'Dashboard' },
  '/orders': { category: 'Commerce', categoryHref: '/orders', title: 'Orders' },
  '/products': { category: 'Commerce', categoryHref: '/products', title: 'Products' },
  '/products/new': { category: 'Products', categoryHref: '/products', title: 'New Product' },
  '/categories': { category: 'Commerce', categoryHref: '/categories', title: 'Categories' },
  '/stock': { category: 'Commerce', categoryHref: '/stock', title: 'Stock & Inventory' },
  '/inventory': { category: 'Commerce', categoryHref: '/stock', title: 'Stock & Inventory' },
  '/customers': { category: 'Commerce', categoryHref: '/customers', title: 'Customers' },
  '/reports': { category: 'Analytics', categoryHref: '/reports', title: 'Reports' },
  '/receipts': { category: 'Commerce', categoryHref: '/receipts', title: 'Receipts' },
  '/settings': { category: 'Settings', categoryHref: '/settings', title: 'Shop Settings' },
  '/payment': { category: 'Settings', categoryHref: '/settings', title: 'Payment (ABA Pay)' },
  '/telegram': { category: 'Channels', categoryHref: '/telegram', title: 'Telegram Bot' },
  '/backup': { category: 'Settings', categoryHref: '/settings', title: 'Backup & Restore' },
  '/upgrade': { category: 'Account', categoryHref: '/upgrade', title: 'Upgrade Plan' },
  '/floor-plan': { category: 'Operations', categoryHref: '/floor-plan', title: 'Floor Plan' },
  '/kitchen-display': { category: 'Operations', categoryHref: '/kitchen-display', title: 'Kitchen Display' },
  '/reservations': { category: 'Operations', categoryHref: '/reservations', title: 'Reservations' },
  '/profile': { category: 'Settings', categoryHref: '/profile?view=general', title: 'General' },
};

// Profile settings tab title mapping
const PROFILE_VIEW_TITLES: Record<string, string> = {
  general: 'General',
  roles: 'Roles & Permissions',
  workflow: 'Workflow',
  notifications: 'Notifications',
  localization: 'Localization',
  system: 'System',
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className,
  showHome = true,
  homeHref = '/dashboard',
  homeLabel = 'Home',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();

  // If items are not passed manually, auto-generate from the current pathname and search params
  const computedItems: BreadcrumbItem[] = React.useMemo(() => {
    if (items && items.length > 0) {
      return items;
    }

    const pathname = location.pathname;

    // Special handling for Profile page with ?view=
    if (pathname.includes('/profile') || pathname.includes('/pages/user-profile')) {
      const view = searchParams.get('view') || 'general';
      const viewTitle = PROFILE_VIEW_TITLES[view] || 'General';
      return [
        { label: 'Settings', href: '/profile?view=general' },
        { label: viewTitle },
      ];
    }

    // Dynamic order detail: /orders/:id
    if (pathname.startsWith('/orders/') && pathname !== '/orders/new') {
      const orderId = pathname.replace('/orders/', '');
      return [
        { label: 'Orders', href: '/orders' },
        { label: `#${orderId}` },
      ];
    }

    // Dynamic product edit: /products/:id/edit
    if (pathname.startsWith('/products/') && pathname.endsWith('/edit')) {
      return [
        { label: 'Products', href: '/products' },
        { label: 'Edit Product' },
      ];
    }

    // Exact match in route config
    const matched = ROUTE_CONFIG[pathname];
    if (matched) {
      if (pathname === '/dashboard') {
        return [{ label: 'Dashboard' }];
      }
      return [
        { label: matched.category, href: matched.categoryHref },
        { label: matched.title },
      ];
    }

    // Generic fallback from URL segments
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((seg, idx) => {
      const isLast = idx === segments.length - 1;
      const formatted = seg.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const href = '/' + segments.slice(0, idx + 1).join('/');
      return {
        label: formatted,
        href: isLast ? undefined : href,
      };
    });
  }, [items, location.pathname, searchParams]);

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-sans select-none',
        className
      )}
    >
      <ol className="flex items-center gap-1.5 flex-wrap">
        {/* Home Item */}
        {showHome && (
          <li className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => navigate(homeHref)}
              className="flex items-center gap-1.5 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors outline-none group"
              title={homeLabel}
            >
              <FiHome className="size-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
              <span>{t('nav.home', homeLabel)}</span>
            </button>
            {computedItems.length > 0 && (
              <span className="text-slate-300 dark:text-slate-600 font-normal">/</span>
            )}
          </li>
        )}

        {/* Trail Items */}
        {computedItems.map((item, index) => {
          const isLast = index === computedItems.length - 1;
          const Icon = item.icon;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {isLast ? (
                <span className="text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1 cursor-default">
                  {Icon && <Icon className="size-3 text-slate-500" />}
                  <span>{t(`breadcrumb.${item.label}`, item.label)}</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (item.onClick) item.onClick();
                    else if (item.href) navigate(item.href);
                  }}
                  className={cn(
                    'hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-1 outline-none',
                    item.href || item.onClick ? 'cursor-pointer' : 'cursor-default text-slate-500 dark:text-slate-400'
                  )}
                >
                  {Icon && <Icon className="size-3 text-slate-400" />}
                  <span>{t(`breadcrumb.${item.label}`, item.label)}</span>
                </button>
              )}

              {!isLast && (
                <span className="text-slate-300 dark:text-slate-600 font-normal">/</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;

