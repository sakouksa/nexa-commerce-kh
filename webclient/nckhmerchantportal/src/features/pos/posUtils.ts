import { localizeCategoryName } from '../categories/categoryUtils';

/**
 * Intelligent Localization Helper for Product & Category names.
 * Accurately extracts clean Khmer or clean English without combined brackets,
 * and maps all standard static category and product names locally.
 */
export function getLocalizedText(raw: any, isKhmer: boolean): string {
  if (!raw) return '';
  return localizeCategoryName(raw, isKhmer, true);
}

/**
 * Format currency in USD
 */
export function formatUSD(amount: number): string {
  return `$${Number(amount || 0).toFixed(2)}`;
}

/**
 * Convert USD to KHR (Cambodian Riel)
 */
export function usdToKhr(amount: number, exchangeRate: number = 4100): number {
  return Math.round(Number(amount || 0) * exchangeRate);
}

/**
 * Format currency in KHR (Cambodian Riel) with Cambodian comma format
 */
export function formatKHR(amountInUsd: number, exchangeRate: number = 4100): string {
  const khr = usdToKhr(amountInUsd, exchangeRate);
  return `${new Intl.NumberFormat('en-US').format(khr)} ៛`;
}
