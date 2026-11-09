import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  X,
  RefreshCw,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useToastStore, type Toast } from '../../stores/toastStore'
import { translateString } from '../../i18n'

const TOAST_THEMES = {
  success: {
    bg: 'bg-white/95 dark:bg-slate-900/95',
    border: 'border-emerald-500/30 dark:border-emerald-500/40',
    title: 'text-emerald-950 dark:text-emerald-100',
    body: 'text-emerald-800/90 dark:text-emerald-200/80',
    iconBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    progress: 'bg-gradient-to-r from-emerald-400 to-emerald-600',
    glow: 'shadow-emerald-500/10',
  },
  error: {
    bg: 'bg-white/95 dark:bg-slate-900/95',
    border: 'border-rose-500/30 dark:border-rose-500/40',
    title: 'text-rose-950 dark:text-rose-100',
    body: 'text-rose-800/90 dark:text-rose-200/80',
    iconBg: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    icon: <AlertOctagon className="w-5 h-5 text-rose-500 flex-shrink-0" />,
    badgeBg: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
    progress: 'bg-gradient-to-r from-rose-400 to-rose-600',
    glow: 'shadow-rose-500/15',
  },
  warning: {
    bg: 'bg-white/95 dark:bg-slate-900/95',
    border: 'border-amber-500/30 dark:border-amber-500/40',
    title: 'text-amber-950 dark:text-amber-100',
    body: 'text-amber-800/90 dark:text-amber-200/80',
    iconBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    icon: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
    badgeBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    progress: 'bg-gradient-to-r from-amber-400 to-amber-600',
    glow: 'shadow-amber-500/10',
  },
  info: {
    bg: 'bg-white/95 dark:bg-slate-900/95',
    border: 'border-indigo-500/30 dark:border-indigo-500/40',
    title: 'text-indigo-950 dark:text-indigo-100',
    body: 'text-indigo-800/90 dark:text-indigo-200/80',
    iconBg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    icon: <Info className="w-5 h-5 text-indigo-500 flex-shrink-0" />,
    badgeBg: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
    progress: 'bg-gradient-to-r from-indigo-400 to-indigo-600',
    glow: 'shadow-indigo-500/10',
  },
}

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { t, i18n } = useTranslation()
  const removeToast = useToastStore((s) => s.removeToast)
  const theme = TOAST_THEMES[toast.type] || TOAST_THEMES.info

  const [isHovered, setIsHovered] = useState(false)
  const [remainingTime, setRemainingTime] = useState(toast.duration ?? 4500)

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return

    const timer = setInterval(() => {
      if (!isHovered) {
        setRemainingTime((prev) => {
          if (prev <= 100) {
            clearInterval(timer)
            setTimeout(() => {
              removeToast(toast.id)
            }, 0)
            return 0
          }
          return prev - 100
        })
      }
    }, 100)

    return () => clearInterval(timer)
  }, [toast.id, toast.duration, isHovered, removeToast])

  const progressPercent = toast.duration
    ? Math.max(0, Math.min(100, (remainingTime / toast.duration) * 100))
    : 0

  const currentLang = (i18n.language === 'en' ? 'en' : 'kh') as 'en' | 'kh'

  const defaultTitles: Record<string, string> = {
    success: currentLang === 'kh' ? 'ជោគជ័យ' : 'Success',
    error: currentLang === 'kh' ? 'កំហុស' : 'Error',
    warning: currentLang === 'kh' ? 'ការព្រមាន' : 'Warning',
    info: currentLang === 'kh' ? 'ព័ត៌មាន' : 'Information',
  }

  // Dynamically translate all toast contents based on the active language
  const resolvedTitle = toast.title
    ? translateString(toast.title, currentLang)
    : (t(`common.${toast.type}`, defaultTitles[toast.type]) || defaultTitles[toast.type] || toast.type)

  const resolvedMessage = toast.message
    ? translateString(toast.message, currentLang)
    : ''

  const resolvedDescription = toast.description
    ? translateString(toast.description, currentLang)
    : undefined

  const resolvedActionLabel = toast.action?.label
    ? translateString(toast.action.label, currentLang)
    : undefined

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, y: -12 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-88 sm:w-[400px] rounded-2xl border shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all ${theme.bg} ${theme.border} ${theme.glow}`}
    >
      <div className="p-4 flex flex-col gap-2">
        {/* Header with Icon, Title, Badge & Close */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={`p-2 rounded-xl border shadow-xs flex-shrink-0 flex items-center justify-center ${theme.iconBg}`}
            >
              {theme.icon}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className={`text-sm font-bold tracking-tight capitalize ${theme.title}`}>
                  {resolvedTitle}
                </h4>

                {toast.code && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${theme.badgeBg}`}
                  >
                    {typeof toast.code === 'number' ? `HTTP ${toast.code}` : toast.code}
                  </span>
                )}
              </div>

              <p className={`text-xs sm:text-sm font-medium mt-1 leading-relaxed break-words ${theme.body}`}>
                {resolvedMessage}
              </p>

              {resolvedDescription && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                  {resolvedDescription}
                </p>
              )}
            </div>
          </div>

          {/* Dismiss button */}
          {toast.dismissible !== false && (
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors -mr-1 -mt-1 flex-shrink-0 cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Action button if provided */}
        {toast.action && (
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                toast.action?.onClick()
                removeToast(toast.id)
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>{resolvedActionLabel || toast.action.label}</span>
            </button>
          </div>
        )}
      </div>

      {/* Animated Countdown Progress Bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="w-full bg-black/5 dark:bg-white/5 h-1 relative overflow-hidden">
          <div
            style={{ width: `${progressPercent}%` }}
            className={`h-full transition-all duration-100 ease-linear ${theme.progress}`}
          />
        </div>
      )}
    </motion.div>
  )
}

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((s) => s.toasts)

  return (
    <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 pointer-events-none max-w-[calc(100vw-2.5rem)]">
      <div className="flex flex-col gap-2.5 pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ToastContainer
