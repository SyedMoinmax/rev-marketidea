import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, Shield, Loader2, CheckCircle, XCircle, Clock, 
  ExternalLink, FileText, Star, MapPin
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";

export default function AdminProfessionals() {
  const [professionals, setProfessionals] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPro, setSelectedPro] = useState(null);
  const [reviewNote, setReviewNote] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [profs, docs] = await Promise.all([
        base44.entities.ProfessionalProfile.list("-created_date", 200),
        base44.entities.VerificationDocument.list("-created_date", 200)
      ]);
      setProfessionals(profs);
      setDocuments(docs);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = professionals.filter(p => {
    const matchSearch = !search || p.business_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.verification_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getProDocs = (proId) => documents.filter(d => d.professional_id === proId);

  const handleVerification = async (proId, status) => {
    setProcessing(true);
    const pro = professionals.find(p => p.id === proId);
    await base44.entities.ProfessionalProfile.update(proId, {
      verification_status: status,
      verification_notes: reviewNote,
      is_active: status === "approved"
    });
    if (pro) {
      await base44.entities.Notification.create({
        user_id: pro.user_id,
        type: status === "approved" ? "verification_approved" : "verification_rejected",
        title: status === "approved" ? "Your profile has been approved! 🎉" : "Profile verification update",
        message: status === "approved"
          ? "Congratulations! You can now browse and submit offers on customer requests."
          : (reviewNote || "Your profile requires additional information. Please contact support."),
        is_read: false
      });
    }
    setProfessionals(prev => prev.map(p => p.id === proId ? { ...p, verification_status: status, is_active: status === "approved" } : p));
    setSelectedPro(null);
    setReviewNote("");
    setProcessing(false);
  };

  const STATUS_CFG = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock },
    approved: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle },
    rejected: { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
    suspended: { bg: "bg-gray-100", text: "text-gray-800", icon: XCircle }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Professional Management</h1>
        <p className="text-sm text-muted-foreground mt-1">{professionals.filter(p => p.verification_status === "pending").length} pending verification</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search professionals..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filtered.map(pro => {
          const cfg = STATUS_CFG[pro.verification_status] || STATUS_CFG.pending;
          const StatusIcon = cfg.icon;
          const proDocs = getProDocs(pro.id);
          return (
            <Card key={pro.id} className="border-border shadow-sm">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{pro.business_name}</h3>
                      <Badge className={`text-xs ${cfg.bg} ${cfg.text}`}>
                        <StatusIcon className="w-3 h-3 mr-1" /> {pro.verification_status}
                      </Badge>
                      {pro.is_active && <Badge className="text-xs bg-green-100 text-green-800">Active</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{pro.description || "No description"}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{pro.city}, {pro.province}</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3" />{pro.average_rating || 0}/5</span>
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{proDocs.length} documents uploaded</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" onClick={() => setSelectedPro(pro)}>
                      Review
                    </Button>
                    {pro.verification_status === "pending" && (
                      <>
                        <Button size="sm" className="bg-green-600 text-white hover:bg-green-700" onClick={() => { setSelectedPro(pro); }}>
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No professionals found</p>
          </div>
        )}
      </div>

      {/* Review Dialog */}
      {selectedPro && (
        <Dialog open={!!selectedPro} onOpenChange={() => setSelectedPro(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Review: {selectedPro.business_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Business:</span> <span className="font-medium">{selectedPro.business_name}</span></div>
                <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{selectedPro.business_type || "—"}</span></div>
                <div><span className="text-muted-foreground">Province:</span> <span className="font-medium">{selectedPro.province}</span></div>
                <div><span className="text-muted-foreground">Experience:</span> <span className="font-medium">{selectedPro.years_experience || "—"} yrs</span></div>
              </div>
              {selectedPro.service_categories?.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Service Categories:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPro.service_categories.map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm font-medium mb-2">Uploaded Documents ({getProDocs(selectedPro.id).length}):</p>
                <div className="space-y-2">
                  {getProDocs(selectedPro.id).map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg text-sm">
                      <span className="text-foreground capitalize">{doc.type.replace(/_/g, " ")}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={doc.status === "approved" ? "bg-green-100 text-green-800 text-xs" : "bg-yellow-100 text-yellow-800 text-xs"}>{doc.status}</Badge>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3.5 h-3.5 text-primary" />
                        </a>
                      </div>
                    </div>
                  ))}
                  {getProDocs(selectedPro.id).length === 0 && <p className="text-xs text-muted-foreground">No documents uploaded yet.</p>}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Review Notes</label>
                <Textarea placeholder="Add notes for the professional..." value={reviewNote} onChange={e => setReviewNote(e.target.value)} className="mt-1.5 text-sm" rows={3} />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setSelectedPro(null)}>Cancel</Button>
              <Button className="bg-red-600 text-white hover:bg-red-700" onClick={() => handleVerification(selectedPro.id, "rejected")} disabled={processing}>
                <XCircle className="w-4 h-4 mr-1" /> Reject
              </Button>
              <Button className="bg-green-600 text-white hover:bg-green-700" onClick={() => handleVerification(selectedPro.id, "approved")} disabled={processing}>
                {processing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}