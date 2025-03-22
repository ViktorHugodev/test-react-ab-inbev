import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-3xl text-lg font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "btn-primary",
        secondary: "btn-secondary",
        accent: "bg-gradient-accent text-white",
        primary: "bg-gradient-primary text-white",
        dark: "bg-solid-1 text-solid-2 border border-solid-5",
        glass: "glass-container text-solid-1",
        outline: "border-2 border-solid-3 text-solid-3 hover:bg-solid-3/10",
        ghost: "hover:bg-solid-3/10 text-solid-3",
        link: "text-solid-3 underline-offset-4 hover:underline",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-2xl px-4 py-2 text-base",
        lg: "h-14 rounded-3xl px-8 py-4 text-xl",
        xl: "h-16 rounded-3xl px-10 py-5 text-2xl",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
