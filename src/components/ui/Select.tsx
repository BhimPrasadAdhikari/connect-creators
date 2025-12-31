import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  variant?: "default" | "brutal";
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, variant = "default", id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    const baseStyles = `
      w-full px-4 py-3 text-base bg-card text-foreground
      transition-all duration-200
      disabled:bg-muted disabled:cursor-not-allowed disabled:text-muted-foreground
      appearance-none bg-no-repeat bg-right
      min-h-touch cursor-pointer
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
            htmlFor={selectId}
            className={cn(
              "block text-sm font-medium text-foreground mb-1.5",
              variant === "brutal" && "font-mono uppercase tracking-wide"
            )}
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(baseStyles, variants[variant], className)}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: "right 0.75rem center",
            backgroundSize: "1.5em 1.5em",
            paddingRight: "2.5rem",
          }}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-sm text-accent-red">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };


