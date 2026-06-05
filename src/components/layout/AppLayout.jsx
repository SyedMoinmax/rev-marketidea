import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Zap, LayoutDashboard, FileText, Send, MessageSquare,
  Bell, User, Settings, LogOut, Menu, X, ChevronDown,
  Shield, Star, BarChart2, Users
} from "lucide-react";
import { Outlet } from "react-router-dom";

const navLinks = {
  customer: [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/requests", icon: FileText, label: "My Requests" },
    { to: "/offers", icon: Send, label: "Offers Received" },
    { to: "/messages", icon: MessageSquare, label: "Messages" },
  ],
  professional: [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/browse-requests", icon: FileText, label: "Browse Requests" },
    { to: "/my-offers", icon: Send, label: "My Offers" },
    { to: "/messages", icon: MessageSquare, label: "Messages" },
    { to: "/analytics", icon: BarChart2, label: "Analytics" },
  ],
  admin: [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/users", icon: Users, label: "Users" },
    { to: "/admin/professionals", icon: Shield, label: "Professionals" },
    { to: "/admin/requests", icon: FileText, label: "Requests" },
    { to: "/admin/offers", icon: Send, label: "Offers" },
    { to: "/admin/categories", icon: Star, label: "Categories" },
  ]
};

export default function AppLayout() {
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    base44.entities.Notification.filter({ is_read: false }, "-created_date", 10)
      .then(setNotifications).catch(() => {});
  }, []);

  const role = user?.role || "customer";
  const links = navLinks[role] || navLinks.customer;

  const handleLogout = () => {
    base44.auth.logout("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:inset-auto`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center gap-3 px-5 border-b border-sidebar-border">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-sidebar-foreground">Reverse Marketplace</span>
            <Button variant="ghost" size="icon" className="ml-auto lg:hidden text-sidebar-foreground" onClick={() => setMobileOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Role badge */}
          <div className="px-5 py-3 border-b border-sidebar-border">
            <Badge className="bg-primary/20 text-sidebar-primary border-0 capitalize text-xs">{role}</Badge>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {links.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"}`}>
                  <link.icon className="w-4 h-4 flex-shrink-0" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="p-4 border-t border-sidebar-border">
            <Link to="/profile">
              <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors cursor-pointer">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-white text-xs font-semibold">
                    {user?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-sidebar-foreground truncate">{user?.full_name || "User"}</div>
                  <div className="text-xs text-sidebar-foreground/50 truncate">{user?.email || ""}</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-card border-b border-border flex items-center gap-4 px-4 sm:px-6 sticky top-0 z-30">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-destructive rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                      {notifications.length > 9 ? "9+" : notifications.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-4 py-3 border-b border-border">
                  <p className="font-semibold text-foreground">Notifications</p>
                </div>
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-muted-foreground text-sm">No new notifications</div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <DropdownMenuItem key={n.id} className="px-4 py-3 cursor-pointer">
                      <div>
                        <div className="font-medium text-sm text-foreground">{n.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{n.message}</div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
                <DropdownMenuSeparator />
                <Link to="/notifications">
                  <DropdownMenuItem className="text-center text-primary text-sm font-medium">View all notifications</DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="bg-primary text-white text-xs font-semibold">
                      {user?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <Link to="/profile"><DropdownMenuItem><User className="w-4 h-4 mr-2" /> Profile</DropdownMenuItem></Link>
                <Link to="/settings"><DropdownMenuItem><Settings className="w-4 h-4 mr-2" /> Settings</DropdownMenuItem></Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive"><LogOut className="w-4 h-4 mr-2" /> Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}