import React, { ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { MerchantLayout } from './layouts/MerchantLayout';
import { POSLayout } from './layouts/POSLayout';

// Feature Pages (Modern Feature-Based Modular Architecture - Direct Imports)
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import POSPage from './features/pos/POSPage';
import ProductsPage from './features/products/ProductsPage';
import ProductFormPage from './features/products/ProductFormPage';
import CategoriesPage from './features/categories/CategoriesPage';
import StockPage from './features/inventory/StockPage';
import OrdersPage from './features/orders/OrdersPage';
import OrderDetailPage from './features/orders/OrderDetailPage';
import ReceiptsPage from './features/orders/ReceiptsPage';
import CustomersPage from './features/customers/CustomersPage';
import ReportsPage from './features/reports/ReportsPage';
import ShopSettingsPage from './features/settings/ShopSettingsPage';
import PaymentSettingsPage from './features/settings/PaymentSettingsPage';
import TelegramSettingsPage from './features/settings/TelegramSettingsPage';
import UpgradePlanPage from './features/settings/UpgradePlanPage';
import BackupPage from './features/settings/BackupPage';
import UserProfilePage from './features/profile/UserProfilePage';

// Restaurant & Operational Support Features
import FloorPlanPage from './features/floor-plan/FloorPlanPage';
import KitchenDisplayPage from './features/kitchen-display/KitchenDisplayPage';
import ReservationsPage from './features/reservations/ReservationsPage';
import HttpErrorPage from './components/shared/HttpErrorPage';

// Protected Route Guard
export function ProtectedRoute({
  children,
  allowedRoles = ['shop_owner', 'staff'],
}: {
  children: ReactNode;
  allowedRoles?: string[];
}) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && user.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Standalone Fullscreen POS Terminal (RestroPOS Clone) */}
      <Route
        path="/pos"
        element={
          <ProtectedRoute>
            <POSLayout>
              <POSPage />
            </POSLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected Merchant Portal Shell */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MerchantLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="pos" element={<Navigate to="/pos" replace />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id/edit" element={<ProductFormPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="menu/category" element={<CategoriesPage />} />
        <Route path="stock" element={<StockPage />} />
        <Route path="inventory" element={<StockPage />} />
        <Route path="floor-plan" element={<FloorPlanPage />} />
        <Route path="kitchen-display" element={<KitchenDisplayPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="receipts" element={<ReceiptsPage />} />
        <Route path="settings" element={<ShopSettingsPage />} />
        <Route path="payment" element={<PaymentSettingsPage />} />
        <Route path="telegram" element={<TelegramSettingsPage />} />
        <Route path="backup" element={<BackupPage />} />
        <Route path="upgrade" element={<UpgradePlanPage />} />
        <Route path="profile" element={<UserProfilePage />} />
        <Route path="pages/user-profile" element={<UserProfilePage />} />
        <Route path="*" element={<HttpErrorPage code={404} fullPage={true} />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<HttpErrorPage code={404} fullPage={true} />} />
    </Routes>
  );
};

export default AppRoutes;

