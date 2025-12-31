import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  variant?: "default" | "brutal";
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, variant = "default", id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    const baseStyles = `
      w-full px-4 py-3 text-base bg-card text-foreground
      placeholder:text-muted-foreground
      transition-all duration-200
      disabled:bg-muted disabled:cursor-not-allowed disabled:text-muted-foreground
      resize-y min-h-[120px]
    `;

    const variants = {
      default: `
        border border-border rounded-lg
        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
        ${error ? "border-accent-red focus:ring-accent-red/20 focus:border-accent-red" : ""}
      `,
      brutal: `
        border-3 border-brutal-black rounded-none
        shadow-brutal-sm
        focus:outline-none focus:shadow-brutal focus:translate-x-[-1px] focus:translate-y-[-1px]
        ${error ? "border-accent-red" : ""}
      `,
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              "block text-sm font-medium text-foreground mb-1.5",
              variant === "brutal" && "font-mono uppercase tracking-wide"
            )}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(baseStyles, variants[variant], className)}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-accent-red">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };


