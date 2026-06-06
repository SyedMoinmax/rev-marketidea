import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, MapPin, DollarSign, Clock, AlertCircle, CheckCircle,
  Send, Star, Shield, TrendingUp, Zap, MessageSquare, Loader2, ChevronRight
} from "lucide-react";
import { VALIDATION_STATUS_CONFIG, getScoreLabel } from "@/lib/constants";
import OfferCard from "@/components/offers/OfferCard";

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [offers, setOffers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [professionals, setProfessionals] = useState({});

  useEffect(() => {
    const load = async () => {
      const [u, req] = await Promise.all([
        base44.auth.me().catch(() => null),
        base44.entities.CustomerRequest.filter({ id }).then(d => d[0]).catch(() => null)
      ]);
      setUser(u);
      setRequest(req);
      if (req) {
        const offs = await base44.entities.Offer.filter({ request_id: id }, "-overall_score", 50);
        const visibleOffs = offs.filter(o => o.is_visible_to_customer || u?.role === "admin");
        setOffers(visibleOffs);
        // Load professional profiles for display
        const profIds = [...new Set(visibleOffs.map(o => o.professional_id).filter(Boolean))];
        if (profIds.length > 0) {
          const profs = await base44.entities.ProfessionalProfile.list("-created_date", 100);
          const profMap = {};
          profs.forEach(p => { profMap[p.id] = p; profMap[p.user_id] = p; });
          setProfessionals(profMap);
        }
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleAcceptOffer = async (offerId) => {
    setAccepting(offerId);
    const acceptedOffer = offers.find(o => o.id === offerId);

    // Update offer and request status
    await base44.entities.Offer.update(offerId, { customer_status: "accepted", status: "accepted" });
    await base44.entities.CustomerRequest.update(id, { status: "in_progress", accepted_offer_id: offerId });

    // Reject all other offers on this request
    const otherOffers = offers.filter(o => o.id !== offerId && o.status !== "withdrawn");
    for (const other of otherOffers) {
      await base44.entities.Offer.update(other.id, { customer_status: "rejected", status: "rejected" });
    }

    // Notify the professional whose offer was accepted
    if (acceptedOffer?.professional_user_id) {
      await base44.entities.Notification.create({
        user_id: acceptedOffer.professional_user_id,
        type: "offer_accepted",
        title: "Your offer was accepted! 🎉",
        message: `The customer accepted your offer for "${request.title}". Please reach out to discuss the next steps.`,
        link: `/my-offers`,
        is_read: false,
        metadata: { request_id: id, offer_id: offerId }
      });
    }

    const offs = await base44.entities.Offer.filter({ request_id: id });
    setOffers(offs);
    setRequest(r => ({ ...r, status: "in_progress", accepted_offer_id: offerId }));
    setAccepting(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  if (!request) return (
    <div className="p-8 text-center">
      <p className="text-muted-foreground">Request not found.</p>
      <Link to="/requests"><Button variant="ghost" className="mt-4">Back to Requests</Button></Link>
    </div>
  );

  const PRIORITY_COLORS = { low: "bg-gray-100 text-gray-600", medium: "bg-blue-100 text-blue-700", high: "bg-orange-100 text-orange-700", urgent: "bg-red-100 text-red-700" };
  const STATUS_COLORS = { active: "bg-green-100 text-green-800", in_progress: "bg-blue-100 text-blue-800", completed: "bg-purple-100 text-purple-800" };

  const visibleOffers = offers.filter(o => o.is_visible_to_customer || user?.role === "admin");
  const sortedOffers = [...visibleOffers].sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0));

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-foreground truncate">{request.title}</h1>
            <Badge className={`${STATUS_COLORS[request.status] || "bg-secondary text-secondary-foreground"}`}>{request.status}</Badge>
            <Badge className={`${PRIORITY_COLORS[request.priority] || ""}`}>{request.priority}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{request.category_name}{request.subcategory_name ? ` · ${request.subcategory_name}` : ""}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Request Details */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-border shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{request.description}</p>
              </div>
              <Separator />
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground">{request.city}, {request.province}</span>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground">
                    {request.budget_min ? `$${request.budget_min.toLocaleString()} – $${(request.budget_max || request.budget_min).toLocaleString()} CAD` : "Budget open"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground">{request.timeline || "Flexible"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Send className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground">{offers.length} offer{offers.length !== 1 ? "s" : ""} received</span>
                </div>
              </div>
              {request.images?.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Images</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {request.images.map((url, i) => (
                        <img key={i} src={url} alt="" className="w-full h-20 object-cover rounded-lg" />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Offers */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {sortedOffers.length} Validated Offer{sortedOffers.length !== 1 ? "s" : ""}
            </h2>
            {sortedOffers.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Zap className="w-3 h-3 text-primary" />
                Sorted by AI Score
              </div>
            )}
          </div>

          {sortedOffers.length === 0 ? (
            <Card className="border-border shadow-sm">
              <CardContent className="p-12 text-center">
                <Send className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No offers yet</h3>
                <p className="text-sm text-muted-foreground">Professionals are reviewing your request. You'll be notified when offers arrive.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedOffers.map((offer, index) => {
                const prof = professionals[offer.professional_id] || professionals[offer.professional_user_id];
                return (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    isTopOffer={index === 0}
                    acceptedOfferId={request.accepted_offer_id}
                    onAccept={user?.id === request.customer_id && request.status === "active" ? handleAcceptOffer : null}
                    accepting={accepting}
                    professionalName={prof?.business_name || null}
                    professionalRating={prof?.average_rating || 0}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}