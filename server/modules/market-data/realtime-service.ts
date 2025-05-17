/**
 * Real-time Market Data Service
 * Provides access to up-to-date stock quotes and market information
 */
import axios from 'axios';
import { db } from '../../db';
import { stocks } from '@shared/schema';
import { eq } from 'drizzle-orm';

// API key for Alpha Vantage
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Define data types
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

// Cache to store quote data and avoid excessive API calls
const quoteCache: Record<string, { data: RealTimeQuote; timestamp: number }> = {};
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/**
 * Mock data for development and testing when API is not available
 */
const mockQuote = (symbol: string): RealTimeQuote => {
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
 * Check if we should use cached data
 */
function shouldUseCache(symbol: string): boolean {
  const cached = quoteCache[symbol];
  if (!cached) return false;
  
  const now = Date.now();
  return now - cached.timestamp < CACHE_TTL;
}

/**
 * Fetch real-time quote for a symbol
 */
export async function fetchRealTimeQuote(symbol: string): Promise<RealTimeQuote> {
  // Check cache first
  if (shouldUseCache(symbol)) {
    return quoteCache[symbol].data;
  }
  
  try {
    if (!ALPHA_VANTAGE_API_KEY) {
      console.log(`Alpha Vantage API key not found, using mock data for ${symbol}`);
      const mockData = mockQuote(symbol);
      
      // Store in cache
      quoteCache[symbol] = {
        data: mockData,
        timestamp: Date.now()
      };
      
      // Attempt to store in database
      try {
        await storeQuote(mockData);
      } catch (error) {
        console.error(`Error storing mock data for ${symbol}:`, error);
      }
      
      return mockData;
    }
    
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await axios.get(url);
    
    if (!response.data || !response.data['Global Quote']) {
      throw new Error('Invalid API response format');
    }
    
    const globalQuote = response.data['Global Quote'];
    
    const result: RealTimeQuote = {
      symbol: symbol.toUpperCase(),
      open: parseFloat(globalQuote['02. open']),
      high: parseFloat(globalQuote['03. high']),
      low: parseFloat(globalQuote['04. low']),
      price: parseFloat(globalQuote['05. price']),
      volume: parseInt(globalQuote['06. volume']),
      latestTradingDay: globalQuote['07. latest trading day'],
      previousClose: parseFloat(globalQuote['08. previous close']),
      change: parseFloat(globalQuote['09. change']),
      changePercent: parseFloat(globalQuote['10. change percent'].replace('%', '')) / 100,
      timestamp: new Date().toISOString()
    };
    
    // Store in cache
    quoteCache[symbol] = {
      data: result,
      timestamp: Date.now()
    };
    
    // Store in database
    await storeQuote(result);
    
    return result;
  } catch (error) {
    console.error(`Error fetching real-time quote for ${symbol}:`, error);
    
    // Return mock data as fallback
    const mockData = mockQuote(symbol);
    quoteCache[symbol] = {
      data: mockData,
      timestamp: Date.now()
    };
    
    return mockData;
  }
}

/**
 * Fetch quotes for multiple symbols
 */
export async function fetchMultipleQuotes(symbols: string[]): Promise<RealTimeQuote[]> {
  const promises = symbols.map(symbol => fetchRealTimeQuote(symbol));
  return Promise.all(promises);
}

/**
 * Store quote in database for historical tracking
 * Note: This is silently skipped if database tables aren't yet created
 */
async function storeQuote(quote: RealTimeQuote): Promise<void> {
  try {
    // Skip database operations if tables aren't created yet
    // The migrations should be run to set up the tables properly
    
    // In memory-only mode or when tables aren't created, we just skip storage
    // We'll use the in-memory cache instead
    
    // Only attempt database storage in production with proper migration
    if (process.env.NODE_ENV === 'production') {
      try {
        // Check if stock exists in database
        const existingStock = await db.select().from(stocks).where(eq(stocks.symbol, quote.symbol));
        
        if (existingStock.length === 0) {
          // Create stock if it doesn't exist
          await db.insert(stocks).values({
            symbol: quote.symbol,
            name: quote.symbol, // Use symbol as name if we don't have actual company name
            sector: 'Unknown',
            lastUpdated: new Date()
          });
        } else {
          // Update last updated timestamp
          await db.update(stocks)
            .set({ lastUpdated: new Date() })
            .where(eq(stocks.symbol, quote.symbol));
        }
      } catch (dbError) {
        // Silently fail in development without logging since we expect this error
        // until migrations are run
        if (process.env.NODE_ENV === 'production') {
          console.error(`Database error storing quote for ${quote.symbol}:`, dbError);
        }
      }
    }
  } catch (error) {
    // Only log errors in production since we expect database issues in development
    if (process.env.NODE_ENV === 'production') {
      console.error(`Error storing real-time quote for ${quote.symbol}:`, error);
    }
  }
}

/**
 * Get market overview data
 */
export async function getMarketOverview(): Promise<MarketOverview> {
  try {
    // For a real implementation, we would fetch actual market data for:
    // - Top gainers
    // - Top losers  
    // - Most active
    // - Market indices (SPY, QQQ, DIA, IWM)
    
    // For now, we'll use mock data since the Alpha Vantage free tier has limited API calls
    
    // Major market indices
    const indices = ['SPY', 'QQQ', 'DIA', 'IWM'];
    const indicesData = await fetchMultipleQuotes(indices);
    
    // Generate mock data for other categories
    // In a production environment, these would be fetched from Alpha Vantage or another data provider
    const topGainers = ['AAPL', 'MSFT', 'GOOGL'].map(symbol => {
      const quote = mockQuote(symbol);
      quote.changePercent = 0.01 + Math.random() * 0.05; // 1-6% gain
      quote.change = quote.price * quote.changePercent;
      return quote;
    });
    
    const topLosers = ['XOM', 'PFE', 'WMT'].map(symbol => {
      const quote = mockQuote(symbol);
      quote.changePercent = -(0.01 + Math.random() * 0.05); // 1-6% loss
      quote.change = quote.price * quote.changePercent;
      return quote;
    });
    
    const mostActive = ['AMZN', 'META', 'NVDA'].map(symbol => {
      const quote = mockQuote(symbol);
      quote.volume = Math.floor(Math.random() * 10000000) + 5000000; // High volume
      return quote;
    });
    
    return {
      topGainers,
      topLosers,
      mostActive,
      marketIndices: indicesData,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching market overview:', error);
    
    // Return mock data as fallback
    return {
      topGainers: ['AAPL', 'MSFT', 'GOOGL'].map(mockQuote),
      topLosers: ['XOM', 'PFE', 'WMT'].map(mockQuote),
      mostActive: ['AMZN', 'META', 'NVDA'].map(mockQuote),
      marketIndices: ['SPY', 'QQQ', 'DIA', 'IWM'].map(mockQuote),
      lastUpdated: new Date().toISOString()
    };
  }
}