"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, Button, Badge } from "@/components/ui";
import { 
  Heart, 
  MessageSquare, 
  Package, 
  Check, 
  Bell, 
  Clock, 
  MoreHorizontal 
} from "lucide-react";

// Mock data based on user image
const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: "subscriber",
    title: "New Subscriber!",
    message: "Someone subscribed to your Fan tier",
    time: "6m ago",
    read: false,
    icon: Heart,
    color: "bg-accent-pink",
    textColor: "text-accent-pink"
  },
  {
    id: 2,
    type: "message",
    title: "New Message",
    message: "You have a new message from a fan",
    time: "31m ago",
    read: false,
    icon: MessageSquare,
    color: "bg-accent-blue",
    textColor: "text-accent-blue"
  },
  {
    id: 3,
    type: "product",
    title: "Product Sold!",
    message: "Your preset pack was purchased",
    time: "2h ago",
    read: false,
    icon: Package,
    color: "bg-accent-green",
    textColor: "text-accent-green"
  },
  {
    id: 4,
    type: "system",
    title: "Welcome to CreatorConnect",
    message: "Thanks for joining! Set up your profile to get started.",
    time: "1d ago",
    read: true,
    icon: Bell,
    color: "bg-accent-yellow",
    textColor: "text-accent-yellow"
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <Header />

      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8 border-b-4 border-brutal-black pb-4">
            <h1 className="text-3xl sm:text-4xl font-black font-display uppercase tracking-tight flex items-center gap-3">
              <Bell className="w-8 h-8 sm:w-10 sm:h-10 text-brutal-black" strokeWidth={3} />
              Notifications
            </h1>
            <Button 
              onClick={markAllRead}
              variant="brutal" 
              size="sm"
              className="bg-card text-brutal-black hover:bg-brutal-black hover:text-brutal-white text-xs sm:text-sm font-bold font-mono uppercase"
            >
              Mark all read
            </Button>
          </div>

          {/* List */}
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`group relative bg-card border-2 border-brutal-black shadow-brutal-sm hover:shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer overflow-hidden ${notification.read ? 'opacity-80' : 'bg-secondary/5'}`}
                >
                  {/* Unread Indicator */}
                  {!notification.read && (
                    <div className="absolute top-0 right-0 w-4 h-4 bg-accent-red border-l-2 border-b-2 border-brutal-black z-10" />
                  )}

                  <div className="p-4 sm:p-5 flex items-start gap-4">
                    {/* Icon Box */}
                    <div className={`flex-shrink-0 w-12 h-12 ${notification.read ? 'bg-gray-100' : notification.color + '/20'} border-2 border-brutal-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                      <notification.icon className={`w-6 h-6 ${notification.read ? 'text-gray-400' : notification.textColor}`} strokeWidth={2.5} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`text-lg font-black font-display uppercase leading-none mb-1 ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs font-bold font-mono text-muted-foreground flex-shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {notification.time}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base font-medium font-mono text-muted-foreground leading-snug">
                        {notification.message}
                      </p>
                    </div>

                    {/* Action (Check if read, or arrow) */}
                    <div className="flex-shrink-0 self-center">
                       {notification.read ? (
                         <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-5 h-5 text-brutal-black/50" />
                         </div>
                       ) : (
                         <div className="w-8 h-8 rounded-full border-2 border-brutal-black bg-card flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                           <Check className="w-4 h-4 text-brutal-black" strokeWidth={3} />
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-card border-2 border-brutal-black border-dashed">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-xl font-bold font-mono text-muted-foreground uppercase">No notifications</p>
              </div>
            )}
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
