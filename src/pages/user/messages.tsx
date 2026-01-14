import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Send, Search, MessageSquare } from "lucide-react";
import { formatDistance } from "date-fns";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
  senderName?: string;
  senderAvatar?: string;
}

interface Provider {
  id: string;
  name: string;
  email: string;
  avatar: string;
  service_title: string;
}

const Messages = () => {
  // State
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const { user } = useAuth();
  const userId = user?.id;
  const scrollRef = useRef<HTMLDivElement>(null);
  const Backend_URL =
    import.meta.env.VITE_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Fetch Potential Conversation Partners (Providers from Bookings)
  useEffect(() => {
    if (!userId) return;

    const fetchConversations = async () => {
      try {
        const res = await axios.get(
          `${Backend_URL}/api/messages/conversations`,
          {
            params: { userId },
          }
        );

        if (res.data.success) {
          setProviders(res.data.providers);
        }

      } catch (err) {
        console.error("Error fetching conversations:", err);
      }
    };

    fetchConversations();
  }, [userId]);

  // Listen to Real-time Messages for Selected Conversation
  useEffect(() => {
    if (!selectedConversation || !userId) return;

    const participants = [userId, selectedConversation].sort();
    const conversationId = `${participants[0]}_${participants[1]}`;

    const q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("createdAt", "asc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          senderId: data.senderId,
          receiverId: data.receiverId,
          content: data.content,
          timestamp: data.createdAt?.toDate() || new Date(),
          read: data.read || false,
          // senderName and Avatar could be enriched here or on UI side
          senderName: data.senderId === userId ? "You" : "Provider", // simplified
        } as Message;
      });
      setMessages(msgs);
    });

    return () => unsubscribe();

  }, [selectedConversation, userId]);


  // Send a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation || !userId) return;

    try {
      await axios.post(`${Backend_URL}/api/messages/send`, {
        senderId: userId,
        receiverId: selectedConversation,
        content: messageText,
        senderName: user?.name || "User" // Send user name for notification
      });

      setMessageText("");
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };


  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Messages </h1>
        <p className="text-muted-foreground mt-1">
          Chat with service providers and manage conversations
        </p>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Conversations</CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-10" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {providers.length > 0 ? (
              providers.map((provider) => (
                <div
                  key={provider.id}
                  onClick={() => setSelectedConversation(provider.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedConversation === provider.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={provider.avatar}
                      alt={provider.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base text-foreground truncate">
                        {provider.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {provider.email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {provider.service_title}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                No conversations yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="md:col-span-2 flex flex-col">
          <CardHeader className="border-b border-border pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedConversation ? (
                  <>
                    <img
                      src={
                        providers.find((p) => p.id === selectedConversation)
                          ?.avatar || "https://avatar.vercel.sh/default"
                      }
                      alt="Provider"
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-foreground">
                        {
                          providers.find((p) => p.id === selectedConversation)
                            ?.name
                        }
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">Select a chat</p>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length > 0 ? (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.senderId === userId ? "flex-row-reverse" : ""
                    }`}
                >
                  <img
                    src={msg.senderId === userId ? (user?.avatar || "https://avatar.vercel.sh/you") : (providers.find(p => p.id === msg.senderId)?.avatar || "https://avatar.vercel.sh/provider")}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div
                    className={`flex-1 ${msg.senderId === userId ? "flex flex-col items-end" : ""
                      }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-lg max-w-xs ${msg.senderId === userId
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                        }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistance(msg.timestamp, new Date(), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <p className="text-muted-foreground">
                  No messages yet. Start a conversation!
                </p>
              </div>
            )}
            <div ref={scrollRef} />
          </CardContent>

          {/* Input */}
          <div className="border-t border-border p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <Button size="icon" type="submit">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>

      {/* Tip */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <MessageSquare className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Pro Tip:</span>{" "}
              Use clear and concise messages to communicate with providers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;
