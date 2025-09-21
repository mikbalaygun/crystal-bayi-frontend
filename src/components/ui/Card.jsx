import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'

const cardVariants = cva(
  "rounded-kristal-lg border bg-white text-gray-950 shadow-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-gray-200 shadow-sm hover:shadow-md",
        kristal: "border-kristal-200 shadow-kristal hover:shadow-kristal-lg",
        glass: "glass border-white/30 shadow-glass",
        elevated: "border-gray-200 shadow-lg hover:shadow-xl"
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8"
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "md"
    }
  }
)

const Card = forwardRef(({ 
  className, 
  variant, 
  padding,
  children,
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cardVariants({ variant, padding, className })}
    {...props}
  >
    {children}
  </div>
))

const CardHeader = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 p-6 ${className}`}
    {...props}
  />
))

const CardTitle = forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
))

const CardDescription = forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-gray-500 ${className}`}
    {...props}
  />
))

const CardContent = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
))

const CardFooter = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center p-6 pt-0 ${className}`}
    {...props}
  />
))

Card.displayName = "Card"
CardHeader.displayName = "CardHeader"
CardTitle.displayName = "CardTitle"
CardDescription.displayName = "CardDescription"
CardContent.displayName = "CardContent"
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }