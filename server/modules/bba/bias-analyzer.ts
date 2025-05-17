/**
 * Behavioral Bias Analyzer (BBA) Module
 * 
 * This service analyzes trading behavior and identifies cognitive biases
 * in user investment decisions.
 */

import { storage } from "../../storage";
import { PortfolioHolding, UserTrade } from "@shared/schema";
import { 
  BiasType, 
  BiasDefinition, 
  BiasDetectionResult,
  UserBiasProfile,
  BiasEducationalContent
} from "./types";
import OpenAI from "openai";

// Initialize OpenAI client for analysis
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Bias definitions with educational content
export const biasDefinitions: Record<BiasType, BiasDefinition> = {
  loss_aversion: {
    id: 'loss_aversion',
    name: 'Loss Aversion',
    description: 'The tendency to prefer avoiding losses over acquiring equivalent gains.',
    impact: 'Can lead to holding losing positions too long to avoid realizing losses, or selling winners too early.',
    examples: [
      'Holding onto a losing stock hoping it will recover, even when fundamentals suggest otherwise.',
      'Setting stop losses much farther from purchase price than take-profit targets.'
    ],
    corrections: [
      'Implement strict stop-loss rules based on fundamentals, not emotions.',
      'Focus on total portfolio return rather than individual positions.',
      'Use automated trading rules to remove emotion from selling decisions.'
    ],
    emoji: '😨'
  },
  confirmation_bias: {
    id: 'confirmation_bias',
    name: 'Confirmation Bias',
    description: 'The tendency to search for or interpret information in a way that confirms pre-existing beliefs.',
    impact: 'Can lead to ignoring warning signs about investments that contradict your thesis.',
    examples: [
      'Only reading positive news about stocks you own.',
      'Dismissing analyst downgrades as "not understanding the company".',
      'Seeking validation in investment forums while ignoring critical voices.'
    ],
    corrections: [
      'Actively seek out contrary opinions about your investments.',
      'Create a pre-investment checklist that requires examining bear cases.',
      'Have investment decisions reviewed by people with different perspectives.'
    ],
    emoji: '🔍'
  },
  overconfidence: {
    id: 'overconfidence',
    name: 'Overconfidence',
    description: 'Overestimating one\'s investment abilities, knowledge, and the accuracy of forecasts.',
    impact: 'Can lead to excessive trading, over-concentration in certain assets, and ignoring risks.',
    examples: [
      'Trading frequently based on short-term predictions.',
      'Taking outsized positions in single stocks or sectors.',
      'Using excessive leverage believing you can time the market.'
    ],
    corrections: [
      'Track your prediction accuracy to calibrate confidence.',
      'Implement position-sizing rules based on objective risk metrics.',
      'Diversify investments based on the understanding that predictions will often be wrong.'
    ],
    emoji: '😎'
  },
  recency_bias: {
    id: 'recency_bias',
    name: 'Recency Bias',
    description: 'Overweighting recent events and experiences when making decisions about the future.',
    impact: 'Can lead to chasing performance, buying high and selling low.',
    examples: [
      'Investing heavily in sectors that have recently performed well.',
      'Selling assets after short-term market drops.',
      'Changing investment strategy based on recent market movements.'
    ],
    corrections: [
      'Review longer historical periods when analyzing investments.',
      'Implement a systematic rebalancing strategy.',
      'Document your investment thesis before making decisions and refer back to it.'
    ],
    emoji: '⏱️'
  },
  herd_mentality: {
    id: 'herd_mentality',
    name: 'Herd Mentality',
    description: 'Following what others are doing rather than making independent decisions.',
    impact: 'Can lead to market bubbles, buying at peaks, and panic selling at bottoms.',
    examples: [
      'Investing in popular "meme stocks" without understanding the fundamentals.',
      'Selling during market panics when everyone else is selling.',
      'FOMO-based (Fear Of Missing Out) investment decisions.'
    ],
    corrections: [
      'Develop an independent investment framework.',
      'Wait 24-48 hours before acting on hot tips or market movements.',
      'Limit consumption of financial media during volatile periods.'
    ],
    emoji: '🐑'
  },
  anchoring_bias: {
    id: 'anchoring_bias',
    name: 'Anchoring Bias',
    description: 'Over-relying on the first piece of information encountered (the "anchor") when making decisions.',
    impact: 'Can lead to holding onto price targets that are no longer relevant, or focusing too much on purchase price.',
    examples: [
      'Refusing to sell a stock until it returns to the price you paid for it.',
      'Setting price targets based on past highs rather than current fundamentals.',
      'Judging a stock as "cheap" because it\'s down from its all-time high, regardless of valuation.'
    ],
    corrections: [
      'Regularly reevaluate investments as if you were buying them today at current prices.',
      'Use multiple valuation metrics rather than anchoring on one number.',
      'Focus on future potential rather than past prices.'
    ],
    emoji: '⚓'
  },
  sunk_cost_fallacy: {
    id: 'sunk_cost_fallacy',
    name: 'Sunk Cost Fallacy',
    description: 'Continuing an investment because of resources already committed, despite new evidence suggesting it is no longer optimal.',
    impact: 'Can lead to throwing good money after bad and holding losing investments too long.',
    examples: [
      'Averaging down on losing positions just because you have already invested significantly.',
      'Refusing to exit a failed investment strategy because of the time already invested in it.',
      'Holding onto poor investments because "I have already lost so much, it can only go up from here."'
    ],
    corrections: [
      'Evaluate investments based solely on future prospects, not past commitments.',
      'Ask: "Would I buy this investment today if I did not already own it?"',
      'Set predefined exit conditions before investing.'
    ],
    emoji: '🕳️'
  },
  hindsight_bias: {
    id: 'hindsight_bias',
    name: 'Hindsight Bias',
    description: 'The tendency to see past events as having been predictable.',
    impact: 'Can lead to overconfidence in future predictions and failure to learn properly from mistakes.',
    examples: [
      'Thinking market crashes were obvious in retrospect.',
      'Saying "I knew that stock would perform well" after seeing its success.',
      'Misremembering your own predictions to align with what actually happened.'
    ],
    corrections: [
      'Keep a detailed investment journal with predictions and reasoning.',
      'Focus on your decision process rather than just outcomes.',
      'Recognize the role of randomness and uncertainty in markets.'
    ],
    emoji: '👓'
  },
  fear_of_missing_out: {
    id: 'fear_of_missing_out',
    name: 'Fear of Missing Out (FOMO)',
    description: 'Making investment decisions based on anxiety that others are benefiting from opportunities you are not taking.',
    impact: 'Can lead to chasing returns, buying at market peaks, and excessive risk-taking.',
    examples: [
      'Investing in cryptocurrencies or NFTs without understanding them because of hype.',
      'Increasing position sizes after seeing others\' outsized returns.',
      'Abandoning your strategy to follow trending investments.'
    ],
    corrections: [
      'Stick to your investment plan even when others appear to be making quick gains.',
      'Remind yourself that extraordinary returns often come with extraordinary risks.',
      'Focus on your long-term financial goals rather than short-term opportunities.'
    ],
    emoji: '😰'
  },
  status_quo_bias: {
    id: 'status_quo_bias',
    name: 'Status Quo Bias',
    description: 'Preferring the current state of affairs and avoiding changes, even when change would be beneficial.',
    impact: 'Can lead to portfolio inertia, failure to rebalance, and holding legacy positions too long.',
    examples: [
      'Holding the same investments for years without reassessment.',
      'Failing to rebalance a portfolio that has drifted from target allocations.',
      'Keeping inherited investments due to familiarity rather than merit.'
    ],
    corrections: [
      'Schedule regular portfolio reviews with mandatory reassessment.',
      'Implement automatic rebalancing rules.',
      'Imagine you were starting from cash—would you build the same portfolio you have now?'
    ],
    emoji: '🧊'
  },
  self_attribution_bias: {
    id: 'self_attribution_bias',
    name: 'Self-Attribution Bias',
    description: 'Taking credit for successes while blaming external factors for failures.',
    impact: 'Can lead to overconfidence and failure to learn from mistakes.',
    examples: [
      'Attributing investment gains to your skill but losses to market conditions.',
      'Focusing on successful picks while ignoring or explaining away failures.',
      'Believing you have special insight that others lack, based on selective memory.'
    ],
    corrections: [
      'Track all investment decisions and their outcomes, both good and bad.',
      'For each investment outcome, list internal and external factors that contributed.',
      'Ask what you could have done differently even for successful investments.'
    ],
    emoji: '🏆'
  },
  narrative_fallacy: {
    id: 'narrative_fallacy',
    name: 'Narrative Fallacy',
    description: 'Creating stories to explain events, leading to oversimplification and false causality.',
    impact: 'Can lead to investment decisions based on compelling but flawed narratives rather than data.',
    examples: [
      'Investing based on a simple "story" about why a company will succeed.',
      'Attributing market movements to specific news events without evidence.',
      'Creating cause-and-effect relationships between unrelated economic factors.'
    ],
    corrections: [
      'Focus on quantifiable metrics and data rather than stories.',
      'Test narratives against historical data and alternative explanations.',
      'Be wary of simple explanations for complex market phenomena.'
    ],
    emoji: '📚'
  },
  illusion_of_control: {
    id: 'illusion_of_control',
    name: 'Illusion of Control',
    description: 'Overestimating one\'s ability to control or influence outcomes.',
    impact: 'Can lead to excessive trading, market timing attempts, and underestimation of risks.',
    examples: [
      'Frequent checking of portfolio values thinking it helps performance.',
      'Believing you can consistently time market entries and exits.',
      'Trading based on patterns you perceive in market movements.'
    ],
    corrections: [
      'Acknowledge the role of randomness and uncertainty in markets.',
      'Focus on factors you can control (fees, diversification, taxes) rather than trying to control the market.',
      'Automate investment decisions where possible to remove the illusion of control.'
    ],
    emoji: '🎮'
  },
  availability_bias: {
    id: 'availability_bias',
    name: 'Availability Bias',
    description: 'Overestimating the likelihood or importance of things that come readily to mind.',
    impact: 'Can lead to overreaction to recent or vivid market events.',
    examples: [
      'Avoiding airline stocks after highly publicized crashes.',
      'Overestimating the probability of market crashes after reading about historic ones.',
      'Investing heavily in sectors frequently mentioned in the media.'
    ],
    corrections: [
      'Use objective probabilities and historical data rather than examples that come to mind.',
      'Create a systematic framework for evaluating investments.',
      'Be aware of how media coverage influences your perception of risk and opportunity.'
    ],
    emoji: '🧠'
  },
  disposition_effect: {
    id: 'disposition_effect',
    name: 'Disposition Effect',
    description: 'The tendency to sell assets that have increased in value while keeping assets that have dropped in value.',
    impact: 'Can lead to portfolios full of losers and missed opportunities for continued growth.',
    examples: [
      'Selling winning stocks to "lock in profits" while holding losing positions.',
      'Taking small gains quickly but allowing losses to grow.',
      'Creating arbitrary mental accounts that track gains and losses separately.'
    ],
    corrections: [
      'Implement a rule-based approach to selling, such as trailing stops.',
      'Evaluate each position based on future prospects, not past performance.',
      'Consider tax implications of selling winners vs. losers.'
    ],
    emoji: '⚖️'
  }
};

