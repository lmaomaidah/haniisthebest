import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isApproved, isAdmin, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin text-6xl">✨</div>
          <p className="text-xl text-foreground/80">Loading the vibes...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Admins always have access; non-approved users see pending screen
  if (!isApproved && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-7xl">⏳</div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Pending Approval
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your account has been created but you need to be approved by an admin before you can access the site. Hang tight!
          </p>
          <div className="bg-card/80 border border-border rounded-2xl p-4">
            <p className="text-sm text-muted-foreground">
              Ask the admin to approve your account from the Admin Dashboard.
            </p>
          </div>
          <Button onClick={signOut} variant="outline" className="mt-4">
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
