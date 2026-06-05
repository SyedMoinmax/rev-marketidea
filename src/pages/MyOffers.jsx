import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, DollarSign, Clock, Zap, TrendingUp, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { VALIDATION_STATUS_CONFIG, getScoreLabel } from "@/lib/constants";

export default function MyOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me().catch(() => null);
      setUser(u);
      if (u) {
        const data = await base44.entities.Offer.filter({ professional_user_id: u.id }, "-created_date", 100);
        setOffers(data);
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = filter === "all" ? offers : offers.filter(o => o.validation_status === filter || o.customer_status === filter);

  const stats = {
    total: offers.length,
    accepted: offers.filter(o => o.customer_status === "accepted").length,
    green: offers.filter(o => o.validation_status === "green").length,
    avgScore: offers.length ? Math.round(offers.reduce((a, o) => a + (o.overall_score || 0), 0) / offers.length) : 0
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">My Offers</h1>
        <p className="text-sm text-muted-foreground mt-1">Track all offers you've submitted</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Submitted", value: stats.total, icon: Send, color: "bg-blue-100 text-blue-600" },
          { label: "Accepted", value: stats.accepted, icon: CheckCircle, color: "bg-green-100 text-green-600" },
          { label: "Green Validated", value: stats.green, icon: TrendingUp, color: "bg-emerald-100 text-emerald-600" },
          { label: "Avg AI Score", value: `${stats.avgScore}/100`, icon: Zap, color: "bg-purple-100 text-purple-600" },
        ].map((s, i) => (
          <Card key={i} className="border-border shadow-sm">
            <CardContent className="p-5 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-6">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Offers</SelectItem>
            <SelectItem value="green">Green — Approved</SelectItem>
            <SelectItem value="yellow">Yellow — Attention</SelectItem>
            <SelectItem value="red">Red — Blocked</SelectItem>
            <SelectItem value="pending">Pending Validation</SelectItem>
            <SelectItem value="accepted">Accepted by Customer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Send className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No offers found</h3>
          <p className="text-muted-foreground mb-6">Start browsing customer requests to submit your first offer.</p>
          <Link to="/browse-requests"><Button className="bg-primary text-white">Browse Requests</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(offer => {
            const vCfg = VALIDATION_STATUS_CONFIG[offer.validation_status] || VALIDATION_STATUS_CONFIG.pending;
            const scoreInfo = offer.overall_score ? getScoreLabel(offer.overall_score) : null;
            return (
              <Card key={offer.id} className="border-border shadow-sm">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge className={`text-xs ${vCfg.badge}`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-1 ${vCfg.dot}`} />
                          {vCfg.label}
                        </Badge>
                        {offer.customer_status === "accepted" && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" /> Customer Accepted
                          </Badge>
                        )}
                        {offer.customer_status === "rejected" && (
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            <XCircle className="w-3 h-3 mr-1" /> Rejected
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{offer.description}</p>
                      {offer.validation_message && (
                        <p className={`text-xs mt-2 ${vCfg.color}`}>{offer.validation_message}</p>
                      )}
                      {offer.validation_recommendations?.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {offer.validation_recommendations.map((r, i) => (
                            <li key={i} className={`text-xs ${vCfg.color} flex items-start gap-1.5`}>
                              <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" /> {r}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="flex sm:flex-col items-start sm:items-end gap-4 sm:gap-2 flex-shrink-0">
                      <div>
                        <p className="text-lg font-bold text-foreground">${offer.price?.toLocaleString() || "—"} CAD</p>
                        <p className="text-xs text-muted-foreground">{offer.price_type}</p>
                      </div>
                      {offer.overall_score && (
                        <div className="flex items-center gap-1.5 bg-accent rounded-lg px-2.5 py-1">
                          <Zap className="w-3.5 h-3.5 text-primary" />
                          <span className={`text-sm font-bold ${scoreInfo?.color || "text-primary"}`}>{Math.round(offer.overall_score)}/100</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" /> {offer.timeline}
                      </div>
                    </div>
                  </div>
                  {offer.validation_status === "yellow" || offer.validation_status === "red" ? (
                    <div className="mt-3 pt-3 border-t border-border">
                      <Link to={`/requests/${offer.request_id}/offer?edit=${offer.id}`}>
                        <Button size="sm" variant="outline" className="text-xs border-primary text-primary">
                          Revise & Resubmit
                        </Button>
                      </Link>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}