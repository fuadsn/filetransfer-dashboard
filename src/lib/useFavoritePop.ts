import { useEffect, useRef } from 'react'
import { useAnimationControls } from 'motion/react'

/**
 * Motion controls that play a subtle Instagram-like "like" bounce when
 * `favorited` flips to true — grow past size, dip, small overshoot, settle.
 * Fires only on the star action, not on mount, un-star, or re-renders.
 *
 * Spread the returned controls onto a `motion.span` wrapping the star:
 *   const pop = useFavoritePop(transfer.favorited)
 *   <motion.span animate={pop}><Star /></motion.span>
 */
export function useFavoritePop(favorited: boolean) {
  const controls = useAnimationControls()
  const wasFavorited = useRef(favorited)

  useEffect(() => {
    if (favorited && !wasFavorited.current) {
      void controls.start({
        scale: [1, 1.5, 0.9, 1.15, 1],
        transition: { duration: 0.45, ease: 'easeOut', times: [0, 0.28, 0.52, 0.76, 1] },
      })
    }
    wasFavorited.current = favorited
  }, [favorited, controls])

  return controls
}
