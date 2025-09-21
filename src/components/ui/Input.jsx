import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'

const inputVariants = cva(
  "flex w-full rounded-kristal border bg-white px-3 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-gray-300 focus:border-kristal-500 focus:ring-2 focus:ring-kristal-200",
        error: "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200",
        success: "border-kristal-500 focus:border-kristal-600 focus:ring-2 focus:ring-kristal-200",
        glass: "glass border-white/30 focus:border-kristal-400 focus:ring-2 focus:ring-kristal-200/50"
      },
      size: {
        sm: "h-9 px-2 text-sm",
        md: "h-10 px-3",
        lg: "h-12 px-4 text-lg"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
)

const Input = forwardRef(({ 
  className, 
  variant, 
  size,
  error,
  label,
  helperText,
  type,
  ...props 
}, ref) => {
  const inputVariant = error ? 'error' : variant

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        className={inputVariants({ variant: inputVariant, size, className })}
        ref={ref}
        {...props}
      />
      {(helperText || error) && (
        <p className={`text-xs ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = "Input"

export default Input