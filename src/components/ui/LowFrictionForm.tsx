"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, useState } from "react";
import { Check, AlertCircle, Loader2 } from "lucide-react";

/* ========================================
   LowFrictionForm - Streamlined Form Components
   ======================================== 
   
   Low-friction form components with inline validation,
   autocomplete styling, and progress indicators.
*/

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label for the input */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Success state */
  success?: boolean;
  /** Loading state (for async validation) */
  validating?: boolean;
  /** Visual variant */
  variant?: "default" | "brutal";
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      success,
      validating,
      variant = "default",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s/g, "-")}`;

    const baseInputStyles = `
      w-full px-4 py-3 text-base min-h-touch
      transition-all duration-base
      focus:outline-none focus:ring-2 focus:ring-primary/20
      disabled:opacity-50 disabled:cursor-not-allowed
      placeholder:text-muted-foreground
    `;

    const variantStyles = {
      default: `
        bg-card border border-input rounded-lg
        focus:border-primary
        ${error ? "border-accent-red focus:ring-red-500/20" : ""}
        ${success ? "border-secondary focus:ring-green-500/20" : ""}
      `,
      brutal: `
        bg-card border-3 border-brutal-black rounded-none
        shadow-brutal-sm
        focus:shadow-brutal focus:translate-x-[-1px] focus:translate-y-[-1px]
        ${error ? "border-accent-red" : ""}
        ${success ? "border-secondary" : ""}
      `,
    };

    return (
      <div className={cn("space-y-1.5", className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={cn(baseInputStyles, variantStyles[variant], "pr-10")}
            {...props}
          />
          
          {/* Status indicator */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {validating && (
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            )}
            {!validating && success && (
              <Check className="w-5 h-5 text-secondary" />
            )}
            {!validating && error && (
              <AlertCircle className="w-5 h-5 text-accent-red" />
            )}
          </div>
        </div>
        
        {/* Helper/Error text */}
        {(helperText || error) && (
          <p
            className={cn(
              "text-xs",
              error ? "text-accent-red" : "text-muted-foreground"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

/* ========================================
   FormTextarea - Textarea with validation
   ======================================== */

export interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: boolean;
  variant?: "default" | "brutal";
}

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      success,
      variant = "default",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `textarea-${label?.toLowerCase().replace(/\s/g, "-")}`;

    const baseStyles = `
      w-full px-4 py-3 text-base min-h-[120px] resize-y
      transition-all duration-base
      focus:outline-none focus:ring-2 focus:ring-primary/20
      disabled:opacity-50 disabled:cursor-not-allowed
      placeholder:text-muted-foreground
    `;

    const variantStyles = {
      default: `
        bg-card border border-input rounded-lg
        focus:border-primary
        ${error ? "border-accent-red focus:ring-red-500/20" : ""}
        ${success ? "border-secondary focus:ring-green-500/20" : ""}
      `,
      brutal: `
        bg-card border-3 border-brutal-black rounded-none
        shadow-brutal-sm
        focus:shadow-brutal focus:translate-x-[-1px] focus:translate-y-[-1px]
        ${error ? "border-accent-red" : ""}
        ${success ? "border-secondary" : ""}
      `,
    };

    return (
      <div className={cn("space-y-1.5", className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={inputId}
          className={cn(baseStyles, variantStyles[variant])}
          {...props}
        />
        
        {(helperText || error) && (
          <p
            className={cn(
              "text-xs",
              error ? "text-accent-red" : "text-muted-foreground"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea";

/* ========================================
   FormProgress - Multi-step progress
   ======================================== */

export interface FormProgressProps {
  /** Current step (1-indexed) */
  currentStep: number;
  /** Total steps */
  totalSteps: number;
  /** Step labels */
  labels?: string[];
  /** Variant */
  variant?: "default" | "brutal";
  className?: string;
}

const FormProgress = ({
  currentStep,
  totalSteps,
  labels,
  variant = "default",
  className,
}: FormProgressProps) => {
  const progress = (currentStep / totalSteps) * 100;

  if (variant === "brutal") {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex justify-between text-xs font-mono text-muted-foreground">
          <span>STEP {currentStep}/{totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-muted border-2 border-brutal-black">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {labels && labels[currentStep - 1] && (
          <p className="text-sm font-medium text-foreground">
            {labels[currentStep - 1]}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      {labels && labels[currentStep - 1] && (
        <p className="text-sm font-medium text-foreground">
          {labels[currentStep - 1]}
        </p>
      )}
    </div>
  );
};

/* ========================================
   FormSection - Section divider
   ======================================== */

export interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const FormSection = ({ title, description, children, className }: FormSectionProps) => (
  <div className={cn("space-y-4", className)}>
    <div>
      <h4 className="font-semibold text-foreground">{title}</h4>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
    {children}
  </div>
);

export { FormInput, FormTextarea, FormProgress, FormSection };
