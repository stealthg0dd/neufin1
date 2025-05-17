import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { BarChart2, TrendingUp, Brain, Lightbulb, BarChart3, PieChart, LayoutDashboard, Menu } from "lucide-react";
import logoPath from "@assets/neufin tagline bare logo.png";
import { AuthButton } from "./AuthButton";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  
  return (
    <header className="border-b sticky top-0 bg-white z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/">
            <div className="flex flex-col items-center cursor-pointer">
              <img 
                src={logoPath} 
                alt="Neufin Logo" 
                className="h-14 mr-2"
              />
              <span className="text-xs text-blue-600 font-semibold whitespace-nowrap">NEURAL POWERED FINANCE UNLOCKED</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/">
              <Button 
                variant={location === "/" ? "default" : "ghost"} 
                className="text-sm h-9"
              >
                <TrendingUp className="mr-1.5 h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button 
                variant={location === "/dashboard" ? "default" : "ghost"} 
                className="text-sm h-9"
              >
                <LayoutDashboard className="mr-1.5 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/sentiment">
              <Button 
                variant={location === "/sentiment" ? "default" : "ghost"} 
                className="text-sm h-9"
              >
                <Brain className="mr-1.5 h-4 w-4" />
                Sentiment
              </Button>
            </Link>
            <Link href="/stocks">
              <Button 
                variant={location === "/stocks" ? "default" : "ghost"} 
                className="text-sm h-9"
              >
                <BarChart2 className="mr-1.5 h-4 w-4" />
                Stocks
              </Button>
            </Link>
            <Link href="/recommendations">
              <Button 
                variant={location === "/recommendations" ? "default" : "ghost"} 
                className="text-sm h-9"
              >
                <Lightbulb className="mr-1.5 h-4 w-4" />
                AI Recommendations
              </Button>
            </Link>
            <Link href="/market-data">
              <Button 
                variant={location === "/market-data" ? "default" : "ghost"} 
                className="text-sm h-9"
              >
                <BarChart3 className="mr-1.5 h-4 w-4" />
                Market Data
              </Button>
            </Link>
            <Link href="/bias-analyzer">
              <Button 
                variant={location === "/bias-analyzer" ? "default" : "ghost"} 
                className="text-sm h-9"
              >
                <PieChart className="mr-1.5 h-4 w-4" />
                Bias Analyzer
              </Button>
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="hidden sm:block">
            <AuthButton />
          </div>
          
          {!isAuthenticated && (
            <Button 
              size="sm" 
              className="hidden sm:flex"
              onClick={() => {
                // Use direct form submission for "Start Free Trial" button
                const form = document.createElement('form');
                form.method = 'get';
                form.action = '/api/login';
                document.body.appendChild(form);
                form.submit();
              }}
            >
              Start Free Trial
            </Button>
          )}
          
          {/* Mobile menu button (could be expanded with a proper mobile menu) */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;