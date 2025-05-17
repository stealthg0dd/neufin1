import { Link } from "wouter";
import { 
  Twitter, 
  Linkedin, 
  Facebook, 
  Instagram,
  Mail,
  Phone,
  MapPin,
  ArrowRight
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import neufinLogo from "../../assets/neufin-logo.png";

export default function Footer() {
  const [email, setEmail] = useState("");
  
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would send data to a newsletter service
    window.location.href = `mailto:info@ctechventure.com?subject=Newsletter Signup&body=Please add me to your newsletter: ${email}`;
    setEmail("");
  };

  return (
    <footer className="bg-neutral-900 text-white pt-16 pb-8" id="contact">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <img src={neufinLogo} alt="Neufin AI Logo" className="h-10" />
            </Link>
            <p className="text-neutral-400 mb-6">
              AI-powered financial intelligence platform transforming how investors make decisions.
            </p>
            
            {/* Contact Information */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-primary mr-3" />
                <a href="mailto:info@ctechventure.com" className="text-neutral-400 hover:text-white transition-colors">
                  info@ctechventure.com
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-primary mr-3" />
                <span className="text-neutral-400">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mr-3 mt-1" />
                <span className="text-neutral-400">123 Finance Street, Suite 300<br />New York, NY 10001</span>
              </div>
            </div>
            
            {/* Social Media Links */}
            <div className="flex space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Products</h3>
            <ul className="space-y-3">
              <li>
                <a href="#products" className="text-neutral-400 hover:text-white transition-colors">
                  Neufin Sentient
                </a>
              </li>
              <li>
                <a href="#products" className="text-neutral-400 hover:text-white transition-colors">
                  Neufin Nemo
                </a>
              </li>
              <li>
                <a href="#products" className="text-neutral-400 hover:text-white transition-colors">
                  Neufin O2
                </a>
              </li>
              <li>
                <a href="#products" className="text-neutral-400 hover:text-white transition-colors">
                  Neufin BBA
                </a>
              </li>
              <li>
                <a href="#products" className="text-neutral-400 hover:text-white transition-colors">
                  API & Integrations
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-neutral-400 hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#faqs" className="text-neutral-400 hover:text-white transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Newsletter</h3>
            <p className="text-neutral-400 mb-4 text-sm">
              Subscribe to our newsletter for the latest updates, market insights, and AI-powered tips.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="flex flex-col space-y-2">
                <Input 
                  type="email" 
                  placeholder="Your email address" 
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full">
                  Subscribe <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Neufin Technologies, Inc. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-neutral-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-neutral-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-neutral-400 hover:text-white text-sm transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
