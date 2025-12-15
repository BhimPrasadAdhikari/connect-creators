import { cn } from "@/lib/utils";

export interface BadgeProps {
  variant?: "default" | "success" | "accent" | "warning" | "error";
  children: React.ReactNode;
  className?: string;
}

const variants = {
  default: "bg-primary/10 text-primary",
  success: "bg-secondary/10 text-secondary-700",
  accent: "bg-accent/10 text-accent-700",
  warning: "bg-yellow-100 text-yellow-700",
  error: "bg-red-100 text-red-700",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
