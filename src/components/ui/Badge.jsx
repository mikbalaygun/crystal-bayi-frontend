import { cva } from 'class-variance-authority'
import { forwardRef } from 'react'

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-kristal-500 text-white hover:bg-kristal-600",
        secondary: "border-transparent bg-secondary-500 text-white hover:bg-secondary-600",
        success: "border-transparent bg-green-500 text-white hover:bg-green-600",
        warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
        danger: "border-transparent bg-red-500 text-white hover:bg-red-600",
        outline: "border-kristal-500 text-kristal-600 hover:bg-kristal-50",
        glass: "glass border-white/30 text-kristal-700"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

const Badge = forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={badgeVariants({ variant, className })}
      {...props}
    />
  )
})

Badge.displayName = "Badge"

export default Badge