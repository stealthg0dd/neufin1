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
import MarketData from "@/pages/MarketData";
import Navbar from "@/components/layout/Navbar";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/sentiment" component={SentimentAnalysis} />
      <Route path="/stocks" component={StockAnalysis} />
      <Route path="/recommendations" component={InvestmentRecommendations} />
      <Route path="/market-data" component={MarketData} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
