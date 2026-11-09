import api, { API_BASE, fullUrl } from './client';
import { authService } from '../services/authService';
import { shopService } from '../services/shopService';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { orderService } from '../services/orderService';
import { customerService } from '../services/customerService';
import { stockService } from '../services/stockService';
import { reportService } from '../services/reportService';
import { posService } from '../services/posService';
import { paymentService } from '../services/paymentService';
import { telegramService } from '../services/telegramService';
import { backupService } from '../services/backupService';
import { uploadService } from '../services/uploadService';

// Re-export client
export { api, API_BASE, fullUrl };

// Re-export individual functions for 100% backward compatibility
export const login = authService.login;
export const changePassword = authService.changePassword;

export const getShopDetail = shopService.getDetail;
export const updateShop = shopService.update;

export const listProducts = productService.list;
export const getProduct = productService.get;
export const createProduct = productService.create;
export const updateProduct = productService.update;
export const deleteProduct = productService.delete;

export const listCategories = categoryService.list;
export const createCategory = categoryService.create;
export const updateCategory = categoryService.update;
export const deleteCategory = categoryService.delete;

export const listOrders = orderService.list;
export const getOrder = orderService.get;
export const updateOrderStatus = orderService.updateStatus;
export const generateReceipt = orderService.generateReceipt;
export const createPosOrder = orderService.createPosOrder;

export const listCustomers = customerService.list;
export const getCustomer = customerService.get;
export const createCustomer = customerService.create;
export const updateCustomer = customerService.update;
export const deleteCustomer = customerService.delete;

export const getStockReport = stockService.getReport;
export const updateStock = stockService.update;
export const sendStockAlert = stockService.sendAlert;

export const getOverview = reportService.getOverview;
export const getSalesReport = reportService.getSales;
export const getProductReport = reportService.getProducts;
export const getCustomerReport = reportService.getCustomerReport;

export const testPayment = paymentService.test;
export const createPayment = paymentService.create;
export const verifyPayment = paymentService.verify;
export const getPlans = paymentService.getPlans;
export const upgradePlan = paymentService.upgradePlan;
export const confirmPlan = paymentService.confirmPlan;

export const testTelegram = telegramService.test;
export const getTelegramSettings = telegramService.getSettings;
export const setTelegramWebhook = telegramService.setWebhook;

export const createShopBackup = backupService.create;
export const exportShopBackup = backupService.export;
export const importShopBackup = backupService.import;
export const backupHistory = backupService.history;
export const getBackupDownload = backupService.download;

export const uploadImage = uploadService.uploadImage;
export const uploadImages = uploadService.uploadImages;

export default api;
