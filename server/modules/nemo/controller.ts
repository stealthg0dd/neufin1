/**
 * Neufin Nemo API Controller
 * Handles API endpoints for stock intelligence
 */

import { Router, Request, Response } from 'express';
import { db } from '../../db';
import { stocks, stockPrices, stockIndicators, stockAnalysis } from '@shared/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { 
  updateStockData, 
  findStockBySymbol, 
  searchSymbol 
} from './alpha-vantage-client';
import { 
  processStockIndicators, 
  getStockAnalysisReport,
  compareStocks,
  findStockAnomalies
} from './stock-analyzer';

// Create Express router
const nemoRouter = Router();

/**
 * Get stock summary (basic data)
 */
nemoRouter.get('/stocks/:symbol/summary', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    // Get the stock from database or fetch from API
    let stock = await findStockBySymbol(symbol);
    
    if (!stock) {
      // If stock not found, fetch and store it
      stock = await updateStockData(symbol);
    }
    
    res.json(stock);
  } catch (error) {
    console.error(`Error fetching stock summary for ${req.params.symbol}:`, error);
    res.status(500).json({ error: 'Failed to retrieve stock data' });
  }
});

/**
 * Get stock price data
 */
nemoRouter.get('/stocks/:symbol/prices', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const timeRange = req.query.range as string || '1M'; // 1D, 1W, 1M, 3M, 1Y, ALL
    
    // Get or create stock record
    let stock = await findStockBySymbol(symbol);
    
    if (!stock) {
      stock = await updateStockData(symbol);
    }
    
    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '1D':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '1W':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '1Y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default: // ALL
        startDate = new Date(0); // Beginning of time
    }
    
    // Query price data
    const prices = await db.select()
      .from(stockPrices)
      .where(
        and(
          eq(stockPrices.stockId, stock.id),
          gte(stockPrices.date, startDate),
          lte(stockPrices.date, endDate)
        )
      )
      .orderBy(stockPrices.date);
    
    res.json(prices);
  } catch (error) {
    console.error(`Error fetching stock prices for ${req.params.symbol}:`, error);
    res.status(500).json({ error: 'Failed to retrieve price data' });
  }
});

/**
 * Get technical indicators
 */
nemoRouter.get('/stocks/:symbol/indicators', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    // Get or create stock record
    let stock = await findStockBySymbol(symbol);
    
    if (!stock) {
      stock = await updateStockData(symbol);
    }
    
    // Get latest indicators
    const indicators = await db.select()
      .from(stockIndicators)
      .where(eq(stockIndicators.stockId, stock.id))
      .orderBy(desc(stockIndicators.date))
      .limit(1);
    
    // If no indicators found, process them now
    if (indicators.length === 0) {
      await processStockIndicators(symbol);
      
      // Fetch the newly created indicators
      const updatedIndicators = await db.select()
        .from(stockIndicators)
        .where(eq(stockIndicators.stockId, stock.id))
        .orderBy(desc(stockIndicators.date))
        .limit(1);
      
      res.json(updatedIndicators[0]);
    } else {
      res.json(indicators[0]);
    }
  } catch (error) {
    console.error(`Error fetching indicators for ${req.params.symbol}:`, error);
    res.status(500).json({ error: 'Failed to retrieve indicator data' });
  }
});

/**
 * Get stock analysis
 */
nemoRouter.get('/stocks/:symbol/analysis', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    // Get or create stock record
    let stock = await findStockBySymbol(symbol);
    
    if (!stock) {
      stock = await updateStockData(symbol);
    }
    
    // Get latest analysis
    const analysis = await db.select()
      .from(stockAnalysis)
      .where(eq(stockAnalysis.stockId, stock.id))
      .orderBy(desc(stockAnalysis.date))
      .limit(1);
    
    // If no analysis found, process indicators and analysis now
    if (analysis.length === 0) {
      await processStockIndicators(symbol);
      
      // Fetch the newly created analysis
      const updatedAnalysis = await db.select()
        .from(stockAnalysis)
        .where(eq(stockAnalysis.stockId, stock.id))
        .orderBy(desc(stockAnalysis.date))
        .limit(1);
      
      res.json(updatedAnalysis[0]);
    } else {
      res.json(analysis[0]);
    }
  } catch (error) {
    console.error(`Error fetching analysis for ${req.params.symbol}:`, error);
    res.status(500).json({ error: 'Failed to retrieve analysis data' });
  }
});

/**
 * Get full stock intelligence report
 */
nemoRouter.get('/stocks/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const report = await getStockAnalysisReport(symbol);
    res.json(report);
  } catch (error) {
    console.error(`Error fetching stock intelligence for ${req.params.symbol}:`, error);
    res.status(500).json({ error: 'Failed to retrieve stock intelligence data' });
  }
});

/**
 * Search for stocks
 */
nemoRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }
    
    const results = await searchSymbol(query);
    res.json(results);
  } catch (error) {
    console.error(`Error searching for stocks:`, error);
    res.status(500).json({ error: 'Failed to search for stocks' });
  }
});

/**
 * Compare multiple stocks
 */
nemoRouter.get('/compare', async (req: Request, res: Response) => {
  try {
    const symbolsParam = req.query.symbols as string;
    
    if (!symbolsParam) {
      return res.status(400).json({ error: 'No symbols provided for comparison' });
    }
    
    const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase());
    
    if (symbols.length < 2 || symbols.length > 5) {
      return res.status(400).json({ error: 'Please provide between 2 and 5 symbols to compare' });
    }
    
    const comparison = await compareStocks(symbols);
    res.json(comparison);
  } catch (error) {
    console.error(`Error comparing stocks:`, error);
    res.status(500).json({ error: 'Failed to compare stocks' });
  }
});

/**
 * Get stock anomalies
 */
nemoRouter.get('/anomalies', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const anomalies = await findStockAnomalies(limit);
    res.json(anomalies);
  } catch (error) {
    console.error(`Error finding stock anomalies:`, error);
    res.status(500).json({ error: 'Failed to find stock anomalies' });
  }
});

/**
 * Trigger refresh of stock data
 */
nemoRouter.post('/stocks/:symbol/refresh', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    // Update stock data from Alpha Vantage
    await updateStockData(symbol);
    
    // Process indicators
    await processStockIndicators(symbol);
    
    res.json({ message: `Successfully refreshed data for ${symbol}` });
  } catch (error) {
    console.error(`Error refreshing data for ${req.params.symbol}:`, error);
    res.status(500).json({ error: 'Failed to refresh stock data' });
  }
});

export default nemoRouter;