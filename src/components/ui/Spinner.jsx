import { cva } from 'class-variance-authority'

const spinnerVariants = cva(
  "animate-spin rounded-full border-2 border-gray-200",
  {
    variants: {
      size: {
        sm: "h-4 w-4 border-t-kristal-500",
        md: "h-6 w-6 border-t-kristal-500", 
        lg: "h-8 w-8 border-t-kristal-500",
        xl: "h-12 w-12 border-t-kristal-600"
      },
      color: {
        kristal: "border-t-kristal-500",
        secondary: "border-t-secondary-500",
        white: "border-t-white border-gray-300"
      }
    },
    defaultVariants: {
      size: "md",
      color: "kristal"
    }
  }
)

export default function Spinner({ 
  size = "md", 
  color = "kristal", 
  className = "",
  text 
}) {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className={spinnerVariants({ size, color, className })} />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  )
}

// Loading overlay component
export function LoadingOverlay({ loading, children, text = "Yükleniyor..." }) {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-kristal">
          <Spinner size="lg" text={text} />
        </div>
      )}
    </div>
  )
}