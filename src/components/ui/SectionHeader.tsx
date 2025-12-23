import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: {
    icon?: LucideIcon;
    text: string;
  };
  centered?: boolean;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  badge,
  centered = true,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn(centered && "text-center", "mb-16", className)}>
      {badge && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mb-6">
          {badge.icon && <badge.icon className="w-4 h-4" />}
          {badge.text}
        </div>
      )}
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  );
}
