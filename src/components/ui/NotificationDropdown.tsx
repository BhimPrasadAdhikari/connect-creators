"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, Check, MessageSquare, Heart, Package, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "./Avatar";

export interface Notification {
  id: string;
  type: "subscription" | "message" | "like" | "purchase" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  href?: string;
  avatar?: string;
}

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export function NotificationBadge({ count, className }: NotificationBadgeProps) {
  if (count === 0) return null;

  return (
    <span
      className={cn(
        "absolute -top-2 -right-2 flex items-center justify-center",
        "min-w-[20px] h-[20px] px-1 text-xs font-bold font-mono",
        "bg-red-500 text-white border-2 border-brutal-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead?: (id: string) => void;
}

function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const icons = {
    subscription: Heart,
    message: MessageSquare,
    like: Heart,
    purchase: Package,
    system: Bell,
  };

  const itemStyles = {
    subscription: { bg: "bg-accent-pink/10", iconBg: "bg-accent-pink", text: "text-accent-pink" },
    message: { bg: "bg-accent-blue/10", iconBg: "bg-accent-blue", text: "text-accent-blue" },
    like: { bg: "bg-accent-red/10", iconBg: "bg-accent-red", text: "text-accent-red" },
    purchase: { bg: "bg-accent-green/10", iconBg: "bg-accent-green", text: "text-accent-green" },
    system: { bg: "bg-accent-yellow/10", iconBg: "bg-accent-yellow", text: "text-accent-yellow" },
  };

  const style = itemStyles[notification.type] || itemStyles.system;
  const Icon = icons[notification.type];
  const timeAgo = getTimeAgo(notification.createdAt);

  const content = (
    <div
      className={cn(
        "relative flex items-start gap-4 p-4 transition-colors border-b-2 border-brutal-black group/item",
        "hover:bg-secondary/5 bg-card",
        !notification.read && "bg-secondary/5"
      )}
    >
      {!notification.read && (
         <div className="absolute top-0 right-0 w-3 h-3 bg-accent-red border-l-2 border-b-2 border-brutal-black" />
      )}

      {notification.avatar ? (
        <div className="border-2 border-brutal-black flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
           <Avatar src={notification.avatar} size="sm" />
        </div>
      ) : (
        <div className={cn("w-10 h-10 border-2 border-brutal-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]", style.iconBg)}>
          <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
            <p className={cn("text-base font-black font-display uppercase leading-none mb-1", !notification.read ? "text-foreground" : "text-foreground/60")}>
            {notification.title}
            </p>
            {onMarkRead && !notification.read && (
                <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onMarkRead(notification.id);
                }}
                className="opacity-0 group-hover/item:opacity-100 p-0.5 hover:bg-black/10 transition-all rounded-sm"
                title="Mark as read"
                >
                <Check className="w-4 h-4 text-brutal-black" />
                </button>
            )}
        </div>
        <p className="text-sm font-medium font-mono text-muted-foreground leading-snug mb-1">{notification.message}</p>
        <p className="text-xs font-bold font-mono text-muted-foreground/60 flex items-center gap-1 uppercase">
            <Clock className="w-3 h-3" /> {timeAgo}
        </p>
      </div>
    </div>
  );

  if (notification.href) {
    return (
      <Link href={notification.href} className="block">
        {content}
      </Link>
    );
  }

  return <div>{content}</div>;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  className?: string;
}

export function NotificationDropdown({
  notifications,
  onMarkRead,
  onMarkAllRead,
  className,
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative w-10 h-10 flex items-center justify-center border-3 border-brutal-black transition-all bg-yellow-400 shadow-brutal-sm",
          isOpen ? "translate-x-[2px] translate-y-[2px] shadow-none bg-secondary/10" : "hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal hover:bg-secondary/10"
        )}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5 text-foreground" strokeWidth={2.5} />
        <NotificationBadge count={unreadCount} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-card border-3 border-brutal-black shadow-brutal z-[60] animate-in fade-in zoom-in-95 duration-100 origin-top-right">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b-2 border-brutal-black bg-primary">
            <h3 className="font-black font-display uppercase text-white tracking-wide text-lg flex items-center gap-2">
                <Bell className="w-5 h-5" /> Notifications
            </h3>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && onMarkAllRead && (
                <button
                  onClick={onMarkAllRead}
                  className="text-xs font-bold font-mono text-white/90 hover:text-white uppercase hover:underline"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-card/20 rounded p-0.5 transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar bg-card">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-2 border-brutal-black bg-secondary/10 flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Bell className="w-8 h-8 opacity-50 text-foreground" />
                </div>
                <p className="font-bold font-mono uppercase text-sm text-foreground/50">No notifications yet</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.slice(0, 5).map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={onMarkRead}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t-2 border-brutal-black bg-secondary/5 hover:bg-secondary/10 transition-colors">
            <Link
              href="/notifications"
              className="group flex items-center justify-center gap-2 w-full py-2 text-sm font-black font-display uppercase tracking-widest text-foreground hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
              <span className="bg-brutal-black text-brutal-white px-1 text-[10px] group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function for time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
}
