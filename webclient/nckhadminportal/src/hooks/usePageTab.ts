import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

export interface UsePageTabOptions<T extends string = string> {
  /**
   * The URL search parameter name to read/write.
   * Defaults to 'tab'.
   */
  paramKey?: string

  /**
   * The storage key for localStorage to remember the tab across revisits.
   * If not provided, it auto-generates based on pathname and paramKey.
   */
  storageKey?: string

  /**
   * Default fallback tab if none is in URL or localStorage.
   */
  defaultTab: T

  /**
   * Optional array of valid tab IDs. If a stored or URL value is not in this list,
   * it falls back to defaultTab.
   */
  validTabs?: readonly T[] | T[]

  /**
   * Custom transform function (e.g. legacy param mapping like 'org' -> 'departments').
   */
  transform?: (raw: string) => T

  /**
   * Whether to sync tab changes to URL search parameters (default: true).
   */
  syncUrl?: boolean

  /**
   * If true, removes the param from the URL when the active tab equals defaultTab.
   * Default is false (keeps URL explicit for reload and sharing).
   */
  deleteDefaultFromUrl?: boolean

  /**
   * Optional callback triggered when tab changes.
   */
  onChange?: (tab: T) => void
}

/**
 * Universal hook for preserving page-level tabs and sub-tabs across page reloads and revisits.
 * Priority:
 * 1. Explicit URL search parameter (supports direct links, bookmarks, reload)
 * 2. Preserved value in localStorage (supports revisit from sidebar / clean navigation)
 * 3. Fallback default tab
 */
export function usePageTab<T extends string = string>({
  paramKey = 'tab',
  storageKey,
  defaultTab,
  validTabs,
  transform,
  syncUrl = true,
  deleteDefaultFromUrl = false,
  onChange,
}: UsePageTabOptions<T>): [T, (tab: T | string) => void] {
  const [searchParams, setSearchParams] = useSearchParams()

  const getEffectiveStorageKey = useCallback(() => {
    if (storageKey) return storageKey
    const path = typeof window !== 'undefined' ? window.location.pathname.replace(/\/+$/, '') : ''
    return `page_tab_${path || 'root'}_${paramKey}`
  }, [storageKey, paramKey])

  // Helper to validate and transform tab value
  const resolveTab = useCallback(
    (candidate: string | null | undefined): T | null => {
      if (!candidate) return null
      const val = transform ? transform(candidate) : (candidate as T)
      if (validTabs && !validTabs.includes(val)) {
        return null
      }
      return val
    },
    [transform, validTabs]
  )

  // Initial resolution on mount
  const [currentTab, setCurrentTab] = useState<T>(() => {
    const fromUrl = resolveTab(searchParams.get(paramKey))
    const effectiveKey = getEffectiveStorageKey()

    if (fromUrl) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(effectiveKey, fromUrl)
        } catch {}
      }
      return fromUrl
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(effectiveKey)
        const fromStorage = resolveTab(stored)
        if (fromStorage) return fromStorage
      } catch {}
    }

    return defaultTab
  })

  // Synchronize URL on initial load if URL was clean but storage had a preserved tab
  const initialSyncedRef = useRef(false)
  useEffect(() => {
    if (!initialSyncedRef.current && syncUrl) {
      initialSyncedRef.current = true
      const urlParam = searchParams.get(paramKey)
      if (!urlParam) {
        if (!deleteDefaultFromUrl || currentTab !== defaultTab) {
          setSearchParams(
            prev => {
              const next = new URLSearchParams(prev)
              next.set(paramKey, currentTab)
              return next
            },
            { replace: true }
          )
        }
      }
    }
  }, [currentTab, defaultTab, deleteDefaultFromUrl, getEffectiveStorageKey, paramKey, searchParams, setSearchParams, syncUrl])

  // Listen to external URL search param changes (e.g. back/forward navigation or explicit link clicks)
  const isMountedRef = useRef(false)
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true
      return
    }
    const rawParam = searchParams.get(paramKey)
    const fromUrl = resolveTab(rawParam)
    if (fromUrl && fromUrl !== currentTab) {
      setCurrentTab(fromUrl)
      try {
        localStorage.setItem(getEffectiveStorageKey(), fromUrl)
      } catch {}
      onChange?.(fromUrl)
    } else if (!rawParam && currentTab !== defaultTab) {
      setCurrentTab(defaultTab)
      try {
        localStorage.setItem(getEffectiveStorageKey(), defaultTab)
      } catch {}
      onChange?.(defaultTab)
    }
  }, [searchParams, paramKey, resolveTab, currentTab, defaultTab, getEffectiveStorageKey, onChange])

  // Tab change handler
  const setTab = useCallback(
    (inputTab: T | string) => {
      const resolved = resolveTab(inputTab) || (inputTab as T)
      setCurrentTab(resolved)

      try {
        localStorage.setItem(getEffectiveStorageKey(), resolved)
      } catch {}

      if (syncUrl) {
        setSearchParams(
          prev => {
            const next = new URLSearchParams(prev)
            if (deleteDefaultFromUrl && resolved === defaultTab) {
              next.delete(paramKey)
            } else {
              next.set(paramKey, resolved)
            }
            return next
          },
          { replace: true }
        )
      }

      onChange?.(resolved)
    },
    [deleteDefaultFromUrl, defaultTab, getEffectiveStorageKey, onChange, paramKey, resolveTab, setSearchParams, syncUrl]
  )

  return [currentTab, setTab]
}

export default usePageTab
