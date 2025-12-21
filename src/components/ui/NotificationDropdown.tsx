"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, Check, MessageSquare, Heart, CreditCard, Package, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
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
        "absolute -top-1 -right-1 flex items-center justify-center",
        "min-w-[18px] h-[18px] px-1 text-xs font-semibold",
        "bg-red-500 text-white rounded-full",
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

  const iconColors = {
    subscription: "text-pink-500 bg-pink-100",
    message: "text-blue-500 bg-blue-100",
    like: "text-red-500 bg-red-100",
    purchase: "text-green-500 bg-green-100",
    system: "text-gray-500 bg-gray-100",
  };

  const Icon = icons[notification.type];
  const timeAgo = getTimeAgo(notification.createdAt);

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-colors",
        "hover:bg-gray-50",
        !notification.read && "bg-blue-50/50"
      )}
    >
      {notification.avatar ? (
        <Avatar src={notification.avatar} size="sm" />
      ) : (
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", iconColors[notification.type])}>
          <Icon className="w-4 h-4" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm", !notification.read && "font-medium")}>
          {notification.title}
        </p>
        <p className="text-xs text-gray-500 truncate">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
      </div>
      {!notification.read && onMarkRead && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMarkRead(notification.id);
          }}
          className="p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Mark as read"
        >
          <Check className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </div>
  );

  if (notification.href) {
    return (
      <Link href={notification.href} className="block group">
        {content}
      </Link>
    );
  }

  return <div className="group">{content}</div>;
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

  // Close on outside click
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
          "relative p-2 rounded-lg transition-colors min-w-touch min-h-touch flex items-center justify-center",
          isOpen ? "bg-gray-100" : "hover:bg-gray-100"
        )}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5 text-gray-600" />
        <NotificationBadge count={unreadCount} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && onMarkAllRead && (
                <button
                  onClick={onMarkAllRead}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.slice(0, 10).map((notification) => (
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
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <Link
                href="/notifications"
                className="text-sm text-blue-600 hover:underline"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
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
