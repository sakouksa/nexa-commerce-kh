// Telegram WebApp helpers for the Mini App.
// Works in Telegram, and degrades gracefully when opened in a normal browser
// (useful for local development).

import { TelegramUser } from './types';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

export function getTelegram(): any {
  return typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp
    ? window.Telegram.WebApp
    : null;
}

export function initTelegram(): any {
  const tg = getTelegram();
  if (tg) {
    if (typeof tg.ready === 'function') tg.ready();
    if (typeof tg.expand === 'function') tg.expand();
    try {
      if (typeof tg.setHeaderColor === 'function') tg.setHeaderColor('#0b1220');
      if (typeof tg.setBackgroundColor === 'function') tg.setBackgroundColor('#0f172a');
      if (typeof tg.enableClosingConfirmation === 'function') tg.enableClosingConfirmation();
    } catch (e) {
      /* ignore */
    }
  }
  return tg;
}

// Raw signed initData - sent to the backend and verified with the shop bot token.
export function getInitData(): string {
  const tg = getTelegram();
  return (tg && tg.initData) || '';
}

// Unsigned user object Telegram exposes locally (name/photo for the UI only).
export function getUnsafeUser(): TelegramUser | null {
  const tg = getTelegram();
  return (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) || null;
}

// Which shop to open: Telegram start_param (t.me/<bot>?startapp=<shop>)
// or the ?shop=<username> query param (browser testing).
export function resolveShopUsername(): string {
  const tg = getTelegram();
  const sp = (tg && tg.initDataUnsafe && tg.initDataUnsafe.start_param) || '';
  const qs = new URLSearchParams(window.location.search).get('shop');
  return (sp || qs || 'demo').trim();
}

export interface MainButtonOptions {
  text?: string;
  show?: boolean;
  enabled?: boolean;
  color?: string;
  onClick?: (() => void) | null;
}

// Main button (bottom button inside Telegram) used for "Add to cart" / "Pay".
export function mainButton(
  tg: any,
  { text = '', show = false, enabled = true, color = '#2563eb', onClick = null }: MainButtonOptions = {},
): void {
  if (!tg || !tg.MainButton) return;
  if (typeof tg.MainButton.setText === 'function') tg.MainButton.setText(text);
  tg.MainButton.color = color;
  tg.MainButton.textColor = '#ffffff';
  tg.MainButton.isEnabled = enabled;
  if (onClick && typeof tg.MainButton.onClick === 'function') {
    tg.MainButton.onClick(onClick);
  }
  if (show && typeof tg.MainButton.show === 'function') tg.MainButton.show();
  else if (typeof tg.MainButton.hide === 'function') tg.MainButton.hide();
}

export function showAlert(tg: any, message: string): void {
  if (tg && typeof tg.showAlert === 'function') tg.showAlert(message);
  else window.alert(message);
}
