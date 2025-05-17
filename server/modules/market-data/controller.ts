/**
 * Market Data API Controller
 * Handles endpoints for real-time market data
 */
import { Request, Response, Router } from 'express';
import { 
  fetchRealTimeQuote, 
  fetchMultipleQuotes, 
  getMarketOverview 
} from './realtime-service';

export const marketDataRouter = Router();

/**
 * Get a real-time quote for a specific symbol
 * GET /api/market-data/quote/:symbol
 */
marketDataRouter.get('/quote/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
    
    const quote = await fetchRealTimeQuote(symbol);
    
    return res.json(quote);
  } catch (error) {
    console.error(`Error fetching quote for ${req.params.symbol}:`, error);
    return res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

/**
 * Get real-time quotes for multiple symbols
 * GET /api/market-data/quotes?symbols=AAPL,MSFT,GOOGL
 */
marketDataRouter.get('/quotes', async (req: Request, res: Response) => {
  try {
    const symbolsParam = req.query.symbols as string;
    
    if (!symbolsParam) {
      return res.status(400).json({ error: 'Symbols parameter is required' });
    }
    
    const symbols = symbolsParam.split(',').map(s => s.trim());
    
    if (symbols.length === 0) {
      return res.status(400).json({ error: 'At least one symbol is required' });
    }
    
    const quotes = await fetchMultipleQuotes(symbols);
    
    return res.json(quotes);
  } catch (error) {
    console.error('Error fetching multiple quotes:', error);
    return res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

/**
 * Get market overview data (indices, top gainers/losers, most active)
 * GET /api/market-data/overview
 */
marketDataRouter.get('/overview', async (req: Request, res: Response) => {
  try {
    const overview = await getMarketOverview();
    
    return res.json(overview);
  } catch (error) {
    console.error('Error fetching market overview:', error);
    return res.status(500).json({ error: 'Failed to fetch market overview' });
  }
});

/**
 * Refresh data for a specific symbol (force fetch from API)
 * POST /api/market-data/refresh/:symbol
 */
marketDataRouter.post('/refresh/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
    
    // Force refresh by directly calling the API
    const quote = await fetchRealTimeQuote(symbol);
    
    return res.json(quote);
  } catch (error) {
    console.error(`Error refreshing data for ${req.params.symbol}:`, error);
    return res.status(500).json({ error: 'Failed to refresh data' });
  }
});