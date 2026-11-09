import React from 'react';
import { usePOSState } from './usePOSState';
import { POSHeader } from './POSHeader';
import { POSDietaryFilter } from './POSDietaryFilter';
import { POSCategoryBar } from './POSCategoryBar';
import { POSProductGrid } from './POSProductGrid';
import { POSCartSidebar } from './POSCartSidebar';
import { POSPaymentModal } from './POSPaymentModal';
import { POSReceiptModal } from './POSReceiptModal';

export default function POSPage() {
  const {
    // Products & Categories
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    selectedDietary,
    setSelectedDietary,
    search,
    setSearch,
    activeCardId,
    isLoadingProducts,

    // Cart & Order
    cart,
    orderType,
    setOrderType,
    selectedTable,
    setSelectedTable,
    customerName,
    setCustomerName,
    couponCode,
    setCouponCode,
    couponDiscount,
    onApplyCoupon,
    subtotal,
    tax,
    total,
    hasStockError,
    getCartCount,
    addToCart,
    updateQuantity,
    removeCartItem,
    clearCart,

    // Checkout & Modals
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    orderSuccess,
    isSubmitting,
    handleProceedPayment,
    completeSale,
    resetOrder,

    // Settings
    isFullscreen,
    toggleFullScreen,
    isDark,
    toggleTheme,
    isKhmer,
  } = usePOSState();

  return (
    <div className="fixed inset-0 z-50 bg-[#f4f5f7] dark:bg-slate-950 flex flex-col h-screen w-screen overflow-hidden text-slate-900 dark:text-slate-100 font-sans select-none">
      {/* 1. TOP HEADER: Real Store Branding & Real Profile Dropdown */}
      <POSHeader
        isFullscreen={isFullscreen}
        toggleFullScreen={toggleFullScreen}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />

      {/* 2. MAIN LAYOUT: Split into Left Product Catalog Card + Right Order Ticket Card */}
      <main className="flex-1 flex overflow-hidden p-3 gap-3">
        {/* LEFT / CENTER CARD: Product Catalog */}
        <section className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Top Bar: Search + Veg/Non-Veg/Egg Filter Badges */}
          <POSDietaryFilter
            search={search}
            onSearchChange={setSearch}
            selectedDietary={selectedDietary}
            onDietaryChange={setSelectedDietary}
          />

          {/* Category Tabs: Dynamically derived from DB */}
          <POSCategoryBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            isKhmer={isKhmer}
          />

          {/* Product Cards Grid */}
          <POSProductGrid
            products={products}
            activeCardId={activeCardId}
            isKhmer={isKhmer}
            isLoading={isLoadingProducts}
            getCartCount={getCartCount}
            onAddToCart={addToCart}
          />
        </section>

        {/* RIGHT CARD: Order Ticket (Floating Card with real-time totals and stock lock) */}
        <POSCartSidebar
          cart={cart}
          orderType={orderType}
          setOrderType={setOrderType}
          selectedTable={selectedTable}
          setSelectedTable={setSelectedTable}
          customerName={customerName}
          setCustomerName={setCustomerName}
          couponCode={couponCode}
          setCouponCode={setCouponCode}
          couponDiscount={couponDiscount}
          onApplyCoupon={onApplyCoupon}
          subtotal={subtotal}
          tax={tax}
          total={total}
          hasStockError={hasStockError}
          isKhmer={isKhmer}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeCartItem}
          onClearCart={clearCart}
          onProceedPayment={handleProceedPayment}
        />
      </main>

      {/* 3. PAYMENT MODAL: Cash & Bakong KHQR with stock safety */}
      <POSPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        total={total}
        selectedTable={selectedTable}
        isKhmer={isKhmer}
        isSubmitting={isSubmitting}
        onCompleteSale={completeSale}
      />

      {/* 4. SUCCESS ORDER / RECEIPT MODAL */}
      <POSReceiptModal
        orderSuccess={orderSuccess}
        onNewOrder={resetOrder}
        isKhmer={isKhmer}
      />
    </div>
  );
}

// Re-export utility functions and types for any external consumers
export * from './types';
export * from './posUtils';

