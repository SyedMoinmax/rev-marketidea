import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, MessageSquare, Paperclip, Image } from "lucide-react";

export default function Messages() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me().catch(() => null);
      setUser(u);
      if (u) {
        const isPro = u.role === "professional";
        const convs = isPro
          ? await base44.entities.ChatConversation.filter({ professional_user_id: u.id }, "-last_message_at", 50)
          : await base44.entities.ChatConversation.filter({ customer_id: u.id }, "-last_message_at", 50);
        setConversations(convs);
        if (convs.length > 0) {
          setSelectedConv(convs[0]);
          loadMessages(convs[0].id);
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedConv) return;
    const unsub = base44.entities.ChatMessage.subscribe((event) => {
      if (event.data?.conversation_id === selectedConv.id) {
        if (event.type === "create") setMessages(prev => [...prev, event.data]);
      }
    });
    return unsub;
  }, [selectedConv?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async (convId) => {
    const msgs = await base44.entities.ChatMessage.filter({ conversation_id: convId }, "created_date", 100);
    setMessages(msgs);
  };

  const selectConversation = (conv) => {
    setSelectedConv(conv);
    loadMessages(conv.id);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv || sending) return;
    setSending(true);
    const isPro = user.role === "professional";
    const msg = await base44.entities.ChatMessage.create({
      conversation_id: selectedConv.id,
      sender_id: user.id,
      sender_role: isPro ? "professional" : "customer",
      content: newMessage.trim(),
      type: "text"
    });
    await base44.entities.ChatConversation.update(selectedConv.id, {
      last_message: newMessage.trim(),
      last_message_at: new Date().toISOString()
    });
    setMessages(prev => [...prev, msg]);
    setNewMessage("");
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Conversations List */}
      <div className={`w-full sm:w-80 border-r border-border bg-card flex flex-col ${selectedConv ? "hidden sm:flex" : "flex"}`}>
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Messages</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{conversations.length} conversations</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
            </div>
          ) : (
            conversations.map(conv => (
              <button key={conv.id} onClick={() => selectConversation(conv)}
                className={`w-full text-left px-4 py-3 border-b border-border hover:bg-secondary/30 transition-colors ${selectedConv?.id === conv.id ? "bg-accent" : ""}`}>
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-foreground truncate">
                        {user.role === "professional" ? "Customer" : "Professional"}
                      </p>
                      {(user.role === "customer" ? conv.customer_unread : conv.professional_unread) > 0 && (
                        <Badge className="bg-primary text-white text-xs w-5 h-5 p-0 flex items-center justify-center rounded-full">
                          {user.role === "customer" ? conv.customer_unread : conv.professional_unread}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.last_message || "Start a conversation"}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConv ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <div className="h-14 px-4 border-b border-border flex items-center gap-3 bg-card">
            <button className="sm:hidden text-primary text-sm" onClick={() => setSelectedConv(null)}>← Back</button>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">U</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm text-foreground">{user.role === "professional" ? "Customer" : "Professional"}</p>
              <p className="text-xs text-green-500">Active</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Start the conversation</p>
              </div>
            )}
            {messages.map(msg => {
              const isMe = msg.sender_id === user.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs sm:max-w-sm lg:max-w-md px-4 py-2.5 rounded-2xl text-sm
                    ${isMe ? "bg-primary text-white rounded-tr-sm" : "bg-card border border-border text-foreground rounded-tl-sm"}`}>
                    {msg.content}
                    <div className={`text-xs mt-1 ${isMe ? "text-blue-100" : "text-muted-foreground"}`}>
                      {new Date(msg.created_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {isMe && <span className="ml-1">{msg.is_read ? "✓✓" : "✓"}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button onClick={sendMessage} className="bg-primary text-white px-3" disabled={!newMessage.trim() || sending}>
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden sm:flex flex-1 items-center justify-center bg-secondary/20">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Select a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}