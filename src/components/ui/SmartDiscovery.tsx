"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";
import { Sparkles, TrendingUp, Target, Zap, ArrowRight } from "lucide-react";

/* ========================================
   SmartDiscovery - AI Matchmaking Components
   ======================================== 
   
   UI components for "Smart Discovery" that display
   brand-affinity scores and predicted ROI for creator-brand pairings.
*/

export interface AffinityScoreProps extends HTMLAttributes<HTMLDivElement> {
  /** Affinity score 0-100 */
  score: number;
  /** Label for the score */
  label?: string;
  /** Show as percentage */
  showPercentage?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

const AffinityScore = forwardRef<HTMLDivElement, AffinityScoreProps>(
  (
    {
      className,
      score,
      label = "Match Score",
      showPercentage = true,
      size = "md",
      ...props
    },
    ref
  ) => {
    const getScoreColor = (score: number) => {
      if (score >= 80) return "text-secondary bg-secondary/10 border-secondary";
      if (score >= 60) return "text-primary bg-primary/20 border-primary";
      if (score >= 40) return "text-accent bg-accent/10 border-accent";
      return "text-muted-foreground bg-muted border-border";
    };

    const sizeClasses = {
      sm: "w-12 h-12 text-sm",
      md: "w-16 h-16 text-lg",
      lg: "w-20 h-20 text-xl",
    };

    return (
      <div ref={ref} className={cn("flex flex-col items-center gap-1", className)} {...props}>
        <div
          className={cn(
            "rounded-full border-3 flex items-center justify-center font-display font-bold",
            sizeClasses[size],
            getScoreColor(score)
          )}
        >
          {score}
          {showPercentage && <span className="text-xs">%</span>}
        </div>
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
    );
  }
);

AffinityScore.displayName = "AffinityScore";

/* ========================================
   ROIPredictor - Predicted ROI Display
   ======================================== */

export interface ROIPredictorProps extends HTMLAttributes<HTMLDivElement> {
  /** Predicted ROI multiplier (e.g., 2.5 = 2.5x return) */
  roi: number;
  /** Confidence level 0-100 */
  confidence?: number;
  /** Investment basis */
  basis?: string;
}

const ROIPredictor = forwardRef<HTMLDivElement, ROIPredictorProps>(
  (
    {
      className,
      roi,
      confidence = 75,
      basis = "Based on historical performance",
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-card border-3 border-brutal-black p-4 shadow-brutal-sm",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-secondary" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Predicted ROI
          </span>
        </div>
        <div className="font-display text-display-sm font-bold text-foreground">
          {roi.toFixed(1)}x
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary transition-all duration-500"
              style={{ width: `${confidence}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{confidence}%</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{basis}</p>
      </div>
    );
  }
);

ROIPredictor.displayName = "ROIPredictor";

/* ========================================
   MatchCard - Creator-Brand Match Card
   ======================================== */

export interface MatchCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Creator/Brand name */
  name: string;
  /** Category/niche */
  category: string;
  /** Match score 0-100 */
  matchScore: number;
  /** Predicted ROI */
  predictedROI?: number;
  /** Profile image URL */
  imageUrl?: string;
  /** Whether this is a recommended match */
  isRecommended?: boolean;
}

const MatchCard = forwardRef<HTMLDivElement, MatchCardProps>(
  (
    {
      className,
      name,
      category,
      matchScore,
      predictedROI,
      imageUrl,
      isRecommended = false,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-card border-3 border-brutal-black p-4 shadow-brutal brutal-hover cursor-pointer",
          className
        )}
        {...props}
      >
        {isRecommended && (
          <div className="flex items-center gap-1 text-xs font-semibold text-accent mb-2">
            <Sparkles className="w-3 h-3" />
            AI Recommended
          </div>
        )}
        
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-none bg-muted border-2 border-brutal-black flex items-center justify-center overflow-hidden flex-shrink-0">
            {imageUrl ? (
              <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-display font-bold">{name[0]}</span>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate">{name}</h4>
            <p className="text-xs text-muted-foreground truncate">{category}</p>
          </div>
          
          {/* Score */}
          <div className="flex flex-col items-end">
            <div className={cn(
              "px-2 py-1 text-sm font-bold border-2 border-brutal-black",
              matchScore >= 80 ? "bg-secondary text-white" :
              matchScore >= 60 ? "bg-primary text-white" :
              "bg-muted text-foreground"
            )}>
              {matchScore}%
            </div>
          </div>
        </div>
        
        {/* ROI Preview */}
        {predictedROI && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t-2 border-border">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Target className="w-3 h-3" />
              Est. ROI
            </div>
            <span className="font-semibold text-secondary">{predictedROI.toFixed(1)}x</span>
          </div>
        )}
        
        {/* Action hint */}
        <div className="flex items-center justify-end gap-1 mt-2 text-xs text-muted-foreground">
          View Details <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    );
  }
);

MatchCard.displayName = "MatchCard";

/* ========================================
   SmartDiscoveryHeader - Section header
   ======================================== */

export interface SmartDiscoveryHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Title */
  title?: string;
  /** Subtitle */
  subtitle?: string;
}

const SmartDiscoveryHeader = forwardRef<HTMLDivElement, SmartDiscoveryHeaderProps>(
  (
    {
      className,
      title = "Smart Discovery",
      subtitle = "AI-powered matches based on your profile and performance",
      ...props
    },
    ref
  ) => (
    <div ref={ref} className={cn("mb-4", className)} {...props}>
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-5 h-5 text-accent" />
        <h3 className="font-display text-h2 font-bold text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  )
);

SmartDiscoveryHeader.displayName = "SmartDiscoveryHeader";

export { AffinityScore, ROIPredictor, MatchCard, SmartDiscoveryHeader };
