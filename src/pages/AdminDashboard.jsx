import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, FileText, Send, Shield, TrendingUp, CheckCircle,
  AlertCircle, XCircle, Zap, ArrowRight, Loader2, Activity
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ requests: 0, offers: 0, professionals: 0, pendingVerification: 0, greenOffers: 0, yellowOffers: 0, redOffers: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentOffers, setRecentOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [requests, offers, professionals] = await Promise.all([
        base44.entities.CustomerRequest.list("-created_date", 10),
        base44.entities.Offer.list("-created_date", 10),
        base44.entities.ProfessionalProfile.list("-created_date", 100)
      ]);
      setRecentRequests(requests.slice(0, 5));
      setRecentOffers(offers.slice(0, 5));
      setStats({
        requests: requests.length,
        offers: offers.length,
        professionals: professionals.length,
        pendingVerification: professionals.filter(p => p.verification_status === "pending").length,
        greenOffers: offers.filter(o => o.validation_status === "green").length,
        yellowOffers: offers.filter(o => o.validation_status === "yellow").length,
        redOffers: offers.filter(o => o.validation_status === "red").length,
      });
      setLoading(false);
    };
    load();
  }, []);

  const validationData = [
    { name: "Green", value: stats.greenOffers, fill: "#10B981" },
    { name: "Yellow", value: stats.yellowOffers, fill: "#F59E0B" },
    { name: "Red", value: stats.redOffers, fill: "#EF4444" },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform overview and management</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Requests", value: stats.requests, icon: FileText, color: "bg-blue-100 text-blue-600", link: "/admin/requests" },
          { label: "Total Offers", value: stats.offers, icon: Send, color: "bg-green-100 text-green-600", link: "/admin/offers" },
          { label: "Professionals", value: stats.professionals, icon: Shield, color: "bg-purple-100 text-purple-600", link: "/admin/professionals" },
          { label: "Pending Verification", value: stats.pendingVerification, icon: AlertCircle, color: "bg-yellow-100 text-yellow-600", link: "/admin/professionals" },
        ].map((s, i) => (
          <Link to={s.link} key={i}>
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                    <p className="text-3xl font-bold text-foreground">{s.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pending Verification Alert */}
      {stats.pendingVerification > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-yellow-800 text-sm">{stats.pendingVerification} professional{stats.pendingVerification > 1 ? "s" : ""} awaiting verification</p>
            <p className="text-xs text-yellow-700">Review and approve verification documents to activate their profiles.</p>
          </div>
          <Link to="/admin/professionals">
            <Button size="sm" className="bg-yellow-600 text-white hover:bg-yellow-700 text-xs flex-shrink-0">Review</Button>
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* AI Validation Chart */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> AI Validation Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={validationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {validationData.map((d, i) => (
                    <rect key={i} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="border-border shadow-sm">
          <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { to: "/admin/professionals", icon: Shield, label: "Review Verifications", badge: stats.pendingVerification > 0 ? `${stats.pendingVerification} pending` : null, badgeClass: "bg-yellow-100 text-yellow-800" },
              { to: "/admin/requests", icon: FileText, label: "Manage Requests" },
              { to: "/admin/offers", icon: Send, label: "Moderate Offers" },
              { to: "/admin/users", icon: Users, label: "User Management" },
              { to: "/admin/categories", icon: Activity, label: "Category Management" },
            ].map((item, i) => (
              <Link to={item.to} key={i}>
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer">
                  <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground flex-1">{item.label}</span>
                  {item.badge && <Badge className={`text-xs ${item.badgeClass}`}>{item.badge}</Badge>}
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Requests</CardTitle>
            <Link to="/admin/requests"><Button variant="ghost" size="sm" className="text-primary text-xs">View all</Button></Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentRequests.map(r => (
                <div key={r.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-foreground truncate max-w-48">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.city}, {r.province}</p>
                  </div>
                  <Badge className={r.status === "active" ? "bg-green-100 text-green-800" : "bg-secondary text-secondary-foreground"}>
                    {r.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Offers */}
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Offers</CardTitle>
            <Link to="/admin/offers"><Button variant="ghost" size="sm" className="text-primary text-xs">View all</Button></Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentOffers.map(o => (
                <div key={o.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-foreground">${o.price?.toLocaleString()} CAD</p>
                    <p className="text-xs text-muted-foreground">{o.timeline}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {o.overall_score && <span className="text-xs font-bold text-primary">{Math.round(o.overall_score)}/100</span>}
                    <div className={`w-2 h-2 rounded-full ${
                      o.validation_status === "green" ? "bg-green-500" :
                      o.validation_status === "yellow" ? "bg-yellow-500" :
                      o.validation_status === "red" ? "bg-red-500" : "bg-blue-500"}`} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}