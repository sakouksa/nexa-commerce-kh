import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { RouteTransition } from '../components/common/RouteTransition';

export const MerchantLayout: React.FC = () => {
  const location = useLocation();

  // Responsive collapsed state
  // On screens < 1280px (tablets / smaller desktop / laptop), default to collapsed mode ("ចូលទម្រង់បង្រួម")
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1280) {
      return true;
    }
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  // Mobile drawer state (< 768px)
  const [mobileOpen, setMobileOpen] = useState(false);

  // Automatically collapse sidebar when resizing into small screen (< 1280px)
  useEffect(() => {
    const handleResize = () => {
      const isSmall = window.innerWidth < 1280;
      if (isSmall) {
        setCollapsed(true);
      } else {
        // Restore user preference on large desktop screens
        const saved = localStorage.getItem('sidebar_collapsed');
        if (saved !== null) {
          setCollapsed(saved === 'true');
        }
      }

      // Close mobile drawer if resized to tablet/desktop
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleToggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleToggleMobileSidebar = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#f2f0e8] dark:bg-[#0e1b1d] text-[#16292e] dark:text-[#e7ede9] flex transition-colors font-sans">
      {/* Mobile Drawer Backdrop Overlay */}
      {mobileOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close sidebar backdrop"
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setMobileOpen(false);
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Responsive Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={handleToggleSidebar}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        style={{
          marginLeft: typeof window !== 'undefined' && window.innerWidth >= 768
            ? (collapsed ? '70px' : 'var(--sidebar-width, 260px)')
            : undefined,
        }}
        className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ml-0"
      >
        <Header
          sidebarCollapsed={collapsed}
          onToggleSidebar={handleToggleSidebar}
          onToggleMobileSidebar={handleToggleMobileSidebar}
        />
        <main className="flex-1 p-3.5 sm:p-5 lg:p-7 overflow-y-auto w-full no-scrollbar flex flex-col justify-between">
          <div className="flex-1 min-w-0">
            <RouteTransition>
              <Outlet />
            </RouteTransition>
          </div>
          <Footer className="mt-6" />
        </main>
      </div>
    </div>
  );
};

export default MerchantLayout;
