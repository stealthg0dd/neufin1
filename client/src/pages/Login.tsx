import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import { Separator } from "@/components/ui/separator";
import logoPath from "@assets/neufin tagline bare logo.png";

export default function Login() {
  const { login, isLoading, error: authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [, params] = useRoute<{ redirectTo?: string }>("/login/:redirectTo?");
  
  const redirectTo = params?.redirectTo ? decodeURIComponent(params.redirectTo) : "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    
    try {
      setError(null);
      await login(email, password);
      toast({
        title: "Login successful",
        description: "Welcome back to Neufin!",
      });
      navigate(redirectTo);
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="mb-8">
        <img 
          src={logoPath} 
          alt="Neufin Logo" 
          className="h-12 mx-auto"
        />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Sign in to Neufin</CardTitle>
          <CardDescription className="text-center">
            Access your premium financial intelligence platform
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <GoogleLoginButton />
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button variant="link" className="px-0 text-xs text-muted-foreground" type="button">
                  Forgot password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {(error || authError) && (
              <div className="text-sm text-red-500 py-2">
                {error || authError}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col">
          <p className="text-xs text-center text-muted-foreground mt-2">
            By signing in, you agree to our{" "}
            <Button variant="link" className="p-0 h-auto text-xs">Terms of Service</Button> and{" "}
            <Button variant="link" className="p-0 h-auto text-xs">Privacy Policy</Button>
          </p>
          <div className="text-sm text-center mt-4">
            <span className="text-muted-foreground">Don't have an account?</span>{" "}
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/register")}>
              Sign up
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}