import { useState, useEffect, useCallback } from 'react'

interface UseServerPaginationOptions<TFilters = Record<string, any>> {
  storageKey: string
  defaultPerPage?: number
  defaultSortBy?: string
  defaultSortOrder?: 'asc' | 'desc' | ''
  defaultFilters?: TFilters
}

export function useServerPagination<TFilters = Record<string, any>>({
  storageKey,
  defaultPerPage = 20,
  defaultSortBy = '',
  defaultSortOrder = '',
  defaultFilters = {} as TFilters,
}: UseServerPaginationOptions<TFilters>) {
  // 1. perPage state (read/write to localStorage)
  const [perPage, setPerPageState] = useState<number>(() => {
    const saved = localStorage.getItem(`per_page_${storageKey}`)
    if (saved) {
      const parsed = parseInt(saved, 10)
      if ([10, 20, 50, 100].includes(parsed)) return parsed
    }
    return defaultPerPage
  })

  const setPerPage = useCallback((size: number) => {
    setPerPageState(size)
    localStorage.setItem(`per_page_${storageKey}`, size.toString())
    setPage(1) // changing perPage must reset to page 1
  }, [storageKey])

  // 2. page, search, sort, filter states
  const [page, setPage] = useState<number>(1)
  const [search, setSearch] = useState<string>('')
  const [debouncedSearch, setDebouncedSearch] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>(defaultSortBy)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>(defaultSortOrder)
  const [filters, setFiltersState] = useState<TFilters>(defaultFilters)

  // 3. Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Reset page to 1 when debouncedSearch or filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const setFilters = useCallback((newFilters: TFilters | ((prev: TFilters) => TFilters)) => {
    setFiltersState(prev => {
      const next = typeof newFilters === 'function' ? (newFilters as Function)(prev) : newFilters
      return next
    })
    setPage(1)
  }, [])

  // 4. Handle sorting toggle
  const handleSort = useCallback((field: string) => {
    setSortOrder(prev => {
      if (sortBy !== field) {
        setSortBy(field)
        return 'asc'
      }
      if (prev === 'asc') return 'desc'
      if (prev === 'desc') {
        setSortBy('')
        return ''
      }
      return 'asc'
    })
    setPage(1)
  }, [sortBy])

  // 5. Reset all parameters
  const reset = useCallback(() => {
    setSearch('')
    setDebouncedSearch('')
    setSortBy(defaultSortBy)
    setSortOrder(defaultSortOrder)
    setFiltersState(defaultFilters)
    setPage(1)
  }, [defaultSortBy, defaultSortOrder, defaultFilters])

  // 6. Delete callback helper: check if we need to fall back to previous page
  const adjustAfterDelete = useCallback((currentItemsCount: number) => {
    if (currentItemsCount <= 1 && page > 1) {
      setPage(p => p - 1)
    }
  }, [page])

  return {
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    debouncedSearch,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filters,
    setFilters,
    handleSort,
    reset,
    adjustAfterDelete,
  }
}
