import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

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

/**
 * Hook to fetch real-time quote for a specific symbol
 */
export function useRealTimeQuote(symbol: string, enabled = true) {
  return useQuery({
    queryKey: ['/api/market-data/quote', symbol],
    queryFn: async () => {
      const response = await apiRequest(`/api/market-data/quote/${symbol}`);
      return response.data as RealTimeQuote;
    },
    enabled,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });
}

/**
 * Hook to fetch real-time quotes for multiple symbols
 */
export function useMultipleQuotes(symbols: string[], enabled = true) {
  return useQuery({
    queryKey: ['/api/market-data/quotes', symbols.join(',')],
    queryFn: async () => {
      if (symbols.length === 0) return [];
      const response = await apiRequest(`/api/market-data/quotes?symbols=${symbols.join(',')}`);
      return response.data as RealTimeQuote[];
    },
    enabled: enabled && symbols.length > 0,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });
}

/**
 * Hook to fetch market overview data
 */
export function useMarketOverview(enabled = true) {
  return useQuery({
    queryKey: ['/api/market-data/overview'],
    queryFn: async () => {
      const response = await apiRequest('/api/market-data/overview');
      return response.data as MarketOverview;
    },
    enabled,
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 60000, // Consider data stale after 1 minute
  });
}

/**
 * Function to refresh data for a specific symbol
 */
export async function refreshSymbolData(symbol: string): Promise<RealTimeQuote | null> {
  try {
    const response = await apiRequest(`/api/market-data/refresh/${symbol}`, {
      method: 'POST',
    });
    return response.data as RealTimeQuote;
  } catch (error) {
    console.error(`Error refreshing data for ${symbol}:`, error);
    return null;
  }
}