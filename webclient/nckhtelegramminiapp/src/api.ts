// API client for the Mini App - talks to the same FastAPI / Laravel backend.

import { Shop, Category, Product, Customer, Order, PaymentResult } from './types';

const rawApi =
  typeof process.env.REACT_APP_API_URL === 'string'
    ? process.env.REACT_APP_API_URL.trim()
    : '';
const API = rawApi ? rawApi.replace(/\/+$/, '') : '';

// Images (banners, logos, products, QR) are stored on the real backend host.
const MEDIA = (
  process.env.REACT_APP_MEDIA_URL ||
  'http://localhost:8003' // local study default
).replace(/\/+$/, '');

let _token = '';

export function setToken(t: string): void {
  _token = t || '';
}

export function getToken(): string {
  return _token;
}

export function mediaUrl(path?: string): string {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return `${MEDIA}${path.startsWith('/') ? path : '/' + path}`;
}

interface RequestOptions {
  method?: string;
  body?: any;
}

async function req<T = any>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (_token) headers.Authorization = `Bearer ${_token}`;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  if (!res.ok) {
    const detail =
      (data && (data.detail || data.message)) ||
      `Request failed (${res.status})`;
    const message = Array.isArray(detail)
      ? detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ')
      : String(detail);
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  mediaUrl,

  shop: (username: string): Promise<Shop> => req<Shop>(`/api/shops/${username}/mini`),

  categories: (shopId: number): Promise<Category[]> =>
    req<Category[]>(`/api/categories/public?shop_id=${shopId}`),

  products: (shopId: number, categoryId?: number | string): Promise<Product[]> => {
    const cat = categoryId ? `&category_id=${categoryId}` : '';
    return req<Product[]>(`/api/products/public?shop_id=${shopId}${cat}`);
  },

  // Full product detail (all images, description, variations, attributes).
  productDetail: (id: number | string): Promise<Product> =>
    req<Product>(`/api/products/${id}/public`),

  // Telegram Mini App auto-login (server verifies initData against the bot).
  miniLogin: (
    shopId: number,
    initData: string,
  ): Promise<{ access_token: string; customer: Customer }> =>
    req<{ access_token: string; customer: Customer }>('/api/auth/telegram/mini/login', {
      method: 'POST',
      body: { shop_id: shopId, init_data: initData },
    }),

  createOrder: (payload: any): Promise<Order> =>
    req<Order>('/api/orders', { method: 'POST', body: payload }),

  abaCreate: (orderId: number | string): Promise<PaymentResult> =>
    req<PaymentResult>('/api/payments/aba/create', {
      method: 'POST',
      body: {
        order_id: orderId,
        success_url: `${window.location.origin}${window.location.pathname}?paid=1`,
        error_url: `${window.location.origin}${window.location.pathname}?paid=0`,
        cancel_url: `${window.location.origin}${window.location.pathname}`,
      },
    }),

  abaVerify: (orderId: number | string, transactionId?: string): Promise<any> =>
    req('/api/payments/aba/verify', {
      method: 'POST',
      body: { order_id: orderId, transaction_id: transactionId || '' },
    }),
};
