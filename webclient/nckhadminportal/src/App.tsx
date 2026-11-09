import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AppRoutes } from './routes';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { ThemeSynchronizer } from './components/theme/ThemeSynchronizer';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeSynchronizer />
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </ErrorBoundary>
  );
}
