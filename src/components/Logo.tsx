import * as React from "react"
import { cn } from "@/lib/utils"

export const Logo = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>(({ className, ...props }, ref) => (
  <svg
    ref={ref}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("size-full", className)}
    {...props}
  >
    <rect x="15" y="45" width="15" height="20" rx="3" fill="hsl(var(--flag-green))" />
    <rect x="32.5" y="25" width="15" height="40" rx="3" fill="hsl(var(--flag-yellow))" />
    <rect x="50" y="35" width="15" height="30" rx="3" fill="hsl(var(--flag-red))" />
  </svg>
))
Logo.displayName = "Logo"
