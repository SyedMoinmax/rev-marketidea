import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, FileText, Send, TrendingUp, Star, ArrowRight, 
  CheckCircle, Clock, AlertCircle, Zap, Users
} from "lucide-react";
import RequestStatusTracker from "@/components/customer/RequestStatusTracker";

const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <Card className="border-border shadow-sm">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {change && <p className="text-xs text-green-600 mt-1 font-medium">{change}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me().catch(() => null);
      setUser(u);
      if (u) {
        const isAdmin = u.role === "admin";
        const isPro = u.role === "professional";
        if (isAdmin) {
          const [reqs, offs] = await Promise.all([
            base44.entities.CustomerRequest.list("-created_date", 5),
            base44.entities.Offer.list("-created_date", 5)
          ]);
          setRequests(reqs); setOffers(offs);
        } else if (isPro) {
          const offs = await base44.entities.Offer.filter({ professional_user_id: u.id }, "-created_date", 5);
          setOffers(offs);
        } else {
          const reqs = await base44.entities.CustomerRequest.filter({ customer_id: u.id }, "-created_date", 5);
          setRequests(reqs);
          if (reqs.length > 0) {
            const offs = await base44.entities.Offer.filter({ customer_id: u.id }, "-created_date", 5);
            setOffers(offs);
          }
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const role = user?.role || "customer";

  const getStatusBadge = (status) => {
    const cfg = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-blue-100 text-blue-800",
      green: "bg-green-100 text-green-800",
      yellow: "bg-yellow-100 text-yellow-800",
      red: "bg-red-100 text-red-800",
      submitted: "bg-blue-100 text-blue-800",
    };
    return cfg[status] || "bg-secondary text-secondary-foreground";
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-muted rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Welcome back{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-muted-foreground mt-1">
            {role === "admin" ? "Platform overview and management" :
             role === "professional" ? "Your business performance overview" :
             "Here's what's happening with your requests"}
          </p>
        </div>
        {role === "customer" && (
          <Link to="/requests/new">
            <Button className="bg-primary text-white hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" /> New Request
            </Button>
          </Link>
        )}
        {role === "professional" && (
          <Link to="/browse-requests">
            <Button className="bg-primary text-white hover:bg-primary/90">
              <FileText className="w-4 h-4 mr-2" /> Browse Requests
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {role === "customer" && <>
          <StatCard title="Active Requests" value={requests.filter(r => r.status === "active").length} icon={FileText} color="bg-blue-100 text-blue-600" />
          <StatCard title="Offers Received" value={offers.length} change="+3 this week" icon={Send} color="bg-green-100 text-green-600" />
          <StatCard title="Completed" value={requests.filter(r => r.status === "completed").length} icon={CheckCircle} color="bg-purple-100 text-purple-600" />
          <StatCard title="Avg. Offers" value={requests.length > 0 ? Math.round(offers.length / Math.max(requests.length, 1)) : 0} icon={TrendingUp} color="bg-orange-100 text-orange-600" />
        </>}
        {role === "professional" && <>
          <StatCard title="Offers Submitted" value={offers.length} icon={Send} color="bg-blue-100 text-blue-600" />
          <StatCard title="Accepted" value={offers.filter(o => o.customer_status === "accepted").length} icon={CheckCircle} color="bg-green-100 text-green-600" />
          <StatCard title="AI Score Avg" value={offers.length > 0 ? Math.round(offers.reduce((a,o) => a + (o.overall_score || 0), 0) / offers.length) : 0} icon={Zap} color="bg-purple-100 text-purple-600" />
          <StatCard title="Pending Review" value={offers.filter(o => o.validation_status === "pending").length} icon={Clock} color="bg-yellow-100 text-yellow-600" />
        </>}
        {role === "admin" && <>
          <StatCard title="Total Requests" value={requests.length} change="Platform wide" icon={FileText} color="bg-blue-100 text-blue-600" />
          <StatCard title="Total Offers" value={offers.length} icon={Send} color="bg-green-100 text-green-600" />
          <StatCard title="Pending Review" value={offers.filter(o => o.validation_status === "pending").length} icon={Clock} color="bg-yellow-100 text-yellow-600" />
          <StatCard title="Active Users" value="—" icon={Users} color="bg-purple-100 text-purple-600" />
        </>}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        {(role === "customer" || role === "admin") && (
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base font-semibold">
                {role === "customer" ? "My Requests" : "Recent Requests"}
              </CardTitle>
              <Link to={role === "admin" ? "/admin/requests" : "/requests"}>
                <Button variant="ghost" size="sm" className="text-primary text-xs">View all <ArrowRight className="ml-1 w-3 h-3" /></Button>
              </Link>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {requests.length === 0 ? (
                <div className="text-center py-6">
                  <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No requests yet</p>
                  {role === "customer" && <Link to="/requests/new"><Button size="sm" className="mt-3 bg-primary text-white">Create First Request</Button></Link>}
                </div>
              ) : role === "customer" ? (
                <div className="space-y-3">
                  {requests.slice(0, 5).map((req) => (
                    <RequestStatusTracker key={req.id} request={req} />
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-border -mx-4">
                  {requests.slice(0, 5).map((req) => (
                    <Link to={`/requests/${req.id}`} key={req.id}>
                      <div className="px-6 py-3 hover:bg-secondary/30 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">{req.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{req.city}, {req.province} · {req.category_name}</p>
                          </div>
                          <Badge className={`text-xs flex-shrink-0 ${getStatusBadge(req.status)}`}>{req.status}</Badge>
                        </div>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Send className="w-3 h-3" /> {req.offer_count || 0} offers</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {req.timeline || "—"}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Offers */}
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-semibold">
              {role === "professional" ? "My Recent Offers" : "Recent Offers"}
            </CardTitle>
            <Link to={role === "professional" ? "/my-offers" : "/offers"}>
              <Button variant="ghost" size="sm" className="text-primary text-xs">View all <ArrowRight className="ml-1 w-3 h-3" /></Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {offers.length === 0 ? (
              <div className="px-6 pb-6 text-center">
                <Send className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No offers yet</p>
                {role === "professional" && <Link to="/browse-requests"><Button size="sm" className="mt-3 bg-primary text-white">Browse Requests</Button></Link>}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {offers.slice(0, 5).map((offer) => (
                  <div key={offer.id} className="px-6 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground">${offer.price?.toLocaleString() || "—"} CAD</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{offer.timeline || "—"}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {offer.overall_score && (
                          <span className="text-xs font-bold text-primary">{offer.overall_score}/100</span>
                        )}
                        <Badge className={`text-xs ${getStatusBadge(offer.validation_status)}`}>
                          {offer.validation_status || "pending"}
                        </Badge>
                      </div>
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