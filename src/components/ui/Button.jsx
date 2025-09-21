import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-kristal font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none kristal-shine",
  {
    variants: {
      variant: {
        primary: "bg-kristal-gradient text-white hover:shadow-kristal-lg focus:ring-kristal-500",
        secondary: "bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500",
        outline: "border-2 border-kristal-500 text-kristal-600 hover:bg-kristal-50 focus:ring-kristal-500",
        ghost: "text-kristal-600 hover:bg-kristal-50 focus:ring-kristal-500",
        danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
        glass: "glass text-kristal-700 hover:bg-white/20 focus:ring-kristal-500"
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-lg",
        xl: "h-14 px-8 text-xl"
      },
      fullWidth: {
        true: "w-full"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
)

const Button = forwardRef(({ 
  className, 
  variant, 
  size, 
  fullWidth,
  loading,
  children, 
  ...props 
}, ref) => {
  return (
    <button
      className={buttonVariants({ variant, size, fullWidth, className })}
      ref={ref}
      disabled={loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  )
})

Button.displayName = "Button"

export default Button