import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Send, Loader2, Zap, DollarSign, Clock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { VALIDATION_STATUS_CONFIG } from "@/lib/constants";

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [validationFilter, setValidationFilter] = useState("all");

  useEffect(() => {
    base44.entities.Offer.list("-created_date", 200)
      .then(setOffers).finally(() => setLoading(false));
  }, []);

  const filtered = offers.filter(o => {
    const matchValidation = validationFilter === "all" || o.validation_status === validationFilter;
    return matchValidation;
  });

  const toggleVisibility = async (offer) => {
    const updated = await base44.entities.Offer.update(offer.id, { is_visible_to_customer: !offer.is_visible_to_customer });
    setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, is_visible_to_customer: !o.is_visible_to_customer } : o));
  };

  const overrideValidation = async (offer, status) => {
    await base44.entities.Offer.update(offer.id, {
      validation_status: status,
      is_visible_to_customer: status === "green" || status === "yellow"
    });
    setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, validation_status: status, is_visible_to_customer: status !== "red" } : o));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Offer Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and moderate all platform offers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {["pending", "green", "yellow", "red"].map(status => {
          const cfg = VALIDATION_STATUS_CONFIG[status];
          const count = offers.filter(o => o.validation_status === status).length;
          return (
            <Card key={status} className={`border ${cfg.border} cursor-pointer`} onClick={() => setValidationFilter(status)}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${cfg.dot}`} />
                <div>
                  <p className="text-xs text-muted-foreground capitalize">{cfg.label}</p>
                  <p className="text-xl font-bold text-foreground">{count}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-3 mb-6">
        <Select value={validationFilter} onValueChange={setValidationFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Offers</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="green">Green</SelectItem>
            <SelectItem value="yellow">Yellow</SelectItem>
            <SelectItem value="red">Red</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Price</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Timeline</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">AI Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Score</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Visible</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(offer => {
                  const cfg = VALIDATION_STATUS_CONFIG[offer.validation_status] || VALIDATION_STATUS_CONFIG.pending;
                  return (
                    <tr key={offer.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground text-sm">${offer.price?.toLocaleString() || "—"} CAD</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{offer.timeline || "—"}</td>
                      <td className="px-6 py-4">
                        <Badge className={`text-xs ${cfg.badge}`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-1 ${cfg.dot}`} />
                          {cfg.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {offer.overall_score ? (
                          <span className="font-bold text-primary text-sm flex items-center gap-1">
                            <Zap className="w-3 h-3" />{Math.round(offer.overall_score)}/100
                          </span>
                        ) : <span className="text-muted-foreground text-sm">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleVisibility(offer)}>
                          {offer.is_visible_to_customer 
                            ? <Eye className="w-4 h-4 text-green-600" /> 
                            : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                        </Button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="outline" className="text-xs h-7 px-2 text-green-600 border-green-200" onClick={() => overrideValidation(offer, "green")}>Green</Button>
                          <Button size="sm" variant="outline" className="text-xs h-7 px-2 text-red-600 border-red-200" onClick={() => overrideValidation(offer, "red")}>Block</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Send className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No offers found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}