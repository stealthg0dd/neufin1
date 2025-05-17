/**
 * Stock Analyzer for Neufin Nemo
 * Processes stock data, computes indicators, and generates analyses
 */

import { db } from '../../db';
import {
  stocks, Stock, stockPrices, stockIndicators, stockAnalysis,
  InsertStockIndicator, InsertStockAnalysis
} from '@shared/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { analyzeStockData } from './indicator-calculator';
import { updateStockData, fetchDailyPrices } from './alpha-vantage-client';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client if API key is available
const anthropicClient = process.env.ANTHROPIC_API_KEY ? 
  new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

// The newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const CLAUDE_MODEL = "claude-3-7-sonnet-20250219";

/**
 * Process a stock's data to compute and store all technical indicators
 * @param symbol Stock symbol
 */
export async function processStockIndicators(symbol: string): Promise<void> {
  try {
    // Step 1: Ensure stock data is updated in the database
    let stock = await updateStockData(symbol);
    
    // Step 2: Retrieve historical price data
    const priceData = await db.select()
      .from(stockPrices)
      .where(eq(stockPrices.stockId, stock.id))
      .orderBy(stockPrices.date);
    
    if (priceData.length < 20) {
      console.warn(`Not enough price data for ${symbol} to calculate indicators`);
      return;
    }
    
    // Step 3: Convert database records to PriceData format for indicator calculation
    const formattedPriceData = priceData.map(price => ({
      date: price.date,
      open: parseFloat(price.open),
      high: parseFloat(price.high),
      low: parseFloat(price.low),
      close: parseFloat(price.close),
      volume: price.volume
    }));
    
    // Step 4: Compute all technical indicators
    const indicators = analyzeStockData(formattedPriceData);
    
    // Step 5: Store the latest indicators in the database
    const latestPriceIndex = formattedPriceData.length - 1;
    const latestPrice = formattedPriceData[latestPriceIndex];
    
    const indicatorData: InsertStockIndicator = {
      stockId: stock.id,
      date: latestPrice.date,
      rsi14: indicators.rsi[indicators.rsi.length - 1]?.toString(),
      macd: indicators.macd.macd[indicators.macd.macd.length - 1]?.toString(),
      macdSignal: indicators.macd.signal[indicators.macd.signal.length - 1]?.toString(),
      macdHistogram: indicators.macd.histogram[indicators.macd.histogram.length - 1]?.toString(),
      ema20: indicators.ema20[indicators.ema20.length - 1]?.toString(),
      ema50: indicators.ema50[indicators.ema50.length - 1]?.toString(),
      ema200: indicators.ema200[indicators.ema200.length - 1]?.toString(),
      sma20: indicators.sma20[indicators.sma20.length - 1]?.toString(),
      sma50: indicators.sma50[indicators.sma50.length - 1]?.toString(),
      sma200: indicators.sma200[indicators.sma200.length - 1]?.toString(),
      bollingerUpper: indicators.bollingerBands.upper[indicators.bollingerBands.upper.length - 1]?.toString(),
      bollingerMiddle: indicators.bollingerBands.middle[indicators.bollingerBands.middle.length - 1]?.toString(),
      bollingerLower: indicators.bollingerBands.lower[indicators.bollingerBands.lower.length - 1]?.toString(),
      momentum: indicators.momentum[indicators.momentum.length - 1]?.toString(),
      volatility: indicators.volatility[indicators.volatility.length - 1]?.toString()
    };
    
    // Step 6: Insert or update the indicator record in the database
    await db.insert(stockIndicators).values(indicatorData);
    
    // Step 7: Generate and store stock analysis
    await generateStockAnalysis(stock, formattedPriceData, indicators);
    
    console.log(`Processed all indicators for ${symbol}`);
  } catch (error) {
    console.error(`Error processing indicators for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Generate and store a stock analysis
 */
async function generateStockAnalysis(
  stock: Stock,
  priceData: any[],
  indicators: any
): Promise<void> {
  try {
    // Determine short-term and long-term outlook based on indicators
    const shortTermOutlook = determineShortTermOutlook(indicators);
    const longTermOutlook = determineLongTermOutlook(indicators);
    
    // Get support and resistance levels
    const supportLevels = indicators.supportResistance.support;
    const resistanceLevels = indicators.supportResistance.resistance;
    
    // Identify key events like breakouts, trend changes, etc.
    const keyEvents = identifyKeyEvents(priceData, indicators);
    
    // Generate AI summary if Anthropic API is available
    let aiSummary = null;
    if (anthropicClient) {
      aiSummary = await generateAiSummary(stock, priceData, indicators, {
        shortTermOutlook,
        longTermOutlook,
        supportLevels,
        resistanceLevels,
        keyEvents
      });
    }
    
    // Prepare analysis data
    const analysisData: InsertStockAnalysis = {
      stockId: stock.id,
      date: new Date(),
      shortTermOutlook,
      longTermOutlook,
      supportLevels,
      resistanceLevels,
      keyEvents,
      aiSummary: aiSummary || undefined
    };
    
    // Store analysis in database
    await db.insert(stockAnalysis).values(analysisData);
    
  } catch (error) {
    console.error(`Error generating analysis for ${stock.symbol}:`, error);
    // Continue without analysis if it fails
  }
}

/**
 * Determine the short-term outlook (1-7 days) based on technical indicators
 */
function determineShortTermOutlook(indicators: any): 'bullish' | 'bearish' | 'neutral' {
  let bullishPoints = 0;
  let bearishPoints = 0;
  
  // RSI analysis
  const rsi = indicators.rsi[indicators.rsi.length - 1];
  if (rsi > 70) bearishPoints += 1;
  else if (rsi < 30) bullishPoints += 1;
  
  // MACD analysis
  const macdHistogram = indicators.macd.histogram[indicators.macd.histogram.length - 1];
  if (macdHistogram > 0) bullishPoints += 1;
  else if (macdHistogram < 0) bearishPoints += 1;
  
  // Price vs moving averages
  const latestPrice = indicators.bollingerBands.middle[indicators.bollingerBands.middle.length - 1];
  const ema20 = indicators.ema20[indicators.ema20.length - 1];
  const ema50 = indicators.ema50[indicators.ema50.length - 1];
  
  if (latestPrice > ema20) bullishPoints += 1;
  else if (latestPrice < ema20) bearishPoints += 1;
  
  if (latestPrice > ema50) bullishPoints += 1;
  else if (latestPrice < ema50) bearishPoints += 1;
  
  // Bollinger Bands analysis
  const upperBand = indicators.bollingerBands.upper[indicators.bollingerBands.upper.length - 1];
  const lowerBand = indicators.bollingerBands.lower[indicators.bollingerBands.lower.length - 1];
  const middleBand = indicators.bollingerBands.middle[indicators.bollingerBands.middle.length - 1];
  
  if (latestPrice > upperBand) bearishPoints += 1; // Overbought
  else if (latestPrice < lowerBand) bullishPoints += 1; // Oversold
  
  // Momentum
  const momentum = indicators.momentum[indicators.momentum.length - 1];
  if (momentum > 0) bullishPoints += 1;
  else if (momentum < 0) bearishPoints += 1;
  
  // Determine outlook based on points
  if (bullishPoints > bearishPoints + 1) return 'bullish';
  if (bearishPoints > bullishPoints + 1) return 'bearish';
  return 'neutral';
}

/**
 * Determine the long-term outlook (30-90 days) based on technical indicators
 */
function determineLongTermOutlook(indicators: any): 'bullish' | 'bearish' | 'neutral' {
  let bullishPoints = 0;
  let bearishPoints = 0;
  
  // Price vs long-term moving averages
  const latestPrice = indicators.bollingerBands.middle[indicators.bollingerBands.middle.length - 1];
  const ema200 = indicators.ema200[indicators.ema200.length - 1];
  const sma200 = indicators.sma200[indicators.sma200.length - 1];
  
  if (latestPrice > ema200) bullishPoints += 2;
  else if (latestPrice < ema200) bearishPoints += 2;
  
  if (latestPrice > sma200) bullishPoints += 2;
  else if (latestPrice < sma200) bearishPoints += 2;
  
  // EMA slopes (trend direction)
  const ema50 = indicators.ema50[indicators.ema50.length - 1];
  const ema50Previous = indicators.ema50[indicators.ema50.length - 3];
  
  if (ema50 > ema50Previous) bullishPoints += 1;
  else if (ema50 < ema50Previous) bearishPoints += 1;
  
  // Trend strength
  const volatility = indicators.volatility[indicators.volatility.length - 1];
  if (volatility > 0.03 && bullishPoints > bearishPoints) bullishPoints += 1;
  if (volatility > 0.03 && bearishPoints > bullishPoints) bearishPoints += 1;
  
  // Determine outlook based on points
  if (bullishPoints > bearishPoints + 1) return 'bullish';
  if (bearishPoints > bullishPoints + 1) return 'bearish';
  return 'neutral';
}

/**
 * Identify key market events like breakouts, trend changes, etc.
 */
function identifyKeyEvents(priceData: any[], indicators: any): any[] {
  const events = [];
  const latestPrice = priceData[priceData.length - 1];
  
  // Check for breakout
  const breakoutSignals = indicators.breakouts.signals;
  const breakoutStrength = indicators.breakouts.strength;
  
  if (breakoutSignals.length > 0) {
    const latestSignal = breakoutSignals[breakoutSignals.length - 1];
    const latestStrength = breakoutStrength[breakoutStrength.length - 1];
    
    if (latestSignal === 1 && latestStrength > 1.5) {
      events.push({
        type: 'breakout',
        direction: 'upward',
        strength: latestStrength,
        price: latestPrice.close,
        date: latestPrice.date
      });
    } else if (latestSignal === -1 && latestStrength > 1.5) {
      events.push({
        type: 'breakout',
        direction: 'downward',
        strength: latestStrength,
        price: latestPrice.close,
        date: latestPrice.date
      });
    }
  }
  
  // Check for golden cross (50-day SMA crosses above 200-day SMA)
  const sma50 = indicators.sma50;
  const sma200 = indicators.sma200;
  
  if (sma50.length > 1 && sma200.length > 1) {
    const currentSma50 = sma50[sma50.length - 1];
    const previousSma50 = sma50[sma50.length - 2];
    const currentSma200 = sma200[sma200.length - 1];
    const previousSma200 = sma200[sma200.length - 2];
    
    if (currentSma50 > currentSma200 && previousSma50 <= previousSma200) {
      events.push({
        type: 'golden_cross',
        description: '50-day SMA crossed above 200-day SMA',
        date: latestPrice.date
      });
    }
    // Check for death cross (50-day SMA crosses below 200-day SMA)
    else if (currentSma50 < currentSma200 && previousSma50 >= previousSma200) {
      events.push({
        type: 'death_cross',
        description: '50-day SMA crossed below 200-day SMA',
        date: latestPrice.date
      });
    }
  }
  
  // Check for RSI events
  const rsi = indicators.rsi;
  if (rsi.length > 1) {
    const currentRsi = rsi[rsi.length - 1];
    const previousRsi = rsi[rsi.length - 2];
    
    if (currentRsi > 70 && previousRsi <= 70) {
      events.push({
        type: 'overbought',
        indicator: 'RSI',
        value: currentRsi,
        date: latestPrice.date
      });
    } else if (currentRsi < 30 && previousRsi >= 30) {
      events.push({
        type: 'oversold',
        indicator: 'RSI',
        value: currentRsi,
        date: latestPrice.date
      });
    }
  }
  
  return events;
}

/**
 * Generate a human-readable summary of stock analysis using Claude
 */
async function generateAiSummary(
  stock: Stock,
  priceData: any[],
  indicators: any,
  analysis: any
): Promise<string | null> {
  if (!anthropicClient) return null;
  
  try {
    // Prepare data for Claude
    const latestPrice = priceData[priceData.length - 1];
    const previousPrice = priceData[priceData.length - 2];
    const percentChange = ((latestPrice.close - previousPrice.close) / previousPrice.close) * 100;
    
    const prompt = `
      I need a concise stock analysis summary for ${stock.symbol} (${stock.name}). Here's the latest data:
      
      Price: $${latestPrice.close.toFixed(2)} (${percentChange > 0 ? '+' : ''}${percentChange.toFixed(2)}%)
      Volume: ${latestPrice.volume.toLocaleString()}
      
      Technical Indicators:
      - RSI (14): ${indicators.rsi[indicators.rsi.length - 1]?.toFixed(2) || 'N/A'}
      - MACD: ${indicators.macd.macd[indicators.macd.macd.length - 1]?.toFixed(4) || 'N/A'}
      - MACD Signal: ${indicators.macd.signal[indicators.macd.signal.length - 1]?.toFixed(4) || 'N/A'}
      - MACD Histogram: ${indicators.macd.histogram[indicators.macd.histogram.length - 1]?.toFixed(4) || 'N/A'}
      - EMA (20): ${indicators.ema20[indicators.ema20.length - 1]?.toFixed(2) || 'N/A'}
      - EMA (50): ${indicators.ema50[indicators.ema50.length - 1]?.toFixed(2) || 'N/A'}
      - SMA (200): ${indicators.sma200[indicators.sma200.length - 1]?.toFixed(2) || 'N/A'}
      
      Analysis:
      - Short-term outlook: ${analysis.shortTermOutlook}
      - Long-term outlook: ${analysis.longTermOutlook}
      - Support levels: ${analysis.supportLevels.map((level: number) => '$' + level.toFixed(2)).join(', ')}
      - Resistance levels: ${analysis.resistanceLevels.map((level: number) => '$' + level.toFixed(2)).join(', ')}
      
      Key events: ${analysis.keyEvents.map((event: any) => 
        `${event.type}: ${event.description || JSON.stringify(event)}`).join('; ')}
      
      Please provide a concise summary (150-200 words) that explains the stock's current situation, 
      technical position, and what investors might expect in both short and long-term timeframes.
      Focus on explaining the meaning of these technical indicators for an intermediate investor.
      Use straightforward language and avoid being too technical.
    `;
    
    const response = await anthropicClient.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }]
    });
    
    return response.content[0].text;
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return null;
  }
}

/**
 * Get a full stock analysis report
 * @param symbol Stock symbol
 */
export async function getStockAnalysisReport(symbol: string): Promise<any> {
  try {
    // Find stock in database or fetch it
    let stock = await db.select().from(stocks).where(eq(stocks.symbol, symbol)).limit(1);
    if (stock.length === 0) {
      // If stock not found, fetch and update data
      stock = [await updateStockData(symbol)];
    }
    
    const stockId = stock[0].id;
    
    // Get latest prices
    const prices = await db.select()
      .from(stockPrices)
      .where(eq(stockPrices.stockId, stockId))
      .orderBy(desc(stockPrices.date))
      .limit(30);
    
    // Get latest indicators
    const indicators = await db.select()
      .from(stockIndicators)
      .where(eq(stockIndicators.stockId, stockId))
      .orderBy(desc(stockIndicators.date))
      .limit(1);
    
    // Get latest analysis
    const analysis = await db.select()
      .from(stockAnalysis)
      .where(eq(stockAnalysis.stockId, stockId))
      .orderBy(desc(stockAnalysis.date))
      .limit(1);
    
    // If we don't have indicators or analysis, process them now
    if (indicators.length === 0 || analysis.length === 0) {
      await processStockIndicators(symbol);
      
      // Fetch the newly generated data
      const updatedIndicators = await db.select()
        .from(stockIndicators)
        .where(eq(stockIndicators.stockId, stockId))
        .orderBy(desc(stockIndicators.date))
        .limit(1);
      
      const updatedAnalysis = await db.select()
        .from(stockAnalysis)
        .where(eq(stockAnalysis.stockId, stockId))
        .orderBy(desc(stockAnalysis.date))
        .limit(1);
      
      return {
        stock: stock[0],
        prices: prices.reverse(), // Oldest first for charting
        indicators: updatedIndicators[0] || null,
        analysis: updatedAnalysis[0] || null
      };
    }
    
    return {
      stock: stock[0],
      prices: prices.reverse(), // Oldest first for charting
      indicators: indicators[0] || null,
      analysis: analysis[0] || null
    };
  } catch (error) {
    console.error(`Error getting stock analysis report for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Compare multiple stocks
 * @param symbols Array of stock symbols to compare
 */
export async function compareStocks(symbols: string[]): Promise<any> {
  try {
    const results = [];
    
    for (const symbol of symbols) {
      // Get or process stock data
      const report = await getStockAnalysisReport(symbol);
      
      // Extract key metrics for comparison
      results.push({
        symbol: report.stock.symbol,
        name: report.stock.name,
        price: report.prices[report.prices.length - 1]?.close,
        change: calculatePercentChange(report.prices),
        rsi: report.indicators?.rsi14,
        macd: report.indicators?.macdHistogram,
        shortTermOutlook: report.analysis?.shortTermOutlook || 'neutral',
        longTermOutlook: report.analysis?.longTermOutlook || 'neutral',
        volatility: report.indicators?.volatility
      });
    }
    
    return results;
  } catch (error) {
    console.error(`Error comparing stocks:`, error);
    throw error;
  }
}

/**
 * Calculate percent change from price data
 */
function calculatePercentChange(prices: any[]): number {
  if (prices.length < 2) return 0;
  
  const latest = parseFloat(prices[prices.length - 1].close);
  const previous = parseFloat(prices[prices.length - 2].close);
  
  return ((latest - previous) / previous) * 100;
}

/**
 * Find stocks with significant anomalies
 * @param limit Maximum number of stocks to return
 */
export async function findStockAnomalies(limit: number = 5): Promise<any[]> {
  try {
    // Get all stocks with their latest indicators
    const stocksWithIndicators = await db.select({
      stock: stocks,
      indicators: stockIndicators
    })
    .from(stocks)
    .innerJoin(
      stockIndicators,
      eq(stocks.id, stockIndicators.stockId)
    )
    .orderBy(desc(stockIndicators.date))
    .limit(limit * 10); // Get more than we need to filter
    
    // Calculate anomaly scores
    const stocksWithAnomalyScores = stocksWithIndicators.map(item => {
      const anomalyScore = calculateAnomalyScore(item.indicators);
      return {
        ...item,
        anomalyScore
      };
    });
    
    // Sort by anomaly score and get the top results
    return stocksWithAnomalyScores
      .sort((a, b) => b.anomalyScore - a.anomalyScore)
      .slice(0, limit);
  } catch (error) {
    console.error('Error finding stock anomalies:', error);
    return [];
  }
}

/**
 * Calculate an anomaly score based on technical indicators
 * Higher score means more unusual/significant market behavior
 */
function calculateAnomalyScore(indicators: any): number {
  let score = 0;
  
  // RSI extremes
  const rsi = parseFloat(indicators.rsi14 || '0');
  if (rsi > 80) score += 3;
  else if (rsi > 70) score += 2;
  else if (rsi < 20) score += 3;
  else if (rsi < 30) score += 2;
  
  // MACD histogram
  const macdHist = parseFloat(indicators.macdHistogram || '0');
  if (Math.abs(macdHist) > 0.5) score += 1;
  if (Math.abs(macdHist) > 1) score += 1;
  
  // Bollinger band position
  const price = parseFloat(indicators.bollingerMiddle || '0');
  const upper = parseFloat(indicators.bollingerUpper || '0');
  const lower = parseFloat(indicators.bollingerLower || '0');
  
  if (price > upper) score += 2;
  if (price < lower) score += 2;
  
  // Volatility
  const volatility = parseFloat(indicators.volatility || '0');
  if (volatility > 0.03) score += 1;
  if (volatility > 0.05) score += 2;
  
  return score;
}