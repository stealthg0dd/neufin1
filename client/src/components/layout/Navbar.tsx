import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-100 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-primary text-2xl font-bold">
                neu<span className="text-secondary">fin</span>
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8 items-center">
            <a href="#products" className="text-neutral-600 hover:text-primary font-medium transition-colors">
              Products
            </a>
            <a href="#how-it-works" className="text-neutral-600 hover:text-primary font-medium transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-neutral-600 hover:text-primary font-medium transition-colors">
              Pricing
            </a>
            <a href="#faq" className="text-neutral-600 hover:text-primary font-medium transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              href="#"
              className="hidden md:inline-block text-neutral-600 hover:text-primary font-medium transition-colors"
            >
              Log in
            </Link>
            <Button className="bg-primary hover:bg-primary-dark transition-colors">
              Get Started
            </Button>
            <button
              className="md:hidden text-neutral-500 hover:text-neutral-700 focus:outline-none"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <a
            href="#products"
            className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-50"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Products
          </a>
          <a
            href="#how-it-works"
            className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-50"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            How It Works
          </a>
          <a
            href="#pricing"
            className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-50"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Pricing
          </a>
          <a
            href="#faq"
            className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-50"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            FAQ
          </a>
          <a
            href="#"
            className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-50"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Log in
          </a>
        </div>
      </div>
    </header>
  );
}
