"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button, Card, CardContent, Avatar } from "@/components/ui";
import { Skeleton, MessageSkeleton } from "@/components/ui/Skeleton";

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    name: string | null;
    image: string | null;
  };
  lastMessage: string | null;
  lastMessageAt: string | null;
  isCreator: boolean;
  dmPrice: number | null;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  isPaid: boolean;
  price: number | null;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export default function MessagesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv);
    }
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchConversations() {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(convId: string) {
    try {
      const res = await fetch(`/api/messages/${convId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }

  // ... inside MessagesPage component ...

  // Helper to load Razorpay script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;

    setSending(true);
    try {
      const res = await fetch(`/api/messages/${selectedConv}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      if (res.status === 402) {
        // Payment Required
        const data = await res.json();
        const success = await loadRazorpay();
        if (!success) {
          alert("Razorpay SDK failed to load. Are you online?");
          setSending(false);
          return;
        }

        // Create Payment Order
        const orderRes = await fetch(data.paymentUrl || "/api/payments/razorpay/dm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: data.dmPrice, // Amount in paise
            userId: session?.user?.id,
            creatorId: data.creatorId,
            conversationId: selectedConv
          }),
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok) {
          throw new Error(orderData.error || "Failed to create payment order");
        }

        // Open Razorpay Checkout
        const options = {
          key: orderData.key,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "CreatorConnect",
          description: `Unlock DMs with ${data.creatorName}`,
          order_id: orderData.orderId,
          handler: async function (response: any) {
            // Verify Payment
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                type: "dm",
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              // Retry sending the message
              const retryRes = await fetch(`/api/messages/${selectedConv}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newMessage }),
              });

              if (retryRes.ok) {
                const retryData = await retryRes.json();
                setNewMessage("");
                setMessages((prev) => [...prev, retryData.message]);
              } else {
                alert("Payment successful but message failed to send. Please try again.");
              }
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          },
          prefill: {
            name: session?.user?.name,
            email: session?.user?.email,
          },
          theme: {
            color: "#9333ea",
          },
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
        setSending(false); // Reset sending state as we wait for user payment
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setNewMessage("");
        setMessages((prev) => [...prev, data.message]);
      } else {
        console.error("Failed to send message");
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      alert(error.message || "Something went wrong.");
    } finally {
      if (!sending) setSending(false); // Only set if not pending payment
    }
  }



  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-6 w-40 mb-6" />
            <Skeleton className="h-8 w-32 mb-8" />
            <div className="grid md:grid-cols-3 gap-4 h-[600px]">
              <Card className="md:col-span-1">
                <CardContent className="p-0">
                  <MessageSkeleton />
                  <MessageSkeleton />
                  <MessageSkeleton />
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardContent className="p-4">
                  <Skeleton className="h-full w-full min-h-[500px]" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const selectedConversation = conversations.find((c) => c.id === selectedConv);

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-8">Messages</h1>

          <div className="grid md:grid-cols-3 gap-4 h-[600px]">
            {/* Conversations List */}
            <Card className="md:col-span-1 overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y overflow-y-auto max-h-[600px]">
                  {conversations.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No conversations yet</p>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConv(conv.id)}
                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                          selectedConv === conv.id ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={conv.otherUser.image}
                            name={conv.otherUser.name || "User"}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {conv.otherUser.name || "Unknown"}
                            </p>
                            {conv.lastMessage && (
                              <p className="text-sm text-gray-500 truncate">
                                {conv.lastMessage}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Messages View */}
            <Card className="md:col-span-2 flex flex-col overflow-hidden">
              {selectedConv ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b flex items-center gap-3">
                    <Avatar
                      src={selectedConversation?.otherUser.image}
                      name={selectedConversation?.otherUser.name || "User"}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium">
                        {selectedConversation?.otherUser.name}
                      </p>
                      {selectedConversation?.dmPrice && !selectedConversation.isCreator && (
                        <p className="text-xs text-orange-600">
                          ₹{selectedConversation.dmPrice / 100} per message
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => {
                      const isMe = msg.senderId === session.user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              isMe
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p>{msg.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isMe ? "text-blue-200" : "text-gray-400"
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {msg.isPaid && " • Paid"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button type="submit" disabled={sending || !newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </main>
  );
}