/**
 * Analyzes user trades to detect behavioral biases
 */
export async function analyzeTradingBehavior(userId: number): Promise<BiasDetectionResult> {
  // Collect user data needed for analysis
  const user = await storage.getUserWithBiasFlags(userId);
  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  // Get user's trading data
  const userTrades = await storage.getUserTrades(userId);
  const portfolios = await storage.getPortfoliosByUserId(userId);

  // Get holdings for each portfolio
  const portfolioHoldings: PortfolioHolding[] = [];
  for (const portfolio of portfolios) {
    const holdings = await storage.getHoldingsByPortfolioId(portfolio.id);
    portfolioHoldings.push(...holdings);
  }

  // Get user preferences
  const preferences = await storage.getUserPreferences(userId);

  // Analyze for specific biases
  const biasAnalysis = await detectBiases(userTrades, portfolioHoldings, preferences);

  // Calculate overall bias score (0-100, lower is better)
  const overallScore = calculateOverallBiasScore(biasAnalysis);

  // Generate improvement suggestions
  const improvementSuggestions = generateImprovementSuggestions(biasAnalysis);

  // Create premium features if user has premium access
  const isPremium = user.hasPremium || false;
  let comparisonAnalysis = undefined;

  if (isPremium) {
    comparisonAnalysis = await generateBiasFreePortfolioComparison(portfolioHoldings);
  }

  // Save the results to database
  const result: BiasDetectionResult = {
    userId,
    detectedBiases: biasAnalysis,
    overallScore,
    improvementSuggestions,
    comparisonAnalysis,
    premium: isPremium
  };

  // Update user's bias score and flags in the database
  await storage.updateUserBiasScore(
    userId, 
    overallScore, 
    biasAnalysis.map(bias => bias.biasType)
  );

  return result;
}

