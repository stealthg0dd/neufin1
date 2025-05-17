import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Loader2 } from "lucide-react";

export function AuthButton() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  // If user is authenticated, show user menu
  if (isAuthenticated && user) {
    const avatarSrc = user.profileImageUrl;
    const displayName = user.firstName || user.email;
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarSrc} alt={user.firstName || user.email || "User"} />
              <AvatarFallback>
                {user.firstName ? user.firstName.charAt(0).toUpperCase() : 
                  user.lastName ? user.lastName.charAt(0).toUpperCase() :
                  user.email ? user.email.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <a href="/dashboard" className="w-full">Dashboard</a>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <a href="/api/logout" className="w-full">Logout</a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // If user is not authenticated, show login button
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => {
        // Use direct form submission instead of changing location
        const form = document.createElement('form');
        form.method = 'get';
        form.action = '/api/login';
        document.body.appendChild(form);
        form.submit();
      }}
    >
      Sign In
    </Button>
  );
}