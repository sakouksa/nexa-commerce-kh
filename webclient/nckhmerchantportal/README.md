# Architecture & Project Structure Guide (`nckhmerchantportal`)

MiniStoreKH Merchant Portal is architected as a modular, scalable React application utilizing Vite, TypeScript, and TailwindCSS.

The portal provides an enterprise suite for merchants to manage:
- **Cloud POS**: High-speed cashier register with Bakong KHQR & Cash support.
- **Restaurant Operations**: Interactive 2D floor plans, table reservations, and Kitchen Display System (KDS).
- **Store & Menu Management**: Products, categories, variation matrix, and stock inventory.
- **Sales & Analytics**: Orders, customer CRM, receipts archive, and financial reports.
- **Storefront & Integrations**: Live storefront branding, ABA PayWay, Telegram bot alerts, and data backup.

---

## 🏗️ Directory Organization

```text
webclient/nckhmerchantportal/
├── public/                     # Static assets, logos, and defaults
│
├── src/
│   ├── api/                    # Central HTTP client & Axios interceptors
│   │   ├── client.ts
│   │   ├── interceptors.ts
│   │   └── index.ts
│   │
│   ├── services/               # Central API service layer (reusable across app)
│   │   ├── authService.ts
│   │   ├── backupService.ts
│   │   ├── categoryService.ts
│   │   ├── customerService.ts
│   │   ├── orderService.ts
│   │   ├── paymentService.ts
│   │   ├── posService.ts
│   │   ├── productService.ts
│   │   ├── reportService.ts
│   │   ├── shopService.ts
│   │   ├── stockService.ts
│   │   ├── telegramService.ts
│   │   └── uploadService.ts
│   │
│   ├── features/               # Domain-driven features (clean, flat, decomposed components)
│   │   ├── auth/
│   │   │   └── LoginPage.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   │
│   │   ├── pos/
│   │   │   ├── POSPage.tsx
│   │   │   ├── POSHeader.tsx
│   │   │   ├── POSProductGrid.tsx
│   │   │   ├── POSProductCard.tsx
│   │   │   ├── POSCartSidebar.tsx
│   │   │   ├── POSCartItemRow.tsx
│   │   │   ├── POSCategoryBar.tsx
│   │   │   ├── POSDietaryFilter.tsx
│   │   │   ├── POSPaymentModal.tsx
│   │   │   ├── POSReceiptModal.tsx
│   │   │   ├── posIcons.tsx
│   │   │   ├── posUtils.ts
│   │   │   ├── posConstants.ts
│   │   │   ├── usePOSState.ts
│   │   │   ├── demoData.tsx
│   │   │   └── types.ts
│   │   │
│   │   ├── floor-plan/
│   │   │   ├── FloorPlanPage.tsx
│   │   │   ├── FloorPlanTableCard.tsx
│   │   │   ├── TableDetailsModal.tsx
│   │   │   ├── TableSettingsDrawer.tsx
│   │   │   ├── UpcomingReservationsSection.tsx
│   │   │   └── RestroDatePickerPopover.tsx
│   │   │
│   │   ├── kitchen-display/
│   │   │   └── KitchenDisplayPage.tsx
│   │   │
│   │   ├── reservations/
│   │   │   ├── ReservationsPage.tsx
│   │   │   ├── NewReservationModal.tsx
│   │   │   └── EditReservationDrawer.tsx
│   │   │
│   │   ├── products/
│   │   │   ├── ProductsPage.tsx
│   │   │   ├── ProductFormPage.tsx
│   │   │   ├── ProductTable.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── ProductFilters.tsx
│   │   │   ├── ProductActions.tsx
│   │   │   ├── AttributeBuilder.tsx
│   │   │   ├── VariationBuilder.tsx
│   │   │   └── product.types.ts
│   │   │
│   │   ├── categories/
│   │   │   ├── CategoriesPage.tsx
│   │   │   ├── CategoryTable.tsx
│   │   │   ├── CategoryModal.tsx
│   │   │   ├── CategoryActions.tsx
│   │   │   └── category.types.ts
│   │   │
│   │   ├── customers/
│   │   │   ├── CustomersPage.tsx
│   │   │   ├── CustomerTable.tsx
│   │   │   ├── CustomerForm.tsx
│   │   │   ├── CustomerActions.tsx
│   │   │   └── customer.types.ts
│   │   │
│   │   ├── orders/
│   │   │   ├── OrdersPage.tsx
│   │   │   ├── OrderDetailPage.tsx
│   │   │   ├── OrderTable.tsx
│   │   │   ├── OrderFilters.tsx
│   │   │   ├── OrderActions.tsx
│   │   │   ├── OrderDetailsModal.tsx
│   │   │   ├── ReceiptsPage.tsx
│   │   │   ├── ReceiptPrintDocument.tsx
│   │   │   ├── ReceiptPrintVoucher.tsx
│   │   │   └── order.types.ts
│   │   │
│   │   ├── inventory/
│   │   │   └── StockPage.tsx
│   │   │
│   │   ├── reports/
│   │   │   ├── ReportsPage.tsx
│   │   │   ├── ReportChartsSection.tsx
│   │   │   ├── ReportHeaderControls.tsx
│   │   │   ├── ReportKPICards.tsx
│   │   │   ├── ReportActionCenter.tsx
│   │   │   ├── SalesReportTable.tsx
│   │   │   ├── ProductReportTable.tsx
│   │   │   ├── CustomerReportTable.tsx
│   │   │   ├── StockHealthTable.tsx
│   │   │   ├── OrderDrillDownModal.tsx
│   │   │   └── TelegramReportModal.tsx
│   │   │
│   │   ├── settings/
│   │   │   ├── ShopSettingsPage.tsx
│   │   │   ├── PaymentSettingsPage.tsx
│   │   │   ├── TelegramSettingsPage.tsx
│   │   │   ├── UpgradePlanPage.tsx
│   │   │   └── BackupPage.tsx
│   │   │
│   │   └── profile/
│   │       └── UserProfilePage.tsx
│   │
│   ├── layouts/                # Base UI layouts
│   │   ├── AuthLayout.tsx
│   │   ├── MerchantLayout.tsx
│   │   └── POSLayout.tsx
│   │
│   ├── routes/                 # Direct page routing (no barrel files)
│   │   └── AppRoutes.tsx
│   │
│   ├── stores/                 # Zustand state stores
│   │   ├── auth.store.ts
│   │   ├── shop.store.ts
│   │   ├── ui.store.ts
│   │   └── restaurantStore.ts
│   │
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # Global TypeScript contracts
│   ├── utils/                  # Helper utilities (formatters, toast, helpers)
│   ├── config/                 # Navigation & constants
│   ├── styles/                 # TailwindCSS base and theme tokens
│   │   └── globals.css
│   │
│   ├── App.tsx
│   └── main.tsx
```

---

## 💡 Key Architectural Conventions

1. **No Barrel `index.ts` in Feature Directories**:
   - Page and component imports must be explicit (e.g. `import CategoriesPage from '../features/categories/CategoriesPage'`).
   - Prevents circular dependency traps and optimizes tree-shaking.

2. **Centralized Service Layer (`src/services/`)**:
   - Shared API logic and HTTP requests reside centrally in `src/services/` (e.g. `categoryService`, `customerService`, `productService`, `orderService`).
   - Features consume these services directly without duplicating `*.service.ts` inside feature folders.

3. **Discrete UI Components**:
   - Each feature is broken down into `*Page.tsx`, `*Table.tsx`, `*Form.tsx`, `*Filters.tsx`, `*Actions.tsx`, and `*.types.ts`.
   - All feature components are kept clean, flat, and co-located directly in the feature root without nested `components/` subfolders.

---

## 🚀 Setup & Development

```bash
# Install dependencies
npm install

# Run local development server (Vite on http://localhost:3002)
npm run dev

# Check TypeScript static types
npx tsc --noEmit

# Build production bundle
npm run build
```
