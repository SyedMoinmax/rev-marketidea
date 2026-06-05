import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText, Loader2, MapPin, DollarSign, Clock, Send, ExternalLink, Trash2 } from "lucide-react";

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    base44.entities.CustomerRequest.list("-created_date", 200)
      .then(setRequests).finally(() => setLoading(false));
  }, []);

  const filtered = requests.filter(r => {
    const matchSearch = !search || r.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (id, status) => {
    await base44.entities.CustomerRequest.update(id, { status });
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const deleteRequest = async (id) => {
    if (!window.confirm("Delete this request?")) return;
    await base44.entities.CustomerRequest.delete(id);
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const STATUS_COLORS = { active: "bg-green-100 text-green-800", in_progress: "bg-blue-100 text-blue-800", completed: "bg-purple-100 text-purple-800", cancelled: "bg-red-100 text-red-800", draft: "bg-gray-100 text-gray-800" };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Request Management</h1>
        <p className="text-sm text-muted-foreground mt-1">{requests.length} total requests</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        {filtered.map(req => (
          <Card key={req.id} className="border-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">{req.title}</h3>
                    <Badge className={`text-xs ${STATUS_COLORS[req.status] || ""}`}>{req.status}</Badge>
                    <Badge variant="outline" className="text-xs">{req.category_name}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{req.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{req.city}, {req.province}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />
                      {req.budget_min ? `$${req.budget_min.toLocaleString()}–$${(req.budget_max||req.budget_min).toLocaleString()}` : "Open"}
                    </span>
                    <span className="flex items-center gap-1"><Send className="w-3 h-3" />{req.offer_count||0} offers</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link to={`/requests/${req.id}`}>
                    <Button variant="outline" size="sm" className="text-xs"><ExternalLink className="w-3 h-3 mr-1" /> View</Button>
                  </Link>
                  {req.status === "active" && (
                    <Button size="sm" variant="outline" className="text-xs text-yellow-600" onClick={() => updateStatus(req.id, "cancelled")}>Cancel</Button>
                  )}
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteRequest(req.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No requests found</p>
          </div>
        )}
      </div>
    </div>
  );
}