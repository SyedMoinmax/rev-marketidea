import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, FileText, Send, Shield, TrendingUp, CheckCircle,
  AlertCircle, Zap, ArrowRight, Loader2, Activity, Clock,
  UserCheck, XCircle, Eye, ChevronRight
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line, Legend
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import ProfessionalApprovalPanel from "@/components/admin/ProfessionalApprovalPanel";

// Animated counter
function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const start = useRef(0);
  useEffect(() => {
    start.current = 0;
    const step = (ts) => {
      if (!start.current) start.current = ts;
      const progress = Math.min((ts - start.current) / duration, 1);
      setDisplay(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);
  return <span>{display}</span>;
}

// Pulse dot
const PulseDot = ({ color = "bg-green-500" }) => (
  <span className="relative flex h-2.5 w-2.5">
    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-60`} />
    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`} />
  </span>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({ requests: 0, offers: 0, professionals: 0, pendingProfiles: 0, greenOffers: 0, yellowOffers: 0, redOffers: 0 });
  const [requestTrend, setRequestTrend] = useState([]);
  const [offerTrend, setOfferTrend] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [pendingProfiles, setPendingProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const load = async () => {
      const [requests, offers, professionals] = await Promise.all([
        base44.entities.CustomerRequest.list("-created_date", 100),
        base44.entities.Offer.list("-created_date", 100),
        base44.entities.ProfessionalProfile.list("-created_date", 100)
      ]);

      // Build last-7-days trend data
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().slice(0, 10);
      });

      setRequestTrend(days.map(day => ({
        day: new Date(day).toLocaleDateString("en-CA", { weekday: "short" }),
        requests: requests.filter(r => r.created_date?.slice(0, 10) === day).length,
        offers: offers.filter(o => o.created_date?.slice(0, 10) === day).length,
      })));

      setOfferTrend(days.map(day => ({
        day: new Date(day).toLocaleDateString("en-CA", { weekday: "short" }),
        green: offers.filter(o => o.created_date?.slice(0, 10) === day && o.validation_status === "green").length,
        yellow: offers.filter(o => o.created_date?.slice(0, 10) === day && o.validation_status === "yellow").length,
        red: offers.filter(o => o.created_date?.slice(0, 10) === day && o.validation_status === "red").length,
      })));

      // Build 30-day cumulative growth data
      const months = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return d.toISOString().slice(0, 10);
      });
      let cumReqs = 0, cumPros = 0;
      setGrowthData(months.map((day, i) => {
        cumReqs += requests.filter(r => r.created_date?.slice(0, 10) === day).length;
        cumPros += professionals.filter(p => p.created_date?.slice(0, 10) === day).length;
        const label = i % 5 === 0 ? new Date(day).toLocaleDateString("en-CA", { month: "short", day: "numeric" }) : "";
        return { day: label, requests: cumReqs, professionals: cumPros };
      }));

      const pending = professionals.filter(p => p.verification_status === "pending");
      setPendingProfiles(pending);

      setStats({
        requests: requests.length,
        offers: offers.length,
        professionals: professionals.length,
        pendingProfiles: pending.length,
        greenOffers: offers.filter(o => o.validation_status === "green").length,
        yellowOffers: offers.filter(o => o.validation_status === "yellow").length,
        redOffers: offers.filter(o => o.validation_status === "red").length,
      });
      setLoading(false);
    };
    load();
  }, []);

  const handleProfileDecision = (profileId) => {
    setPendingProfiles(prev => prev.filter(p => p.id !== profileId));
    setStats(prev => ({ ...prev, pendingProfiles: prev.pendingProfiles - 1 }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading platform data...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: "Total Requests", value: stats.requests, icon: FileText, gradient: "from-blue-500 to-cyan-500", link: "/admin/requests" },
    { label: "Total Offers", value: stats.offers, icon: Send, gradient: "from-violet-500 to-purple-600", link: "/admin/offers" },
    { label: "Professionals", value: stats.professionals, icon: Shield, gradient: "from-emerald-500 to-teal-500", link: "/admin/professionals" },
    { label: "Pending Approval", value: stats.pendingProfiles, icon: AlertCircle, gradient: "from-amber-500 to-orange-500", link: "/admin/professionals", alert: stats.pendingProfiles > 0 },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 rounded-full border border-green-500/20">
            <PulseDot color="bg-green-500" />
            <span className="text-xs font-medium text-green-600">Live</span>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">Real-time platform metrics and management</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-secondary/50 p-1 rounded-xl w-fit">
        {["overview", "approvals"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {tab}
            {tab === "approvals" && stats.pendingProfiles > 0 && (
              <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">{stats.pendingProfiles}</span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {kpis.map((k, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Link to={k.link}>
                    <Card className={`border-0 shadow-md overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform ${k.alert ? "ring-2 ring-amber-400/50" : ""}`}>
                      <CardContent className="p-0">
                        <div className={`h-1.5 w-full bg-gradient-to-r ${k.gradient}`} />
                        <div className="p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
                              <p className="text-3xl font-bold text-foreground tabular-nums">
                                <AnimatedNumber value={k.value} />
                              </p>
                            </div>
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${k.gradient} flex items-center justify-center shadow-sm`}>
                              <k.icon className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          {k.alert && (
                            <div className="flex items-center gap-1 mt-2">
                              <PulseDot color="bg-amber-500" />
                              <span className="text-xs text-amber-600 font-medium">Needs attention</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Requests & Offers Area Chart */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <Card className="border-border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" /> Incoming Activity (7 days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={requestTrend} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                        <defs>
                          <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="offerGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                        <Area type="monotone" dataKey="requests" stroke="#3B82F6" strokeWidth={2} fill="url(#reqGrad)" name="Requests" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                        <Area type="monotone" dataKey="offers" stroke="#8B5CF6" strokeWidth={2} fill="url(#offerGrad)" name="Offers" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 justify-center mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-blue-500 rounded inline-block" /> Requests</div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-violet-500 rounded inline-block" /> Offers</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Offer Validation Bar Chart */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                <Card className="border-border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" /> AI Offer Validation (7 days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={offerTrend} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                        <Bar dataKey="green" stackId="a" fill="#10B981" name="Green" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="yellow" stackId="a" fill="#F59E0B" name="Yellow" />
                        <Bar dataKey="red" stackId="a" fill="#EF4444" name="Red" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 justify-center mt-2">
                      {[["#10B981","Green"],["#F59E0B","Yellow"],["#EF4444","Red"]].map(([c,l]) => (
                        <div key={l} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: c }} /> {l}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* 30-Day Growth Chart */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-6">
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" /> 30-Day Growth — Active Requests &amp; Professional Registrations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={growthData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                      <defs>
                        <filter id="glow-blue">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                        <filter id="glow-emerald">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={0} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                      <Line type="monotone" dataKey="requests" stroke="#3B82F6" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} name="Active Requests" filter="url(#glow-blue)" />
                      <Line type="monotone" dataKey="professionals" stroke="#10B981" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} name="Professional Registrations" filter="url(#glow-emerald)" strokeDasharray="5 3" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <Card className="border-border shadow-sm">
                <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { to: "/admin/professionals", icon: Shield, label: "Review Professionals", badge: stats.pendingProfiles > 0 ? stats.pendingProfiles : null },
                      { to: "/admin/requests", icon: FileText, label: "Manage Requests" },
                      { to: "/admin/offers", icon: Send, label: "Moderate Offers" },
                      { to: "/admin/users", icon: Users, label: "User Management" },
                      { to: "/admin/categories", icon: Activity, label: "Categories" },
                    ].map((item, i) => (
                      <Link to={item.to} key={i}>
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-accent/30 hover:border-primary/30 transition-all group">
                          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                            <item.icon className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-foreground flex-1">{item.label}</span>
                          {item.badge && <Badge className="bg-amber-100 text-amber-800 text-xs">{item.badge}</Badge>}
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {activeTab === "approvals" && (
          <motion.div key="approvals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProfessionalApprovalPanel
              profiles={pendingProfiles}
              onDecision={handleProfileDecision}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}