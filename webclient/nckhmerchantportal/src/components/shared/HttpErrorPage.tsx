import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Compass,
  ArrowLeft,
  Search,
  RotateCw,
  ShieldAlert,
  AlertTriangle,
  WifiOff,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  Store,
  Database,
  Activity,
  Settings,
  BookOpen,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Layers,
} from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export type HttpErrorCode =
  | 400
  | 401
  | 403
  | 404
  | 408
  | 429
  | 500
  | 502
  | 503
  | 504
  | 'app'
  | 'runtime'
  | 'offline'
  | 'unknown'

export interface HttpErrorPageProps {
  code?: HttpErrorCode
  title?: string
  subtitle?: string
  description?: string
  showBackButton?: boolean
  showHomeButton?: boolean
  showRetryButton?: boolean
  showSearchButton?: boolean
  showContactButton?: boolean
  onRetry?: () => void
  onSearchDocs?: () => void
  fullPage?: boolean
  error?: Error | null
  errorInfo?: React.ErrorInfo | null
  extraActions?: React.ReactNode
}

interface SearchDestItem {
  title: string
  titleKh: string
  desc: string
  descKh: string
  to: string
  isExternal?: boolean
  category: string
  categoryKh: string
  icon: React.ReactNode
  keywords: string[]
}

