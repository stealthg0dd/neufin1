/**
 * Neufin Real-Time Market Data Service
 * Handles fetching and processing of real-time market data from Alpha Vantage API
 */

import axios from 'axios';
import { db } from '../../db';
import { stocks, InsertStock, stockPrices, InsertStockPrice } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Alpha Vantage API configuration
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

// Error handling for API key
if (!API_KEY) {
  console.error('ALPHA_VANTAGE_API_KEY environment variable is not set');
}

// Types for real-time market data
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
 * Fetch real-time quote for a symbol
 * @param symbol Stock symbol (e.g., AAPL, MSFT)
 */
export async function fetchRealTimeQuote(symbol: string): Promise<RealTimeQuote | null> {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: API_KEY
      }
    });

    const data = response.data['Global Quote'];
    
    if (!data || Object.keys(data).length === 0) {
      console.warn(`No real-time data available for symbol: ${symbol}`);
      return null;
    }

    // Parse the response data
    const quote: RealTimeQuote = {
      symbol: data['01. symbol'],
      open: parseFloat(data['02. open']),
      high: parseFloat(data['03. high']),
      low: parseFloat(data['04. low']),
      price: parseFloat(data['05. price']),
      volume: parseInt(data['06. volume']),
      latestTradingDay: data['07. latest trading day'],
      previousClose: parseFloat(data['08. previous close']),
      change: parseFloat(data['09. change']),
      changePercent: parseFloat(data['10. change percent'].replace('%', '')) / 100,
      timestamp: new Date().toISOString()
    };

    // Store the data in the database
    await storeRealTimeQuote(quote);
    
    return quote;
  } catch (error) {
    console.error(`Error fetching real-time quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch multiple real-time quotes with rate limiting
 * @param symbols Array of stock symbols
 */
export async function fetchMultipleRealTimeQuotes(symbols: string[]): Promise<Map<string, RealTimeQuote>> {
  const quotes = new Map<string, RealTimeQuote>();
  
  // Alpha Vantage API has rate limits (typically 5 calls per minute for free tier)
  // We process symbols sequentially with a delay to respect these limits
  for (const symbol of symbols) {
    const quote = await fetchRealTimeQuote(symbol);
    if (quote) {
      quotes.set(symbol, quote);
    }
    
    // Add a delay to respect API rate limits
    if (symbols.indexOf(symbol) < symbols.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 15000)); // 15-second delay between requests
    }
  }
  
  return quotes;
}

/**
 * Store real-time quote in the database
 */
async function storeRealTimeQuote(quote: RealTimeQuote): Promise<void> {
  try {
    // First check if the stock exists in our database
    const existingStock = await db.select()
      .from(stocks)
      .where(eq(stocks.symbol, quote.symbol))
      .limit(1);
    
    let stockId: number;
    
    if (existingStock.length === 0) {
      // Create a new stock entry if it doesn't exist
      const [newStock] = await db.insert(stocks)
        .values({
          symbol: quote.symbol,
          name: quote.symbol, // Default to symbol until we get company info
          currentPrice: quote.price.toString(),
          dailyHigh: quote.high.toString(),
          dailyLow: quote.low.toString(),
          dailyVolume: quote.volume.toString(),
          marketCap: '0', // We'll update this later with company overview data
          peRatio: '0',
          dividendYield: '0',
          sector: '',
          industry: '',
          lastUpdated: new Date().toISOString()
        })
        .returning();
      
      stockId = newStock.id;
    } else {
      // Update existing stock with latest price data
      stockId = existingStock[0].id;
      
      await db.update(stocks)
        .set({
          currentPrice: quote.price.toString(),
          dailyHigh: quote.high.toString(),
          dailyLow: quote.low.toString(),
          dailyVolume: quote.volume.toString(),
          lastUpdated: new Date().toISOString()
        })
        .where(eq(stocks.id, stockId));
    }
    
    // Insert a new price record
    await db.insert(stockPrices)
      .values({
        stockId,
        date: quote.latestTradingDay,
        open: quote.open.toString(),
        high: quote.high.toString(),
        low: quote.low.toString(),
        close: quote.price.toString(),
        volume: quote.volume.toString(),
        adjustedClose: quote.price.toString(),
        source: 'real_time_api',
        type: 'intraday',
        createdAt: new Date().toISOString()
      });
      
  } catch (error) {
    console.error(`Error storing real-time quote for ${quote.symbol}:`, error);
  }
}

/**
 * Fetch market overview data (top gainers, losers, most active stocks)
 * Note: This would typically use a specialized API endpoint, but we're simulating with individual quotes
 */
export async function fetchMarketOverview(): Promise<MarketOverview | null> {
  try {
    // List of popular indices and stocks to track
    const indices = ['SPY', 'QQQ', 'DIA', 'IWM']; // S&P 500, Nasdaq, Dow, Russell 2000
    const popularStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'NFLX'];
    
    // Fetch quotes for indices and popular stocks
    const allSymbols = [...indices, ...popularStocks];
    const quotesMap = await fetchMultipleRealTimeQuotes(allSymbols);
    
    // Convert Map to array
    const quotes = Array.from(quotesMap.values());
    
    // Sort quotes for different categories
    const marketIndices = quotes.filter(q => indices.includes(q.symbol));
    
    // Sort remaining quotes by percent change for gainers/losers
    const stocks = quotes.filter(q => !indices.includes(q.symbol));
    const sortedByChange = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
    
    const topGainers = sortedByChange.slice(0, 5).filter(q => q.changePercent > 0);
    const topLosers = [...sortedByChange].reverse().slice(0, 5).filter(q => q.changePercent < 0);
    
    // Sort by volume for most active
    const mostActive = [...stocks].sort((a, b) => b.volume - a.volume).slice(0, 5);
    
    return {
      topGainers,
      topLosers,
      mostActive,
      marketIndices,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error fetching market overview:", error);
    return null;
  }
}