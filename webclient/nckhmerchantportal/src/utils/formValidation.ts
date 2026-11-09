/**
 * Global Form Validation Utilities
 * 
 * Compliant with Nielsen Norman Group (NN/g), WCAG 2.1 Accessibility (3.3.1 Error Identification),
 * and Material Design Guidelines.
 * 
 * Rules:
 * 1. Do NOT display redundant floating Toast alerts for client-side field validation errors.
 * 2. Rely on clear inline field errors (red border + descriptive message below input).
 * 3. Automatically smooth-scroll and focus the first invalid field so the user can immediately correct it.
 */

export function focusFirstInvalidField(
  errorKeys?: string[] | Record<string, unknown> | null,
  container?: HTMLElement | null
): void {
  if (typeof window === 'undefined') return

  setTimeout(() => {
    const root = container || document

    // 1. Try finding by matching form field name or id
    if (errorKeys) {
      const keys = Array.isArray(errorKeys) ? errorKeys : Object.keys(errorKeys)
      for (const key of keys) {
        if (!key) continue
        const selector = `[name="${key}"], #${key}, [data-field="${key}"], [id="field-${key}"]`
        const el = root.querySelector<HTMLElement>(selector)
        if (el && typeof el.focus === 'function') {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          el.focus({ preventScroll: true })
          return
        }
      }
    }

    // 2. Fallback: Search for any element marked with error classes or aria-invalid
    const fallbackSelector = [
      'input.border-destructive',
      'input.border-red-500',
      'input.border-rose-500',
      'textarea.border-destructive',
      'textarea.border-red-500',
      'textarea.border-rose-500',
      'select.border-destructive',
      'select.border-red-500',
      'select.border-rose-500',
      '[aria-invalid="true"]',
      '.has-error input',
      '.has-error textarea',
      '.has-error select',
    ].join(', ')

    const firstInvalid = root.querySelector<HTMLElement>(fallbackSelector)
    if (firstInvalid && typeof firstInvalid.focus === 'function') {
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' })
      firstInvalid.focus({ preventScroll: true })
    }
  }, 60)
}

export default focusFirstInvalidField
