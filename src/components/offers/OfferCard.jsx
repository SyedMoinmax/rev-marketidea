import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, Star, Shield, Zap, Clock, DollarSign, 
  ChevronDown, ChevronUp, AlertCircle, TrendingUp, Loader2
} from "lucide-react";
import { VALIDATION_STATUS_CONFIG, getScoreLabel } from "@/lib/constants";

const ScoreBar = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{Math.round(value)}/100</span>
    </div>
    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

export default function OfferCard({ offer, isTopOffer, acceptedOfferId, onAccept, accepting, professionalName, professionalRating }) {
  const [expanded, setExpanded] = useState(false);
  const validationCfg = VALIDATION_STATUS_CONFIG[offer.validation_status] || VALIDATION_STATUS_CONFIG.pending;
  const scoreInfo = offer.overall_score ? getScoreLabel(offer.overall_score) : null;
  const isAccepted = acceptedOfferId === offer.id;
  const isOtherAccepted = acceptedOfferId && acceptedOfferId !== offer.id;

  return (
    <Card className={`border-border shadow-sm transition-all
      ${isTopOffer && !isOtherAccepted ? "ring-2 ring-primary/30" : ""}
      ${isAccepted ? "ring-2 ring-green-400" : ""}
      ${isOtherAccepted && !isAccepted ? "opacity-60" : ""}`}>
      
      {isTopOffer && !isOtherAccepted && (
        <div className="px-5 py-2 bg-primary/5 border-b border-border flex items-center gap-2 text-xs text-primary font-semibold rounded-t-lg">
          <Star className="w-3 h-3 fill-primary" /> Top Rated Offer
        </div>
      )}
      {isAccepted && (
        <div className="px-5 py-2 bg-green-50 border-b border-green-200 flex items-center gap-2 text-xs text-green-700 font-semibold rounded-t-lg">
          <CheckCircle className="w-3 h-3" /> Accepted Offer
        </div>
      )}

      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Left: Professional info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">P</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-semibold text-foreground text-sm">{professionalName || "Professional"}</span>
                {professionalRating > 0 && (
                  <div className="flex items-center gap-1 text-xs text-yellow-600">
                    <Star className="w-3 h-3 fill-yellow-500" /> {professionalRating.toFixed(1)}
                  </div>
                )}
                <Badge className="text-xs bg-blue-50 text-blue-700 border-blue-100">
                  <Shield className="w-2.5 h-2.5 mr-1" /> Verified
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{offer.description}</p>
            </div>
          </div>

          {/* Right: Price + Score */}
          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-2 flex-shrink-0">
            <div className="text-right">
              <div className="text-xl font-bold text-foreground">${offer.price?.toLocaleString() || "—"}</div>
              <div className="text-xs text-muted-foreground">{offer.price_type || "fixed"} · CAD</div>
            </div>
            {offer.overall_score && (
              <div className="flex items-center gap-1.5 bg-accent rounded-lg px-3 py-1.5">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm font-bold text-primary">{Math.round(offer.overall_score)}</span>
                <span className="text-xs text-muted-foreground">/100</span>
              </div>
            )}
          </div>
        </div>

        {/* Validation Status */}
        <div className={`mt-4 px-3 py-2.5 rounded-lg border ${validationCfg.bg} ${validationCfg.border}`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${validationCfg.dot}`} />
            <span className={`text-xs font-semibold ${validationCfg.color}`}>{validationCfg.label}</span>
            <span className="text-xs text-muted-foreground ml-1">{offer.validation_message}</span>
          </div>
          {offer.validation_recommendations?.length > 0 && (
            <ul className="mt-2 space-y-1">
              {offer.validation_recommendations.map((r, i) => (
                <li key={i} className={`text-xs ${validationCfg.color} flex items-start gap-1.5`}>
                  <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" /> {r}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Timeline & key info */}
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {offer.timeline || "—"}</span>
          {offer.deliverables?.length > 0 && (
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {offer.deliverables.length} deliverables</span>
          )}
        </div>

        {/* Expand */}
        <button onClick={() => setExpanded(!expanded)} className="mt-3 flex items-center gap-1 text-xs text-primary font-medium">
          {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Hide details</> : <><ChevronDown className="w-3.5 h-3.5" /> View scores & details</>}
        </button>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-border space-y-4">
            {offer.overall_score && (
              <div>
                <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary" /> AI Score Breakdown
                </h4>
                <div className="space-y-2.5">
                  <ScoreBar label="Price Score" value={offer.price_score || 0} color="bg-blue-500" />
                  <ScoreBar label="Quality Score" value={offer.quality_score || 0} color="bg-green-500" />
                  <ScoreBar label="Reputation Score" value={offer.reputation_score || 0} color="bg-purple-500" />
                  <ScoreBar label="Reliability Score" value={offer.reliability_score || 0} color="bg-orange-500" />
                  <ScoreBar label="Market Alignment" value={offer.market_alignment_score || 0} color="bg-primary" />
                </div>
              </div>
            )}
            {offer.scope && (
              <div>
                <h4 className="text-xs font-semibold text-foreground mb-2">Scope of Work</h4>
                <p className="text-xs text-muted-foreground">{offer.scope}</p>
              </div>
            )}
            {offer.deliverables?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-foreground mb-2">Deliverables</h4>
                <ul className="space-y-1">
                  {offer.deliverables.map((d, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" /> {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {onAccept && !isOtherAccepted && !isAccepted && offer.validation_status !== "red" && (
          <div className="mt-4 flex gap-2">
            <Button onClick={() => onAccept(offer.id)} className="bg-primary text-white hover:bg-primary/90 flex-1" disabled={accepting === offer.id}>
              {accepting === offer.id ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Accepting...</> : "Accept This Offer"}
            </Button>
          </div>
        )}
        {isAccepted && (
          <div className="mt-4">
            <Button variant="outline" className="w-full border-green-200 text-green-700" disabled>
              <CheckCircle className="w-4 h-4 mr-2" /> Offer Accepted
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}