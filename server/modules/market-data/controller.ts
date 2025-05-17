/**
 * Neufin Market Data API Controller
 * Handles API endpoints for real-time market data
 */

import { Router, Request, Response } from 'express';
import {
  fetchRealTimeQuote,
  fetchMultipleRealTimeQuotes,
  fetchMarketOverview
} from './realtime-service';

export const marketDataRouter = Router();

/**
 * Get real-time quote for a specific symbol
 * GET /api/market-data/quote/:symbol
 */
marketDataRouter.get('/quote/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Symbol parameter is required'
      });
    }
    
    const quote = await fetchRealTimeQuote(symbol.toUpperCase());
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: `No data found for symbol: ${symbol}`
      });
    }
    
    return res.json({
      success: true,
      data: quote
    });
  } catch (error) {
    console.error('Error fetching real-time quote:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time market data',
      error: error.message
    });
  }
});

/**
 * Get real-time quotes for multiple symbols
 * GET /api/market-data/quotes?symbols=AAPL,MSFT,GOOGL
 */
marketDataRouter.get('/quotes', async (req: Request, res: Response) => {
  try {
    const { symbols } = req.query;
    
    if (!symbols || typeof symbols !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Symbols parameter is required (comma-separated list)'
      });
    }
    
    const symbolList = symbols.split(',').map(s => s.trim().toUpperCase());
    
    if (symbolList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one valid symbol is required'
      });
    }
    
    // Limit the number of symbols to prevent abuse/rate limiting
    const limitedSymbols = symbolList.slice(0, 5);
    
    const quotesMap = await fetchMultipleRealTimeQuotes(limitedSymbols);
    const quotes = Array.from(quotesMap.values());
    
    return res.json({
      success: true,
      data: quotes,
      meta: {
        requested: symbolList.length,
        returned: quotes.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching multiple quotes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time market data',
      error: error.message
    });
  }
});

/**
 * Get market overview with top gainers, losers, most active stocks
 * GET /api/market-data/overview
 */
marketDataRouter.get('/overview', async (req: Request, res: Response) => {
  try {
    const overview = await fetchMarketOverview();
    
    if (!overview) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch market overview data'
      });
    }
    
    return res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('Error fetching market overview:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch market overview data',
      error: error.message
    });
  }
});

/**
 * Trigger immediate refresh of data for a symbol
 * POST /api/market-data/refresh/:symbol
 */
marketDataRouter.post('/refresh/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Symbol parameter is required'
      });
    }
    
    const quote = await fetchRealTimeQuote(symbol.toUpperCase());
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: `Failed to refresh data for symbol: ${symbol}`
      });
    }
    
    return res.json({
      success: true,
      message: `Successfully refreshed data for ${symbol}`,
      data: quote
    });
  } catch (error) {
    console.error(`Error refreshing data for ${req.params.symbol}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to refresh market data',
      error: error.message
    });
  }
});