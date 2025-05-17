/**
 * Scheduler for periodic sentiment analysis updates
 * Runs on configurable intervals to keep sentiment data current
 */

import { processAllSymbols } from './data-fetcher';

// In-memory tracker for our periodic job
let sentimentJobInterval: NodeJS.Timeout | null = null;

/**
 * Start periodic sentiment analysis job
 * @param intervalMinutes How often to run the job (in minutes)
 */
export function startSentimentAnalysisJob(intervalMinutes: number = 60): void {
  // Clear any existing job first
  if (sentimentJobInterval) {
    clearInterval(sentimentJobInterval);
  }
  
  console.log(`Starting sentiment analysis job to run every ${intervalMinutes} minutes`);
  
  // Run once immediately on startup
  processAllSymbols().catch(err => {
    console.error('Error in initial sentiment analysis run:', err);
  });
  
  // Set up recurring job
  sentimentJobInterval = setInterval(() => {
    console.log('Running scheduled sentiment analysis job');
    processAllSymbols().catch(err => {
      console.error('Error in scheduled sentiment analysis:', err);
    });
  }, intervalMinutes * 60 * 1000);
}

/**
 * Stop the scheduled sentiment analysis job
 */
export function stopSentimentAnalysisJob(): void {
  if (sentimentJobInterval) {
    clearInterval(sentimentJobInterval);
    sentimentJobInterval = null;
    console.log('Sentiment analysis job stopped');
  } else {
    console.log('No sentiment analysis job running');
  }
}

/**
 * Get the status of the sentiment analysis job
 */
export function getSentimentJobStatus(): { running: boolean; intervalMinutes?: number } {
  if (sentimentJobInterval) {
    // We can't directly access the interval time from the NodeJS.Timeout object
    // So we'll need to track this separately in a real implementation
    return { 
      running: true,
      // This is placeholder and would need to be tracked separately
      intervalMinutes: 60
    };
  } else {
    return { running: false };
  }
}