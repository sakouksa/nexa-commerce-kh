import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { RouteTransition } from '../common/RouteTransition';

export const AdminLayout: React.FC = () => {
  const location = useLocation();

  // Responsive collapsed state
  // On screens < 1280px (tablets / smaller desktop / laptop), default to collapsed mode
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1280) {
      return true;
    }
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
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
        const saved = localStorage.getItem('admin_sidebar_collapsed');
        if (saved !== null) {
          setCollapsed(saved === 'true');
        }
      }

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
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleToggleMobileSidebar = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950/70 flex text-foreground selection:bg-primary/20 selection:text-primary transition-colors font-sans">
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
          marginLeft:
            typeof window !== 'undefined' && window.innerWidth >= 768
              ? collapsed
                ? '70px'
                : 'var(--sidebar-width, 260px)'
              : undefined,
        }}
        className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ml-0"
      >
        <Header
          sidebarCollapsed={collapsed}
          onToggleSidebar={handleToggleSidebar}
          onToggleMobileSidebar={handleToggleMobileSidebar}
        />
        <main
          style={{ padding: 'var(--container-padding, 1.5rem)' }}
          className="flex-1 overflow-y-auto"
        >
          <RouteTransition>
            <Outlet />
          </RouteTransition>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
