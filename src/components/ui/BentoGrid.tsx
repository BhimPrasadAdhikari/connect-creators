"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

/* ========================================
   BentoGrid - Modular Grid Layout System
   ======================================== 
   
   A responsive Bento Grid system for organizing dashboard and profile content
   into distinct, rectangular compartments. Follows the Bento Box design pattern
   with consistent 16px/24px gutters.
   
   Usage:
   <BentoGrid>
     <BentoCell span={2}>Featured Content</BentoCell>
     <BentoCell>Regular Content</BentoCell>
   </BentoGrid>
*/

export interface BentoGridProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of columns on large screens (default: 4) */
  cols?: 2 | 3 | 4 | 6;
  /** Gap between cells - 16px (default) or 24px */
  gap?: "sm" | "md" | "lg";
}

const BentoGrid = forwardRef<HTMLDivElement, BentoGridProps>(
  ({ className, cols = 4, gap = "md", children, ...props }, ref) => {
    const colClasses = {
      2: "lg:grid-cols-2",
      3: "lg:grid-cols-3",
      4: "lg:grid-cols-4",
      6: "lg:grid-cols-6",
    };

    const gapClasses = {
      sm: "gap-3",      // 12px
      md: "gap-4",      // 16px
      lg: "gap-6",      // 24px
    };

    return (
      <div
        ref={ref}
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2",
          colClasses[cols],
          gapClasses[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BentoGrid.displayName = "BentoGrid";

/* ========================================
   BentoCell - Individual Grid Cell
   ======================================== */

export interface BentoCellProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of columns to span (default: 1) */
  span?: 1 | 2 | 3 | 4;
  /** Number of rows to span (default: 1) */
  rowSpan?: 1 | 2;
  /** Variant styling */
  variant?: "default" | "brutal" | "glass" | "glass-brutal";
  /** Enable hover effects */
  interactive?: boolean;
}

const BentoCell = forwardRef<HTMLDivElement, BentoCellProps>(
  (
    {
      className,
      span = 1,
      rowSpan = 1,
      variant = "default",
      interactive = false,
      children,
      ...props
    },
    ref
  ) => {
    const spanClasses = {
      1: "col-span-1",
      2: "col-span-1 sm:col-span-2",
      3: "col-span-1 sm:col-span-2 lg:col-span-3",
      4: "col-span-1 sm:col-span-2 lg:col-span-4",
    };

    const rowSpanClasses = {
      1: "row-span-1",
      2: "row-span-2",
    };

    const variantClasses = {
      default: "bg-card border border-border shadow-card rounded-lg",
      brutal: "bg-card border-3 border-brutal-black shadow-brutal rounded-none",
      glass: "glass border border-border/20 shadow-glass rounded-lg",
      "glass-brutal": "glass-brutal rounded-none",
    };

    return (
      <div
        ref={ref}
        className={cn(
          spanClasses[span],
          rowSpanClasses[rowSpan],
          variantClasses[variant],
          interactive && variant === "brutal" && "brutal-hover cursor-pointer",
          interactive && variant !== "brutal" && "hover:shadow-card-hover transition-shadow cursor-pointer",
          "overflow-hidden",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BentoCell.displayName = "BentoCell";

/* ========================================
   BentoHeader - Cell Header Section
   ======================================== */

export interface BentoHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const BentoHeader = forwardRef<HTMLDivElement, BentoHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-4 pb-0 lg:p-6 lg:pb-0", className)}
      {...props}
    >
      {children}
    </div>
  )
);

BentoHeader.displayName = "BentoHeader";

/* ========================================
   BentoContent - Cell Content Section
   ======================================== */

export interface BentoContentProps extends HTMLAttributes<HTMLDivElement> {}

const BentoContent = forwardRef<HTMLDivElement, BentoContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-4 lg:p-6", className)}
      {...props}
    >
      {children}
    </div>
  )
);

BentoContent.displayName = "BentoContent";

/* ========================================
   BentoTitle - Cell Title
   ======================================== */

export interface BentoTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Use display font for extra emphasis */
  display?: boolean;
}

const BentoTitle = forwardRef<HTMLHeadingElement, BentoTitleProps>(
  ({ className, display = false, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "font-semibold text-foreground mb-1",
        display ? "font-display text-h2" : "text-h3",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
);

BentoTitle.displayName = "BentoTitle";

/* ========================================
   BentoDescription - Cell Description
   ======================================== */

export interface BentoDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

const BentoDescription = forwardRef<HTMLParagraphElement, BentoDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  )
);

BentoDescription.displayName = "BentoDescription";

export {
  BentoGrid,
  BentoCell,
  BentoHeader,
  BentoContent,
  BentoTitle,
  BentoDescription,
};
