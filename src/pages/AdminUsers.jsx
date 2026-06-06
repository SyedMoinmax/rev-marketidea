import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, Users, Loader2, Shield, MoreHorizontal, 
  Mail, Calendar, UserCheck, UserX
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    base44.entities.User.list("-created_date", 200)
      .then(setUsers).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const matchSearch = !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const updateRole = async (userId, newRole) => {
    await base44.entities.User.update(userId, { role: newRole });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));

    // If approving as professional, create a skeleton ProfessionalProfile if they don't have one
    if (newRole === "professional") {
      const existing = await base44.entities.ProfessionalProfile.filter({ user_id: userId });
      if (existing.length === 0) {
        const targetUser = users.find(u => u.id === userId);
        await base44.entities.ProfessionalProfile.create({
          user_id: userId,
          business_name: targetUser?.full_name ? `${targetUser.full_name}'s Services` : "New Professional",
          verification_status: "approved",
          is_active: true,
          availability: "available"
        });
      } else {
        await base44.entities.ProfessionalProfile.update(existing[0].id, { verification_status: "approved", is_active: true });
      }
      // Send notification to the user
      await base44.entities.Notification.create({
        user_id: userId,
        type: "verification_approved",
        title: "Your professional account is approved! ✅",
        message: "You can now browse customer requests and submit offers. Complete your professional profile to increase your visibility.",
        link: "/profile/professional",
        is_read: false
      });
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const pendingProfessionals = users.filter(u => u.role === "customer" && u.requested_professional);
  const professionalCount = users.filter(u => u.role === "professional").length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-sm text-muted-foreground mt-1">{users.length} registered users · {professionalCount} professionals</p>
      </div>

      {/* Role assignment guide */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <p className="font-semibold mb-1">How to approve professionals</p>
        <p className="text-blue-700">When a user registers as a professional, their role is set to <strong>professional</strong>. Use the Actions menu below to change roles. Approving a professional automatically creates their profile and sends them a notification.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">User</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Role</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Joined</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {u.full_name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm text-foreground">{u.full_name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{u.email}</td>
                    <td className="px-6 py-4">
                      <Badge className={
                        u.role === "admin" ? "bg-purple-100 text-purple-800" :
                        u.role === "professional" ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-800"
                      }>{u.role || "customer"}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {u.created_date ? new Date(u.created_date).toLocaleDateString("en-CA") : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => updateRole(u.id, "customer")}>
                            <UserCheck className="w-4 h-4 mr-2" /> Set as Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateRole(u.id, "professional")}>
                            <Shield className="w-4 h-4 mr-2" /> Set as Professional
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateRole(u.id, "admin")}>
                            <Shield className="w-4 h-4 mr-2 text-purple-600" /> Set as Admin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}