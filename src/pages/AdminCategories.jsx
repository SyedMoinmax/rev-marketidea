import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, Loader2, Pencil, Trash2, CheckCircle, Building2, 
  Wrench, Car, Briefcase, Monitor, Heart, Store, Tag
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { SERVICE_CATEGORIES } from "@/lib/constants";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", name_fr: "", slug: "", description: "", is_active: true, ai_pricing_context: "", min_price_cad: "", max_price_cad: "" });

  useEffect(() => {
    const load = async () => {
      let cats = await base44.entities.ServiceCategory.list("sort_order", 100).catch(() => []);
      if (cats.length === 0) {
        // Seed from constants
        const seeded = await Promise.all(SERVICE_CATEGORIES.map((c, i) =>
          base44.entities.ServiceCategory.create({ name: c.name, slug: c.id, is_active: true, sort_order: i })
        ));
        cats = seeded;
      }
      setCategories(cats);
      setLoading(false);
    };
    load();
  }, []);

  const openNew = () => {
    setEditingCat(null);
    setForm({ name: "", name_fr: "", slug: "", description: "", is_active: true, ai_pricing_context: "", min_price_cad: "", max_price_cad: "" });
    setShowDialog(true);
  };

  const openEdit = (cat) => {
    setEditingCat(cat);
    setForm({ ...cat, min_price_cad: cat.min_price_cad || "", max_price_cad: cat.max_price_cad || "" });
    setShowDialog(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...form, min_price_cad: form.min_price_cad ? parseFloat(form.min_price_cad) : null, max_price_cad: form.max_price_cad ? parseFloat(form.max_price_cad) : null };
    if (editingCat) {
      await base44.entities.ServiceCategory.update(editingCat.id, payload);
      setCategories(prev => prev.map(c => c.id === editingCat.id ? { ...c, ...payload } : c));
    } else {
      const c = await base44.entities.ServiceCategory.create(payload);
      setCategories(prev => [...prev, c]);
    }
    setShowDialog(false);
    setSaving(false);
  };

  const toggleActive = async (cat) => {
    await base44.entities.ServiceCategory.update(cat.id, { is_active: !cat.is_active });
    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, is_active: !c.is_active } : c));
  };

  const deleteCat = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    await base44.entities.ServiceCategory.delete(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Category Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{categories.length} categories</p>
        </div>
        <Button onClick={openNew} className="bg-primary text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      </div>

      <div className="space-y-3">
        {categories.map(cat => (
          <Card key={cat.id} className="border-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  <Tag className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{cat.name}</h3>
                    {cat.name_fr && <span className="text-xs text-muted-foreground">/ {cat.name_fr}</span>}
                    <Badge className={cat.is_active ? "bg-green-100 text-green-800 text-xs" : "bg-gray-100 text-gray-600 text-xs"}>
                      {cat.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{cat.description || `Slug: ${cat.slug}`}</p>
                  {(cat.min_price_cad || cat.max_price_cad) && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Price range: ${cat.min_price_cad?.toLocaleString() || "—"} – ${cat.max_price_cad?.toLocaleString() || "—"} CAD
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Switch checked={cat.is_active} onCheckedChange={() => toggleActive(cat)} />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteCat(cat.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCat ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Name (English) *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1.5" /></div>
              <div><Label>Name (French)</Label><Input value={form.name_fr} onChange={e => setForm(f => ({ ...f, name_fr: e.target.value }))} className="mt-1.5" /></div>
            </div>
            <div><Label>Slug (URL key)</Label><Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="mt-1.5" placeholder="e.g. home-services" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1.5" rows={2} /></div>
            <div><Label>AI Pricing Context</Label><Textarea value={form.ai_pricing_context} onChange={e => setForm(f => ({ ...f, ai_pricing_context: e.target.value }))} className="mt-1.5" rows={2} placeholder="Context for AI to validate pricing in this category..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Min Price (CAD)</Label><Input type="number" value={form.min_price_cad} onChange={e => setForm(f => ({ ...f, min_price_cad: e.target.value }))} className="mt-1.5" /></div>
              <div><Label>Max Price (CAD)</Label><Input type="number" value={form.max_price_cad} onChange={e => setForm(f => ({ ...f, max_price_cad: e.target.value }))} className="mt-1.5" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-primary text-white" disabled={saving || !form.name}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {editingCat ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}