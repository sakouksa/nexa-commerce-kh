import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useLanguage } from '../../i18n';
import { ADMIN_NAV_GROUPS } from '../../config/navConfig';

export const BreadcrumbsNav: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const pathname = location.pathname;

  // Find corresponding group and item
  let matchedGroup = ADMIN_NAV_GROUPS.find((group) =>
    group.items.some((item) =>
      item.end ? pathname === item.to : pathname.startsWith(item.to)
    )
  );

  let matchedItem = matchedGroup?.items.find((item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to)
  );

  // Fallback if root or dashboard path
  const isDashboard = pathname === '/' || pathname === '/dashboard';

  return (
    <Breadcrumb className="hidden sm:flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="size-3.5" />
              <span className="sr-only">Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        {isDashboard ? (
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-foreground text-xs">
              {t('nav.dashboard', 'Dashboard')}
            </BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          <>
            {matchedGroup && (
              <>
                <BreadcrumbItem>
                  <span className="text-xs text-muted-foreground font-medium">
                    {t(matchedGroup.groupKey, matchedGroup.groupLabel)}
                  </span>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}

            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-foreground text-xs">
                {matchedItem?.labelKey
                  ? t(matchedItem.labelKey, matchedItem.label)
                  : matchedItem?.label || t('common.platform', 'Platform')}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbsNav;
