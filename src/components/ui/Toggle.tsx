"use client";

import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes } from "react";

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  size?: "sm" | "md";
}

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, description, size = "md", id, ...props }, ref) => {
    const toggleId = id || label?.toLowerCase().replace(/\s+/g, "-");

    const sizes = {
      sm: {
        toggle: "w-8 h-5",
        dot: "w-3 h-3",
        translate: "translate-x-3.5",
      },
      md: {
        toggle: "w-11 h-6",
        dot: "w-4 h-4",
        translate: "translate-x-5",
      },
    };

    return (
      <label
        htmlFor={toggleId}
        className={cn(
          "flex items-start gap-3 cursor-pointer group",
          props.disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            ref={ref}
            id={toggleId}
            type="checkbox"
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              "rounded-full bg-gray-200 transition-colors duration-200",
              "peer-checked:bg-blue-600",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/20 peer-focus-visible:ring-offset-2",
              sizes[size].toggle
            )}
          />
          <div
            className={cn(
              "absolute top-1 left-1 bg-white rounded-full shadow transition-transform duration-200",
              "peer-checked:" + sizes[size].translate,
              sizes[size].dot
            )}
          />
        </div>
        {(label || description) && (
          <div className="flex-1 min-w-0">
            {label && (
              <p className="text-sm font-medium text-gray-900">{label}</p>
            )}
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
        )}
      </label>
    );
  }
);

Toggle.displayName = "Toggle";

export { Toggle };
