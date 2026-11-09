import React, { ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { AdminLayout } from './components/layout/AdminLayout';

// Domain Pages (Direct Imports - No index.ts needed)
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ShopsPage from './pages/shops/ShopsPage';
import ShopDetailPage from './pages/shops/ShopDetailPage';
import UsersPage from './pages/users/UsersPage';
import ResellersPage from './pages/resellers/ResellersPage';
import ResellerDetailPage from './pages/resellers/ResellerDetailPage';
import BackupPage from './pages/backup/BackupPage';
import ActivityLogsPage from './pages/logs/ActivityLogsPage';
import SettingsPage from './pages/settings/SettingsPage';
import HttpErrorPage from './components/shared/HttpErrorPage';

// Protected Route Guard (Integrated directly in routes file)
export function ProtectedRoute({
  children,
  allowedRoles = ['admin', 'superadmin'],
}: {
  children: ReactNode;
  allowedRoles?: string[];
}) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/sign-in-admin" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/sign-in-admin" replace />;
  }

  return <>{children}</>;
}

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/sign-in-admin" element={<LoginPage />} />
      <Route path="/login" element={<Navigate to="/sign-in-admin" replace />} />

      {/* Protected Admin Portal Shell */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="shops" element={<ShopsPage />} />
        <Route path="shops/:id" element={<ShopDetailPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="resellers" element={<ResellersPage />} />
        <Route path="resellers/:id" element={<ResellerDetailPage />} />
        <Route path="backup" element={<BackupPage />} />
        <Route path="activity" element={<ActivityLogsPage />} />
        <Route path="logs" element={<ActivityLogsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<HttpErrorPage code={404} fullPage={true} />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<HttpErrorPage code={404} fullPage={true} />} />
    </Routes>
  );
};

export default AppRoutes;

