import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ShoppingBag, Briefcase, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACCOUNT_TYPES = [
  {
    id: "customer",
    icon: ShoppingBag,
    title: "I need a service",
    subtitle: "Post requests and receive competitive offers from verified professionals",
    role: "customer",
  },
  {
    id: "professional",
    icon: Briefcase,
    title: "I offer services",
    subtitle: "Browse customer requests and submit offers to grow your business",
    role: "professional",
  },
];

export default function AuthRedirect() {
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);
  const [accountType, setAccountType] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then((user) => {
        if (!user) { window.location.href = "/login"; return; }

        // If the user has no role or role is the platform default "user", they need to pick
        const knownRoles = ["customer", "professional", "admin"];
        if (!user.role || !knownRoles.includes(user.role)) {
          setNeedsRoleSelection(true);
          return;
        }

        if (user.role === "admin") window.location.href = "/admin";
        else if (user.role === "professional") window.location.href = "/browse-requests";
        else window.location.href = "/dashboard";
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  const handleConfirmRole = async () => {
    if (!accountType) return;
    setSaving(true);
    try {
      const selectedType = ACCOUNT_TYPES.find(t => t.id === accountType);
      await base44.auth.updateMe({ role: selectedType.role });
      if (selectedType.role === "professional") {
        window.location.href = "/profile/professional";
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setSaving(false);
    }
  };

  if (needsRoleSelection) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-foreground mb-1">One last step</h2>
          <p className="text-sm text-muted-foreground mb-6">How will you use Reverse Marketplace?</p>

          <div className="space-y-3 mb-6">
            {ACCOUNT_TYPES.map((type) => {
              const Icon = type.icon;
              const selected = accountType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setAccountType(type.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40 hover:bg-secondary/40"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    selected ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground text-sm">{type.title}</p>
                      {selected && <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{type.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <Button
            className="w-full h-12 font-medium"
            onClick={handleConfirmRole}
            disabled={!accountType || saving}
          >
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Continue"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
}