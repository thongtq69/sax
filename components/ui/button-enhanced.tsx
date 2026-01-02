'use client'

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRippleEffect } from "@/hooks/use-ripple-effect"
// Hook returns { ripples, createRipple, RippleContainer }
import { useMagneticEffect } from "@/hooks/use-cursor-spotlight"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        outline:
          "border-2 border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-primary/50 hover:scale-[1.02] active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] text-white shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] animate-[gradient-border-spin_4s_linear_infinite]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  isSuccess?: boolean
  loadingText?: string
  successText?: string
  enableRipple?: boolean
  enableMagnetic?: boolean
  successDuration?: number
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    isLoading = false,
    isSuccess = false,
    loadingText,
    successText,
    enableRipple = true,
    enableMagnetic = false,
    successDuration = 2000,
    children,
    onClick,
    ...props 
  }, ref) => {
    const prefersReducedMotion = useReducedMotion()
    const { createRipple, RippleContainer } = useRippleEffect({
      color: variant === 'outline' || variant === 'ghost' 
        ? 'rgba(0, 0, 0, 0.1)' 
        : 'rgba(255, 255, 255, 0.3)',
    })
    const { 
      ref: magneticRef, 
      style: magneticStyle, 
      onMouseMove: magneticMouseMove, 
      onMouseLeave: magneticMouseLeave 
    } = useMagneticEffect<HTMLButtonElement>(0.2)

    const [showSuccess, setShowSuccess] = React.useState(false)

    // Handle success state
    React.useEffect(() => {
      if (isSuccess) {
        setShowSuccess(true)
        const timer = setTimeout(() => {
          setShowSuccess(false)
        }, successDuration)
        return () => clearTimeout(timer)
      }
    }, [isSuccess, successDuration])

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (enableRipple && !prefersReducedMotion) {
        createRipple(e)
      }
      onClick?.(e)
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (enableMagnetic && !prefersReducedMotion) {
        magneticMouseMove(e)
      }
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (enableMagnetic && !prefersReducedMotion) {
        magneticMouseLeave()
      }
      props.onMouseLeave?.(e)
    }

    // Combine refs
    const combinedRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
        if (magneticRef) {
          (magneticRef as React.MutableRefObject<HTMLButtonElement | null>).current = node
        }
      },
      [ref, magneticRef]
    )

    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref as any}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <button
        className={cn(
          buttonVariants({ variant, size, className }),
          showSuccess && 'bg-green-500 hover:bg-green-500',
          isLoading && 'cursor-wait'
        )}
        ref={combinedRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        disabled={isLoading || props.disabled}
        style={enableMagnetic && !prefersReducedMotion ? magneticStyle : undefined}
        {...props}
      >
        {/* Ripple effect container */}
        {enableRipple && !prefersReducedMotion && <RippleContainer />}
        
        {/* Button content */}
        <span className={cn(
          "flex items-center gap-2 transition-all duration-200",
          (isLoading || showSuccess) && "opacity-0"
        )}>
          {children}
        </span>

        {/* Loading state */}
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText && <span>{loadingText}</span>}
          </span>
        )}

        {/* Success state */}
        {showSuccess && !isLoading && (
          <span className="absolute inset-0 flex items-center justify-center gap-2 animate-scale-in">
            <Check className="h-5 w-5" />
            {successText && <span>{successText}</span>}
          </span>
        )}

        {/* Shine effect overlay */}
        {!prefersReducedMotion && (
          <span className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
            <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-[100%] transition-transform duration-700" />
          </span>
        )}
      </button>
    )
  }
)
EnhancedButton.displayName = "EnhancedButton"

export { EnhancedButton, buttonVariants }