/**
 * Detect specific biases based on user trading data
 */
async function detectBiases(
  trades: UserTrade[],
  holdings: PortfolioHolding[],
  preferences: any
): Promise<BiasDetectionResult['detectedBiases']> {
  // Initial checks for common bias patterns
  const detectedBiases: BiasDetectionResult['detectedBiases'] = [];

  // If we have no trades, return empty result
  if (trades.length === 0) {
    return [];
  }

  // Process trade data to look for patterns

  // Check for loss aversion
  if (hasLossAversionPatterns(trades)) {
    detectedBiases.push({
      biasType: 'loss_aversion',
      score: calculateBiasScore(trades, 'loss_aversion'),
      impact: determineBiasImpact(trades, 'loss_aversion'),
      evidence: findLossAversionEvidence(trades),
      suggestion: biasDefinitions.loss_aversion.corrections[0],
      description: biasDefinitions.loss_aversion.description
    });
  }

  // Check for recency bias
  if (hasRecencyBiasPatterns(trades)) {
    detectedBiases.push({
      biasType: 'recency_bias',
      score: calculateBiasScore(trades, 'recency_bias'),
      impact: determineBiasImpact(trades, 'recency_bias'),
      evidence: findRecencyBiasEvidence(trades),
      suggestion: biasDefinitions.recency_bias.corrections[0],
      description: biasDefinitions.recency_bias.description
    });
  }

  // Use AI to detect more complex patterns
  const aiDetectedBiases = await useAIForBiasDetection(trades, holdings);

  // Combine rule-based and AI-detected biases
  return [...detectedBiases, ...aiDetectedBiases];
}

/**
 * Check for loss aversion patterns in trading history
 */
function hasLossAversionPatterns(trades: UserTrade[]): boolean {
  // For demonstration, we'll implement a simplified check
  // In production, this would be much more sophisticated

  if (trades.length < 5) return false;

  // Count how many losing positions were held longer than winning positions
  let winningHoldTimes: number[] = [];
  let losingHoldTimes: number[] = [];

  // Group trades by symbol to find related buy/sell pairs
  const tradesBySymbol = trades.reduce((acc, trade) => {
    if (!acc[trade.symbol]) {
      acc[trade.symbol] = [];
    }
    acc[trade.symbol].push(trade);
    return acc;
  }, {} as Record<string, UserTrade[]>);

  // Calculate hold times for winning vs losing trades
  Object.values(tradesBySymbol).forEach(symbolTrades => {
    // For simplicity, assuming buy then sell patterns
    // Real implementation would match buy and sell pairs properly

    const buyTrades = symbolTrades.filter(t => t.action === 'buy');
    const sellTrades = symbolTrades.filter(t => t.action === 'sell');

    // Skip if we don't have both buy and sell trades
    if (buyTrades.length === 0 || sellTrades.length === 0) return;

    // Super simplified for demonstration
    const buyDate = new Date(buyTrades[0].tradeDate);
    const sellDate = new Date(sellTrades[0].tradeDate);
    const holdTime = sellDate.getTime() - buyDate.getTime();
    const buyPrice = buyTrades[0].price;
    const sellPrice = sellTrades[0].price;

    if (sellPrice > buyPrice) {
      winningHoldTimes.push(holdTime);
    } else {
      losingHoldTimes.push(holdTime);
    }
  });

  if (winningHoldTimes.length === 0 || losingHoldTimes.length === 0) return false;

  // Calculate average hold times
  const avgWinningHoldTime = winningHoldTimes.reduce((sum, time) => sum + time, 0) / winningHoldTimes.length;
  const avgLosingHoldTime = losingHoldTimes.reduce((sum, time) => sum + time, 0) / losingHoldTimes.length;

  // If losing positions are held significantly longer than winning positions
  return avgLosingHoldTime > (avgWinningHoldTime * 1.5);
}

