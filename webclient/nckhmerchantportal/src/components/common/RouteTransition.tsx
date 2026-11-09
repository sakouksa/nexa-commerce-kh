import React, { useState, useEffect, useRef, ReactNode, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { LoadingSpinner } from './LoadingSpinner';
import { useLanguage } from '../../i18n';
import { cn } from '@/lib/utils';

interface RouteTransitionProps {
  children?: ReactNode;
  duration?: number;
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({
  children,
  duration = 260,
}) => {
  const location = useLocation();
  const { isKhmer } = useLanguage();
  const [isNavigating, setIsNavigating] = useState(false);
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    // Only trigger transition when navigating to a different page
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      setIsNavigating(true);

      // Scroll to top immediately on route change
      window.scrollTo({ top: 0, behavior: 'instant' });

      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, duration);

      return () => {
        clearTimeout(timer);
        setIsNavigating(false);
      };
    }
  }, [location.pathname, duration]);

  return (
    <div className="relative w-full min-h-[60vh] flex-1 flex flex-col">
      {/* Top subtle progress bar accent */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-orange-500/10 dark:bg-orange-400/10 overflow-hidden pointer-events-none">
          <div className="h-full bg-linear-to-r from-orange-500 via-amber-500 to-orange-600 animate-pulse w-full origin-left" />
        </div>
      )}

      {/* Centered Clean Loading Indicator (No box, pure clean) */}
      {isNavigating && (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[55vh] py-16 animate-in fade-in duration-150 select-none">
          <LoadingSpinner
            type="orbit"
            size="medium"
            text={isKhmer ? 'កំពុងផ្ទុកទំព័រ...' : 'Loading page...'}
          />
        </div>
      )}

      {/* Main page content (mounted in background for fast prefetch, then revealed) */}
      <div
        className={cn(
          'flex-1 flex flex-col w-full transition-opacity duration-200',
          isNavigating ? 'hidden' : 'animate-in fade-in-50 duration-200'
        )}
      >
        <Suspense
          fallback={
            <div className="flex-1 flex flex-col items-center justify-center min-h-[55vh] py-16 select-none">
              <LoadingSpinner
                type="orbit"
                size="medium"
                text={isKhmer ? 'កំពុងផ្ទុក...' : 'Loading...'}
              />
            </div>
          }
        >
          {children}
        </Suspense>
      </div>
    </div>
  );
};

export default RouteTransition;
