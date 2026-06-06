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
import { Separator } from "@/components/ui/separator";
import { 
  Building2, MapPin, Globe, Phone, Upload, Plus, X, 
  Loader2, CheckCircle, Shield, Star, Camera
} from "lucide-react";
import { CANADIAN_PROVINCES, CANADIAN_CITIES, SERVICE_CATEGORIES } from "@/lib/constants";

export default function ProfessionalProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    business_name: "", business_type: "", description: "", phone: "",
    website: "", address: "", city: "", province: "", postal_code: "",
    years_experience: "", license_number: "", insurance_info: "",
    service_categories: [], service_areas: [], languages: ["English"],
    availability: "available", logo_url: ""
  });

  const generateLicenseNumber = () => {
    const num = Math.floor(100000 + Math.random() * 900000);
    return `REV-EMP-${num}`;
  };

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me().catch(() => null);
      setUser(u);
      if (u) {
        const [profs, docs] = await Promise.all([
          base44.entities.ProfessionalProfile.filter({ user_id: u.id }),
          base44.entities.VerificationDocument.filter({ user_id: u.id })
        ]);
        if (profs.length > 0) {
          setProfile(profs[0]);
          setForm(f => ({ ...f, ...profs[0] }));
        } else {
          // Pre-generate a license number for new profiles
          setForm(f => ({ ...f, license_number: generateLicenseNumber() }));
        }
        setDocuments(docs);
      }
    };
    load();
  }, []);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleCategory = (catId) => {
    const cats = form.service_categories.includes(catId)
      ? form.service_categories.filter(c => c !== catId)
      : [...form.service_categories, catId];
    update("service_categories", cats);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update("logo_url", file_url);
    setUploading(false);
  };

  const handleDocUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.VerificationDocument.create({
      professional_id: profile?.id || "pending",
      user_id: user.id,
      type: docType,
      file_url,
      file_name: file.name,
      status: "pending"
    });
    const docs = await base44.entities.VerificationDocument.filter({ user_id: user.id });
    setDocuments(docs);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      user_id: user.id,
      years_experience: form.years_experience ? parseInt(form.years_experience) : null,
    };
    if (profile?.id) {
      await base44.entities.ProfessionalProfile.update(profile.id, payload);
    } else {
      const p = await base44.entities.ProfessionalProfile.create(payload);
      setProfile(p);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setSaving(false);
  };

  const availableCities = form.province ? CANADIAN_CITIES[form.province] || [] : [];
  const verStatus = profile?.verification_status || "pending";
  const verConfig = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending Review" },
    approved: { bg: "bg-green-100", text: "text-green-800", label: "Verified" },
    rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
    suspended: { bg: "bg-gray-100", text: "text-gray-800", label: "Suspended" }
  }[verStatus];

  const DOC_TYPES = [
    { key: "government_id", label: "Government ID", desc: "Passport, Driver's License, or other govt. ID" },
    { key: "business_registration", label: "Business Registration", desc: "Certificate of incorporation or business number" },
    { key: "address_proof", label: "Address Proof", desc: "Utility bill or bank statement" },
    { key: "insurance", label: "Insurance Certificate", desc: "General liability or professional insurance" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Professional Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Complete your profile to start receiving requests</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`${verConfig.bg} ${verConfig.text} border-0`}>
            {verStatus === "approved" && <Shield className="w-3 h-3 mr-1" />}
            {verConfig.label}
          </Badge>
          <Button onClick={handleSave} className="bg-primary text-white" disabled={saving}>
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> :
             saved ? <><CheckCircle className="w-4 h-4 mr-2" /> Saved!</> : "Save Profile"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Business Info */}
        <Card className="border-border shadow-sm">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /> Business Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center overflow-hidden border border-border">
                {form.logo_url ? <img src={form.logo_url} alt="Logo" className="w-full h-full object-cover" /> :
                  <Building2 className="w-7 h-7 text-muted-foreground" />}
              </div>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <Button variant="outline" size="sm" asChild>
                  <span><Camera className="w-3.5 h-3.5 mr-1.5" /> {uploading ? "Uploading..." : "Upload Logo"}</span>
                </Button>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Business Name *</Label><Input value={form.business_name} onChange={e => update("business_name", e.target.value)} className="mt-1.5" /></div>
              <div><Label>Business Type</Label>
                <Select value={form.business_type} onValueChange={v => update("business_type", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {["Sole Proprietor", "Partnership", "Corporation", "Cooperative", "Non-profit"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Business Description</Label><Textarea rows={3} value={form.description} onChange={e => update("description", e.target.value)} className="mt-1.5" placeholder="Describe your business and expertise..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => update("phone", e.target.value)} className="mt-1.5" placeholder="+1 (416) 555-0100" /></div>
              <div><Label>Website</Label><Input value={form.website} onChange={e => update("website", e.target.value)} className="mt-1.5" placeholder="https://..." /></div>
              <div><Label>Years of Experience</Label><Input type="number" value={form.years_experience} onChange={e => update("years_experience", e.target.value)} className="mt-1.5" /></div>
              <div>
                <Label>License Number</Label>
                <div className="mt-1.5 flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-secondary/30 text-sm font-mono text-foreground select-all">
                  {form.license_number || "—"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Auto-generated — assigned by the platform</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="border-border shadow-sm">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Location & Service Areas</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Province</Label>
                <Select value={form.province} onValueChange={v => { update("province", v); update("city", ""); }}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{CANADIAN_PROVINCES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>City</Label>
                <Select value={form.city} onValueChange={v => update("city", v)} disabled={!form.province}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select city" /></SelectTrigger>
                  <SelectContent>{availableCities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Business Address</Label><Input value={form.address} onChange={e => update("address", e.target.value)} className="mt-1.5" /></div>
            <div><Label>Postal Code</Label><Input value={form.postal_code} onChange={e => update("postal_code", e.target.value)} className="mt-1.5 w-40" /></div>
          </CardContent>
        </Card>

        {/* Service Categories */}
        <Card className="border-border shadow-sm">
          <CardHeader><CardTitle className="text-base">Service Categories</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {SERVICE_CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => toggleCategory(cat.id)}
                  className={`p-3 rounded-xl border text-left transition-all text-sm font-medium
                    ${form.service_categories.includes(cat.id) ? "bg-accent border-primary text-primary" : "border-border text-foreground hover:border-primary/40"}`}>
                  {cat.name}
                  {form.service_categories.includes(cat.id) && <CheckCircle className="w-3.5 h-3.5 ml-1 inline text-primary" />}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Verification Documents */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Verification Documents
            </CardTitle>
            <p className="text-xs text-muted-foreground">Upload documents to get verified and build customer trust</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {DOC_TYPES.map(docType => {
              const uploaded = documents.find(d => d.type === docType.key);
              const statusCfg = { pending: "bg-yellow-100 text-yellow-800", approved: "bg-green-100 text-green-800", rejected: "bg-red-100 text-red-800" };
              return (
                <div key={docType.key} className="flex items-center justify-between p-4 border border-border rounded-xl">
                  <div>
                    <p className="font-medium text-sm text-foreground">{docType.label}</p>
                    <p className="text-xs text-muted-foreground">{docType.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {uploaded ? (
                      <Badge className={`${statusCfg[uploaded.status] || ""} text-xs`}>{uploaded.status}</Badge>
                    ) : (
                      <label className="cursor-pointer">
                        <input type="file" className="hidden" onChange={e => handleDocUpload(e, docType.key)} />
                        <Button variant="outline" size="sm" asChild>
                          <span className="text-xs"><Upload className="w-3 h-3 mr-1" /> Upload</span>
                        </Button>
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Availability */}
        <Card className="border-border shadow-sm">
          <CardHeader><CardTitle className="text-base">Availability</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {["available", "busy", "unavailable"].map(a => (
                <Button key={a} variant={form.availability === a ? "default" : "outline"}
                  className={form.availability === a ? "bg-primary text-white" : ""}
                  onClick={() => update("availability", a)}>
                  {a.charAt(0).toUpperCase() + a.slice(1)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full bg-primary text-white h-12 text-base" disabled={saving}>
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Profile...</> :
           saved ? <><CheckCircle className="w-4 h-4 mr-2" /> Profile Saved!</> : "Save Professional Profile"}
        </Button>
      </div>
    </div>
  );
}