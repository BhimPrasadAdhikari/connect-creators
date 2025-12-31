"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";
import { CheckCircle, Radio, Shield, BadgeCheck, Fingerprint, Lock } from "lucide-react";

/* ========================================
   TrustBadge - Identity Verification Badges
   ======================================== 
   
   Trust signals for identity verification, liveness checks,
   and blockchain-secured identity indicators.
*/

export type TrustBadgeType = "verified" | "live" | "secured" | "identity" | "kyc" | "premium";

export interface TrustBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Type of trust badge */
  type: TrustBadgeType;
  /** Size of the badge */
  size?: "sm" | "md" | "lg";
  /** Show icon */
  showIcon?: boolean;
  /** Custom label override */
  label?: string;
}

const TrustBadge = forwardRef<HTMLSpanElement, TrustBadgeProps>(
  (
    {
      className,
      type,
      size = "md",
      showIcon = true,
      label,
      ...props
    },
    ref
  ) => {
    const badgeConfig = {
      verified: {
        label: "Verified",
        icon: CheckCircle,
        className: "trust-badge-verified",
      },
      live: {
        label: "Live",
        icon: Radio,
        className: "trust-badge-live",
      },
      secured: {
        label: "Secured",
        icon: Shield,
        className: "bg-secondary/10 text-secondary border-secondary border-2 font-bold",
      },
      identity: {
        label: "ID Verified",
        icon: BadgeCheck,
        className: "bg-primary text-white border-brutal-black",
      },
      kyc: {
        label: "KYC Complete",
        icon: Fingerprint,
        className: "bg-secondary text-white border-brutal-black",
      },
      premium: {
        label: "Premium",
        icon: Lock,
        className: "bg-accent text-white border-brutal-black",
      },
    };

    const config = badgeConfig[type];
    const Icon = config.icon;

    const sizeClasses = {
      sm: "text-[10px] px-2 py-1 gap-1",
      md: "text-xs px-3 py-1.5 gap-1.5",
      lg: "text-sm px-4 py-2 gap-2",
    };

    const iconSizes = {
      sm: 10,
      md: 12,
      lg: 14,
    };

    return (
      <span
        ref={ref}
        className={cn(
          "trust-badge",
          config.className,
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {showIcon && <Icon size={iconSizes[size]} />}
        {label || config.label}
      </span>
    );
  }
);

TrustBadge.displayName = "TrustBadge";

/* ========================================
   TrustBadgeGroup - Group of badges
   ======================================== */

export interface TrustBadgeGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Stack direction */
  direction?: "row" | "column";
}

const TrustBadgeGroup = forwardRef<HTMLDivElement, TrustBadgeGroupProps>(
  ({ className, direction = "row", children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex gap-2 flex-wrap",
        direction === "column" && "flex-col items-start",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

TrustBadgeGroup.displayName = "TrustBadgeGroup";

export { TrustBadge, TrustBadgeGroup };
