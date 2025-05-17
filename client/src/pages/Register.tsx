import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import { Separator } from "@/components/ui/separator";
import logoPath from "@assets/neufin tagline bare logo.png";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      await apiRequest('/api/auth/register', 'POST', {
        name,
        email,
        password
      });
      
      toast({
        title: "Registration successful",
        description: "Your account has been created. Please sign in.",
      });
      
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
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
          <CardTitle className="text-2xl text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Register to unlock premium financial intelligence
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
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            
            {error && (
              <div className="text-sm text-red-500 py-2">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col">
          <p className="text-xs text-center text-muted-foreground mt-2">
            By creating an account, you agree to our{" "}
            <Button variant="link" className="p-0 h-auto text-xs">Terms of Service</Button> and{" "}
            <Button variant="link" className="p-0 h-auto text-xs">Privacy Policy</Button>
          </p>
          <div className="text-sm text-center mt-4">
            <span className="text-muted-foreground">Already have an account?</span>{" "}
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/login")}>
              Sign in
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}