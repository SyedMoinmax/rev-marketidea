import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Shield, CheckCircle, XCircle, Eye, MapPin, Star, Clock,
  Building2, Phone, Globe, FileText, ChevronDown, ChevronUp, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfessionalApprovalPanel({ profiles, onDecision }) {
  const [users, setUsers] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(null);

  // Load user data for each profile
  useEffect(() => {
    if (!profiles.length) return;
    Promise.all(
      profiles.map(p =>
        base44.entities.User.filter ? 
          base44.entities.User.filter({ id: p.user_id }).then(r => r[0]).catch(() => null) :
          null
      )
    ).then(usersArr => {
      const map = {};
      profiles.forEach((p, i) => { if (usersArr[i]) map[p.user_id] = usersArr[i]; });
      setUsers(map);
    });
  }, [profiles]);

  const handleApprove = async (profile) => {
    setProcessing(profile.id + "_approve");
    await base44.entities.ProfessionalProfile.update(profile.id, {
      verification_status: "approved",
      is_active: true,
      verification_notes: "Approved by admin."
    });
    await base44.entities.Notification.create({
      user_id: profile.user_id,
      type: "verification_approved",
      title: "Your profile has been approved! 🎉",
      message: "Congratulations! You can now browse and submit offers on customer requests.",
      is_read: false
    });
    setProcessing(null);
    onDecision(profile.id);
  };

  const handleReject = async (profile) => {
    setProcessing(profile.id + "_reject");
    await base44.entities.ProfessionalProfile.update(profile.id, {
      verification_status: "rejected",
      is_active: false,
      verification_notes: rejectionNote || "Profile did not meet requirements."
    });
    await base44.entities.Notification.create({
      user_id: profile.user_id,
      type: "verification_rejected",
      title: "Profile verification update",
      message: rejectionNote || "Your profile requires additional information. Please contact support.",
      is_read: false
    });
    setProcessing(null);
    setShowRejectInput(null);
    setRejectionNote("");
    onDecision(profile.id);
  };

  if (profiles.length === 0) {
    return (
      <div className="text-center py-20">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">All caught up!</h3>
          <p className="text-muted-foreground text-sm">No professional profiles awaiting approval.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Professional Profile Approvals</h2>
          <p className="text-sm text-muted-foreground">{profiles.length} profile{profiles.length > 1 ? "s" : ""} pending review</p>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {profiles.map((profile, i) => {
            const user = users[profile.user_id];
            const isExpanded = expanded === profile.id;
            const isProcessing = processing?.startsWith(profile.id);
            const isRejectOpen = showRejectInput === profile.id;

            return (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40, scale: 0.95 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="border-border shadow-sm overflow-hidden">
                  {/* Top accent bar */}
                  <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-400" />

                  <CardContent className="p-5">
                    {/* Header row */}
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-blue-600 text-white font-bold text-lg">
                          {profile.business_name?.[0]?.toUpperCase() || "P"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-foreground text-base">{profile.business_name}</h3>
                            <p className="text-sm text-muted-foreground">{user?.full_name || "Unknown"} · {user?.email}</p>
                          </div>
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs flex-shrink-0">
                            <Clock className="w-3 h-3 mr-1" /> Pending
                          </Badge>
                        </div>

                        {/* Quick meta */}
                        <div className="flex flex-wrap gap-3 mt-2">
                          {profile.city && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" /> {profile.city}, {profile.province}
                            </span>
                          )}
                          {profile.years_experience && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Star className="w-3 h-3" /> {profile.years_experience} yrs exp
                            </span>
                          )}
                          {profile.business_type && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Building2 className="w-3 h-3" /> {profile.business_type}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" /> Registered {new Date(profile.created_date).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expand toggle */}
                    <button
                      onClick={() => setExpanded(isExpanded ? null : profile.id)}
                      className="flex items-center gap-1 text-xs text-primary font-medium mt-3 hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {isExpanded ? "Hide details" : "View full profile"}
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-border grid sm:grid-cols-2 gap-4">
                            {profile.description && (
                              <div className="sm:col-span-2">
                                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Description</p>
                                <p className="text-sm text-foreground">{profile.description}</p>
                              </div>
                            )}
                            {profile.phone && (
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Phone</p>
                                <p className="text-sm text-foreground flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {profile.phone}</p>
                              </div>
                            )}
                            {profile.website && (
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Website</p>
                                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary flex items-center gap-1 hover:underline">
                                  <Globe className="w-3.5 h-3.5" /> {profile.website}
                                </a>
                              </div>
                            )}
                            {profile.license_number && (
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">License #</p>
                                <p className="text-sm text-foreground flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {profile.license_number}</p>
                              </div>
                            )}
                            {profile.service_categories?.length > 0 && (
                              <div className="sm:col-span-2">
                                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Service Categories</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {profile.service_categories.map((c, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">{c}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {profile.service_areas?.length > 0 && (
                              <div className="sm:col-span-2">
                                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Service Areas</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {profile.service_areas.map((a, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">{a}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Reject note input */}
                    <AnimatePresence>
                      {isRejectOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
                          <textarea
                            value={rejectionNote}
                            onChange={e => setRejectionNote(e.target.value)}
                            placeholder="Reason for rejection (sent to professional)..."
                            className="w-full text-sm rounded-lg border border-border bg-secondary/30 px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                            rows={2}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white flex-1"
                        onClick={() => handleApprove(profile)}
                        disabled={isProcessing}
                      >
                        {processing === profile.id + "_approve" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4 mr-1.5" /> Approve</>}
                      </Button>
                      {!isRejectOpen ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 flex-1"
                          onClick={() => setShowRejectInput(profile.id)}
                          disabled={isProcessing}
                        >
                          <XCircle className="w-4 h-4 mr-1.5" /> Reject
                        </Button>
                      ) : (
                        <div className="flex gap-1.5 flex-1">
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleReject(profile)}
                            disabled={isProcessing}
                          >
                            {processing === profile.id + "_reject" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Reject"}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setShowRejectInput(null); setRejectionNote(""); }}>Cancel</Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}