export const HttpErrorPage: React.FC<HttpErrorPageProps> = ({
  code = 'unknown',
  title,
  subtitle,
  description,
  showBackButton,
  showHomeButton = true,
  showRetryButton,
  showSearchButton = true,
  showContactButton,
  onRetry,
  onSearchDocs,
  fullPage = true,
  error,
  errorInfo,
  extraActions,
}) => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('common')
  const [showDetails, setShowDetails] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const isKhmer = i18n?.language === 'km' || i18n?.language?.startsWith('km') || i18n?.language?.startsWith('kh')
  const codeKey = String(code)
  const isClientError = codeKey === 'app' || codeKey === 'runtime'
  const isNumericCode = !isNaN(Number(codeKey))
  const lookupKey = isClientError ? 'app' : codeKey

  // Listen for Cmd+K / Ctrl+K shortcut on the error page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (onSearchDocs) {
          onSearchDocs()
        } else {
          setIsSearchOpen((prev) => !prev)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSearchDocs])

  // Brand-aligned visual styling scheme matching MiniStore KH Merchant Portal (Warm Coral/Orange)
  const getVisualScheme = () => {
    switch (codeKey) {
      case '403':
      case '401':
        return {
          glow: 'from-amber-500/10 via-orange-500/8 to-amber-500/5',
          badge: 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/25 ring-1 ring-amber-400/20',
          gradient: 'bg-gradient-to-r from-amber-600 via-orange-500 to-amber-400 dark:from-amber-400 dark:via-orange-400 dark:to-amber-300',
          button: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-xs shadow-amber-600/20',
          icon: <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2.2} />,
        }
      case '500':
      case '502':
      case '503':
      case '504':
      case 'app':
      case 'runtime':
        return {
          glow: 'from-rose-500/10 via-red-500/8 to-rose-500/5',
          badge: 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-500/25 ring-1 ring-rose-400/20',
          gradient: 'bg-gradient-to-r from-rose-600 via-red-500 to-orange-500 dark:from-rose-400 dark:via-red-400 dark:to-orange-300',
          button: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs shadow-rose-600/20',
          icon: <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2.2} />,
        }
      case 'offline':
        return {
          glow: 'from-slate-500/10 via-slate-600/8 to-slate-500/5',
          badge: 'bg-gradient-to-br from-slate-600 to-slate-700 shadow-lg shadow-slate-600/25 ring-1 ring-slate-400/20',
          gradient: 'bg-gradient-to-r from-slate-700 via-slate-600 to-slate-400 dark:from-slate-300 dark:via-slate-400 dark:to-slate-500',
          button: 'bg-slate-700 hover:bg-slate-800 active:bg-slate-900 text-white shadow-xs',
          icon: <WifiOff className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2.2} />,
        }
      case '404':
      default:
        return {
          glow: 'from-orange-500/12 via-amber-500/8 to-orange-500/5',
          badge: 'bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 shadow-lg shadow-orange-500/25 ring-1 ring-orange-400/20',
          gradient: 'bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400 dark:from-orange-400 dark:via-amber-400 dark:to-orange-300',
          button: 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white shadow-xs shadow-orange-600/20',
          icon: <Compass className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2.2} />,
        }
    }
  }

  const scheme = getVisualScheme()
  const displayCode = isClientError ? '500' : (codeKey === 'offline' ? 'Offline' : (codeKey === 'unknown' ? '404' : codeKey))

  // Localized Headings & Titles
  const defaultTitle = isKhmer
    ? (codeKey === '404' || codeKey === 'unknown'
        ? 'រកមិនឃើញទំព័រទេ'
        : isClientError || codeKey === '500'
        ? 'មានបញ្ហាបច្ចេកទេសក្នុងប្រព័ន្ធ'
        : codeKey === '403'
        ? 'គ្មានសិទ្ធិចូលប្រើប្រាស់ទេ'
        : 'មានបញ្ហាក្នុងការផ្ទុកទំព័រ')
    : (codeKey === '404' || codeKey === 'unknown'
        ? 'Page not found'
        : isClientError || codeKey === '500'
        ? 'Internal Server Error'
        : codeKey === '403'
        ? 'Access Denied'
        : 'Something went wrong')

  const displayTitle = title ?? t(`errorPage.${lookupKey}.title`, defaultTitle)

  // Localized Descriptions
  const defaultDesc = isKhmer
    ? (codeKey === '404' || codeKey === 'unknown'
        ? "ទំព័រដែលអ្នកកំពុងស្វែងរកមិនមាន ឬត្រូវបានផ្លាស់ប្តូរទីតាំង។ សូមសាកល្បងស្វែងរកឡើងវិញ ឬត្រឡប់ទៅកាន់ផ្ទាំងគ្រប់គ្រងដើម។"
        : "ផ្នែកនេះបានជួបប្រទះបញ្ហាបច្ចេកទេស។ សូមព្យាយាមម្តងទៀត ឬត្រឡប់ទៅកាន់ផ្ទាំងគ្រប់គ្រងដើម។")
    : (codeKey === '404' || codeKey === 'unknown'
        ? "The page you're looking for doesn't exist or may have been moved. Try searching, or head back to the dashboard."
        : "An unexpected error occurred. Please try again or head back to the dashboard.")

  const displayDesc = description ?? subtitle ?? t(`errorPage.${lookupKey}.description`, defaultDesc)

  // Curated documentation, navigation & support destinations for Merchant Portal
  const searchItems: SearchDestItem[] = useMemo(
    () => [
      {
        title: 'Dashboard Overview',
        titleKh: 'ផ្ទាំងគ្រប់គ្រងទូទៅ',
        desc: 'Sales summary, revenue, and daily orders',
        descKh: 'សង្ខេបការលក់ ចំណូល និងការបញ្ជាទិញប្រចាំថ្ងៃ',
        to: '/dashboard',
        category: 'Navigation',
        categoryKh: 'ការរុករក',
        icon: <LayoutDashboard className="size-4 text-orange-500" />,
        keywords: ['home', 'dashboard', 'sales', 'revenue', 'orders', 'ទំព័រដើម', 'ផ្ទាំងគ្រប់គ្រង'],
      },
      {
        title: 'Products Catalog',
        titleKh: 'បញ្ជីផលិតផល',
        desc: 'Manage store products, variants, and pricing',
        descKh: 'គ្រប់គ្រងផលិតផល តម្លៃ និងរូបភាព',
        to: '/products',
        category: 'Catalog',
        categoryKh: 'កាតាឡុក',
        icon: <Store className="size-4 text-sky-500" />,
        keywords: ['products', 'items', 'catalog', 'prices', 'ផលិតផល', 'ទំនិញ'],
      },
      {
        title: 'Product Categories',
        titleKh: 'ប្រភេទផលិតផល',
        desc: 'Organize products into categories and menus',
        descKh: 'រៀបចំផលិតផលតាមប្រភេទ និងម៉ឺនុយ',
        to: '/products/categories',
        category: 'Catalog',
        categoryKh: 'កាតាឡុក',
        icon: <Layers className="size-4 text-emerald-500" />,
        keywords: ['categories', 'groups', 'menu', 'ប្រភេទ', 'ក្រុម'],
      },
      {
        title: 'Inventory & Stock Management',
        titleKh: 'ការគ្រប់គ្រងស្តុកទំនិញ',
        desc: 'Track quantities, low-stock alerts, and restocking',
        descKh: 'តាមដានចំនួនស្តុក ការជូនដំណឹង និងការបញ្ចូលស្តុក',
        to: '/inventory',
        category: 'Inventory',
        categoryKh: 'ស្តុក',
        icon: <Database className="size-4 text-amber-500" />,
        keywords: ['stock', 'inventory', 'quantity', 'low stock', 'ស្តុក', 'ចំនួន'],
      },
      {
        title: 'Orders & Receipts',
        titleKh: 'ការបញ្ជាទិញ និងវិក្កយបត្រ',
        desc: 'View sales orders, transactions, and print receipts',
        descKh: 'មើលបញ្ជីលក់ ប្រតិបត្តិការ និងបោះពុម្ពវិក្កយបត្រ',
        to: '/orders',
        category: 'Sales',
        categoryKh: 'ការលក់',
        icon: <Activity className="size-4 text-rose-500" />,
        keywords: ['orders', 'receipts', 'sales', 'pos', 'ការបញ្ជាទិញ', 'វិក្កយបត្រ', 'លក់'],
      },
      {
        title: 'Sales Reports & Analytics',
        titleKh: 'របាយការណ៍លក់ និងស្ថិតិ',
        desc: 'Revenue breakdown, best-selling items, and charts',
        descKh: 'វិភាគចំណូល មុខទំនិញលក់ដាច់ និងតារាងស្ថិតិ',
        to: '/reports',
        category: 'Analytics',
        categoryKh: 'ស្ថិតិ',
        icon: <Activity className="size-4 text-purple-500" />,
        keywords: ['reports', 'analytics', 'revenue', 'chart', 'របាយការណ៍', 'ស្ថិតិ'],
      },
      {
        title: 'Shop Settings',
        titleKh: 'ការកំណត់ហាង',
        desc: 'Shop profile, payments, KHQR, and staff settings',
        descKh: 'ព័ត៌មានហាង ការទូទាត់ KHQR និងបុគ្គលិក',
        to: '/settings',
        category: 'Settings',
        categoryKh: 'ការកំណត់',
        icon: <Settings className="size-4 text-slate-500" />,
        keywords: ['settings', 'payment', 'khqr', 'shop', 'profile', 'កំណត់', 'ហាង'],
      },
      {
        title: 'Documentation & Guides',
        titleKh: 'ឯកសារជំនួយ និងរបៀបប្រើប្រាស់',
        desc: 'Merchant guides, user manual, and video tutorials',
        descKh: 'ការណែនាំសម្រាប់ម្ចាស់ហាង និងរបៀបប្រើប្រាស់',
        to: '/settings',
        category: 'Help & Docs',
        categoryKh: 'ជំនួយ & ឯកសារ',
        icon: <BookOpen className="size-4 text-orange-500" />,
        keywords: ['docs', 'help', 'guide', 'manual', 'tutorial', 'ឯកសារ', 'ជំនួយ'],
      },
      {
        title: 'Telegram Technical Support',
        titleKh: 'ជំនួយបច្ចេកទេស Telegram',
        desc: 'Direct live support chat with MiniStore KH team',
        descKh: 'ឆាតផ្ទាល់ជាមួយក្រុមការងារជំនួយបច្ចេកទេស',
        to: 'https://t.me/ministorekh_support',
        isExternal: true,
        category: 'Help & Docs',
        categoryKh: 'ជំនួយ & ឯកសារ',
        icon: <ExternalLink className="size-4 text-sky-500" />,
        keywords: ['support', 'telegram', 'chat', 'contact', 'ជំនួយ', 'ទំនាក់ទំនង'],
      },
    ],
    []
  )

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return searchItems
    return searchItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.titleKh.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.descKh.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q))
    )
  }, [searchQuery, searchItems])

  const handleItemSelect = (item: SearchDestItem) => {
    setIsSearchOpen(false)
    setSearchQuery('')
    if (item.isExternal) {
      window.open(item.to, '_blank', 'noopener,noreferrer')
    } else {
      navigate(item.to)
    }
  }

  const handleSearchButtonClick = () => {
    if (onSearchDocs) {
      onSearchDocs()
    } else {
      setIsSearchOpen(true)
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-background text-foreground relative overflow-hidden select-text",
        fullPage ? "fixed inset-0 z-50 h-screen w-screen p-6" : "min-h-[520px] w-full py-16 px-6"
      )}
    >
      {/* ── Background Ambient Radial Glow ─────────────────────────── */}
      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[650px] h-[350px] bg-gradient-to-tr blur-[130px] rounded-full pointer-events-none",
          scheme.glow
        )}
      />

      {/* ── Main Centered Error Container ─────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto w-full select-text">
        {/* Top Brand-Themed Badge */}
        <div
          className={cn(
            "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 transition-transform hover:scale-105 duration-200 select-none",
            scheme.badge
          )}
        >
          {scheme.icon}
        </div>

        {/* Giant Gradient Code (404, 500, etc.) */}
        <h1
          className={cn(
            "text-7xl sm:text-8xl md:text-9xl font-black tracking-tight leading-none bg-clip-text text-transparent mb-3 sm:mb-4 select-text",
            scheme.gradient
          )}
        >
          {displayCode}
        </h1>

        {/* Heading Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 tracking-tight">
          {displayTitle}
        </h2>

        {/* Subtitle / Description */}
        <p className="text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed mb-7 sm:mb-8">
          {displayDesc}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full select-none">
          {showHomeButton && (
            <button
              type="button"
              onClick={() => {
                if (onRetry) onRetry()
                navigate('/dashboard')
              }}
              className={cn(
                "h-10 px-5 rounded-xl active:scale-[0.98] text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer select-none",
                scheme.button
              )}
            >
              <ArrowLeft size={16} />
              <span>{t('errorPage.backToDashboard', 'Back to Dashboard')}</span>
            </button>
          )}

          {(showRetryButton || onRetry) && (
            <button
              type="button"
              onClick={() => {
                if (onRetry) {
                  onRetry()
                } else {
                  window.location.reload()
                }
              }}
              className="h-10 px-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 active:scale-[0.98] text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer select-none shadow-2xs"
            >
              <RotateCw size={15} />
              <span>{t('errorPage.tryAgain', 'Try Again')}</span>
            </button>
          )}

          {showSearchButton && (
            <button
              type="button"
              onClick={handleSearchButtonClick}
              className="h-10 px-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 active:scale-[0.98] text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer select-none shadow-2xs"
            >
              <Search size={15} />
              <span>{t('errorPage.searchDocs', 'Search the docs')}</span>
            </button>
          )}

          {extraActions}
        </div>

        {/* Collapsible Error Debug Details (shown if error exists) */}
        {error && (
          <div className="mt-8 w-full text-left">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1.5 mx-auto cursor-pointer select-none"
            >
              <span>{t('errorPage.technicalDetails', 'Technical Details')}</span>
              {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showDetails && (
              <div className="mt-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 max-h-48 overflow-y-auto text-xs font-mono text-rose-600 dark:text-rose-400 select-text">
                <div className="font-bold mb-1 select-text">{error.name}: {error.message}</div>
                {error.stack && <pre className="whitespace-pre-wrap text-[11px] text-slate-600 dark:text-slate-400 select-text">{error.stack}</pre>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Interactive Documentation & Page Search Dialog ──────────── */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden border-border/80 shadow-2xl rounded-2xl">
          <DialogTitle className="sr-only">
            {t('errorPage.searchModalTitle', 'Search Docs & Navigation')}
          </DialogTitle>

          {/* Search Input Bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-border/60 bg-background">
            <Search className="size-4.5 text-muted-foreground mr-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filteredItems.length > 0) {
                  e.preventDefault()
                  handleItemSelect(filteredItems[0])
                }
              }}
              placeholder={t('errorPage.searchPlaceholder', isKhmer ? 'វាយឈ្មោះទំព័រ ឬឯកសារជំនួយដែលចង់ស្វែងរក...' : 'Type a page, setting, or guide...')}
              autoFocus
              className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/70 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded bg-muted cursor-pointer"
              >
                ESC
              </button>
            )}
          </div>

          {/* Quick Filtered Results */}
          <div className="max-h-84 overflow-y-auto p-2 space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 flex items-center justify-between">
              <span>{isKhmer ? 'លទ្ធផលរហ័ស' : 'Quick Navigation & Docs'}</span>
              <span className="text-[10px] font-normal lowercase">{filteredItems.length} {isKhmer ? 'ធាតុ' : 'results'}</span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                <Sparkles className="size-6 text-muted-foreground/40" />
                <p>{t('errorPage.noResults', isKhmer ? 'រកមិនឃើញទិន្នន័យដែលផ្គូផ្គងនឹងពាក្យស្វែងរកទេ' : 'No matching destinations or guides found')}</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => handleItemSelect(item)}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium text-foreground hover:bg-accent transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-lg bg-muted/60 border border-border/60 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground truncate text-sm">
                          {isKhmer ? item.titleKh : item.title}
                        </p>
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                          {isKhmer ? item.categoryKh : item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {isKhmer ? item.descKh : item.desc}
                      </p>
                    </div>
                  </div>
                  {item.isExternal ? (
                    <ExternalLink className="size-4 text-muted-foreground/50 group-hover:text-foreground transition-all shrink-0" />
                  ) : (
                    <ArrowRight className="size-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Dialog Footer Shortcuts */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/60 bg-muted/30 text-[11px] text-muted-foreground select-none">
            <div className="flex items-center gap-3">
              <span>
                <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded border border-border/60">↵</kbd> {isKhmer ? 'ជ្រើសរើស' : 'select'}
              </span>
              <span>
                <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded border border-border/60">↑↓</kbd> {isKhmer ? 'ផ្លាស់ទី' : 'navigate'}
              </span>
            </div>
            <span>
              <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded border border-border/60">esc</kbd> {isKhmer ? 'បិទ' : 'close'}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default HttpErrorPage
