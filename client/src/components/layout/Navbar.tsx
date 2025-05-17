import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { BarChart2, TrendingUp, Brain, Lightbulb, BarChart3 } from "lucide-react";
import logoPath from "@assets/neufin tagline bare logo.png";

const Navbar = () => {
  const [location] = useLocation();
  
  return (
    <header className="border-b sticky top-0 bg-white z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <img 
                src={logoPath} 
                alt="Neufin Logo" 
                className="h-10 mr-2"
              />
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
          </nav>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            Sign In
          </Button>
          <Button size="sm" className="hidden sm:flex">
            Get Started
          </Button>
          
          {/* Mobile menu button (could be expanded with a proper mobile menu) */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;