import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, X, Loader2, CheckCircle } from "lucide-react";
import { CANADIAN_PROVINCES, CANADIAN_CITIES, SERVICE_CATEGORIES } from "@/lib/constants";

export default function NewRequest() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category_id: "", category_name: "", 
    subcategory_id: "", subcategory_name: "", city: "", province: "",
    budget_min: "", budget_max: "", timeline: "", priority: "medium",
    attachments: [], images: [], documents: []
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u) { navigate("/login"); return; }
      setUser(u);
    }).catch(() => navigate("/login"));
  }, []);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selectedCategory = SERVICE_CATEGORIES.find(c => c.id === form.category_id);
  const availableCities = form.province ? CANADIAN_CITIES[form.province] || [] : [];

  const handleFileUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      urls.push(file_url);
    }
    update(type, [...form[type], ...urls]);
    setUploading(false);
  };

  const handleSubmit = async () => {
    setSaving(true);
    const payload = {
      ...form,
      customer_id: user.id,
      budget_min: form.budget_min ? parseFloat(form.budget_min) : null,
      budget_max: form.budget_max ? parseFloat(form.budget_max) : null,
      status: "active",
      offer_count: 0
    };
    const req = await base44.entities.CustomerRequest.create(payload);
    navigate(`/requests/${req.id}`);
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create New Request</h1>
          <p className="text-sm text-muted-foreground">Describe what you need and professionals will compete for your business</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 ${s <= step ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors
                ${s < step ? "bg-primary border-primary text-white" : s === step ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>
                {s < step ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              <span className="hidden sm:block text-sm font-medium">
                {s === 1 ? "Details" : s === 2 ? "Location & Budget" : "Attachments"}
              </span>
            </div>
            {s < 3 && <div className={`flex-1 h-px ${s < step ? "bg-primary" : "bg-border"}`} />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <Card className="border-border shadow-sm">
          <CardHeader><CardTitle className="text-lg">Request Details</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label htmlFor="title">Request Title *</Label>
              <Input id="title" placeholder="e.g., Need a licensed plumber for bathroom renovation" value={form.title} onChange={e => update("title", e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="desc">Description *</Label>
              <Textarea id="desc" placeholder="Describe your needs in detail..." rows={5} value={form.description} onChange={e => update("description", e.target.value)} className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Select value={form.category_id} onValueChange={v => {
                  const cat = SERVICE_CATEGORIES.find(c => c.id === v);
                  update("category_id", v);
                  update("category_name", cat?.name || "");
                  update("subcategory_id", "");
                  update("subcategory_name", "");
                }}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {SERVICE_CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subcategory</Label>
                <Select value={form.subcategory_name} onValueChange={v => { update("subcategory_name", v); update("subcategory_id", v); }} disabled={!selectedCategory}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select subcategory" /></SelectTrigger>
                  <SelectContent>
                    {(selectedCategory?.subcategories || []).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Priority</Label>
              <div className="flex gap-2 mt-1.5">
                {["low", "medium", "high", "urgent"].map(p => (
                  <Button key={p} type="button" variant={form.priority === p ? "default" : "outline"} size="sm"
                    className={form.priority === p ? "bg-primary text-white" : ""} onClick={() => update("priority", p)}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <Button onClick={() => setStep(2)} className="w-full bg-primary text-white" disabled={!form.title || !form.description || !form.category_id}>
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-border shadow-sm">
          <CardHeader><CardTitle className="text-lg">Location & Budget</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Province *</Label>
                <Select value={form.province} onValueChange={v => { update("province", v); update("city", ""); }}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select province" /></SelectTrigger>
                  <SelectContent>
                    {CANADIAN_PROVINCES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>City *</Label>
                <Select value={form.city} onValueChange={v => update("city", v)} disabled={!form.province}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select city" /></SelectTrigger>
                  <SelectContent>
                    {availableCities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="addr">Address (optional)</Label>
              <Input id="addr" placeholder="Street address or area" value={form.address || ""} onChange={e => update("address", e.target.value)} className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Budget (CAD)</Label>
                <Input type="number" placeholder="500" value={form.budget_min} onChange={e => update("budget_min", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Max Budget (CAD)</Label>
                <Input type="number" placeholder="2000" value={form.budget_max} onChange={e => update("budget_max", e.target.value)} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label>Timeline</Label>
              <Select value={form.timeline} onValueChange={v => update("timeline", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="When do you need this?" /></SelectTrigger>
                <SelectContent>
                  {["ASAP", "Within 1 week", "Within 2 weeks", "Within 1 month", "1-3 months", "Flexible"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
              <Button onClick={() => setStep(3)} className="flex-1 bg-primary text-white" disabled={!form.province || !form.city}>Continue</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="border-border shadow-sm">
          <CardHeader><CardTitle className="text-lg">Attachments (Optional)</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label>Images</Label>
              <label className="mt-1.5 flex flex-col items-center gap-2 p-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload photos of the area or item</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={e => handleFileUpload(e, "images")} />
              </label>
              {form.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.images.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg" />
                      <button onClick={() => update("images", form.images.filter((_, j) => j !== i))}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label>Documents</Label>
              <label className="mt-1.5 flex flex-col items-center gap-2 p-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload relevant documents (PDF, DOC)</span>
                <input type="file" multiple accept=".pdf,.doc,.docx" className="hidden" onChange={e => handleFileUpload(e, "documents")} />
              </label>
            </div>
            {uploading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Uploading files...</div>}
            
            {/* Summary */}
            <div className="p-4 bg-secondary/50 rounded-xl space-y-2 text-sm">
              <p className="font-semibold text-foreground mb-3">Request Summary</p>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <span>Category:</span><span className="text-foreground font-medium">{form.category_name}</span>
                <span>Location:</span><span className="text-foreground font-medium">{form.city}, {form.province}</span>
                <span>Budget:</span><span className="text-foreground font-medium">
                  {form.budget_min ? `$${parseFloat(form.budget_min).toLocaleString()} - $${parseFloat(form.budget_max || form.budget_min).toLocaleString()} CAD` : "Open"}
                </span>
                <span>Timeline:</span><span className="text-foreground font-medium">{form.timeline || "Flexible"}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
              <Button onClick={handleSubmit} className="flex-1 bg-primary text-white" disabled={saving || uploading}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</> : "Publish Request"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}