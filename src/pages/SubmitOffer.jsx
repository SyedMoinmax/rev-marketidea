import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { validateOffer } from "@/lib/aiValidation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Zap, Plus, X, Loader2, CheckCircle, 
  AlertCircle, XCircle, TrendingUp, DollarSign, Clock
} from "lucide-react";

export default function SubmitOffer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [user, setUser] = useState(null);
  const [professionalProfile, setProfessionalProfile] = useState(null);
  const [form, setForm] = useState({
    price: "", price_type: "fixed", price_max: "",
    description: "", scope: "", timeline: "", timeline_days: "",
    deliverables: [""], notes: ""
  });
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me().catch(() => null);
      setUser(u);
      if (u) {
        const [reqs, profs] = await Promise.all([
          base44.entities.CustomerRequest.filter({ id }).then(d => d[0]),
          base44.entities.ProfessionalProfile.filter({ user_id: u.id })
        ]);
        setRequest(reqs);
        setProfessionalProfile(profs[0] || null);
      }
    };
    load();
  }, [id]);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addDeliverable = () => update("deliverables", [...form.deliverables, ""]);
  const updateDeliverable = (i, v) => {
    const d = [...form.deliverables];
    d[i] = v;
    update("deliverables", d);
  };
  const removeDeliverable = (i) => update("deliverables", form.deliverables.filter((_, j) => j !== i));

  const handleValidate = async () => {
    setValidating(true);
    setValidationResult(null);
    const offerData = {
      ...form,
      price: parseFloat(form.price),
      deliverables: form.deliverables.filter(d => d.trim())
    };
    const result = await validateOffer(offerData, request, professionalProfile);
    setValidationResult(result);
    setValidating(false);
  };

  const handleSubmit = async () => {
    setSaving(true);
    const vr = validationResult || {};
    const offerData = {
      request_id: id,
      professional_id: professionalProfile?.id || user.id,
      professional_user_id: user.id,
      customer_id: request.customer_id,
      ...form,
      price: parseFloat(form.price),
      price_max: form.price_max ? parseFloat(form.price_max) : null,
      timeline_days: form.timeline_days ? parseInt(form.timeline_days) : null,
      deliverables: form.deliverables.filter(d => d.trim()),
      validation_status: vr.validation_status || "pending",
      validation_message: vr.validation_message || "",
      validation_recommendations: vr.validation_recommendations || [],
      overall_score: vr.overall_score || null,
      price_score: vr.price_score || null,
      quality_score: vr.quality_score || null,
      reputation_score: vr.reputation_score || null,
      reliability_score: vr.reliability_score || null,
      market_alignment_score: vr.market_alignment_score || null,
      score_label: vr.score_label || null,
      status: "submitted",
      is_visible_to_customer: vr.validation_status === "green" || vr.validation_status === "yellow",
      resubmission_count: 0
    };
    await base44.entities.Offer.create(offerData);
    // Update offer count on request
    await base44.entities.CustomerRequest.update(id, { offer_count: (request.offer_count || 0) + 1 });
    navigate("/my-offers");
  };

  const ValidationResultDisplay = () => {
    if (!validationResult) return null;
    const { validation_status: vs, validation_message, validation_recommendations, overall_score, analysis_summary } = validationResult;
    const cfg = {
      green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", icon: CheckCircle, iconColor: "text-green-600", label: "Green — Competitive Offer" },
      yellow: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800", icon: AlertCircle, iconColor: "text-yellow-600", label: "Yellow — Needs Attention" },
      red: { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", icon: XCircle, iconColor: "text-red-600", label: "Red — Blocked" }
    }[vs] || { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", icon: Zap, iconColor: "text-blue-600", label: "Validating" };
    const IconComp = cfg.icon;

    return (
      <div className={`mt-6 p-5 rounded-xl border ${cfg.bg} ${cfg.border}`}>
        <div className="flex items-start gap-3 mb-3">
          <IconComp className={`w-5 h-5 flex-shrink-0 mt-0.5 ${cfg.iconColor}`} />
          <div className="flex-1">
            <p className={`font-semibold text-sm ${cfg.text}`}>{cfg.label}</p>
            <p className={`text-sm mt-1 ${cfg.text} opacity-80`}>{validation_message}</p>
          </div>
          {overall_score && (
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-bold text-foreground">{Math.round(overall_score)}</div>
              <div className="text-xs text-muted-foreground">/100</div>
            </div>
          )}
        </div>
        {analysis_summary && <p className={`text-xs ${cfg.text} opacity-70 mb-3`}>{analysis_summary}</p>}
        {validation_recommendations?.length > 0 && (
          <div className={`space-y-1.5 pt-3 border-t ${cfg.border}`}>
            <p className={`text-xs font-semibold ${cfg.text} mb-2`}>Recommendations:</p>
            {validation_recommendations.map((r, i) => (
              <div key={i} className={`flex items-start gap-2 text-xs ${cfg.text}`}>
                <span className="mt-0.5">•</span> {r}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!request) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Submit an Offer</h1>
          <p className="text-sm text-muted-foreground mt-1">{request.title}</p>
        </div>
      </div>

      {/* Request summary */}
      <Card className="mb-6 border-border shadow-sm bg-accent/20">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="text-muted-foreground">Budget: <span className="font-semibold text-foreground">
              {request.budget_min ? `$${request.budget_min.toLocaleString()} – $${(request.budget_max||request.budget_min).toLocaleString()} CAD` : "Open"}
            </span></span>
            <span className="text-muted-foreground">Location: <span className="font-semibold text-foreground">{request.city}, {request.province}</span></span>
            <span className="text-muted-foreground">Timeline: <span className="font-semibold text-foreground">{request.timeline || "Flexible"}</span></span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader><CardTitle className="text-lg">Your Offer</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Your Price (CAD) *</Label>
              <div className="relative mt-1.5">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="number" placeholder="2500" value={form.price} onChange={e => update("price", e.target.value)} className="pl-8" />
              </div>
            </div>
            <div>
              <Label>Pricing Type</Label>
              <Select value={form.price_type} onValueChange={v => update("price_type", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="hourly">Hourly Rate</SelectItem>
                  <SelectItem value="range">Price Range</SelectItem>
                  <SelectItem value="negotiable">Negotiable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Timeline *</Label>
              <Select value={form.timeline} onValueChange={v => update("timeline", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="When can you deliver?" /></SelectTrigger>
                <SelectContent>
                  {["Within 1 day", "2-3 days", "Within 1 week", "1-2 weeks", "2-4 weeks", "1-2 months", "2-3 months"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Days to Complete</Label>
              <Input type="number" placeholder="14" value={form.timeline_days} onChange={e => update("timeline_days", e.target.value)} className="mt-1.5" />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label>Offer Description *</Label>
            <Textarea placeholder="Describe your offer and why you're the best choice..." rows={4} value={form.description} onChange={e => update("description", e.target.value)} className="mt-1.5" />
          </div>

          {/* Scope */}
          <div>
            <Label>Scope of Work</Label>
            <Textarea placeholder="Detailed scope of what's included..." rows={3} value={form.scope} onChange={e => update("scope", e.target.value)} className="mt-1.5" />
          </div>

          {/* Deliverables */}
          <div>
            <Label>Deliverables</Label>
            <div className="mt-1.5 space-y-2">
              {form.deliverables.map((d, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder={`Deliverable ${i + 1}`} value={d} onChange={e => updateDeliverable(i, e.target.value)} />
                  {form.deliverables.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeDeliverable(i)} className="flex-shrink-0">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addDeliverable} className="text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Deliverable
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Additional Notes</Label>
            <Textarea placeholder="Any additional terms, conditions, or notes..." rows={2} value={form.notes} onChange={e => update("notes", e.target.value)} className="mt-1.5" />
          </div>

          {/* AI Validation */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">AI Validation Engine</h3>
              <Badge className="bg-accent text-accent-foreground text-xs border-0">Required</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Your offer will be analyzed against Canadian market rates for {request.city}, {request.province} before being shown to the customer.
            </p>
            <Button onClick={handleValidate} variant="outline" className="border-primary text-primary hover:bg-accent w-full sm:w-auto" 
              disabled={validating || !form.price || !form.description || !form.timeline}>
              {validating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing offer...</> : <><Zap className="w-4 h-4 mr-2" /> Validate with AI</>}
            </Button>
          </div>

          <ValidationResultDisplay />

          {/* Submit */}
          {validationResult && validationResult.validation_status !== "red" && (
            <Button onClick={handleSubmit} className="w-full bg-primary text-white hover:bg-primary/90" disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : "Submit Offer"}
            </Button>
          )}
          {validationResult?.validation_status === "red" && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <strong>Offer blocked.</strong> Please address the recommendations above and re-validate before submitting.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}