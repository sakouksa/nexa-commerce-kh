/**
 * Unified API Facade & Services
 * Re-exports all domain services and client for seamless backward compatibility.
 */
import { AxiosProgressEvent } from 'axios';
import api, { API_BASE, fullUrl } from './client';
import {
  authService,
  userService,
  shopService,
  resellerService,
  dashboardService,
  activityLogService,
  backupService,
  settingsService,
} from '../services';
import {
  ActivityLog,
  Category,
  Order,
  PlatformStats,
  Product,
  Reseller,
  Shop,
  User,
} from '../types';

export * from './client';
export { API_BASE, fullUrl, api };
export type { AxiosProgressEvent };

// Auth API
export const login = authService.login;

// User Management API
export const listUsers = userService.listUsers;
export const createUser = userService.createUser;
export const updateUser = userService.updateUser;
export const deleteUser = userService.deleteUser;

// Shop API
export const listShops = shopService.listShops;
export const createShop = shopService.createShop;
export const updateShopStatus = shopService.updateShopStatus;
export const deleteShop = shopService.deleteShop;
export const getShopDetail = shopService.getShopDetail;
export const setShopExpiry = shopService.setShopExpiry;
export const setShopLimits = shopService.setShopLimits;

// Products & Categories & Orders
export const listShopProducts = shopService.listProducts;
export const createProduct = shopService.createProduct;
export const updateProduct = shopService.updateProduct;
export const deleteProduct = shopService.deleteProduct;

export const listShopCategories = shopService.listCategories;
export const createCategory = shopService.createCategory;
export const updateCategory = shopService.updateCategory;
export const deleteCategory = shopService.deleteCategory;

export const listShopOrders = shopService.listOrders;
export const getOrder = shopService.getOrder;
export const updateOrderStatus = shopService.updateOrderStatus;
export const deleteOrder = shopService.deleteOrder;

export const listShopCustomers = shopService.listCustomers;
export const deleteCustomer = shopService.deleteCustomer;

// Reseller API
export const listResellers = resellerService.listResellers;
export const createReseller = resellerService.createReseller;
export const updateReseller = resellerService.updateReseller;
export const deleteReseller = resellerService.deleteReseller;
export const resellerCustomers = resellerService.resellerCustomers;
export const getReseller = resellerService.getReseller;

// Dashboard & Analytics
export const getStats = dashboardService.getStats;
export const getPlatformCharts = dashboardService.getPlatformCharts;

// Activity Logs
export const getActivity = activityLogService.getActivity;

// Backup API
export const createSystemBackup = backupService.createSystemBackup;
export const exportSystemBackup = backupService.exportSystemBackup;
export const exportShopBackup = backupService.exportShopBackup;
export const importSystemBackup = backupService.importSystemBackup;
export const backupHistory = backupService.backupHistory;
export const getBackupDownload = backupService.getBackupDownload;

// Platform Settings
export const getPlatformSettings = settingsService.getPlatformSettings;

export default api;
