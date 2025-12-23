import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: "default" | "outlined" | "problem";
  className?: string;
}

const variants = {
  default: "text-center p-6 rounded-xl hover:bg-gray-50 transition-colors",
  outlined:
    "text-center p-6 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all",
  problem: "text-center p-6 rounded-xl hover:bg-gray-50 transition-colors",
};

const iconVariants = {
  default: "bg-blue-100 text-blue-600",
  outlined: "bg-blue-100 text-blue-600",
  problem: "bg-red-50 text-red-500",
};

export function FeatureCard({
  icon: Icon,
  title,
  description,
  variant = "default",
  className,
}: FeatureCardProps) {
  return (
    <div className={cn(variants[variant], className)}>
      <div
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4",
          iconVariants[variant]
        )}
      >
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
