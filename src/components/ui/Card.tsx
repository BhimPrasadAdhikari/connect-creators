import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive" | "outlined" | "glass" | "brutal" | "glass-brutal";
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hover = true, children, ...props }, ref) => {
    const baseStyles = "transition-all duration-base overflow-hidden";

    const variants = {
      default: "bg-card border border-border shadow-card rounded-xl",
      elevated: "bg-card border-none shadow-elevated rounded-xl",
      interactive: `
        bg-card border border-border shadow-card rounded-xl
        cursor-pointer
        hover:shadow-card-hover hover:border-primary/20
        active:scale-[0.99]
      `,
      outlined: "bg-card border-2 border-border shadow-none rounded-xl",
      glass: `
        glass rounded-xl
        border border-border/20 
        shadow-glass
      `,
      // Neubrutalist Variants
      brutal: `
        bg-card rounded-none
        border-3 border-brutal-black
        shadow-brutal
        overflow-visible
      `,
      "glass-brutal": `
        glass-brutal rounded-none
        shadow-brutal
        overflow-visible
      `,
    };

    const hoverEffects = {
      default: "hover:shadow-card-hover",
      elevated: "hover:shadow-2xl",
      interactive: "", // Already has hover effects
      outlined: "hover:border-primary/30",
      glass: "hover:shadow-lg",
      brutal: "brutal-hover",
      "glass-brutal": "brutal-hover",
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          hover && hoverEffects[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pb-0", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-h3 font-semibold text-foreground mb-2", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription };


