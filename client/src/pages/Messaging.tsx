import { useState, useRef, useEffect } from "react";
import { Link, useSearch } from "wouter";
import {
  Search, Send, Paperclip, MoreVertical, ArrowLeft,
  Phone, Video, Star, Package, CheckCheck, Check,
  Image, Smile, X, ChevronDown, ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";

type Message = {
  id: number;
  text: string;
  sender: "me" | "them";
  time: string;
  status?: "sent" | "delivered" | "read";
  productRef?: { name: string; price: string; image: string };
};

type Conversation = {
  id: number;
  name: string;
  role: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  productContext?: string;
  messages: Message[];
};

const CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    name: "Kwabena Farms",
    role: "Farmer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    lastMessage: "Yes, we have 50kg available for delivery this week.",
    time: "10:32 AM",
    unread: 2,
    online: true,
    productContext: "Vine Ripened Tomatoes",
    messages: [
      { id: 1, text: "Hello! I'm interested in your Vine Ripened Tomatoes listing.", sender: "me", time: "10:15 AM", status: "read" },
      { id: 2, text: "Hi there! Thanks for reaching out. What quantity are you looking for?", sender: "them", time: "10:18 AM" },
      { id: 3, text: "I need about 50kg for my restaurant. Is that available?", sender: "me", time: "10:20 AM", status: "read" },
      { id: 4, text: "Yes, we have 50kg available for delivery this week.", sender: "them", time: "10:32 AM" },
    ],
  },
  {
    id: 2,
    name: "AgroSupply Africa",
    role: "Input Supplier",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face",
    lastMessage: "The NPK fertilizer is certified organic and safe for all crops.",
    time: "Yesterday",
    unread: 0,
    online: false,
    productContext: "NPK Fertilizer 20-20-20",
    messages: [
      { id: 1, text: "I saw your NPK fertilizer listing. Is it suitable for vegetable farming?", sender: "me", time: "Yesterday 2:00 PM", status: "read" },
      { id: 2, text: "The NPK fertilizer is certified organic and safe for all crops.", sender: "them", time: "Yesterday 2:45 PM" },
    ],
  },
  {
    id: 3,
    name: "Asante Agro Co.",
    role: "Farmer",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
    lastMessage: "We can arrange a farm visit if you'd like to see the yams before ordering.",
    time: "Mon",
    unread: 1,
    online: true,
    productContext: "Large Pona Yam",
    messages: [
      { id: 1, text: "Hi, I'm interested in your Pona Yam. What's the minimum order?", sender: "me", time: "Mon 9:00 AM", status: "read" },
      { id: 2, text: "Minimum order is 10 tubers. We can arrange a farm visit if you'd like to see the yams before ordering.", sender: "them", time: "Mon 11:30 AM" },
    ],
  },
  {
    id: 4,
    name: "TractorHub GH",
    role: "Machinery Dealer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    lastMessage: "The John Deere 5075E is available for lease starting next Monday.",
    time: "Sun",
    unread: 0,
    online: false,
    productContext: "John Deere 5075E Tractor",
    messages: [
      { id: 1, text: "Is the John Deere tractor available for a 2-week lease?", sender: "me", time: "Sun 3:00 PM", status: "read" },
      { id: 2, text: "The John Deere 5075E is available for lease starting next Monday.", sender: "them", time: "Sun 4:15 PM" },
    ],
  },
  {
    id: 5,
    name: "Green Valley Farm",
    role: "Farmer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    lastMessage: "Our carrots are harvested fresh every Tuesday and Friday.",
    time: "Last week",
    unread: 0,
    online: false,
    productContext: "Organic Baby Carrots",
    messages: [
      { id: 1, text: "When are your organic carrots usually harvested?", sender: "me", time: "Last week", status: "read" },
      { id: 2, text: "Our carrots are harvested fresh every Tuesday and Friday.", sender: "them", time: "Last week" },
    ],
  },
];

const ROLE_COLORS: Record<string, string> = {
  Farmer: "bg-green-100 text-green-700",
  "Input Supplier": "bg-blue-100 text-blue-700",
  "Machinery Dealer": "bg-purple-100 text-purple-700",
  Logistics: "bg-teal-100 text-teal-700",
  Storage: "bg-orange-100 text-orange-700",
};

