import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { Check } from "lucide-react";
import { Button } from "./Button";
import Link from "next/link";

export interface TierCardProps {
  id: string;
  name: string;
  price: number; // in paise
  benefits: string[];
  isPopular?: boolean;
  creatorUsername?: string;
  className?: string;
}

export function TierCard({
  id,
  name,
  price,
  benefits,
  isPopular = false,
  creatorUsername,
  className,
}: TierCardProps) {
  const checkoutUrl = creatorUsername
    ? `/checkout/${id}?creator=${creatorUsername}`
    : `/checkout/${id}`;

  return (
    <div
      className={cn(
        "relative bg-card rounded-xl border p-6",
        isPopular
          ? "border-primary shadow-elevated"
          : "border-border shadow-card hover:shadow-card-hover",
        "transition-all duration-200",
        className
      )}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      {/* Tier Name */}
      <h3 className="text-lg font-semibold text-text-primary mb-2">{name}</h3>

      {/* Price */}
      <div className="mb-4">
        <span className="text-3xl font-bold text-text-primary">
          {formatPrice(price)}
        </span>
        <span className="text-text-secondary">/month</span>
      </div>

      {/* Benefits */}
      <ul className="space-y-3 mb-6">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <span className="text-sm text-text-secondary">{benefit}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link href={checkoutUrl} className="block">
        <Button
          variant={isPopular ? "primary" : "outline"}
          className="w-full"
          size="lg"
        >
          Subscribe
        </Button>
      </Link>
    </div>
  );
}
