"use client";

import Link from "next/link";
import { memo } from "react";
import { Users as UsersIcon, CheckCircle } from "lucide-react";
import { Avatar, TrustBadge } from "@/components/ui";

interface CreatorCardProps {
  username: string;
  name: string;
  bio: string | null;
  image: string | null;
  isVerified: boolean;
  subscriberCount: number;
  startingPrice: string;
}

// Helper function to format price
function formatPrice(amountInPaise: number): string {
  const amount = amountInPaise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Memoized CreatorCard component to prevent unnecessary re-renders
export const CreatorCard = memo(function CreatorCard({
  username,
  name,
  bio,
  image,
  isVerified,
  subscriberCount,
  startingPrice,
}: CreatorCardProps) {
  return (
    <Link href={`/creator/${username}`} className="block group">
      <div className="h-full p-5 bg-card border-3 border-brutal-black shadow-brutal-sm hover:shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-brutal-black overflow-hidden">
              <Avatar
                src={image}
                name={name}
                size="lg"
                className="w-full h-full rounded-none"
              />
            </div>
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-primary border-2 border-brutal-black p-0.5">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="font-display font-bold text-foreground truncate text-lg group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground font-mono">
              @{username}
            </p>
            {isVerified && (
              <TrustBadge type="verified" size="sm" className="mt-1" />
            )}
          </div>
        </div>

        <p className="text-muted-foreground text-sm mb-6 line-clamp-2 leading-relaxed min-h-[40px]">
          {bio || "Creator on CreatorConnect. Join to see their exclusive content."}
        </p>

        <div className="flex items-center justify-between pt-4 border-t-2 border-brutal-black">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UsersIcon className="w-4 h-4" />
            <span className="font-bold text-foreground font-mono">{subscriberCount.toLocaleString()}</span>
          </div>
          
          <div className="px-3 py-1.5 bg-primary text-white border-2 border-brutal-black text-sm font-bold shadow-brutal-sm group-hover:shadow-brutal transition-shadow">
            {startingPrice}
          </div>
        </div>
      </div>
    </Link>
  );
});

CreatorCard.displayName = "CreatorCard";
