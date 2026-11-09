import React, { ReactNode, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FiWifi, FiWifiOff } from 'react-icons/fi';

interface POSLayoutProps {
  children?: ReactNode;
}

export const POSLayout: React.FC<POSLayoutProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-900 text-slate-100 flex flex-col select-none">
      {/* Network Offline Alert Bar */}
      {!isOnline && (
        <div className="bg-rose-600 text-white text-xs font-medium py-1 px-4 flex items-center justify-center gap-2 shadow-sm animate-pulse z-50">
          <FiWifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode — Transaction data will queue locally until network reconnects</span>
        </div>
      )}

      {/* POS Terminal Body */}
      <main className="flex-1 w-full h-full overflow-hidden flex flex-col">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default POSLayout;
