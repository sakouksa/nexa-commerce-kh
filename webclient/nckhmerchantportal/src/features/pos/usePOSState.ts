import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import toast from '../../utils/toast';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n';
import {
  listProducts,
  listCategories,
  createPosOrder,
  fullUrl,
} from '../../api';
import {
  CartItem,
  POSProduct,
  OrderType,
  DietaryFilter,
  OrderSuccessState,
} from './types';
import { RESTRO_31_PRODUCTS } from './demoData';
import { getLocalizedText } from './posUtils';

export function usePOSState() {
  const { user } = useAuth();
  const { isKhmer, t } = useLanguage();

  // Dynamic products & categories state
  const [dbProducts, setDbProducts] = useState<POSProduct[]>([]);
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDietary, setSelectedDietary] = useState<DietaryFilter>('All');
  const [activeCardId, setActiveCardId] = useState<string>('');

  // Cart state: Initialized dynamic and clean
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [selectedTable, setSelectedTable] = useState('T-01');
  const [customerName, setCustomerName] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<OrderSuccessState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

  // Dark mode state
  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.getItem('theme') === 'dark' ||
      document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Fullscreen listeners
  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Fetch real dynamic products & categories from Database API
  useEffect(() => {
    if (!user?.shop_id) {
      setIsLoadingProducts(false);
      return;
    }

    setIsLoadingProducts(true);

    Promise.all([
      listProducts(user.shop_id).catch(() => []),
      listCategories(user.shop_id).catch(() => []),
    ])
      .then(([productsRes, categoriesRes]) => {
        if (Array.isArray(productsRes) && productsRes.length > 0) {
          const catMap = new Map();
          if (Array.isArray(categoriesRes)) {
            categoriesRes.forEach((c: any) => catMap.set(c.id, c.name));
          }

          const mapped: POSProduct[] = productsRes.map((p: any) => {
            let dietary = 'Veg';
            let nameKh = '';
            let nameEn = '';

            try {
              if (p.metadata_json) {
                const meta =
                  typeof p.metadata_json === 'string'
                    ? JSON.parse(p.metadata_json)
                    : p.metadata_json;
                if (meta?.dietary) dietary = meta.dietary;
                if (meta?.name_kh) nameKh = meta.name_kh;
                if (meta?.name_en) nameEn = meta.name_en;
              } else if (p.custom_attributes) {
                const attrs =
                  typeof p.custom_attributes === 'string'
                    ? JSON.parse(p.custom_attributes)
                    : p.custom_attributes;
                const d = attrs?.find((a: any) => a.name === 'dietary');
                if (d?.value) dietary = d.value;
                const nKh = attrs?.find((a: any) => a.name === 'name_kh');
                if (nKh?.value) nameKh = nKh.value;
                const nEn = attrs?.find((a: any) => a.name === 'name_en');
                if (nEn?.value) nameEn = nEn.value;
              }
            } catch {}

            let img = '/images/default-product.svg';
            try {
              if (Array.isArray(p.images) && p.images.length > 0 && p.images[0]) {
                img = p.images[0];
              } else if (typeof p.images === 'string') {
                const parsed = JSON.parse(p.images);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]) img = parsed[0];
              }
            } catch {}

            if (
              img &&
              !img.startsWith('http') &&
              !img.startsWith('/images/') &&
              !img.startsWith('/default-product.svg')
            ) {
              img = fullUrl(img);
            }

            const catName = p.category_name || catMap.get(p.category_id) || 'Food';
            const stockQty =
              typeof p.quantity === 'number'
                ? p.quantity
                : p.quantity
                ? Number(p.quantity)
                : 0;

            return {
              id: String(p.id),
              productId: Number(p.id),
              name: p.name,
              name_kh: nameKh,
              name_en: nameEn,
              category: catName,
              price: Number(p.sale_price !== null && p.sale_price !== undefined ? p.sale_price : p.price || 0),
              dietary,
              image: img,
              stock: stockQty,
              barcode: p.sku || p.barcode || '',
            };
          });

          setDbProducts(mapped);
          const cats = Array.from(new Set(mapped.map((m) => m.category))).filter(Boolean);
          setDbCategories(cats);
        }
      })
      .finally(() => {
        setIsLoadingProducts(false);
      });
  }, [user?.shop_id]);

  // Categories list: Uses dynamic database categories or fallback
  const availableCategories = useMemo(() => {
    if (dbProducts.length > 0 && dbCategories.length > 0) {
      return ['All', ...dbCategories];
    }
    return ['All', 'Pizza', 'Burgers', 'Salads', 'Soups', 'Desserts', 'Drinks'];
  }, [dbProducts, dbCategories]);

  // Products Source list: Pure dynamic database products or seamless fallback
  const productSourceList = useMemo(() => {
    return dbProducts.length > 0 ? dbProducts : RESTRO_31_PRODUCTS;
  }, [dbProducts]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    let list = productSourceList;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => {
        const raw = (p.name || '').toLowerCase();
        const kh = getLocalizedText(p, true).toLowerCase();
        const en = getLocalizedText(p, false).toLowerCase();
        const barcode = (p.barcode || '').toLowerCase();
        return raw.includes(q) || kh.includes(q) || en.includes(q) || barcode.includes(q);
      });
    }

    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (selectedDietary !== 'All') {
      list = list.filter((p) => p.dietary === selectedDietary);
    }

    return list;
  }, [productSourceList, search, selectedCategory, selectedDietary]);

  // Cart item count lookup
  const getCartCount = useCallback(
    (productId: string) => {
      const item = cart.find((i) => i.id === productId);
      return item ? item.quantity : 0;
    },
    [cart]
  );

  // Out of stock verification
  const outOfStockItems = useMemo(() => {
    return cart.filter(
      (i) => typeof i.stock === 'number' && (i.stock <= 0 || i.quantity > i.stock)
    );
  }, [cart]);

  const hasStockError = outOfStockItems.length > 0;

  // Add to cart with real stock validation
  const addToCart = useCallback(
    (product: POSProduct) => {
      const availableStock = typeof product.stock === 'number' ? product.stock : 999;
      const displayName = getLocalizedText(product, isKhmer);

      if (availableStock <= 0) {
        toast.error(
          t('pos.outOfStockAlert', {
            name: displayName,
            defaultValue: `Item "${displayName}" is out of stock! Cannot add to order.`,
          })
        );
        return;
      }

      const existing = cart.find((i) => i.id === product.id);
      const currentQty = existing ? existing.quantity : 0;

      if (currentQty >= availableStock) {
        toast.error(
          t('pos.stockCeilingAlert', {
            count: availableStock,
            defaultValue: `Cannot add more! Only ${availableStock} left in stock.`,
          })
        );
        return;
      }

      setActiveCardId(product.id);
      setCart((prev) => {
        if (existing) {
          return prev.map((i) =>
            i.id === product.id
              ? { ...i, quantity: i.quantity + 1, stock: availableStock }
              : i
          );
        }
        return [
          ...prev,
          {
            id: product.id,
            productId: product.productId,
            name: product.name,
            name_kh: product.name_kh,
            name_en: product.name_en,
            price: product.price,
            quantity: 1,
            image: product.image,
            dietary: product.dietary,
            stock: availableStock,
            category: product.category,
          },
        ];
      });

      toast.success(`${displayName} +1`);
    },
    [cart, isKhmer, t]
  );

  // Stepper quantity update
  const updateQuantity = useCallback(
    (id: string, delta: number) => {
      if (delta > 0) {
        const item = cart.find((i) => i.id === id);
        const availableStock = typeof item?.stock === 'number' ? item.stock : 999;
        if (item && item.quantity >= availableStock) {
          toast.error(
            t('pos.stockCeilingAlert', {
              count: availableStock,
              defaultValue: `Only ${availableStock} left in stock.`,
            })
          );
          return;
        }
      }

      setCart((prev) =>
        prev
          .map((i) => {
            if (i.id === id) {
              const next = i.quantity + delta;
              return next > 0 ? { ...i, quantity: next } : null;
            }
            return i;
          })
          .filter(Boolean) as CartItem[]
      );
    },
    [cart, isKhmer, t]
  );

  const removeCartItem = useCallback((id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    if (cart.length === 0) return;
    if (
      window.confirm(
        t('pos.clearCartConfirm', 'Clear current order ticket?')
      )
    ) {
      setCart([]);
      setCouponDiscount(0);
      setCouponCode('');
    }
  }, [cart.length, isKhmer, t]);

  // Calculations
  const subtotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cart]
  );
  const tax = useMemo(() => subtotal * 0.05, [subtotal]); // 5% TAX
  const total = useMemo(
    () => Math.max(0, subtotal - couponDiscount + tax),
    [subtotal, couponDiscount, tax]
  );

  // Coupon application
  const handleApplyCoupon = useCallback(() => {
    const c = couponCode.trim().toUpperCase();
    if (c === 'SAVE10' || c === 'DISCOUNT10') {
      const disc = subtotal * 0.1;
      setCouponDiscount(disc);
      toast.success(t('pos.couponApplied', { percent: 10, defaultValue: 'Coupon 10% applied!' }));
    } else if (c === 'SAVE20') {
      const disc = subtotal * 0.2;
      setCouponDiscount(disc);
      toast.success(t('pos.couponApplied', { percent: 20, defaultValue: 'Coupon 20% applied!' }));
    } else {
      toast.error(t('pos.invalidCoupon', 'Invalid coupon code'));
    }
  }, [couponCode, subtotal, isKhmer, t]);

  // Proceed to payment
  const handleProceedPayment = useCallback(() => {
    if (cart.length === 0) {
      toast.error(t('pos.emptyCart', 'Cart is empty'));
      return;
    }

    if (hasStockError) {
      toast.error(
        t('pos.cannotCheckoutAlert', 'Cannot checkout: some items exceed available stock!')
      );
      return;
    }

    setIsPaymentModalOpen(true);
  }, [cart.length, hasStockError, isKhmer, t]);

  // Complete Sale Action
  const completeSale = useCallback(
    async (method: 'cash' | 'khqr', cashReceivedAmount?: number) => {
      setIsSubmitting(true);
      const generatedOrderNum = `POS-${Math.floor(100000 + Math.random() * 900000)}`;
      const savedCart = [...cart];

      try {
        if (user?.shop_id) {
          const res = await createPosOrder({
            shop_id: user.shop_id,
            customer_name:
              customerName ||
              (orderType === 'dine-in' ? `Table ${selectedTable}` : 'Walk-in Customer'),
            items: cart.map((i) => ({
              product_id: i.productId || (isNaN(Number(i.id)) ? null : Number(i.id)),
              name: i.name,
              price: i.price,
              quantity: i.quantity,
            })),
            subtotal,
            tax,
            discount: couponDiscount,
            total,
            payment_method: method,
            order_type: orderType,
            table_number: selectedTable,
            status: 'completed',
          });

          if (res?.order_number) {
            // Updated with real order number from database
            setOrderSuccess({
              orderNumber: res.order_number,
              total,
              method: method === 'cash' ? 'Cash' : 'Bakong KHQR',
              table: selectedTable,
              items: savedCart,
              subtotal,
              tax,
              discount: couponDiscount,
              customerName: customerName || `Table ${selectedTable}`,
            });
          } else {
            setOrderSuccess({
              orderNumber: generatedOrderNum,
              total,
              method: method === 'cash' ? 'Cash' : 'Bakong KHQR',
              table: selectedTable,
              items: savedCart,
              subtotal,
              tax,
              discount: couponDiscount,
              customerName: customerName || `Table ${selectedTable}`,
            });
          }
        } else {
          setOrderSuccess({
            orderNumber: generatedOrderNum,
            total,
            method: method === 'cash' ? 'Cash' : 'Bakong KHQR',
            table: selectedTable,
            items: savedCart,
            subtotal,
            tax,
            discount: couponDiscount,
            customerName: customerName || `Table ${selectedTable}`,
          });
        }

        // Deduct local stock immediately for real-time responsiveness
        setDbProducts((prev) =>
          prev.map((p) => {
            const bought = savedCart.find((c) => c.id === p.id);
            if (bought) {
              return { ...p, stock: Math.max(0, p.stock - bought.quantity) };
            }
            return p;
          })
        );

        setIsPaymentModalOpen(false);
        setCart([]);
        setCouponDiscount(0);
        setCouponCode('');
        toast.success(t('pos.saleCompletedSuccess', 'Sale Completed Successfully!'));
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message ||
            t('pos.errorCreatingOrder', 'Error creating POS order')
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      cart,
      user?.shop_id,
      customerName,
      orderType,
      selectedTable,
      subtotal,
      tax,
      couponDiscount,
      total,
      isKhmer,
      t,
    ]
  );

  const resetOrder = useCallback(() => {
    setOrderSuccess(null);
  }, []);

  return {
    // Products & Categories
    products: filteredProducts,
    categories: availableCategories,
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
    onApplyCoupon: handleApplyCoupon,
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
  };
}
