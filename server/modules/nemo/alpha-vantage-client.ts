/**
 * Neufin Nemo - Alpha Vantage API Client
 * Handles fetching stock data from Alpha Vantage API
 */

import axios from 'axios';
import { db } from '../../db';
import { stocks, Stock, InsertStock, stockPrices, InsertStockPrice } from '@shared/schema';
import { eq } from 'drizzle-orm';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

// Delay between API calls to prevent rate limiting (Alpha Vantage limits to 5 calls/minute on free plan)
const API_CALL_DELAY = 15000; // 15 seconds

/**
 * Fetch company overview for a symbol
 */
export async function fetchCompanyOverview(symbol: string): Promise<any> {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'OVERVIEW',
        symbol,
        apikey: API_KEY
      }
    });

    if (response.data.Note) {
      throw new Error(`API limit reached: ${response.data.Note}`);
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching company overview for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Fetch daily price data for a symbol
 * @param symbol Stock symbol
 * @param full Whether to fetch full or compact data
 */
export async function fetchDailyPrices(symbol: string, full: boolean = false): Promise<any> {
  try {
    const outputsize = full ? 'full' : 'compact';
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol,
        outputsize,
        apikey: API_KEY
      }
    });

    if (response.data.Note) {
      throw new Error(`API limit reached: ${response.data.Note}`);
    }

    if (!response.data['Time Series (Daily)']) {
      throw new Error(`No daily time series data found for ${symbol}`);
    }

    return response.data['Time Series (Daily)'];
  } catch (error) {
    console.error(`Error fetching daily prices for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Fetch intraday price data for a symbol
 * @param symbol Stock symbol
 * @param interval Time interval (1min, 5min, 15min, 30min, 60min)
 */
export async function fetchIntradayPrices(
  symbol: string, 
  interval: '1min' | '5min' | '15min' | '30min' | '60min' = '15min'
): Promise<any> {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'TIME_SERIES_INTRADAY',
        symbol,
        interval,
        outputsize: 'compact',
        apikey: API_KEY
      }
    });

    if (response.data.Note) {
      throw new Error(`API limit reached: ${response.data.Note}`);
    }

    const timeSeriesKey = `Time Series (${interval})`;
    if (!response.data[timeSeriesKey]) {
      throw new Error(`No intraday time series data found for ${symbol}`);
    }

    return response.data[timeSeriesKey];
  } catch (error) {
    console.error(`Error fetching intraday prices for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Fetch global quote for a symbol
 */
export async function fetchGlobalQuote(symbol: string): Promise<any> {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: API_KEY
      }
    });

    if (response.data.Note) {
      throw new Error(`API limit reached: ${response.data.Note}`);
    }

    if (!response.data['Global Quote']) {
      throw new Error(`No global quote found for ${symbol}`);
    }

    return response.data['Global Quote'];
  } catch (error) {
    console.error(`Error fetching global quote for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Fetch search results for a query
 */
export async function searchSymbol(keywords: string): Promise<any[]> {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords,
        apikey: API_KEY
      }
    });

    if (response.data.Note) {
      throw new Error(`API limit reached: ${response.data.Note}`);
    }

    return response.data.bestMatches || [];
  } catch (error) {
    console.error(`Error searching for ${keywords}:`, error);
    throw error;
  }
}

/**
 * Fetch technical indicator data
 * @param symbol Stock symbol
 * @param indicator Indicator function name (e.g., RSI, EMA, SMA, BBANDS)
 * @param interval Time interval (daily, weekly, monthly)
 * @param timePeriod Time period for the indicator
 * @param seriesType Series type (close, open, high, low)
 */
export async function fetchTechnicalIndicator(
  symbol: string,
  indicator: 'RSI' | 'EMA' | 'SMA' | 'BBANDS' | 'MACD',
  interval: 'daily' | 'weekly' | 'monthly' = 'daily',
  timePeriod: number = 14,
  seriesType: 'close' | 'open' | 'high' | 'low' = 'close'
): Promise<any> {
  try {
    const params: any = {
      function: indicator,
      symbol,
      interval,
      time_period: timePeriod,
      series_type: seriesType,
      apikey: API_KEY
    };

    // MACD has specific parameters
    if (indicator === 'MACD') {
      delete params.time_period;
      params.fastperiod = 12;
      params.slowperiod = 26;
      params.signalperiod = 9;
    }

    const response = await axios.get(BASE_URL, { params });

    if (response.data.Note) {
      throw new Error(`API limit reached: ${response.data.Note}`);
    }

    // Extract the technical indicator data
    const indicatorKey = Object.keys(response.data).find(key => 
      key.startsWith('Technical Analysis:') || key.includes('MACD')
    );

    if (!indicatorKey || !response.data[indicatorKey]) {
      throw new Error(`No technical indicator data found for ${symbol}`);
    }

    return response.data[indicatorKey];
  } catch (error) {
    console.error(`Error fetching ${indicator} for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Update stock data in the database
 * This function fetches fresh data and stores it
 */
export async function updateStockData(symbol: string): Promise<Stock> {
  try {
    // Step 1: Fetch company overview
    const overview = await fetchCompanyOverview(symbol);
    
    // Step 2: Find or create stock record
    let stock = await findStockBySymbol(symbol);
    
    if (!stock) {
      // Create new stock record
      const insertData: InsertStock = {
        symbol: overview.Symbol,
        name: overview.Name,
        sector: overview.Sector,
        industry: overview.Industry,
        marketCap: overview.MarketCapitalization ? parseFloat(overview.MarketCapitalization) : null,
        peRatio: overview.PERatio ? parseFloat(overview.PERatio) : null,
        dividendYield: overview.DividendYield ? parseFloat(overview.DividendYield) : null,
        beta: overview.Beta ? parseFloat(overview.Beta) : null,
        fiftyTwoWeekHigh: overview['52WeekHigh'] ? parseFloat(overview['52WeekHigh']) : null,
        fiftyTwoWeekLow: overview['52WeekLow'] ? parseFloat(overview['52WeekLow']) : null,
        averageVolume: overview.AvgVolume ? parseInt(overview.AvgVolume) : null,
        metadata: {
          exchange: overview.Exchange,
          currency: overview.Currency,
          country: overview.Country,
          description: overview.Description
        }
      };
      
      const [newStock] = await db.insert(stocks).values(insertData).returning();
      stock = newStock;
    } else {
      // Update existing stock record
      const [updatedStock] = await db.update(stocks)
        .set({
          name: overview.Name,
          sector: overview.Sector,
          industry: overview.Industry,
          marketCap: overview.MarketCapitalization ? parseFloat(overview.MarketCapitalization) : null,
          peRatio: overview.PERatio ? parseFloat(overview.PERatio) : null,
          dividendYield: overview.DividendYield ? parseFloat(overview.DividendYield) : null,
          beta: overview.Beta ? parseFloat(overview.Beta) : null,
          fiftyTwoWeekHigh: overview['52WeekHigh'] ? parseFloat(overview['52WeekHigh']) : null,
          fiftyTwoWeekLow: overview['52WeekLow'] ? parseFloat(overview['52WeekLow']) : null,
          averageVolume: overview.AvgVolume ? parseInt(overview.AvgVolume) : null,
          lastUpdated: new Date(),
          metadata: {
            exchange: overview.Exchange,
            currency: overview.Currency,
            country: overview.Country,
            description: overview.Description
          }
        })
        .where(eq(stocks.id, stock.id))
        .returning();
      
      stock = updatedStock;
    }
    
    // Step 3: Fetch and store daily prices
    await fetchAndStoreDailyPrices(stock.id, symbol);
    
    // Step 4: Return updated stock data
    return stock;
  } catch (error) {
    console.error(`Error updating stock data for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Fetch and store daily price data for a stock
 */
async function fetchAndStoreDailyPrices(stockId: number, symbol: string): Promise<void> {
  try {
    // Fetch up to 100 days of daily prices
    const dailyPrices = await fetchDailyPrices(symbol, false);
    
    // Process and store each day's data
    const pricePromises = Object.entries(dailyPrices).map(async ([dateStr, priceData]: [string, any]) => {
      const insertData: InsertStockPrice = {
        stockId,
        date: new Date(dateStr),
        open: parseFloat(priceData['1. open']),
        high: parseFloat(priceData['2. high']),
        low: parseFloat(priceData['3. low']),
        close: parseFloat(priceData['4. close']),
        adjustedClose: parseFloat(priceData['5. adjusted close'] || priceData['4. close']),
        volume: parseInt(priceData['6. volume'] || priceData['5. volume'])
      };
      
      // Check if price data for this date already exists
      const existingPrices = await db.select()
        .from(stockPrices)
        .where(eq(stockPrices.stockId, stockId))
        .where(eq(stockPrices.date, new Date(dateStr)));
      
      if (existingPrices.length === 0) {
        // Insert new price data
        await db.insert(stockPrices).values(insertData);
      }
    });
    
    await Promise.all(pricePromises);
  } catch (error) {
    console.error(`Error storing daily prices for stock ID ${stockId}:`, error);
    throw error;
  }
}

/**
 * Find a stock by symbol
 */
export async function findStockBySymbol(symbol: string): Promise<Stock | undefined> {
  const results = await db.select().from(stocks).where(eq(stocks.symbol, symbol));
  return results.length > 0 ? results[0] : undefined;
}

/**
 * Process multiple symbols with rate limiting
 */
export async function processMultipleSymbols(symbols: string[]): Promise<Stock[]> {
  const results: Stock[] = [];
  
  for (const symbol of symbols) {
    try {
      const stock = await updateStockData(symbol);
      results.push(stock);
      
      // Wait to avoid rate limiting
      if (symbols.indexOf(symbol) < symbols.length - 1) {
        await new Promise(resolve => setTimeout(resolve, API_CALL_DELAY));
      }
    } catch (error) {
      console.error(`Error processing symbol ${symbol}:`, error);
      // Continue with next symbol
    }
  }
  
  return results;
}