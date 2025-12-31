"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

/* ========================================
   GlassNav - Floating Navigation Component
   ======================================== 
   
   A premium floating navigation with frosted glass effect
   and optional Neubrutalist border accent.
*/

export interface GlassNavProps extends HTMLAttributes<HTMLDivElement> {
  /** Navigation variant */
  variant?: "default" | "brutal";
  /** Position of the nav */
  position?: "top" | "bottom" | "floating";
  /** Is navigation currently visible */
  visible?: boolean;
}

const GlassNav = forwardRef<HTMLDivElement, GlassNavProps>(
  (
    {
      className,
      variant = "default",
      position = "top",
      visible = true,
      children,
      ...props
    },
    ref
  ) => {
    const positionClasses = {
      top: "fixed top-0 left-0 right-0 z-fixed",
      bottom: "fixed bottom-0 left-0 right-0 z-fixed",
      floating: "fixed top-4 left-4 right-4 z-fixed",
    };

    const variantClasses = {
      default: "glass-nav",
      brutal: "glass-brutal border-b-4 border-brutal-black",
    };

    return (
      <nav
        ref={ref}
        className={cn(
          positionClasses[position],
          variantClasses[variant],
          position === "floating" && "rounded-lg mx-auto max-w-7xl",
          !visible && "translate-y-[-100%] opacity-0",
          "transition-all duration-300 ease-smooth",
          className
        )}
        {...props}
      >
        {children}
      </nav>
    );
  }
);

GlassNav.displayName = "GlassNav";

/* ========================================
   GlassNavContent - Inner container
   ======================================== */

export interface GlassNavContentProps extends HTMLAttributes<HTMLDivElement> {}

const GlassNavContent = forwardRef<HTMLDivElement, GlassNavContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between h-16 px-4 lg:px-6 max-w-7xl mx-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

GlassNavContent.displayName = "GlassNavContent";

export { GlassNav, GlassNavContent };
