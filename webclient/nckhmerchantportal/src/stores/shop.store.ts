import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Shop } from '../types/shop.types';

export interface ShopState {
  shop: Shop | null;
  isLoading: boolean;
  activeTable: string | null;
  currency: string;
  taxRate: number;
  setShop: (shop: Shop) => void;
  updateShop: (partial: Partial<Shop>) => void;
  setActiveTable: (tableId: string | null) => void;
  setCurrency: (currency: string) => void;
  setTaxRate: (rate: number) => void;
  clearShop: () => void;
}

export const useShopStore = create<ShopState>()(
  persist(
    (set) => ({
      shop: null,
      isLoading: false,
      activeTable: null,
      currency: 'USD',
      taxRate: 0,

      setShop: (shop: Shop) => set({ shop }),
      updateShop: (partial: Partial<Shop>) =>
        set((state) => ({
          shop: state.shop ? { ...state.shop, ...partial } : null,
        })),
      setActiveTable: (tableId: string | null) => set({ activeTable: tableId }),
      setCurrency: (currency: string) => set({ currency }),
      setTaxRate: (taxRate: number) => set({ taxRate }),
      clearShop: () => set({ shop: null, activeTable: null }),
    }),
    {
      name: 'ministore-shop-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useShopStore;
