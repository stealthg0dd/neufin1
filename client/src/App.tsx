import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import SentimentAnalysis from "@/pages/SentimentAnalysis";
import StockAnalysis from "@/pages/StockAnalysis";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/sentiment" component={SentimentAnalysis} />
      <Route path="/stocks" component={StockAnalysis} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