/**
 * Check for recency bias patterns in trading history
 */
function hasRecencyBiasPatterns(trades: UserTrade[]): boolean {
  if (trades.length < 5) return false;

  // Sort trades by date
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime()
  );

  // Get recent market trends from trade context (simplified)
  const recentTrades = sortedTrades.slice(-5);
  const olderTrades = sortedTrades.slice(0, -5);

  if (olderTrades.length === 0) return false;

  // Check if user is following trends that just recently emerged
  // This is simplified; a real implementation would be much more thorough
  const recentBuySymbols = new Set(recentTrades
    .filter(t => t.action === 'buy')
    .map(t => t.symbol));

  const olderBuySymbols = new Set(olderTrades
    .filter(t => t.action === 'buy')
    .map(t => t.symbol));

  // If user is buying completely different symbols in recent trades
  const commonSymbols = [...recentBuySymbols].filter(s => olderBuySymbols.has(s));

  // If less than 20% overlap, might indicate chasing new trends
  return commonSymbols.length < (recentBuySymbols.size * 0.2);
}

/**
 * Calculate a score for how strongly a bias is present
 */
function calculateBiasScore(trades: UserTrade[], biasType: BiasType): number {
  // Default moderate score
  let score = 50;

  switch (biasType) {
    case 'loss_aversion':
      // In production, this would have sophisticated scoring logic
      score = calculateLossAversionScore(trades);
      break;
    case 'recency_bias':
      score = calculateRecencyBiasScore(trades);
      break;
    // Add cases for other bias types
    default:
      score = 50; // Default moderate score
  }

  // Return score between 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate loss aversion score based on trade patterns
 */
function calculateLossAversionScore(trades: UserTrade[]): number {
  // Simplified scoring for demonstration
  // Group trades by symbol
  const tradesBySymbol = trades.reduce((acc, trade) => {
    if (!acc[trade.symbol]) {
      acc[trade.symbol] = [];
    }
    acc[trade.symbol].push(trade);
    return acc;
  }, {} as Record<string, UserTrade[]>);

  let totalScore = 0;
  let symbolsAnalyzed = 0;

  Object.values(tradesBySymbol).forEach(symbolTrades => {
    if (symbolTrades.length < 2) return;

    const buyTrades = symbolTrades.filter(t => t.action === 'buy');
    const sellTrades = symbolTrades.filter(t => t.action === 'sell');

    if (buyTrades.length === 0 || sellTrades.length === 0) return;

    // Calculate buy and sell prices (simplified)
    const avgBuyPrice = buyTrades.reduce((sum, t) => sum + t.price, 0) / buyTrades.length;
    const avgSellPrice = sellTrades.reduce((sum, t) => sum + t.price, 0) / sellTrades.length;

    // Calculate avg hold times
    const avgBuyDate = new Date(buyTrades.reduce((sum, t) => sum + new Date(t.tradeDate).getTime(), 0) / buyTrades.length);
    const avgSellDate = new Date(sellTrades.reduce((sum, t) => sum + new Date(t.tradeDate).getTime(), 0) / sellTrades.length);
    const holdTime = avgSellDate.getTime() - avgBuyDate.getTime();

    // Higher score (worse) if losing trades held longer
    let symbolScore = 50;

    if (avgSellPrice < avgBuyPrice) {
      // Losing trade - higher score if held longer
      symbolScore += Math.min(50, holdTime / (7 * 24 * 60 * 60 * 1000) * 10); // Add points for each week held
    } else {
      // Winning trade - lower score is better
      symbolScore -= Math.min(30, holdTime / (30 * 24 * 60 * 60 * 1000) * 20); // Subtract points for holding winners
    }

    totalScore += symbolScore;
    symbolsAnalyzed++;
  });

  return symbolsAnalyzed > 0 ? Math.round(totalScore / symbolsAnalyzed) : 50;
}

/**
 * Calculate recency bias score based on trade patterns
 */
function calculateRecencyBiasScore(trades: UserTrade[]): number {
  // Simplified scoring
  if (trades.length < 5) return 50;

  // Sort trades by date
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime()
  );

  // Split into time periods
  const recentQuarter = sortedTrades.slice(Math.floor(sortedTrades.length * 0.75));
  const olderTrades = sortedTrades.slice(0, Math.floor(sortedTrades.length * 0.75));

  if (recentQuarter.length === 0 || olderTrades.length === 0) return 50;

  // Calculate trading patterns
  const recentTradeFrequency = recentQuarter.length / 
    ((new Date(recentQuarter[recentQuarter.length - 1].tradeDate).getTime() - 
      new Date(recentQuarter[0].tradeDate).getTime()) / (24 * 60 * 60 * 1000));

  const olderTradeFrequency = olderTrades.length / 
    ((new Date(olderTrades[olderTrades.length - 1].tradeDate).getTime() - 
      new Date(olderTrades[0].tradeDate).getTime()) / (24 * 60 * 60 * 1000));

  // Score based on change in trading frequency
  let score = 50;

  if (recentTradeFrequency > olderTradeFrequency * 2) {
    // Significantly increased trading frequency recently
    score += 30;
  } else if (recentTradeFrequency > olderTradeFrequency * 1.5) {
    // Moderately increased trading frequency
    score += 20;
  } else if (recentTradeFrequency > olderTradeFrequency * 1.2) {
    // Slightly increased trading frequency
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Determine the impact level of a bias
 */
function determineBiasImpact(trades: UserTrade[], biasType: BiasType): 'low' | 'medium' | 'high' {
  const score = calculateBiasScore(trades, biasType);

  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

/**
 * Find evidence of loss aversion in trading patterns
 */
function findLossAversionEvidence(trades: UserTrade[]): any[] {
  const evidence = [];

  // Group trades by symbol
  const tradesBySymbol = trades.reduce((acc, trade) => {
    if (!acc[trade.symbol]) {
      acc[trade.symbol] = [];
    }
    acc[trade.symbol].push(trade);
    return acc;
  }, {} as Record<string, UserTrade[]>);

  // Find examples of holding losing positions too long
  Object.entries(tradesBySymbol).forEach(([symbol, symbolTrades]) => {
    if (symbolTrades.length < 2) return;

    const buyTrades = symbolTrades.filter(t => t.action === 'buy')
      .sort((a, b) => new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime());

    const sellTrades = symbolTrades.filter(t => t.action === 'sell')
      .sort((a, b) => new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime());

    if (buyTrades.length === 0 || sellTrades.length === 0) return;

    // Simple matching of buy-sell pairs (in production this would be more sophisticated)
    const earliestBuy = buyTrades[0];
    const latestSell = sellTrades[sellTrades.length - 1];

    const buyDate = new Date(earliestBuy.tradeDate);
    const sellDate = new Date(latestSell.tradeDate);
    const holdPeriodDays = Math.round((sellDate.getTime() - buyDate.getTime()) / (24 * 60 * 60 * 1000));

    if (latestSell.price < earliestBuy.price && holdPeriodDays > 60) {
      // Found evidence of holding a losing position for over 60 days
      evidence.push({
        type: 'long_hold_loss',
        symbol,
        buyDate: earliestBuy.tradeDate,
        sellDate: latestSell.tradeDate,
        buyPrice: earliestBuy.price,
        sellPrice: latestSell.price,
        holdPeriodDays,
        percentLoss: ((earliestBuy.price - latestSell.price) / earliestBuy.price * 100).toFixed(2)
      });
    }
  });

  return evidence;
}

/**
 * Find evidence of recency bias in trading patterns
 */
function findRecencyBiasEvidence(trades: UserTrade[]): any[] {
  const evidence = [];

  // Sort trades by date
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime()
  );

  if (sortedTrades.length < 5) return evidence;

  // Get recent market trends from trade context (simplified)
  const recentTrades = sortedTrades.slice(-Math.min(10, Math.floor(sortedTrades.length / 3)));

  // Get unique symbols from recent trades
  const recentSymbols = [...new Set(recentTrades.map(t => t.symbol))];

  // Check for clustering of similar trades in short timeframes
  recentSymbols.forEach(symbol => {
    const symbolTrades = recentTrades.filter(t => t.symbol === symbol && t.action === 'buy');

    if (symbolTrades.length < 2) return;

    // Sort by date
    symbolTrades.sort((a, b) => 
      new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime()
    );

    // Check for rapid increases in position size
    const firstTrade = symbolTrades[0];
    const lastTrade = symbolTrades[symbolTrades.length - 1];

    const daysBetween = Math.round(
      (new Date(lastTrade.tradeDate).getTime() - new Date(firstTrade.tradeDate).getTime()) 
      / (24 * 60 * 60 * 1000)
    );

    if (daysBetween < 14 && symbolTrades.length >= 3) {
      // Multiple trades of the same symbol in a short period
      evidence.push({
        type: 'clustered_buys',
        symbol,
        trades: symbolTrades.length,
        timeframeDays: daysBetween,
        startDate: firstTrade.tradeDate,
        endDate: lastTrade.tradeDate
      });
    }
  });

  return evidence;
}

/**
 * Use OpenAI to detect complex bias patterns
 */
async function useAIForBiasDetection(
  trades: UserTrade[], 
  holdings: PortfolioHolding[]
): Promise<BiasDetectionResult['detectedBiases']> {
  if (trades.length === 0) return [];

  try {
    // Prepare data for analysis
    const tradeData = trades.map(t => ({
      symbol: t.symbol,
      action: t.action,
      shares: t.shares,
      price: t.price,
      date: new Date(t.tradeDate).toISOString().split('T')[0],
      emotionalState: t.emotionalState
    }));

    const holdingData = holdings.map(h => ({
      symbol: h.symbol,
      shares: h.shares,
      avgCost: h.averageCost,
      currentValue: h.currentValue,
      purchaseDate: h.purchaseDate ? new Date(h.purchaseDate).toISOString().split('T')[0] : 'unknown'
    }));

    // Bias detection prompt
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a behavioral finance expert analyzing trading patterns for cognitive biases.
Analyze the provided trading history and current holdings to identify potential behavioral biases.
Focus on these specific biases: overconfidence, herd mentality, anchoring bias, self-attribution bias, and sunk cost fallacy.
For each bias you detect, provide:
1. Bias name (use the exact name from the above list)
2. Confidence score (0-100)
3. Impact level (low/medium/high)
4. Evidence (specific examples from the data)
5. A specific actionable suggestion to counter this bias
6. A brief description of the bias
Respond in JSON format with an array of detected biases.`
        },
        {
          role: "user",
          content: `Here is the trading history:\n${JSON.stringify(tradeData, null, 2)}\n\nCurrent holdings:\n${JSON.stringify(holdingData, null, 2)}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    if (!result.detectedBiases || !Array.isArray(result.detectedBiases)) {
      return [];
    }

    // Map AI results to our interface
    return result.detectedBiases.map((bias: any) => ({
      biasType: bias.biasType as BiasType,
      score: bias.score,
      impact: bias.impact as 'low' | 'medium' | 'high',
      evidence: bias.evidence,
      suggestion: bias.suggestion,
      description: bias.description
    }));
  } catch (error) {
    console.error("Error using AI for bias detection:", error);
    return [];
  }
}

/**
 * Calculate overall bias score from individual bias scores
 */
function calculateOverallBiasScore(biases: BiasDetectionResult['detectedBiases']): number {
  if (biases.length === 0) return 0;

  // Weight biases by impact
  const impactWeights = {
    'high': 1.5,
    'medium': 1.0,
    'low': 0.5
  };

  let weightedSum = 0;
  let totalWeight = 0;

  biases.forEach(bias => {
    const weight = impactWeights[bias.impact];
    weightedSum += bias.score * weight;
    totalWeight += weight;
  });

  return Math.round(weightedSum / totalWeight);
}

/**
 * Generate improvement suggestions based on detected biases
 */
function generateImprovementSuggestions(biases: BiasDetectionResult['detectedBiases']): string[] {
  if (biases.length === 0) {
    return ["No significant biases detected. Continue monitoring your trading patterns."];
  }

  // Sort biases by impact and score
  const sortedBiases = [...biases].sort((a, b) => {
    const impactOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];

    if (impactDiff !== 0) return impactDiff;
    return b.score - a.score;
  });

  // Generate suggestions for top 3 biases
  const suggestions = sortedBiases.slice(0, 3).map(bias => {
    const definition = biasDefinitions[bias.biasType];
    const randomCorrectionIndex = Math.floor(Math.random() * definition.corrections.length);

    return `${definition.emoji} ${definition.name}: ${definition.corrections[randomCorrectionIndex]}`;
  });

  // Add a general suggestion
  if (sortedBiases.length > 0) {
    const highBiasCount = sortedBiases.filter(b => b.impact === 'high').length;

    if (highBiasCount >= 2) {
      suggestions.push("⚠️ Consider using automated trading rules to reduce emotional decision-making.");
    } else {
      suggestions.push("📊 Schedule a monthly portfolio review with a focus on objective performance metrics.");
    }
  }

  return suggestions;
}

/**
 * Generate bias-free portfolio comparison (premium feature)
 */
async function generateBiasFreePortfolioComparison(
  holdings: PortfolioHolding[]
): Promise<BiasDetectionResult['comparisonAnalysis']> {
  if (holdings.length === 0) {
    return {
      actualPortfolio: { value: 0, allocation: {} },
      biasFreePortfolio: { value: 0, allocation: {} },
      differenceMetrics: { 
        expectedReturnDifference: 0,
        riskDifference: 0,
        diversificationScore: 0
      }
    };
  }

  // Group holdings by symbol
  const symbolHoldings = holdings.reduce((acc, holding) => {
    if (!acc[holding.symbol]) {
      acc[holding.symbol] = {
        shares: 0,
        value: 0
      };
    }
    acc[holding.symbol].shares += holding.shares;
    acc[holding.symbol].value += holding.currentValue || 0;
    return acc;
  }, {} as Record<string, { shares: number, value: number }>);

  // Calculate total portfolio value
  const totalValue = Object.values(symbolHoldings).reduce((sum, holding) => sum + holding.value, 0);

  // Calculate actual portfolio allocation
  const actualAllocation = Object.entries(symbolHoldings).reduce((acc, [symbol, data]) => {
    acc[symbol] = (data.value / totalValue) * 100;
    return acc;
  }, {} as Record<string, number>);

  // Create a hypothetical bias-free portfolio
  // This would normally involve sophisticated optimization
  // For demo purposes, we'll create a more balanced allocation

  const symbols = Object.keys(symbolHoldings);
  const biasFreeAllocation = {} as Record<string, number>;

  // Very simple allocation strategy (would be much more sophisticated in production)
  if (symbols.length <=.5) {
    // Equal weight for small portfolios
    const equalWeight = 100 / symbols.length;
    symbols.forEach(symbol => {
      biasFreeAllocation[symbol] = equalWeight;
    });
  } else {
    // More sophisticated allocation for larger portfolios
    // In production this would use optimization algorithms

    // For demo, just use a simple tiered approach
    // Top 3 symbols get 20% each, rest equally split 40%
    const topSymbols = symbols.slice(0, 3);
    const otherSymbols = symbols.slice(3);

    topSymbols.forEach(symbol => {
      biasFreeAllocation[symbol] = 20;
    });

    if (otherSymbols.length > 0) {
      const remainingWeight = 40 / otherSymbols.length;
      otherSymbols.forEach(symbol => {
        biasFreeAllocation[symbol] = remainingWeight;
      });
    }
  }

  // Calculate metrics for comparison
  const expectedReturnDifference = 1.5; // Percentage points, would be calculated based on historical data
  const riskDifference = -2.3; // Lower risk in bias-free portfolio, would be calculated

  // Calculate a diversification score (higher is better)
  const actualDiversification = calculateDiversificationScore(actualAllocation);
  const biasFreeeDiversification = calculateDiversificationScore(biasFreeAllocation);
  const diversificationImprovement = biasFreeeDiversification - actualDiversification;

  return {
    actualPortfolio: {
      value: totalValue,
      allocation: actualAllocation
    },
    biasFreePortfolio: {
      value: totalValue, // Same value, different allocation
      allocation: biasFreeAllocation
    },
    differenceMetrics: {
      expectedReturnDifference,
      riskDifference,
      diversificationScore: diversificationImprovement
    }
  };
}

/**
 * Calculate diversification score based on allocation
 */
function calculateDiversificationScore(allocation: Record<string, number>): number {
  // Simple Herfindahl-Hirschman Index (HHI) for concentration
  // Lower HHI means better diversification
  const hhi = Object.values(allocation).reduce((sum, weight) => {
    return sum + Math.pow(weight / 100, 2);
  }, 0);

  // Convert to a 0-100 score where higher is better diversification
  return Math.round((1 - hhi) * 100);
}

/**
 * Get educational content about a specific bias
 */
export function getBiasEducationalContent(biasType: BiasType): BiasEducationalContent {
  const definition = biasDefinitions[biasType];

  if (!definition) {
    throw new Error(`Bias type "${biasType}" not found`);
  }

  return {
    biasType,
    title: definition.name,
    description: definition.description,
    examples: definition.examples,
    avoidanceStrategies: definition.corrections,
    resources: [
      {
        title: "Understanding Behavioral Finance",
        url: "https://www.investopedia.com/terms/b/behavioralfinance.asp"
      },
      {
        title: `How to Overcome ${definition.name}`,
        url: "https://www.morningstar.com/articles/937254/4-behavioral-traps-investors-should-avoid"
      }
    ]
  };

/**
 * Get a user's bias profile with historical data
 */
export async function getUserBiasProfile(userId: number): Promise<UserBiasProfile> {
  // Get user's latest bias analysis
  const latestReport = await storage.getLatestBiasReport(userId);

  if (!latestReport) {
    throw new Error(`No bias analysis found for user ${userId}`);
  }

  // Get user's historical bias reports to track trends
  const historicalReports = await storage.getUserBiasReports(userId);

  // Get current user to check overall bias score
  const user = await storage.getUserWithBiasFlags(userId);

  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  // Get primary biases from the latest report
  const primaryBiases = JSON.parse(latestReport.primaryBiases as string || "[]");

  // Calculate trends for each bias by comparing with historical data
  const biasesWithTrends = primaryBiases.map((bias: any) => {
    const trend = calculateBiasTrend(bias.biasType, historicalReports);
    return {
      ...bias,
      trend
    };
  });

  // Create historical scores data points
  const historicalScores = historicalReports.map(report => ({
    date: new Date(report.createdAt).toISOString().split('T')[0],
    score: report.overallScore
  }));

  // Get recommendations from the latest report
  const recommendations = JSON.parse(latestReport.improvementSuggestions as string || "[]");

  return {
    userId,
    overallScore: user.biasScore || 0,
    primaryBiases: biasesWithTrends,
    historicalScores,
    recommendations,
    lastUpdated: new Date(latestReport.createdAt).toISOString()
  };
}

/**
 * Calculate the trend for a specific bias by analyzing historical reports
 */
function calculateBiasTrend(
  biasType: BiasType, 
  reports: BiasAnalysisReport[]
): 'improving' | 'worsening' | 'stable' {
  if (reports.length < 2) return 'stable';

  // Sort reports by date (newest first)
  const sortedReports = [...reports].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Compare the most recent report with the one before it
  const latest = sortedReports[0];
  const previous = sortedReports[1];

  // Extract bias scores from each report
  const latestBiases = JSON.parse(latest.primaryBiases as string || "[]");
  const previousBiases = JSON.parse(previous.primaryBiases as string || "[]");

  // Find the specific bias in each report
  const latestBias = latestBiases.find((b: any) => b.biasType === biasType);
  const previousBias = previousBiases.find((b: any) => b.biasType === biasType);

  if (!latestBias || !previousBias) return 'stable';

  // Calculate difference in scores
  const scoreDifference = latestBias.score - previousBias.score;

  if (scoreDifference <= -5) return 'improving'; // At least 5 points better
  if (scoreDifference >= 5) return 'worsening';  // At least 5 points worse
  return 'stable';
}

/**
 * Process natural language queries about user's biases and portfolio
 */
export async function processNaturalLanguageQuery(
  userId: number, 
  query: string
): Promise<NaturalLanguageQueryResponse> {
  // Get user data
  const user = await storage.getUserWithBiasFlags(userId);
  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  // Get user's biases
  const biases = await storage.getUserBiases(userId);

  // Get user's portfolio data
  const portfolios = await storage.getPortfoliosByUserId(userId);
  const portfolioHoldings: PortfolioHolding[] = [];
  for (const portfolio of portfolios) {
    const holdings = await storage.getHoldingsByPortfolioId(portfolio.id);
    portfolioHoldings.push(...holdings);
  }

  // Get user's trading history
  const trades = await storage.getUserTrades(userId);

  try {
    // Process query with OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a behavioral finance expert assistant. Answer the user's question about their trading behavior and cognitive biases based on the provided data.
Keep your answers concise, practical, and focused on identifying and correcting behavioral biases.
Reference specific data points when possible. When identifying biases, always use the proper terms.
Always end your answer with 1-3 specific, actionable suggestions.`
        },
        {
          role: "user",
          content: `Here is my user data:
- Bias score: ${user.biasScore || 'Not calculated yet'}
- Biases detected: ${formatBiasListForLLM(biases)}
- Portfolio symbols: ${formatPortfolioForLLM(portfolioHoldings)}
- Recent trades: ${formatTradesForLLM(trades)}

My question is: ${query}`
        }
      ]
    });

    // Extract biases mentioned in the response
    const answer = response.choices[0].message.content || "";
    const mentionedBiases = extractBiasesFromText(answer);

    // Extract suggestions from the answer
    const suggestedActions = extractSuggestionsFromText(answer);

    return {
      answer,
      relatedBiases: mentionedBiases,
      suggestedActions,
      premium: user.hasPremium || false
    };
  } catch (error) {
    console.error("Error processing natural language query:", error);
    return {
      answer: "I'm sorry, I couldn't process your query at this time. Please try again later.",
      relatedBiases: [],
      suggestedActions: [],
      premium: false
    };
  }
}

/**
 * Format a list of biases for LLM prompt
 */
function formatBiasListForLLM(biases: BehavioralBias[]): string {
  if (biases.length === 0) return "None detected yet";

  return biases.map(bias => 
    `${biasDefinitions[bias.biasType as BiasType]?.name || bias.biasType} (score: ${bias.score}, impact: ${bias.impact})`
  ).join(', ');
}

/**
 * Format portfolio holdings for LLM prompt
 */
function formatPortfolioForLLM(holdings: PortfolioHolding[]): string {
  if (holdings.length === 0) return "No holdings";

  // Group holdings by symbol
  const symbolHoldings = holdings.reduce((acc, holding) => {
    if (!acc[holding.symbol]) {
      acc[holding.symbol] = {
        shares: 0,
        value: 0
      };
    }
    acc[holding.symbol].shares += holding.shares;
    acc[holding.symbol].value += holding.currentValue || 0;
    return acc;
  }, {} as Record<string, { shares: number, value: number }>);

  return Object.entries(symbolHoldings)
    .map(([symbol, data]) => `${symbol} (${data.shares} shares, $${data.value.toFixed(2)})`)
    .join(', ');
}

/**
 * Format trades for LLM prompt
 */
function formatTradesForLLM(trades: UserTrade[]): string {
  if (trades.length === 0) return "No trades";

  // Sort by date (most recent first)
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime()
  );

  // Take just the 5 most recent trades
  const recentTrades = sortedTrades.slice(0, 5);

  return recentTrades.map(trade => 
    `${trade.action.toUpperCase()} ${trade.shares} ${trade.symbol} @ $${trade.price} on ${new Date(trade.tradeDate).toISOString().split('T')[0]}`
  ).join(', ');
}

/**
 * Extract bias types from text
 */
function extractBiasesFromText(text: string): BiasType[] {
  const biasTypes = Object.keys(biasDefinitions) as BiasType[];
  const mentionedBiases: BiasType[] = [];

  biasTypes.forEach(biasType => {
    const biasName = biasDefinitions[biasType].name.toLowerCase();
    const searchText = text.toLowerCase();

    // Check for bias type ID or name
    if (searchText.includes(biasType) || searchText.includes(biasName)) {
      mentionedBiases.push(biasType);
    }
  });

  return mentionedBiases;
}

/**
 * Extract suggested actions from text
 */
function extractSuggestionsFromText(text: string): string[] {
  // Look for sentences that appear to be suggestions
  // Simplified regex approach - in production would use more sophisticated NLP
  const suggestionPatterns = [
    /consider\s+([^.!?]+[.!?])/gi,
    /try\s+([^.!?]+[.!?])/gi,
    /should\s+([^.!?]+[.!?])/gi,
    /recommend\s+([^.!?]+[.!?])/gi,
    /suggestion(?:s)?:?\s+([^.!?]+[.!?])/gi
  ];

  let suggestions: string[] = [];

  suggestionPatterns.forEach(pattern => {
    const matches = [...text.matchAll(pattern)];
    matches.forEach(match => {
      if (match[1] && match[1].length > 10) { // Ensure it's a substantial suggestion
        suggestions.push(match[1].trim());
      }
    });
  });

  // If no suggestions found, check last few sentences
  if (suggestions.length === 0) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    if (sentences.length > 0) {
      // Get last 2 sentences as they often contain suggestions
      const lastSentences = sentences.slice(-Math.min(2, sentences.length));
      suggestions = lastSentences.map(s => s.trim());
    }
  }

  // Remove duplicates and limit to 3
  return [...new Set(suggestions)].slice(0, 3);
}