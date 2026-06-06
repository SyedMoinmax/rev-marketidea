import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X, Zap, DollarSign, Clock, Star, CheckCircle, Trophy,
  ChevronDown, ChevronUp, BarChart2, Loader2
} from "lucide-react";

const SCORE_FIELDS = [
  { key: "price_score",           label: "Price",          color: "#3B82F6" },
  { key: "quality_score",         label: "Quality",        color: "#10B981" },
  { key: "reputation_score",      label: "Reputation",     color: "#8B5CF6" },
  { key: "reliability_score",     label: "Reliability",    color: "#F59E0B" },
  { key: "market_alignment_score",label: "Market Fit",     color: "#EF4444" },
];

function ScoreBar({ value, color, animate }) {
  return (
    <div className="h-2 bg-secondary rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: animate ? `${value || 0}%` : `${value || 0}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  );
}

function ValidationBadge({ status }) {
  const cfg = {
    green:  { cls: "bg-green-100 text-green-800 border-green-200",  label: "✓ Green — Competitive" },
    yellow: { cls: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "⚠ Yellow — Review" },
    red:    { cls: "bg-red-100 text-red-800 border-red-200",        label: "✗ Red — Flagged" },
    pending:{ cls: "bg-blue-100 text-blue-800 border-blue-200",     label: "⏳ Pending" },
  };
  const c = cfg[status] || cfg.pending;
  return <Badge className={`text-xs border ${c.cls}`}>{c.label}</Badge>;
}

export default function OfferCompare({ offers, professionals, request, onAccept, accepting, onClose }) {
  const [selected, setSelected] = useState(offers.slice(0, 2).map(o => o.id));
  const [animated] = useState(true);

  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : prev.length < 3
          ? [...prev, id]
          : [prev[1], prev[2] || prev[0], id].filter(Boolean)
    );
  };

  const compareOffers = offers.filter(o => selected.includes(o.id));

  const colWidth = compareOffers.length === 1 ? "w-full max-w-sm" : compareOffers.length === 2 ? "flex-1" : "flex-1";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="mt-6"
    >
      <Card className="border-border shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              Side-by-Side Comparison
              <Badge className="bg-primary/10 text-primary text-xs ml-1">{compareOffers.length} selected</Badge>
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Offer selector chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            {offers.map((o, i) => {
              const prof = professionals[o.professional_id] || professionals[o.professional_user_id];
              const isSelected = selected.includes(o.id);
              return (
                <button
                  key={o.id}
                  onClick={() => toggle(o.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isSelected
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-secondary text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {i === 0 && <Trophy className="w-3 h-3" />}
                  {prof?.business_name || `Offer ${i + 1}`} · ${o.price?.toLocaleString()}
                </button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {compareOffers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Select at least one offer to compare.</p>
          ) : (
            <div className={`flex gap-4 ${compareOffers.length === 1 ? "justify-center" : ""}`}>
              {compareOffers.map((offer, idx) => {
                const prof = professionals[offer.professional_id] || professionals[offer.professional_user_id];
                const isTop = offer.overall_score === Math.max(...offers.map(o => o.overall_score || 0));
                const canAccept = onAccept && request?.status === "active";

                return (
                  <motion.div
                    key={offer.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`${colWidth} min-w-0`}
                  >
                    <div className={`rounded-xl border-2 overflow-hidden ${
                      isTop ? "border-primary shadow-md shadow-primary/10" : "border-border"
                    }`}>
                      {/* Header */}
                      <div className={`p-4 ${isTop ? "bg-primary/5" : "bg-secondary/30"}`}>
                        {isTop && (
                          <div className="flex items-center gap-1 text-xs font-bold text-primary mb-2">
                            <Trophy className="w-3 h-3" /> Top AI Score
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-foreground text-sm truncate">
                              {prof?.business_name || `Professional ${idx + 1}`}
                            </p>
                            {prof?.average_rating > 0 && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {prof.average_rating}/5
                              </div>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xl font-black text-foreground">${offer.price?.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{offer.price_type || "fixed"}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <ValidationBadge status={offer.validation_status} />
                        </div>
                      </div>

                      {/* Overall score */}
                      <div className="px-4 py-3 border-b border-border">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Zap className="w-3 h-3 text-primary" /> AI Score
                          </span>
                          <span className="text-2xl font-black text-primary">
                            {offer.overall_score ? Math.round(offer.overall_score) : "—"}
                            <span className="text-xs font-normal text-muted-foreground">/100</span>
                          </span>
                        </div>
                        {offer.overall_score && (
                          <ScoreBar value={offer.overall_score} color="hsl(var(--primary))" animate={animated} />
                        )}
                      </div>

                      {/* Score breakdown */}
                      <div className="px-4 py-3 space-y-2.5 border-b border-border">
                        {SCORE_FIELDS.map(f => (
                          <div key={f.key}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">{f.label}</span>
                              <span className="font-semibold text-foreground">{offer[f.key] || 0}</span>
                            </div>
                            <ScoreBar value={offer[f.key] || 0} color={f.color} animate={animated} />
                          </div>
                        ))}
                      </div>

                      {/* Meta */}
                      <div className="px-4 py-3 space-y-2 border-b border-border">
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-foreground">{offer.timeline || "—"}</span>
                        </div>
                        {offer.deliverables?.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Deliverables</p>
                            <div className="space-y-0.5">
                              {offer.deliverables.slice(0, 3).map((d, i) => (
                                <div key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                                  <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="line-clamp-1">{d}</span>
                                </div>
                              ))}
                              {offer.deliverables.length > 3 && (
                                <p className="text-xs text-muted-foreground">+{offer.deliverables.length - 3} more</p>
                              )}
                            </div>
                          </div>
                        )}
                        {offer.validation_message && (
                          <p className="text-xs text-muted-foreground italic line-clamp-2">{offer.validation_message}</p>
                        )}
                      </div>

                      {/* Accept button */}
                      {canAccept && (
                        <div className="p-3">
                          <Button
                            size="sm"
                            className={`w-full ${isTop ? "bg-primary hover:bg-primary/90" : "bg-secondary text-foreground hover:bg-secondary/70"}`}
                            onClick={() => onAccept(offer.id)}
                            disabled={!!accepting}
                          >
                            {accepting === offer.id
                              ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> Accepting...</>
                              : <><CheckCircle className="w-3.5 h-3.5 mr-1" /> Accept This Offer</>
                            }
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}