export default function Messaging() {
  const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS);
  const [activeId, setActiveId] = useState<number>(1);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId)!;
  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.productContext || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages]);

  function sendMessage() {
    const text = inputText.trim();
    if (!text) return;
    const newMsg: Message = {
      id: Date.now(),
      text,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: text, time: "Just now", unread: 0 }
          : c
      )
    );
    setInputText("");

    // Simulate reply after 1.5s
    setTimeout(() => {
      const replies = [
        "Thank you for your message! I'll get back to you shortly.",
        "Sure, let me check our current stock and confirm.",
        "Great question! We can discuss the details further.",
        "I'll have that information ready for you soon.",
        "Thanks! We appreciate your interest in our products.",
      ];
      const reply: Message = {
        id: Date.now() + 1,
        text: replies[Math.floor(Math.random() * replies.length)],
        sender: "them",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? { ...c, messages: [...c.messages, reply], lastMessage: reply.text, time: "Just now" }
            : c
        )
      );
    }, 1500);
  }

  function selectConversation(id: number) {
    setActiveId(id);
    setMobileView("chat");
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNavbar />

      <div className="flex-1 flex flex-col">
        {/* Page Header */}
        <div className="bg-white border-b px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/buyer">
                <Button variant="ghost" size="sm" className="gap-1 text-gray-500">
                  <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Button>
              </Link>
              <div className="h-5 w-px bg-gray-200" />
              <h1 className="font-semibold text-gray-900">Messages</h1>
              {totalUnread > 0 && (
                <Badge className="bg-orange-500 text-white text-xs px-2 py-0.5">{totalUnread}</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Messaging Layout */}
        <div className="flex-1 max-w-7xl mx-auto w-full flex" style={{ height: "calc(100vh - 130px)" }}>

          {/* Conversation List */}
          <div className={`w-full md:w-80 lg:w-96 border-r bg-white flex flex-col flex-shrink-0 ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}>
            {/* Search */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-9 bg-gray-50 border-0 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No conversations found</div>
              ) : (
                filtered.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv.id)}
                    className={`w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left ${conv.id === activeId ? "bg-orange-50 border-l-2 border-l-orange-500" : ""}`}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-11 h-11">
                        <AvatarImage src={conv.avatar} />
                        <AvatarFallback>{conv.name[0]}</AvatarFallback>
                      </Avatar>
                      {conv.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-medium text-sm text-gray-900 truncate">{conv.name}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{conv.time}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${ROLE_COLORS[conv.role] || "bg-gray-100 text-gray-600"}`}>
                          {conv.role}
                        </span>
                        {conv.productContext && (
                          <span className="text-xs text-gray-400 truncate flex items-center gap-1">
                            <Package className="w-3 h-3" /> {conv.productContext}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                        {conv.unread > 0 && (
                          <span className="flex-shrink-0 ml-2 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Thread */}
          {active && (
            <div className={`flex-1 flex flex-col bg-white ${mobileView === "list" ? "hidden md:flex" : "flex"}`}>
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileView("list")}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={active.avatar} />
                    <AvatarFallback>{active.name[0]}</AvatarFallback>
                  </Avatar>
                  {active.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-gray-900 text-sm">{active.name}</h2>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${ROLE_COLORS[active.role] || "bg-gray-100 text-gray-600"}`}>
                      {active.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {active.online ? "Online now" : "Last seen recently"}
                    {active.productContext && ` · Re: ${active.productContext}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:text-orange-500" onClick={() => toast.info("Voice call feature coming soon")}>
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:text-orange-500" onClick={() => toast.info("Video call feature coming soon")}>
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-500">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Product Context Banner */}
              {active.productContext && (
                <div className="flex items-center gap-3 px-4 py-2 bg-orange-50 border-b border-orange-100">
                  <Package className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span className="text-xs text-orange-700 font-medium">
                    Enquiry about: <span className="font-semibold">{active.productContext}</span>
                  </span>
                  <Link href="/marketplace" className="ml-auto text-xs text-orange-500 hover:underline flex items-center gap-1">
                    <ShoppingCart className="w-3 h-3" /> View Product
                  </Link>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {/* Date separator */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 px-2">Today</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {active.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"} items-end gap-2`}
                  >
                    {msg.sender === "them" && (
                      <Avatar className="w-7 h-7 flex-shrink-0">
                        <AvatarImage src={active.avatar} />
                        <AvatarFallback>{active.name[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[70%] ${msg.sender === "me" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      {msg.productRef && (
                        <div className="bg-white border rounded-xl p-3 flex items-center gap-3 mb-1 shadow-sm">
                          <img src={msg.productRef.image} alt={msg.productRef.name} className="w-12 h-12 rounded-lg object-cover" />
                          <div>
                            <p className="text-xs font-semibold text-gray-800">{msg.productRef.name}</p>
                            <p className="text-xs text-orange-500 font-bold">{msg.productRef.price}</p>
                          </div>
                        </div>
                      )}
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.sender === "me"
                            ? "bg-orange-500 text-white rounded-br-sm"
                            : "bg-white text-gray-800 shadow-sm rounded-bl-sm border border-gray-100"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <div className={`flex items-center gap-1 ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                        <span className="text-xs text-gray-400">{msg.time}</span>
                        {msg.sender === "me" && msg.status && (
                          msg.status === "read"
                            ? <CheckCheck className="w-3 h-3 text-blue-500" />
                            : msg.status === "delivered"
                            ? <CheckCheck className="w-3 h-3 text-gray-400" />
                            : <Check className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-3 border-t bg-white">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-orange-500 flex-shrink-0" onClick={() => toast.info("File attachment coming soon")}>
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-orange-500 flex-shrink-0" onClick={() => toast.info("Image sharing coming soon")}>
                    <Image className="w-4 h-4" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      className="pr-10 bg-gray-50 border-gray-200 rounded-full text-sm"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 w-7 h-7"
                      onClick={() => toast.info("Emoji picker coming soon")}
                    >
                      <Smile className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    size="icon"
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-full flex-shrink-0"
                    onClick={sendMessage}
                    disabled={!inputText.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
