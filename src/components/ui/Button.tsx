import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2 font-medium rounded-lg
      transition-all duration-base
      focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      active:scale-[0.98]
    `;

    const variants = {
      primary: `
        bg-primary text-white 
        hover:bg-primary-700 
        active:bg-primary-800
        shadow-sm hover:shadow-md
      `,
      secondary: `
        bg-secondary text-white 
        hover:bg-secondary-600 
        active:bg-secondary-700
        shadow-sm hover:shadow-md
      `,
      outline: `
        border-2 border-primary text-primary bg-transparent 
        hover:bg-primary/5 hover:border-primary-600
      `,
      ghost: `
        text-text-secondary bg-transparent
        hover:text-text-primary hover:bg-gray-100
      `,
      danger: `
        bg-red-600 text-white
        hover:bg-red-700
        active:bg-red-800
        shadow-sm hover:shadow-md
      `,
    };

    const sizes = {
      sm: "px-3 py-2 text-sm min-h-[36px]",
      md: "px-4 py-3 text-base min-h-touch", // 44px touch target
      lg: "px-6 py-4 text-lg min-h-[52px]",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2
            className={cn(
              "animate-spin",
              size === "sm" && "w-4 h-4",
              size === "md" && "w-5 h-5",
              size === "lg" && "w-6 h-6"
            )}
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
