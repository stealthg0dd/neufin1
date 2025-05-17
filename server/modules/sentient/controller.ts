/**
 * Neufin Sentient API Controller
 * Handles API endpoints for sentiment analysis
 */

import { Router, Request, Response } from 'express';
import { db } from '../../db';
import { marketSentiment } from '@shared/schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import {
  getSentimentData,
  getSentimentBySecctor,
  processAllSymbols,
  analyzeAndStoreSentimentForSymbol
} from './data-fetcher';
import { startSentimentAnalysisJob, stopSentimentAnalysisJob, getSentimentJobStatus } from './scheduler';

// Create Express router
const sentientRouter = Router();

/**
 * Get market sentiment overview
 * Returns aggregated sentiment data across symbols
 */
sentientRouter.get('/overview', async (req: Request, res: Response) => {
  try {
    // Get time range from query params
    const timeRange = req.query.timeRange as '1D' | '1W' | '1M' | 'ALL' || 'ALL';
    
    // Query the latest sentiment data for key symbols
    const sentimentResults = await db
      .select()
      .from(marketSentiment)
      .orderBy(desc(marketSentiment.timestamp))
      .limit(50);
    
    // Group and aggregate sentiment data
    const overallSentiment = calculateOverallSentiment(sentimentResults);
    const sectorSentiment = calculateSectorSentiment(sentimentResults);
    
    res.json({
      timeRange,
      timestamp: new Date(),
      overall: overallSentiment,
      sectors: sectorSentiment
    });
  } catch (error) {
    console.error('Error fetching sentiment overview:', error);
    res.status(500).json({ error: 'Failed to retrieve sentiment data' });
  }
});

/**
 * Get sentiment data for a specific symbol
 */
sentientRouter.get('/symbol/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const timeRange = req.query.timeRange as '1D' | '1W' | '1M' | 'ALL' || 'ALL';
    
    const sentimentData = await getSentimentData(symbol, timeRange);
    
    // Calculate trend
    const trend = calculateTrend(sentimentData);
    
    res.json({
      symbol,
      timeRange,
      trend,
      data: sentimentData
    });
  } catch (error) {
    console.error(`Error fetching sentiment for symbol ${req.params.symbol}:`, error);
    res.status(500).json({ error: 'Failed to retrieve sentiment data for symbol' });
  }
});

/**
 * Get sentiment data for a specific sector
 */
sentientRouter.get('/sector/:sector', async (req: Request, res: Response) => {
  try {
    const { sector } = req.params;
    const timeRange = req.query.timeRange as '1D' | '1W' | '1M' | 'ALL' || 'ALL';
    
    const sectorData = await getSentimentBySecctor(sector, timeRange);
    
    res.json({
      sector,
      timeRange,
      data: sectorData
    });
  } catch (error) {
    console.error(`Error fetching sentiment for sector ${req.params.sector}:`, error);
    res.status(500).json({ error: 'Failed to retrieve sentiment data for sector' });
  }
});

/**
 * Trigger analysis for a specific symbol (admin endpoint)
 */
sentientRouter.post('/analyze/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    await analyzeAndStoreSentimentForSymbol(symbol);
    
    res.json({ message: `Analysis triggered for ${symbol}` });
  } catch (error) {
    console.error(`Error analyzing sentiment for ${req.params.symbol}:`, error);
    res.status(500).json({ error: 'Failed to analyze sentiment' });
  }
});

/**
 * Trigger analysis for all symbols (admin endpoint)
 */
sentientRouter.post('/analyze-all', async (req: Request, res: Response) => {
  try {
    // Process asynchronously so we don't block the response
    processAllSymbols().catch(err => {
      console.error('Error in bulk sentiment analysis:', err);
    });
    
    res.json({ message: 'Sentiment analysis started for all symbols' });
  } catch (error) {
    console.error('Error starting bulk analysis:', error);
    res.status(500).json({ error: 'Failed to start sentiment analysis' });
  }
});

/**
 * Scheduler control endpoints (admin)
 */
sentientRouter.post('/scheduler/start', (req: Request, res: Response) => {
  try {
    const intervalMinutes = parseInt(req.query.interval as string) || 60;
    startSentimentAnalysisJob(intervalMinutes);
    res.json({ 
      message: `Sentiment analysis scheduler started with ${intervalMinutes} minute interval`,
      status: getSentimentJobStatus()
    });
  } catch (error) {
    console.error('Error starting sentiment scheduler:', error);
    res.status(500).json({ error: 'Failed to start sentiment scheduler' });
  }
});

sentientRouter.post('/scheduler/stop', (req: Request, res: Response) => {
  try {
    stopSentimentAnalysisJob();
    res.json({ 
      message: 'Sentiment analysis scheduler stopped',
      status: getSentimentJobStatus()
    });
  } catch (error) {
    console.error('Error stopping sentiment scheduler:', error);
    res.status(500).json({ error: 'Failed to stop sentiment scheduler' });
  }
});

sentientRouter.get('/scheduler/status', (req: Request, res: Response) => {
  try {
    res.json(getSentimentJobStatus());
  } catch (error) {
    console.error('Error getting scheduler status:', error);
    res.status(500).json({ error: 'Failed to get scheduler status' });
  }
});

/**
 * Helper functions for data aggregation
 */

function calculateOverallSentiment(data: any[]) {
  if (!data || data.length === 0) {
    return { score: 50, status: 'neutral', change: 0 };
  }
  
  // Calculate average sentiment score
  const totalScore = data.reduce((sum, item) => sum + item.sentimentScore, 0);
  const averageScore = Math.round(totalScore / data.length);
  
  // Determine status
  let status = 'neutral';
  if (averageScore > 60) status = 'positive';
  if (averageScore < 40) status = 'negative';
  
  // Calculate change (simplified)
  // In a real implementation, you would compare against historical average
  const change = data.length > 1 ? 
    averageScore - data[data.length - 1].sentimentScore : 0;
  
  return {
    score: averageScore,
    status,
    change
  };
}

function calculateSectorSentiment(data: any[]) {
  const sectors: Record<string, any[]> = {};
  
  // Group data by sector
  data.forEach(item => {
    const sector = item.details?.sector || 'Other';
    if (!sectors[sector]) {
      sectors[sector] = [];
    }
    sectors[sector].push(item);
  });
  
  // Calculate sentiment for each sector
  const result: Record<string, any> = {};
  for (const [sector, items] of Object.entries(sectors)) {
    result[sector] = calculateOverallSentiment(items);
  }
  
  return result;
}

function calculateTrend(data: any[]) {
  if (!data || data.length < 2) {
    return { direction: 'stable', magnitude: 0 };
  }
  
  // Sort data by timestamp (most recent first)
  const sortedData = [...data].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Get most recent and oldest available score
  const latestScore = sortedData[0].sentimentScore;
  const oldestScore = sortedData[sortedData.length - 1].sentimentScore;
  
  // Calculate change
  const change = latestScore - oldestScore;
  const absChange = Math.abs(change);
  
  // Determine direction and magnitude
  let direction = 'stable';
  let magnitude = 'low';
  
  if (change > 0) direction = 'upward';
  else if (change < 0) direction = 'downward';
  
  if (absChange > 10) magnitude = 'high';
  else if (absChange > 5) magnitude = 'medium';
  
  return {
    direction,
    magnitude,
    change
  };
}

export default sentientRouter;