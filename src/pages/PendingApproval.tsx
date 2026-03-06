import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import WhimsicalBackground from "@/components/WhimsicalBackground";
import { useAuth } from "@/hooks/useAuth";

export default function PendingApproval() {
  const navigate = useNavigate();
  const { user, isApproved, isAdmin, refreshProfile, signOut, loading, profile } = useAuth();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }

    if (isApproved || isAdmin) {
      navigate("/", { replace: true });
    }
  }, [user, isApproved, isAdmin, navigate, loading]);

  const handleCheckAgain = async () => {
    setChecking(true);
    await refreshProfile();
    setChecking(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      <WhimsicalBackground />

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-lg bg-card/90 backdrop-blur-md border-2 border-border shadow-lg relative z-10">
        <CardHeader className="text-center space-y-3">
          <CardTitle className="text-3xl font-bold text-foreground">Approval Pending</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {profile?.username ? `@${profile.username}, your account is waiting for admin approval.` : "Your account is waiting for admin approval."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            Once approved, you’ll automatically get access to the full website.
          </div>

          <div className="flex gap-3">
            <Button onClick={handleCheckAgain} disabled={checking} className="flex-1">
              {checking ? "Checking..." : "Check approval status"}
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="flex-1">
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
