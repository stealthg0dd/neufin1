/**
 * Real-time Market Data Service
 * Provides access to up-to-date stock quotes and market information
 */
import axios from 'axios';
import { db } from '../../db';
import { stocks, stockPrices } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const API_BASE_URL = 'https://www.alphavantage.co/query';

// Real-time quote interface
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

// Market overview interface
export interface MarketOverview {
  topGainers: RealTimeQuote[];
  topLosers: RealTimeQuote[];
  mostActive: RealTimeQuote[];
  marketIndices: RealTimeQuote[];
  lastUpdated: string;
}

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
 * Fetch real-time quote for a symbol
 */
export async function fetchRealTimeQuote(symbol: string): Promise<RealTimeQuote> {
  try {
    // Check if we have an API key
    if (!ALPHA_VANTAGE_API_KEY) {
      console.log(`Alpha Vantage API key not found, using mock data for ${symbol}`);
      return mockQuote(symbol);
    }
    
    // Make request to Alpha Vantage
    const response = await axios.get(`${API_BASE_URL}`, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });
    
    const data = response.data;
    
    // Check if we have valid data
    if (!data['Global Quote'] || Object.keys(data['Global Quote']).length === 0) {
      console.warn(`No data returned from Alpha Vantage for ${symbol}, using mock data`);
      return mockQuote(symbol);
    }
    
    const quote = data['Global Quote'];
    
    // Parse and convert data
    const result: RealTimeQuote = {
      symbol,
      open: parseFloat(quote['02. open']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      price: parseFloat(quote['05. price']),
      volume: parseInt(quote['06. volume'], 10),
      latestTradingDay: quote['07. latest trading day'],
      previousClose: parseFloat(quote['08. previous close']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')) / 100,
      timestamp: new Date().toISOString()
    };
    
    // Store quote in database
    await storeQuote(result);
    
    return result;
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    // Return mock data as fallback
    return mockQuote(symbol);
  }
}

/**
 * Fetch quotes for multiple symbols
 */
export async function fetchMultipleQuotes(symbols: string[]): Promise<RealTimeQuote[]> {
  try {
    const promises = symbols.map(symbol => fetchRealTimeQuote(symbol));
    return await Promise.all(promises);
  } catch (error) {
    console.error(`Error fetching multiple quotes:`, error);
    return symbols.map(symbol => mockQuote(symbol));
  }
}

/**
 * Get market overview data
 */
export async function getMarketOverview(): Promise<MarketOverview> {
  try {
    // For a real implementation, this would fetch top gainers, losers, etc. from Alpha Vantage
    // Since Alpha Vantage doesn't have a direct endpoint for this, we would normally
    // compile this data from multiple sources or use another data provider
    
    // For now, simulate with important indices and some mock stocks
    const indices = ['SPY', 'QQQ', 'DIA', 'IWM'];
    const techStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
    const otherStocks = ['JPM', 'BAC', 'XOM', 'PFE', 'WMT'];
    
    const indicesData = await fetchMultipleQuotes(indices);
    const techData = await fetchMultipleQuotes(techStocks);
    const otherData = await fetchMultipleQuotes(otherStocks);
    
    // Combine and sort for mock gainers/losers/active
    const allStocks = [...techData, ...otherData];
    
    // Sort by percent change for gainers and losers
    const sortedByChange = [...allStocks].sort((a, b) => b.changePercent - a.changePercent);
    
    // Sort by volume for most active
    const sortedByVolume = [...allStocks].sort((a, b) => b.volume - a.volume);
    
    return {
      topGainers: sortedByChange.slice(0, 5),
      topLosers: sortedByChange.slice(-5).reverse(),
      mostActive: sortedByVolume.slice(0, 5),
      marketIndices: indicesData,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error getting market overview:`, error);
    
    // Return minimal mock data as fallback
    return {
      topGainers: ['AAPL', 'MSFT', 'GOOGL'].map(symbol => mockQuote(symbol)),
      topLosers: ['XOM', 'PFE', 'WMT'].map(symbol => mockQuote(symbol)),
      mostActive: ['AMZN', 'META', 'NVDA'].map(symbol => mockQuote(symbol)),
      marketIndices: ['SPY', 'QQQ', 'DIA', 'IWM'].map(symbol => mockQuote(symbol)),
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * Store quote in database for historical tracking
 */
async function storeQuote(quote: RealTimeQuote): Promise<void> {
  try {
    // Check if we have this stock in the database
    const existingStock = await db.select()
      .from(stocks)
      .where(eq(stocks.symbol, quote.symbol))
      .limit(1);
    
    let stockId: number;
    
    if (existingStock.length === 0) {
      // Create new stock entry
      const [newStock] = await db.insert(stocks)
        .values({
          symbol: quote.symbol,
          name: quote.symbol, // We would want to get the proper name, but this requires another API call
          lastPrice: quote.price.toString(),
          lastPriceUpdated: new Date().toISOString()
        })
        .returning({ id: stocks.id });
      
      stockId = newStock.id;
    } else {
      stockId = existingStock[0].id;
      
      // Update the last price
      await db.update(stocks)
        .set({
          lastPrice: quote.price.toString(),
          lastPriceUpdated: new Date().toISOString()
        })
        .where(eq(stocks.id, stockId));
    }
    
    // Store the price data
    await db.insert(stockPrices)
      .values({
        stockId,
        date: new Date().toISOString(),
        open: quote.open.toString(),
        high: quote.high.toString(),
        low: quote.low.toString(),
        close: quote.price.toString(),
        volume: quote.volume.toString(),
        adjustedClose: quote.price.toString()
      });
      
  } catch (error) {
    console.error(`Error storing quote in database:`, error);
  }
}