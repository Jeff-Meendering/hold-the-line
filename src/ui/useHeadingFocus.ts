// When a screen appears, and when the next customer appears, focus moves to
// that screen's heading and the page goes back to the top (design.md section
// 3.7, U9). A keyboard player then starts at the top, a screen reader reads
// the new heading, and a held Enter key cannot press a button on the next
// screen. The heading needs tabIndex={-1} so that it can take focus.
import { useEffect, useRef } from 'react'

export function useHeadingFocus() {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    window.scrollTo(0, 0)
    heading.current?.focus({ preventScroll: true })
  }, [])
  return heading
}
