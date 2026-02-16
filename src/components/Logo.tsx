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
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20 15C20 13.3431 21.3431 12 23 12H57C58.6569 12 60 13.3431 60 15V18H20V15Z"
      fill="currentColor"
    />
    <path
      d="M23 21H57V24H23V21Z"
      fill="currentColor"
      fillOpacity="0.8"
    />
    <path
      d="M25 68V27H31V68H25Z"
      fill="currentColor"
    />
    <path
      d="M49 68V27H55V68H49Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20 73C20 71.3431 21.3431 70 23 70H57C58.6569 70 60 71.3431 60 73V76H20V73Z"
      fill="currentColor"
    />
    <path
      d="M36 68V52H44V68H36Z"
      fill="currentColor"
    />
    {/* Gráfico de Barras e Visto */}
    <g transform="translate(28, 30) scale(0.6)">
        <rect x="5" y="45" width="10" height="15" fill="currentColor" opacity="0.9"/>
        <rect x="20" y="35" width="10" height="25" fill="currentColor" opacity="0.9"/>
        <path d="M35 25H45V50C45 52.7614 42.7614 55 40 55H35V25Z" fill="currentColor"  opacity="0.9"/>
        <path d="M50 30L58 38L75 21" stroke="hsl(var(--primary-foreground))" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
))
Logo.displayName = "Logo"
