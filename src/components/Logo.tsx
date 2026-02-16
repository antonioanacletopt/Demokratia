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
    <path d="M10 30L20 40L35 15L50 55L70 60" stroke="hsl(var(--flag-green))" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 50L30 60L45 30L60 40L70 20" stroke="hsl(var(--flag-yellow))" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 70L25 20L40 45L55 10L70 30" stroke="hsl(var(--flag-red))" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
))
Logo.displayName = "Logo"
