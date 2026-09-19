'use client'

import { useEffect } from 'react'

/**
 * Body scroll lock and Escape-to-close for an open overlay.
 *
 * Harvested from components/layout/mobile-nav.tsx, which was deleted: it had
 * zero imports, yet was the only place in the app that did either of these.
 * The two modals and the two bottom sheets all mount with the page still
 * scrollable behind them and no keyboard dismissal.
 *
 * Deliberately uses `overflow: hidden` rather than the `position: fixed` +
 * scroll-offset trick. The latter is the usual workaround for iOS Safari
 * ignoring overflow on body, but it costs a scroll-position save/restore and
 * visibly jumps on restore. With `overscroll-behavior: contain` now set on
 * every scroll container (globals.css), the chaining this is guarding against
 * is already handled, so the simpler mechanism is enough.
 */
export function useOverlay(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])
}
