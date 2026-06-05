import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, CheckCheck, Loader2, FileText, Send, MessageSquare, 
  Star, Shield, AlertCircle, Zap, Info
} from "lucide-react";

const NOTIFICATION_ICONS = {
  new_request: FileText,
  new_offer: Send,
  offer_approved: Zap,
  offer_rejected: AlertCircle,
  offer_accepted: CheckCheck,
  chat_message: MessageSquare,
  review_received: Star,
  verification_approved: Shield,
  verification_rejected: AlertCircle,
  system: Info,
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me().catch(() => null);
      setUser(u);
      if (u) {
        const data = await base44.entities.Notification.filter({ user_id: u.id }, "-created_date", 100);
        setNotifications(data);
      }
      setLoading(false);
    };
    load();
  }, []);

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const markRead = async (id) => {
    await base44.entities.Notification.update(id, { is_read: true });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Notifications {unreadCount > 0 && <Badge className="bg-primary text-white">{unreadCount}</Badge>}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{notifications.length} total notifications</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllRead} className="text-sm">
            <CheckCheck className="w-4 h-4 mr-2" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No notifications</h3>
          <p className="text-muted-foreground">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const Icon = NOTIFICATION_ICONS[n.type] || Bell;
            return (
              <Card key={n.id} className={`border-border shadow-sm cursor-pointer transition-all hover:shadow-md ${!n.is_read ? "border-primary/30 bg-accent/20" : ""}`}
                onClick={() => !n.is_read && markRead(n.id)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${!n.is_read ? "bg-primary/10" : "bg-secondary"}`}>
                      <Icon className={`w-4 h-4 ${!n.is_read ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold ${!n.is_read ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                        {!n.is_read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {new Date(n.created_date).toLocaleString("en-CA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}