import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Loader2, TrendingUp, CheckCircle, Zap, DollarSign, 
  Clock, Star, Send, BarChart2, Target
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { getScoreLabel, VALIDATION_STATUS_CONFIG } from "@/lib/constants";

const CHART_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function Analytics() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me().catch(() => null);
      if (u) {
        const data = await base44.entities.Offer.filter({ professional_user_id: u.id }, "-created_date", 200);
        setOffers(data);
      }
      setLoading(false);
    };
    load();
  }, []);

  const stats = {
    total: offers.length,
    accepted: offers.filter(o => o.customer_status === "accepted").length,
    green: offers.filter(o => o.validation_status === "green").length,
    yellow: offers.filter(o => o.validation_status === "yellow").length,
    red: offers.filter(o => o.validation_status === "red").length,
    avgScore: offers.length ? Math.round(offers.reduce((a, o) => a + (o.overall_score || 0), 0) / offers.length) : 0,
    acceptanceRate: offers.length ? Math.round((offers.filter(o => o.customer_status === "accepted").length / offers.length) * 100) : 0,
    totalRevenue: offers.filter(o => o.customer_status === "accepted").reduce((a, o) => a + (o.price || 0), 0)
  };

  const validationPieData = [
    { name: "Green", value: stats.green },
    { name: "Yellow", value: stats.yellow },
    { name: "Red", value: stats.red },
  ].filter(d => d.value > 0);

  const PIE_COLORS = ["#10B981", "#F59E0B", "#EF4444"];

  const scoreDistribution = [
    { range: "90-100", count: offers.filter(o => (o.overall_score || 0) >= 90).length },
    { range: "80-89", count: offers.filter(o => (o.overall_score || 0) >= 80 && (o.overall_score || 0) < 90).length },
    { range: "70-79", count: offers.filter(o => (o.overall_score || 0) >= 70 && (o.overall_score || 0) < 80).length },
    { range: "60-69", count: offers.filter(o => (o.overall_score || 0) >= 60 && (o.overall_score || 0) < 70).length },
    { range: "<60", count: offers.filter(o => (o.overall_score || 0) < 60 && o.overall_score).length },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Performance Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your offer performance and business metrics</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Offers", value: stats.total, icon: Send, color: "text-blue-600 bg-blue-100", suffix: "" },
          { label: "Accepted", value: stats.accepted, icon: CheckCircle, color: "text-green-600 bg-green-100", suffix: "" },
          { label: "Acceptance Rate", value: stats.acceptanceRate, icon: Target, color: "text-purple-600 bg-purple-100", suffix: "%" },
          { label: "Avg AI Score", value: stats.avgScore, icon: Zap, color: "text-orange-600 bg-orange-100", suffix: "/100" },
        ].map((s, i) => (
          <Card key={i} className="border-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-foreground">{s.value}{s.suffix}</p>
                </div>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue */}
      <Card className="mb-6 border-border shadow-sm bg-gradient-to-r from-primary to-blue-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Revenue Earned</p>
              <p className="text-4xl font-bold text-white">${stats.totalRevenue.toLocaleString()} <span className="text-xl text-blue-100">CAD</span></p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* AI Score Distribution */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> AI Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {offers.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Validation Status Breakdown */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Validation Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {validationPieData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No validated offers yet</div>
            ) : (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={validationPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                      {validationPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {validationPieData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                      <span className="text-muted-foreground">{d.name}:</span>
                      <span className="font-semibold text-foreground">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Score Breakdown Average */}
        <Card className="border-border shadow-sm lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Average Sub-Score Performance</CardTitle></CardHeader>
          <CardContent>
            {offers.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">Submit offers to see your performance scores</div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: "Price Score", key: "price_score", color: "bg-blue-500" },
                  { label: "Quality Score", key: "quality_score", color: "bg-green-500" },
                  { label: "Reputation Score", key: "reputation_score", color: "bg-purple-500" },
                  { label: "Reliability Score", key: "reliability_score", color: "bg-orange-500" },
                  { label: "Market Alignment", key: "market_alignment_score", color: "bg-primary" },
                ].map(s => {
                  const validOffers = offers.filter(o => o[s.key]);
                  const avg = validOffers.length ? Math.round(validOffers.reduce((a, o) => a + o[s.key], 0) / validOffers.length) : 0;
                  return (
                    <div key={s.key}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className="font-semibold text-foreground">{avg}/100</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full ${s.color} rounded-full transition-all`} style={{ width: `${avg}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}