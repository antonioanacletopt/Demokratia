"use client"

import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // Set the initial state from the media query
    setIsMobile(mediaQuery.matches)

    // Create a listener for changes
    const handleResize = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }

    // Add the listener
    mediaQuery.addEventListener("change", handleResize)

    // Clean up the listener on component unmount
    return () => {
      mediaQuery.removeEventListener("change", handleResize)
    }
  }, [])

  return isMobile
}
