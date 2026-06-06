import { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

export default function AuthRedirect() {
  useEffect(() => {
    base44.auth.me()
      .then((user) => {
        if (user?.role === "admin") window.location.href = "/admin";
        else if (user?.role === "professional") window.location.href = "/browse-requests";
        else window.location.href = "/dashboard";
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
}