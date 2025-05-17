import { Button } from "@/components/ui/button";
import { ArrowRight, Star, StarHalf } from "lucide-react";
import financialDashboard from "../../assets/financial-dashboard.png";
import neufinLogo from "../../assets/neufin-logo.png";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          <div className="lg:col-span-6 mb-12 lg:mb-0">
            <div className="flex items-center mb-6">
              <img src={neufinLogo} alt="Neufin AI Logo" className="h-16 mr-4" />
              <h2 className="text-2xl font-bold">NEURAL POWERED FINANCE UNLOCKED</h2>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight">
              Financial intelligence, <span className="text-primary">powered by AI</span>
            </h1>
            <p className="mt-6 text-xl text-neutral-600 max-w-3xl">
              Make smarter investment decisions with real-time market sentiment analysis,
              stock intelligence, and personalized recommendations.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <Button size="lg" className="bg-primary hover:bg-primary-dark transition-colors">
                Start free trial
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-primary bg-white hover:bg-neutral-50 border-transparent shadow-sm"
                asChild
              >
                <a href="#how-it-works">
                  How it works <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
            <div className="mt-8 flex items-center">
              <div className="flex -space-x-2">
                {/* User avatars */}
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-neutral-300 overflow-hidden">
                  <svg
                    className="h-full w-full text-neutral-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-neutral-300 overflow-hidden">
                  <svg
                    className="h-full w-full text-neutral-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-neutral-300 overflow-hidden">
                  <svg
                    className="h-full w-full text-neutral-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <span className="text-sm font-medium text-neutral-500">
                  Trusted by 5000+ investors
                </span>
                <div className="flex items-center mt-1">
                  <div className="flex text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <StarHalf className="h-4 w-4 fill-current" />
                  </div>
                  <span className="ml-2 text-sm text-neutral-500">4.8/5</span>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-6 lg:relative">
            {/* A financial dashboard interface with data visualizations */}
            <div className="rounded-xl shadow-2xl bg-white overflow-hidden">
              <div className="w-full h-auto rounded-xl overflow-hidden aspect-w-16 aspect-h-9">
                <img 
                  src={financialDashboard} 
                  alt="Neufin AI Financial Dashboard" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute left-0 right-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
}
