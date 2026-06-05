import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, MapPin, DollarSign, Clock, Send, Filter, 
  Loader2, ChevronRight, Zap, AlertCircle
} from "lucide-react";
import { CANADIAN_PROVINCES, SERVICE_CATEGORIES } from "@/lib/constants";

export default function BrowseRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState("all");
  const [category, setCategory] = useState("all");
  const [user, setUser] = useState(null);
  const [professionalProfile, setProfessionalProfile] = useState(null);

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me().catch(() => null);
      setUser(u);
      if (u) {
        const [reqs, profs] = await Promise.all([
          base44.entities.CustomerRequest.filter({ status: "active" }, "-created_date", 100),
          base44.entities.ProfessionalProfile.filter({ user_id: u.id })
        ]);
        setRequests(reqs);
        setProfessionalProfile(profs[0] || null);
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = requests.filter(r => {
    const matchSearch = !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase());
    const matchProvince = province === "all" || r.province === province;
    const matchCat = category === "all" || r.category_id === category;
    return matchSearch && matchProvince && matchCat;
  });

  const PRIORITY_COLORS = { urgent: "bg-red-100 text-red-700", high: "bg-orange-100 text-orange-700", medium: "bg-blue-100 text-blue-700", low: "bg-gray-100 text-gray-600" };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Browse Customer Requests</h1>
        <p className="text-muted-foreground text-sm mt-1">Find requests matching your expertise and submit competitive offers</p>
      </div>

      {professionalProfile && professionalProfile.verification_status !== "approved" && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">Verification Pending</p>
            <p className="text-xs text-yellow-700 mt-0.5">Your profile is being reviewed. You can browse requests but cannot submit offers until verified.</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={province} onValueChange={setProvince}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Province" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Provinces</SelectItem>
            {CANADIAN_PROVINCES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {SERVICE_CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground mb-4">{filtered.length} requests found</p>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No matching requests</h3>
          <p className="text-muted-foreground">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(req => (
            <Link to={`/requests/${req.id}/offer`} key={req.id}>
              <Card className="border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{req.title}</h3>
                        <Badge className={`text-xs ${PRIORITY_COLORS[req.priority] || ""}`}>{req.priority}</Badge>
                        <Badge variant="outline" className="text-xs">{req.category_name}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{req.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{req.city}, {req.province}</span>
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />
                          {req.budget_min ? `$${req.budget_min.toLocaleString()} – $${(req.budget_max||req.budget_min).toLocaleString()} CAD` : "Open budget"}
                        </span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{req.timeline || "Flexible"}</span>
                        <span className="flex items-center gap-1"><Send className="w-3 h-3" />{req.offer_count||0} offers</span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center gap-3 sm:gap-2 flex-shrink-0">
                      <Button size="sm" className="bg-primary text-white text-xs">
                        Submit Offer <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                      {req.offer_count === 0 && <Badge className="bg-green-100 text-green-700 text-xs border-0">First offer</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}