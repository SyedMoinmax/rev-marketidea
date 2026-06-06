import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, TrendingUp, CheckCircle, Zap, DollarSign,
  Clock, Send, Target, Users, FileText, Shield,
  Activity, BarChart2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

const PIE_COLORS = ["#10B981", "#F59E0B", "#EF4444", "#3B82F6"];

function StatCard({ label, value, suffix = "", icon: Icon, color, sub }) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold text-foreground tabular-nums">{value}{suffix}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me().catch(() => null);
      setUser(u);

      if (u?.role === "admin") {
        const [requests, offers, professionals, users] = await Promise.all([
          base44.entities.CustomerRequest.list("-created_date", 500),
          base44.entities.Offer.list("-created_date", 500),
          base44.entities.ProfessionalProfile.list("-created_date", 500),
          base44.entities.User.list("-created_date", 500),
        ]);

        // 7-day trend
        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().slice(0, 10);
        });
        const trend = days.map(day => ({
          day: new Date(day).toLocaleDateString("en-CA", { weekday: "short" }),
          requests: requests.filter(r => r.created_date?.slice(0, 10) === day).length,
          offers: offers.filter(o => o.created_date?.slice(0, 10) === day).length,
        }));

        // Status breakdown
        const reqStatusData = [
          { name: "Active", value: requests.filter(r => r.status === "active").length },
          { name: "In Progress", value: requests.filter(r => r.status === "in_progress").length },
          { name: "Completed", value: requests.filter(r => r.status === "completed").length },
          { name: "Other", value: requests.filter(r => !["active","in_progress","completed"].includes(r.status)).length },
        ].filter(d => d.value > 0);

        const offerValidData = [
          { name: "Green", value: offers.filter(o => o.validation_status === "green").length },
          { name: "Yellow", value: offers.filter(o => o.validation_status === "yellow").length },
          { name: "Red", value: offers.filter(o => o.validation_status === "red").length },
          { name: "Pending", value: offers.filter(o => o.validation_status === "pending" || !o.validation_status).length },
        ].filter(d => d.value > 0);

        setData({
          isAdmin: true,
          stats: {
            activeRequests: requests.filter(r => r.status === "active").length,
            totalRequests: requests.length,
            totalOffers: offers.length,
            acceptedOffers: offers.filter(o => o.customer_status === "accepted").length,
            totalProfessionals: professionals.length,
            pendingVerification: professionals.filter(p => p.verification_status === "pending").length,
            approvedProfessionals: professionals.filter(p => p.verification_status === "approved").length,
            totalUsers: users.length,
            avgOffersPerRequest: requests.length ? (offers.length / requests.length).toFixed(1) : 0,
            platformRevenue: offers.filter(o => o.customer_status === "accepted").reduce((a, o) => a + (o.price || 0), 0),
          },
          trend,
          reqStatusData,
          offerValidData,
        });
      } else if (u) {
        // Professional view
        const offers = await base44.entities.Offer.filter({ professional_user_id: u.id }, "-created_date", 200);
        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().slice(0, 10);
        });
        const trend = days.map(day => ({
          day: new Date(day).toLocaleDateString("en-CA", { weekday: "short" }),
          offers: offers.filter(o => o.created_date?.slice(0, 10) === day).length,
        }));

        const scoreDistribution = [
          { range: "90-100", count: offers.filter(o => (o.overall_score || 0) >= 90).length },
          { range: "80-89", count: offers.filter(o => (o.overall_score || 0) >= 80 && (o.overall_score || 0) < 90).length },
          { range: "70-79", count: offers.filter(o => (o.overall_score || 0) >= 70 && (o.overall_score || 0) < 80).length },
          { range: "60-69", count: offers.filter(o => (o.overall_score || 0) >= 60 && (o.overall_score || 0) < 70).length },
          { range: "<60", count: offers.filter(o => (o.overall_score || 0) < 60 && o.overall_score).length },
        ];

        setData({
          isAdmin: false,
          stats: {
            total: offers.length,
            accepted: offers.filter(o => o.customer_status === "accepted").length,
            avgScore: offers.length ? Math.round(offers.reduce((a, o) => a + (o.overall_score || 0), 0) / offers.length) : 0,
            acceptanceRate: offers.length ? Math.round((offers.filter(o => o.customer_status === "accepted").length / offers.length) * 100) : 0,
            totalRevenue: offers.filter(o => o.customer_status === "accepted").reduce((a, o) => a + (o.price || 0), 0),
            green: offers.filter(o => o.validation_status === "green").length,
            yellow: offers.filter(o => o.validation_status === "yellow").length,
            red: offers.filter(o => o.validation_status === "red").length,
          },
          trend,
          scoreDistribution,
          subScores: [
            { label: "Price Score", key: "price_score", color: "bg-blue-500" },
            { label: "Quality Score", key: "quality_score", color: "bg-green-500" },
            { label: "Reputation", key: "reputation_score", color: "bg-purple-500" },
            { label: "Reliability", key: "reliability_score", color: "bg-orange-500" },
            { label: "Market Alignment", key: "market_alignment_score", color: "bg-primary" },
          ].map(s => {
            const valid = offers.filter(o => o[s.key]);
            return { ...s, avg: valid.length ? Math.round(valid.reduce((a, o) => a + o[s.key], 0) / valid.length) : 0 };
          }),
          offers,
        });
      }

      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!data) return null;

  // ── ADMIN VIEW ────────────────────────────────────────────────
  if (data.isAdmin) {
    const { stats, trend, reqStatusData, offerValidData } = data;
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Platform Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Live usage stats across the entire marketplace</p>
        </div>

        {/* KPI row 1 – requests & offers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard label="Active Requests" value={stats.activeRequests} icon={FileText} color="bg-blue-100 text-blue-600" sub={`${stats.totalRequests} total`} />
          <StatCard label="Total Offers" value={stats.totalOffers} icon={Send} color="bg-violet-100 text-violet-600" sub={`${stats.acceptedOffers} accepted`} />
          <StatCard label="Avg Offers / Request" value={stats.avgOffersPerRequest} icon={TrendingUp} color="bg-cyan-100 text-cyan-600" />
          <StatCard label="Offer Accept Rate" value={stats.totalOffers ? Math.round((stats.acceptedOffers / stats.totalOffers) * 100) : 0} suffix="%" icon={Target} color="bg-green-100 text-green-600" />
        </div>

        {/* KPI row 2 – professionals & users */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="bg-indigo-100 text-indigo-600" />
          <StatCard label="Professionals" value={stats.totalProfessionals} icon={Shield} color="bg-teal-100 text-teal-600" sub={`${stats.approvedProfessionals} approved`} />
          <StatCard label="Pending Verification" value={stats.pendingVerification} icon={Clock} color="bg-amber-100 text-amber-600" />
          <StatCard label="Platform Revenue" value={`$${(stats.platformRevenue / 1000).toFixed(1)}k`} icon={DollarSign} color="bg-emerald-100 text-emerald-600" sub="from accepted offers" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* 7-day activity */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> 7-Day Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trend} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="reqG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="offerG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                  <Area type="monotone" dataKey="requests" stroke="#3B82F6" strokeWidth={2} fill="url(#reqG)" name="Requests" dot={{ r: 3 }} />
                  <Area type="monotone" dataKey="offers" stroke="#8B5CF6" strokeWidth={2} fill="url(#offerG)" name="Offers" dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-4 justify-center mt-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-blue-500 rounded inline-block" /> Requests</div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-violet-500 rounded inline-block" /> Offers</div>
              </div>
            </CardContent>
          </Card>

          {/* Request status breakdown */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Request Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {reqStatusData.length === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
              ) : (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="55%" height={200}>
                    <PieChart>
                      <Pie data={reqStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                        {reqStatusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2.5 flex-1">
                    {reqStatusData.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                          <span className="text-muted-foreground">{d.name}</span>
                        </div>
                        <span className="font-semibold text-foreground">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Offer validation */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> AI Offer Validation Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {offerValidData.length === 0 ? (
              <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">No validated offers yet</div>
            ) : (
              <div className="space-y-3">
                {offerValidData.map((d, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                        <span className="text-muted-foreground">{d.name}</span>
                      </div>
                      <span className="font-semibold text-foreground">{d.value}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.round((d.value / data.stats.totalOffers) * 100)}%`, background: PIE_COLORS[i] }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── PROFESSIONAL VIEW ─────────────────────────────────────────
  const { stats, trend, scoreDistribution, subScores } = data;
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Performance Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your offer performance and business metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Offers" value={stats.total} icon={Send} color="bg-blue-100 text-blue-600" />
        <StatCard label="Accepted" value={stats.accepted} icon={CheckCircle} color="bg-green-100 text-green-600" />
        <StatCard label="Acceptance Rate" value={stats.acceptanceRate} suffix="%" icon={Target} color="bg-purple-100 text-purple-600" />
        <StatCard label="Avg AI Score" value={stats.avgScore} suffix="/100" icon={Zap} color="bg-orange-100 text-orange-600" />
      </div>

      <Card className="mb-6 border-0 shadow-sm bg-gradient-to-r from-primary to-blue-600">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm mb-1">Total Revenue Earned</p>
            <p className="text-4xl font-bold text-white">${stats.totalRevenue.toLocaleString()} <span className="text-xl text-blue-100">CAD</span></p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart2 className="w-4 h-4 text-primary" /> AI Score Distribution</CardTitle></CardHeader>
          <CardContent>
            {stats.total === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={scoreDistribution} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader><CardTitle className="text-base">Avg Sub-Score Performance</CardTitle></CardHeader>
          <CardContent>
            {stats.total === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Submit offers to see scores</div>
            ) : (
              <div className="space-y-3">
                {subScores.map(s => (
                  <div key={s.key}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-semibold text-foreground">{s.avg}/100</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full ${s.color} rounded-full transition-all`} style={{ width: `${s.avg}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}