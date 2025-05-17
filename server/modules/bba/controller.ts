/**
 * Behavioral Bias Analyzer (BBA) Module Controller
 * 
 * Handles API routes for the Behavioral Bias Analyzer module
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../../storage';
import { 
  analyzeTradingBehavior, 
  getBiasEducationalContent, 
  getUserBiasProfile,
  processNaturalLanguageQuery
} from './bias-analyzer';
import { 
  TradeAnalysisRequest, 
  BiasType, 
  NaturalLanguageQueryRequest
} from './types';
import { insertUserTradeSchema, insertBiasAnalysisReportSchema } from '@shared/schema';

// Initialize router
const router = Router();

/**
 * Analyze user trading behavior for biases
 * 
 * POST /api/bba/analyze
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      userId: z.number()
    });
    
    const { userId } = schema.parse(req.body);
    
    // Run analysis
    const result = await analyzeTradingBehavior(userId);
    
    // Save the bias analysis report
    const reportData = {
      userId,
      overallScore: result.overallScore,
      primaryBiases: JSON.stringify(result.detectedBiases),
      improvementSuggestions: JSON.stringify(result.improvementSuggestions),
      comparisonData: result.comparisonAnalysis 
        ? JSON.stringify(result.comparisonAnalysis) 
        : null
    };
    
    // Create bias report
    await storage.createBiasReport(reportData);
    
    res.json(result);
  } catch (error: any) {
    console.error('Error analyzing trading behavior:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get user's bias profile with historical data
 * 
 * GET /api/bba/profile/:userId
 */
router.get('/profile/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const profile = await getUserBiasProfile(userId);
    res.json(profile);
  } catch (error: any) {
    console.error('Error getting user bias profile:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get educational content about a specific bias
 * 
 * GET /api/bba/bias/:biasType
 */
router.get('/bias/:biasType', async (req: Request, res: Response) => {
  try {
    const biasType = req.params.biasType as BiasType;
    const content = getBiasEducationalContent(biasType);
    res.json(content);
  } catch (error: any) {
    console.error('Error getting bias educational content:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Process natural language queries about user's biases
 * 
 * POST /api/bba/query
 */
router.post('/query', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      userId: z.number(),
      query: z.string().min(1)
    });
    
    const payload = schema.parse(req.body) as NaturalLanguageQueryRequest;
    const result = await processNaturalLanguageQuery(payload.userId, payload.query);
    
    res.json(result);
  } catch (error: any) {
    console.error('Error processing natural language query:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Record a user trade for analysis
 * 
 * POST /api/bba/trades
 */
router.post('/trades', async (req: Request, res: Response) => {
  try {
    const tradeData = insertUserTradeSchema.parse(req.body);
    const trade = await storage.createTrade(tradeData);
    res.status(201).json(trade);
  } catch (error: any) {
    console.error('Error creating trade record:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get user trades for analysis
 * 
 * GET /api/bba/trades/:userId
 */
router.get('/trades/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    let trades;
    
    // Check if filtering by symbol
    if (req.query.symbol) {
      trades = await storage.getTradesBySymbol(userId, req.query.symbol as string);
    } else {
      trades = await storage.getUserTrades(userId, limit);
    }
    
    res.json(trades);
  } catch (error: any) {
    console.error('Error getting user trades:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get a list of bias reports for a user
 * 
 * GET /api/bba/reports/:userId
 */
router.get('/reports/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const reports = await storage.getUserBiasReports(userId, limit);
    res.json(reports);
  } catch (error: any) {
    console.error('Error getting bias reports:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get the latest bias report for a user
 * 
 * GET /api/bba/reports/:userId/latest
 */
router.get('/reports/:userId/latest', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const report = await storage.getLatestBiasReport(userId);
    
    if (!report) {
      return res.status(404).json({ error: 'No bias report found for this user' });
    }
    
    res.json(report);
  } catch (error: any) {
    console.error('Error getting latest bias report:', error);
    res.status(400).json({ error: error.message });
  }
});

export const bbaController = router;