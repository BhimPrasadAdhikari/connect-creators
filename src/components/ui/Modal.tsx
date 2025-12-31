"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, variant = "default" }: ModalProps & { variant?: "default" | "brutal" }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    // Reset overflow on navigation/page unload
    const handleBeforeUnload = () => {
      document.body.style.overflow = "";
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      window.addEventListener("beforeunload", handleBeforeUnload);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className={cn(
          "absolute inset-0 transition-opacity",
          variant === "brutal" ? "bg-brutal-black/20 backdrop-blur-md" : "bg-overlay/50 backdrop-blur-sm"
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div 
        className={cn(
          "relative w-full max-w-lg transform text-left transition-all sm:my-8",
          variant === "brutal" 
            ? "bg-card border-4 border-brutal-black shadow-brutal p-8 rounded-none" 
            : "rounded-xl bg-card p-6 shadow-xl"
        )}
        role="dialog" 
        aria-modal="true"
      >
        <div className={cn(
          "flex items-center justify-between mb-6",
          variant === "brutal" && "border-b-4 border-brutal-black pb-4"
        )}>
          <h3 className={cn(
            "text-lg font-bold leading-6",
            variant === "brutal" ? "font-display text-2xl uppercase tracking-tight text-foreground" : "text-foreground"
          )}>
            {title}
          </h3>
          <button
            type="button"
            className={cn(
              "transition-colors",
              variant === "brutal" 
                ? "bg-accent-red text-white border-2 border-brutal-black p-1 hover:bg-red-600 shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none" 
                : "rounded-md bg-card text-muted-foreground hover:text-foreground focus:outline-none"
            )}
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <X className={cn("h-5 w-5", variant === "brutal" && "h-6 w-6")} aria-hidden="true" />
          </button>
        </div>
        
        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>
  );
}

