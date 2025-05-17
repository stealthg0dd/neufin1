import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import SentimentAnalysis from "@/pages/SentimentAnalysis";
import StockAnalysis from "@/pages/StockAnalysis";
import InvestmentRecommendations from "@/pages/InvestmentRecommendations";
import InvestmentAccounts from "@/pages/InvestmentAccounts";
import MarketData from "@/pages/MarketData";
import BehavioralBiasAnalyzer from "@/pages/BehavioralBiasAnalyzer";
import Dashboard from "@/pages/Dashboard";
import Checkout from "@/pages/Checkout";
import Navbar from "@/components/layout/Navbar";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { useEffect } from "react";
import { initAnalytics } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";

function Router() {
  // Track page views when routes change
  useAnalytics();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/checkout" component={Checkout} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/sentiment" component={SentimentAnalysis} />
      <ProtectedRoute path="/stocks" component={StockAnalysis} />
      <ProtectedRoute path="/recommendations" component={InvestmentRecommendations} />
      <ProtectedRoute path="/investment-accounts" component={InvestmentAccounts} />
      <ProtectedRoute path="/market-data" component={MarketData} />
      <ProtectedRoute path="/bias-analyzer" component={BehavioralBiasAnalyzer} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize Google Analytics when app loads
  useEffect(() => {
    // Initialize analytics
    initAnalytics();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Router />
          </main>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
