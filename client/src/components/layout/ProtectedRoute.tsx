import { Route, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

// Internal Redirect component
function Redirect({ to }: { to: string }) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation(to);
  }, [to, setLocation]);

  return null;
}

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

export function ProtectedRoute({ component: Component, path, ...rest }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Show a loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Route
      path={path}
      {...rest}
      component={(props: any) => {
        // If user is authenticated, render the component
        if (isAuthenticated) {
          return <Component {...props} />;
        }
        
        // If not authenticated, redirect to login
        return <Redirect to="/" />;
      }}
    />
  );
}