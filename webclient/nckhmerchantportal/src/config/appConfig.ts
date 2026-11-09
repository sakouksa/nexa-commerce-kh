export const APP_CONFIG = {
  name: 'MiniStore KH',
  subtitle: 'Merchant Portal',
  version: '1.0.0',
  apiBaseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8003',
  storeUrl: process.env.REACT_APP_STORE_URL || 'http://localhost:3000',
  storageKeys: {
    token: 'ms_token',
    user: 'ms_user',
    lang: 'merchant_language',
    theme: 'ministore-theme-storage',
  },
  pagination: {
    defaultPageSize: 15,
  },
};

export default APP_CONFIG;
