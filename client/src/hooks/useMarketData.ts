import { useQuery } from '@tanstack/react-query';
import { apiRequest, getQueryFn } from '@/lib/queryClient';

// Types for market data
export interface RealTimeQuote {
  symbol: string;
  open: number;
  high: number;
  low: number;
  price: number;
  volume: number;
  latestTradingDay: string;
  previousClose: number;
  change: number;
  changePercent: number;
  timestamp?: string;
}

export interface MarketOverview {
  topGainers: RealTimeQuote[];
  topLosers: RealTimeQuote[];
  mostActive: RealTimeQuote[];
  marketIndices: RealTimeQuote[];
  lastUpdated: string;
}

// Mock data for development and testing
const mockQuoteData = (symbol: string): RealTimeQuote => {
  const basePrice = symbol.length * 10 + Math.random() * 100;
  return {
    symbol,
    open: basePrice * 0.995,
    high: basePrice * 1.02,
    low: basePrice * 0.98,
    price: basePrice,
    volume: Math.floor(Math.random() * 1000000),
    latestTradingDay: new Date().toISOString().split('T')[0],
    previousClose: basePrice * 0.99,
    change: basePrice * 0.01,
    changePercent: 0.01,
    timestamp: new Date().toISOString()
  };
};

/**
 * Hook to fetch real-time quote for a specific symbol
 */
export function useRealTimeQuote(symbol: string, enabled = true) {
  return useQuery({
    queryKey: ['/api/market-data/quote', symbol],
    queryFn: getQueryFn<RealTimeQuote>({ 
      on401: "returnNull" 
    }),
    enabled,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
    placeholderData: () => mockQuoteData(symbol) // Fallback while loading
  });
}

/**
 * Hook to fetch real-time quotes for multiple symbols
 */
export function useMultipleQuotes(symbols: string[], enabled = true) {
  return useQuery({
    queryKey: ['/api/market-data/quotes'],
    queryFn: getQueryFn<RealTimeQuote[]>({ 
      on401: "returnNull" 
    }),
    enabled: enabled && symbols.length > 0,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
    placeholderData: () => symbols.map(symbol => mockQuoteData(symbol)) // Fallback while loading
  });
}

/**
 * Hook to fetch market overview data
 */
export function useMarketOverview(enabled = true) {
  return useQuery({
    queryKey: ['/api/market-data/overview'],
    queryFn: getQueryFn<MarketOverview>({ 
      on401: "returnNull" 
    }),
    enabled,
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 60000, // Consider data stale after 1 minute
    placeholderData: () => {
      // Mock market overview data
      return {
        topGainers: ['AAPL', 'MSFT', 'GOOGL'].map(symbol => mockQuoteData(symbol)),
        topLosers: ['XOM', 'PFE', 'WMT'].map(symbol => mockQuoteData(symbol)),
        mostActive: ['AMZN', 'META', 'NVDA'].map(symbol => mockQuoteData(symbol)),
        marketIndices: ['SPY', 'QQQ', 'DIA', 'IWM'].map(symbol => mockQuoteData(symbol)),
        lastUpdated: new Date().toISOString()
      };
    }
  });
}

/**
 * Function to refresh data for a specific symbol
 */
export async function refreshSymbolData(symbol: string): Promise<RealTimeQuote | null> {
  try {
    const response = await apiRequest<RealTimeQuote>(`/api/market-data/refresh/${symbol}`, "POST");
    return response;
  } catch (error) {
    console.error(`Error refreshing data for ${symbol}:`, error);
    // Return mock data as fallback
    return mockQuoteData(symbol);
  }
}