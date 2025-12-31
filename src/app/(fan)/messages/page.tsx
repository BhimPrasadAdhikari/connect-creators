"use client";

import { useState } from "react";
import { Search, Send, MoreVertical, Phone, Video, Image as ImageIcon, Paperclip, ArrowLeft } from "lucide-react";
import { Button, Input, Card, CardContent } from "@/components/ui";

// Mock Data
const MOCK_CONVERSATIONS = [
  {
    id: "1",
    creator: {
      name: "Sarah Jenkins",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      isOnline: true,
    },
    lastMessage: "Thanks for subscribing! Let me know if you have any questions.",
    timestamp: "10:30 AM",
    unread: 2,
  },
  {
    id: "2",
    creator: {
      name: "Mike Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
      isOnline: false,
    },
    lastMessage: "New exclusive content dropping tomorrow!",
    timestamp: "Yesterday",
    unread: 0,
  },
  {
    id: "3",
    creator: {
      name: "Art By Anna",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anna",
      isOnline: true,
    },
    lastMessage: "Did you like the latest tutorial?",
    timestamp: "Dec 12",
    unread: 0,
  },
];

const MOCK_MESSAGES = [
  {
    id: "1",
    senderId: "creator",
    text: "Hey! Thanks so much for joining my inner circle.",
    timestamp: "10:28 AM",
  },
  {
    id: "2",
    senderId: "creator",
    text: "I'll be posting daily updates here.",
    timestamp: "10:29 AM",
  },
  {
    id: "3",
    senderId: "me",
    text: "Hi Sarah! Really excited to be here. Love your work!",
    timestamp: "10:30 AM",
  },
  {
    id: "4",
    senderId: "creator",
    text: "Thanks for subscribing! Let me know if you have any questions.",
    timestamp: "10:30 AM",
  },
];

export default function MessagesPage() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");

  const activeConversation = MOCK_CONVERSATIONS.find(c => c.id === activeConversationId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    // Handle send logic
    setMessageInput("");
  };

  return (
    <div className="h-[calc(100vh-6rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <Card variant="brutal" className="h-full flex flex-col overflow-hidden bg-card">
        <div className="flex flex-1 h-full overflow-hidden">
          {/* Conversation List Sidebar */}
          <div className={`
            w-full md:w-80 lg:w-96 border-r-2 border-brutal-black flex flex-col bg-secondary/5
            ${activeConversationId ? 'hidden md:flex' : 'flex'}
          `}>
            {/* Sidebar Header */}
            <div className="p-4 border-b-2 border-brutal-black bg-card">
              <h1 className="font-display text-2xl font-bold uppercase mb-4">Messages</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text"
                  placeholder="Search messages..."
                  className="w-full pl-10 pr-4 py-2 bg-card border-2 border-brutal-black focus:outline-none focus:shadow-brutal-sm transition-all font-mono text-sm"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {MOCK_CONVERSATIONS.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`w-full p-4 flex items-start gap-3 border-b-2 border-brutal-black/10 hover:bg-secondary/10 transition-colors text-left
                    ${activeConversationId === conv.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}
                  `}
                >
                  <div className="relative shrink-0">
                    <img 
                      src={conv.creator.avatar} 
                      alt={conv.creator.name}
                      className="w-12 h-12 rounded-full border-2 border-brutal-black bg-card" 
                    />
                    {conv.creator.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-accent-green border-2 border-brutal-black rounded-full"></span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-display font-bold truncate">{conv.creator.name}</span>
                      <span className="font-mono text-xs text-muted-foreground whitespace-nowrap ml-2">{conv.timestamp}</span>
                    </div>
                    <p className={`text-sm truncate font-mono ${conv.unread > 0 ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                      {conv.lastMessage}
                    </p>
                  </div>

                  {conv.unread > 0 && (
                    <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 border-2 border-brutal-black min-w-[20px] text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {conv.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`
            flex-1 flex flex-col bg-card
            ${!activeConversationId ? 'hidden md:flex' : 'flex'}
          `}>
            {activeConversationId ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b-2 border-brutal-black flex items-center justify-between bg-card shrink-0">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setActiveConversationId(null)}
                      className="md:hidden p-2 hover:bg-secondary/20 rounded-full border-2 border-transparent hover:border-brutal-black transition-all"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="relative">
                      <img 
                        src={activeConversation?.creator.avatar} 
                        alt={activeConversation?.creator.name}
                        className="w-10 h-10 rounded-full border-2 border-brutal-black bg-secondary/20" 
                      />
                      {activeConversation?.creator.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-accent-green border-2 border-brutal-black rounded-full"></span>
                      )}
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-lg">{activeConversation?.creator.name}</h2>
                      {activeConversation?.creator.isOnline && (
                        <p className="text-xs font-mono text-accent-green font-bold uppercase">Online</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="hidden sm:flex border-2 border-transparent hover:border-brutal-black">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="hidden sm:flex border-2 border-transparent hover:border-brutal-black">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="border-2 border-transparent hover:border-brutal-black">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/5">
                   <div className="flex justify-center my-4">
                      <span className="bg-card border-2 border-brutal-black px-3 py-1 text-xs font-mono font-bold text-muted-foreground shadow-brutal-sm">
                        Today
                      </span>
                   </div>
                   
                   {MOCK_MESSAGES.map((msg) => (
                     <div 
                       key={msg.id} 
                       className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                     >
                       <div 
                         className={`
                           max-w-[80%] sm:max-w-[70%] p-4 border-2 border-brutal-black shadow-brutal-sm relative
                           ${msg.senderId === 'me' 
                             ? 'bg-primary text-white rounded-tr-none' 
                             : 'bg-card text-foreground rounded-tl-none'
                           }
                         `}
                       >
                         <p className="font-medium text-sm leading-relaxed">{msg.text}</p>
                         <span className={`
                           text-[10px] font-mono font-bold mt-2 block opacity-70
                           ${msg.senderId === 'me' ? 'text-right' : 'text-left'}
                         `}>
                           {msg.timestamp}
                         </span>
                       </div>
                     </div>
                   ))}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t-2 border-brutal-black bg-card shrink-0">
                  <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                    <Button type="button" variant="ghost" className="border-2 border-brutal-black p-2 h-12 w-12 shrink-0 hover:bg-secondary/20">
                       <Paperclip className="w-5 h-5" />
                    </Button>
                    <div className="flex-1 relative">
                       <Input 
                         variant="brutal" 
                         placeholder="Type a message..." 
                         value={messageInput}
                         onChange={(e) => setMessageInput(e.target.value)}
                         className="pr-10"
                         containerClassName="mb-0"
                       />
                       <button 
                         type="button"
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                         <ImageIcon className="w-5 h-5" />
                       </button>
                    </div>
                    <Button 
                      type="submit" 
                      variant="brutal" 
                      className={`h-12 w-12 p-0 flex items-center justify-center ${!messageInput.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!messageInput.trim()}
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-secondary/5">
                <div className="w-24 h-24 bg-card border-2 border-brutal-black rounded-full flex items-center justify-center mb-6 shadow-brutal">
                  <Send className="w-10 h-10 text-primary" />
                </div>
                <h2 className="font-display text-3xl font-bold uppercase mb-2">Your Messages</h2>
                <p className="font-mono text-muted-foreground max-w-md">
                  Select a conversation from the list to start chatting with your favorite creators.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
