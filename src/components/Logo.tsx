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
    <path d="M10 60C20 40 30 70 40 50C50 30 60 60 70 40" stroke="hsl(var(--flag-green))" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 50C20 70 30 40 40 60C50 80 60 50 70 70" stroke="hsl(var(--flag-yellow))" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 40C20 20 30 50 40 30C50 10 60 40 70 20" stroke="hsl(var(--flag-red))" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
))
Logo.displayName = "Logo"
