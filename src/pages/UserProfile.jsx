import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Shield, CheckCircle, Loader2, Zap } from "lucide-react";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ role: user.role });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!user) return null;

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-5 mb-6">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary text-white text-xl font-bold">
                  {user.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-foreground">{user.full_name || "User"}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={
                    user.role === "admin" ? "bg-purple-100 text-purple-800" :
                    user.role === "professional" ? "bg-blue-100 text-blue-800" :
                    "bg-green-100 text-green-800"
                  }>
                    {user.role === "admin" ? <><Shield className="w-3 h-3 mr-1" />Admin</> :
                     user.role === "professional" ? <><Zap className="w-3 h-3 mr-1" />Professional</> :
                     <><User className="w-3 h-3 mr-1" />Customer</>}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator className="mb-6" />

            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input value={user.full_name || ""} disabled className="mt-1.5 bg-secondary/30" />
                <p className="text-xs text-muted-foreground mt-1">Name is managed by your account settings</p>
              </div>
              <div>
                <Label>Email Address</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={user.email || ""} disabled className="pl-9 bg-secondary/30" />
                </div>
              </div>
              <div>
                <Label>Account Role</Label>
                <Select value={user.role || "customer"} onValueChange={v => setUser(u => ({ ...u, role: v }))}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer — Browse and request services</SelectItem>
                    <SelectItem value="professional">Professional — Submit offers to customer requests</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Changing your role affects what you can do on the platform</p>
              </div>
            </div>

            <Button onClick={handleSave} className="w-full mt-6 bg-primary text-white" disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> :
               saved ? <><CheckCircle className="w-4 h-4 mr-2" /> Saved!</> : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="border-border shadow-sm">
          <CardHeader><CardTitle className="text-base">Account Information</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Account ID</span>
              <span className="font-mono text-xs text-foreground">{user.id?.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Member Since</span>
              <span className="text-foreground">{user.created_date ? new Date(user.created_date).toLocaleDateString("en-CA") : "—"}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Platform</span>
              <span className="text-foreground flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-primary" /> OfferMatch Canada
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}