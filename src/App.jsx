import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from './components/ui/toaster';
import { useAnalytics } from './hooks/use-analytics';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import NotFound from './pages/NotFound';
import MarketData from './pages/MarketData';
import SentimentAnalysis from './pages/SentimentAnalysis';
import StockAnalysis from './pages/StockAnalysis';
import InvestmentRecommendations from './pages/InvestmentRecommendations';
import BehavioralBiasAnalyzer from './pages/BehavioralBiasAnalyzer';
import InvestmentAccounts from './pages/InvestmentAccounts';

// Analytics Tracker
function AnalyticsTracker() {
  useAnalytics();
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AnalyticsTracker />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/market-data" element={<MarketData />} />
              <Route path="/sentiment-analysis" element={<SentimentAnalysis />} />
              <Route path="/stock-analysis" element={<StockAnalysis />} />
              <Route path="/investment-recommendations" element={<InvestmentRecommendations />} />
              <Route path="/behavioral-bias-analyzer" element={<BehavioralBiasAnalyzer />} />
              <Route path="/investment-accounts" element={<InvestmentAccounts />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;