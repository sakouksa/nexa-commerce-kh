export const APP_CONFIG = {
  name: 'Mini Shop',
  subtitle: 'Platform Admin',
  version: '1.0.0',
  apiBaseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8003',
  storageKeys: {
    token: 'ms_token',
    user: 'ms_user',
  },
  pagination: {
    defaultPageSize: 15,
  },
};
