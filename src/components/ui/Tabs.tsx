"use client";

import { useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  children: (activeTab: string) => ReactNode;
  className?: string;
}

export function Tabs({ tabs, defaultTab, children, className, variant = "default" }: TabsProps & { variant?: "default" | "brutal" }) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className={cn(
        "border-b border-border",
        variant === "brutal" && "border-b-4 border-brutal-black bg-card p-2 border-2 shadow-brutal-sm"
      )}>
        <nav className={cn(
          "flex gap-1 overflow-x-auto scrollbar-hide",
          variant === "default" && "-mb-px"
        )} aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all",
                  variant === "default" && "border-b-2",
                  variant === "default" && isActive && "border-primary text-primary",
                  variant === "default" && !isActive && "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
                  variant === "brutal" && "border-2 border-brutal-black mx-1 mb-1 font-display uppercase tracking-wide font-bold",
                  variant === "brutal" && isActive && "bg-primary text-white shadow-brutal-sm translate-x-[-2px] translate-y-[-2px]",
                  variant === "brutal" && !isActive && "bg-secondary/20 hover:bg-secondary/40 text-foreground hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-sm"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn(
                    "ml-1 px-2 py-0.5 text-xs rounded-full border-2 border-brutal-black font-mono",
                    isActive 
                      ? "bg-card text-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className={cn("pt-6", variant === "brutal" && "pt-8")}>
        {children(activeTab)}
      </div>
    </div>
  );
}

// Simple tab panel for pre-defined content
interface TabPanelsProps {
  tabs: Tab[];
  panels: Record<string, ReactNode>;
  defaultTab?: string;
  className?: string;
}

export function TabPanels({ tabs, panels, defaultTab, className }: TabPanelsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className="border-b border-border">
        <nav className="flex gap-1 -mb-px overflow-x-auto scrollbar-hide" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn(
                    "ml-1 px-2 py-0.5 text-xs rounded-full",
                    isActive 
                      ? "bg-primary/20 text-primary" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pt-6">
        {panels[activeTab]}
      </div>
    </div>
  );
}
