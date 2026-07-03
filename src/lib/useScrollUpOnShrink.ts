import { useLayoutEffect, useRef, type RefObject } from 'react'

// The window is the page scroller. When a filter shrinks the list, the document
// gets shorter and the browser snap-clamps the scroll position up to fit — a
// jarring jump if the search/filter bar was scrolled out of view. This eases the
// page up instead:
//   1. freeze the document height so the collapsing rows can't snap the scroll,
//   2. let TransferList's row-collapse animation finish,
//   3. glide the scroll up to the top of the (now shorter) content.
// It only acts when the list actually shrank AND the user is scrolled down far
// enough that a jump would occur — otherwise it stays out of the way.

const COLLAPSE_MS = 340 // a touch past TransferList's 0.32s row collapse
const GLIDE_MS = 460
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

export function useScrollUpOnShrink(count: number, contentRef: RefObject<HTMLElement | null>) {
  const prevCount = useRef(count)

  useLayoutEffect(() => {
    const shrank = count < prevCount.current
    prevCount.current = count
    if (!shrank) return

    const startY = window.scrollY
    if (startY <= 4) return // already at the top — nothing to ease

    const doc = document.documentElement
    // Freeze height (before paint) so collapsing rows can't snap the scroll.
    doc.style.minHeight = `${doc.scrollHeight}px`

    let settleTimer = 0
    let raf = 0
    let done = false
    const cleanup = () => {
      if (done) return
      done = true
      window.clearTimeout(settleTimer)
      cancelAnimationFrame(raf)
      window.removeEventListener('wheel', cleanup)
      window.removeEventListener('touchstart', cleanup)
      doc.style.minHeight = '' // release; we settle within bounds, so no shift
    }
    // If the user takes over scrolling, get out of the way immediately.
    window.addEventListener('wheel', cleanup, { passive: true })
    window.addEventListener('touchstart', cleanup, { passive: true })

    settleTimer = window.setTimeout(() => {
      const el = contentRef.current
      const contentBottom = el
        ? el.getBoundingClientRect().bottom + window.scrollY
        : doc.scrollHeight
      const maxScroll = Math.max(0, contentBottom - window.innerHeight)
      if (startY <= maxScroll + 1) {
        // The list still reaches past the viewport — no jump would happen.
        cleanup()
        return
      }
      const from = window.scrollY
      const distance = from - maxScroll
      let start = 0
      const step = (now: number) => {
        if (done) return
        if (!start) start = now
        const p = Math.min(1, (now - start) / GLIDE_MS)
        window.scrollTo(0, from - distance * easeOutCubic(p))
        if (p < 1) raf = requestAnimationFrame(step)
        else cleanup()
      }
      raf = requestAnimationFrame(step)
    }, COLLAPSE_MS)

    return cleanup
  }, [count, contentRef])
}
