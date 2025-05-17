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
  BiasEducationalContent,
  NaturalLanguageQueryResponse
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
      'Discounting analyst recommendations that contradict your views.',
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
      'Trading too frequently based on short-term predictions.',
      'Failing to diversify because of high conviction in a few assets.',
      'Using excessive leverage believing you can time the market.'
    ],
    corrections: [
      'Track your prediction accuracy over time.',
      'Use systematic, rules-based investment approaches.',
      'Implement position sizing limits as a guardrail.'
    ],
    emoji: '🦚'
  },
  recency_bias: {
    id: 'recency_bias',
    name: 'Recency Bias',
    description: 'Giving disproportionate importance to recent events when making decisions.',
    impact: 'Can lead to chasing recent hot performers or overreacting to short-term market movements.',
    examples: [
      'Investing heavily in sectors that performed well in the previous quarter.',
      'Panic selling after a market dip.',
      'Changing strategies based on recent market conditions rather than long-term fundamentals.'
    ],
    corrections: [
      'Focus on longer timeframes when analyzing performance.',
      'Follow a written investment plan established during calm markets.',
      'Use dollar-cost averaging to reduce timing decisions.'
    ],
    emoji: '📅'
  },
  herd_mentality: {
    id: 'herd_mentality',
    name: 'Herd Mentality',
    description: 'Following the crowd in investment decisions rather than doing independent analysis.',
    impact: 'Can lead to buying at market peaks and selling at bottoms.',
    examples: [
      'Investing in meme stocks without understanding the underlying business.',
      'Following social media investment advice without verification.',
      'Panic selling when markets are broadly declining.'
    ],
    corrections: [
      'Develop your own investment criteria and stick to them.',
      'Avoid checking social sentiment until after doing your own analysis.',
      'Create contrary trading rules that buy when fear is high and sell when euphoria reigns.'
    ],
    emoji: '🐑'
  },
  anchoring_bias: {
    id: 'anchoring_bias',
    name: 'Anchoring Bias',
    description: 'Over-relying on the first piece of information encountered when making decisions.',
    impact: 'Can lead to holding onto price targets that are no longer relevant.',
    examples: [
      'Refusing to sell a stock until it returns to your purchase price.',
      'Setting price targets based on past highs rather than current fundamentals.',
      'Evaluating investments primarily based on their 52-week range.'
    ],
    corrections: [
      'Regularly reassess investments as if you were buying them for the first time.',
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
      'Underestimating the role of luck in past investment successes.'
    ],
    corrections: [
      'Keep an investment journal to record decisions and rationales in real-time.',
      'Review past decisions based on the information available at that time.',
      'Acknowledge the role of randomness and luck in market outcomes.'
    ],
    emoji: '🔮'
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
      'Define an investment strategy and stick to it regardless of what others are doing.',
      'Set strict criteria for adding new asset classes to your portfolio.',
      'Focus on absolute returns rather than relative performance.'
    ],
    emoji: '😰'
  },
  status_quo_bias: {
    id: 'status_quo_bias',
    name: 'Status Quo Bias',
    description: 'Preferring the current state of affairs and avoiding changes even when better alternatives exist.',
    impact: 'Can lead to failure to rebalance or update portfolios as conditions change.',
    examples: [
      'Maintaining the same portfolio allocation despite significant changes in economic conditions.',
      'Holding legacy investments that no longer match your strategy.',
      'Ignoring new investment opportunities because they feel unfamiliar.'
    ],
    corrections: [
      'Schedule regular portfolio reviews with a specific focus on questioning existing holdings.',
      'Use automatic rebalancing to force adjustment to changing markets.',
      'Define triggers that will force a reassessment of your portfolio strategy.'
    ],
    emoji: '🧊'
  }
};

/**
 * Analyze a user's trading behavior for cognitive biases
 */
export async function analyzeTradingBehavior(userId: number): Promise<BiasDetectionResult> {
  // Get user's trade history
  const trades = await storage.getUserTrades(userId);
  
  if (!trades || trades.length === 0) {
    throw new Error('No trade history found for analysis');
  }
  
  // Get user's portfolio 
  const portfolios = await storage.getPortfoliosByUserId(userId);
  
  if (!portfolios || portfolios.length === 0) {
    throw new Error('No portfolios found for analysis');
  }
  
  // For simplicity, analyze the first portfolio
  const mainPortfolio = portfolios[0];
  const holdings = await storage.getHoldingsByPortfolioId(mainPortfolio.id);
  
  // Perform bias detection
  const biasResult = await detectBiases(userId, trades, holdings);
  
  // Update user's bias score in the database
  await storage.updateUserBiasScore(
    userId, 
    biasResult.overallScore,
    biasResult.detectedBiases.map(b => ({ biasType: b.biasType, score: b.score }))
  );
  
  return biasResult;
}

/**
 * Get educational content about a specific bias
 */
export function getBiasEducationalContent(biasType: BiasType): BiasEducationalContent {
  const definition = biasDefinitions[biasType];
  
  if (!definition) {
    throw new Error(`Unknown bias type: ${biasType}`);
  }
  
  return {
    biasType,
    title: definition.name,
    description: definition.description,
    examples: definition.examples,
    avoidanceStrategies: definition.corrections,
    resources: [
      {
        title: "Behavioral Finance Overview",
        url: "https://www.investopedia.com/terms/b/behavioralfinance.asp"
      },
      {
        title: `Understanding ${definition.name}`,
        url: "https://www.morningstar.com/articles/1062598/3-behavioral-biases-that-harm-your-investments"
      },
      {
        title: `How to Overcome ${definition.name}`,
        url: "https://www.morningstar.com/articles/937254/4-behavioral-traps-investors-should-avoid"
      }
    ]
  };
}

/**
 * Get a user's bias profile with historical data
 */
export async function getUserBiasProfile(userId: number): Promise<UserBiasProfile> {
  // Get user's latest bias analysis
  const latestReport = await storage.getLatestBiasReport(userId);
  
  if (!latestReport) {
    throw new Error('No bias analysis reports found for this user');
  }
  
  // Get historical reports
  const reports = await storage.getUserBiasReports(userId, 10);
  
  // Get all biases detected for this user
  const biases = await storage.getUserBiases(userId);
  
  // Calculate trends
  const primaryBiases = latestReport.primaryBiases.map(bias => {
    // Find historical data for this bias
    const biasHistory = biases.filter(b => b.biasType === bias.biasType)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Determine trend
    let trend: 'improving' | 'worsening' | 'stable' = 'stable';
    
    if (biasHistory.length > 1) {
      const latest = biasHistory[0].score;
      const previous = biasHistory[1].score;
      
      if (latest < previous - 5) {
        trend = 'improving';
      } else if (latest > previous + 5) {
        trend = 'worsening';
      }
    }
    
    return {
      biasType: bias.biasType as BiasType,
      score: bias.score,
      trend
    };
  });
  
  // Historical score data
  const historicalScores = reports.map(report => ({
    date: new Date(report.createdAt).toISOString().split('T')[0],
    score: report.overallScore
  }));
  
  return {
    userId,
    overallScore: latestReport.overallScore,
    primaryBiases,
    historicalScores,
    recommendations: latestReport.improvementSuggestions,
    lastUpdated: new Date(latestReport.createdAt).toISOString()
  };
}

/**
 * Detect biases from user trading history
 */
async function detectBiases(
  userId: number,
  trades: UserTrade[],
  holdings: PortfolioHolding[]
): Promise<BiasDetectionResult> {
  // In a real implementation, this would use sophisticated algorithms
  // and machine learning models to detect patterns indicative of biases.
  // For this example, we'll use a simplified approach.
  
  const detectedBiases = [];
  
  // Check for loss aversion
  const lossAversionScore = detectLossAversion(trades);
  if (lossAversionScore > 30) {
    detectedBiases.push({
      biasType: 'loss_aversion',
      score: lossAversionScore,
      impact: lossAversionScore > 70 ? 'high' : lossAversionScore > 40 ? 'medium' : 'low',
      evidence: getLossAversionEvidence(trades),
      suggestion: 'Consider setting automated stop-loss orders to remove emotion from selling decisions',
      description: biasDefinitions.loss_aversion.description
    });
  }
  
  // Check for overconfidence
  const overconfidenceScore = detectOverconfidence(trades);
  if (overconfidenceScore > 30) {
    detectedBiases.push({
      biasType: 'overconfidence',
      score: overconfidenceScore,
      impact: overconfidenceScore > 70 ? 'high' : overconfidenceScore > 40 ? 'medium' : 'low',
      evidence: getOverconfidenceEvidence(trades),
      suggestion: 'Consider implementing position size limits and tracking your prediction accuracy',
      description: biasDefinitions.overconfidence.description
    });
  }
  
  // Calculate overall bias score (0-100, lower is better)
  const overallScore = Math.min(
    100,
    Math.floor(
      (detectedBiases.reduce((sum, bias) => sum + bias.score, 0) / 
      (detectedBiases.length || 1)) * 0.7 + 
      Math.random() * 20
    )
  );
  
  // Generate improvement suggestions
  const improvementSuggestions = detectedBiases.map(bias => 
    biasDefinitions[bias.biasType].corrections[
      Math.floor(Math.random() * biasDefinitions[bias.biasType].corrections.length)
    ]
  );
  
  // Add a general suggestion if needed
  if (improvementSuggestions.length < 3) {
    improvementSuggestions.push(
      'Consider maintaining an investment journal to track decisions and outcomes'
    );
  }
  
  return {
    userId,
    detectedBiases,
    overallScore,
    improvementSuggestions,
    premium: false
  };
}

// Helper functions for bias detection

function detectLossAversion(trades: UserTrade[]): number {
  // Simplified algorithm: 
  // - Count instances where profitable positions were closed quickly
  // - Count instances where losing positions were held for extended periods
  
  let score = 0;
  const holdingPeriods = new Map<string, { buy: Date, profitability: number }>();
  
  // Track holding periods and profitability
  trades.forEach(trade => {
    const symbol = trade.symbol;
    
    if (trade.type === 'buy') {
      if (!holdingPeriods.has(symbol)) {
        holdingPeriods.set(symbol, { 
          buy: new Date(trade.timestamp), 
          profitability: 0 
        });
      }
    } else if (trade.type === 'sell' && holdingPeriods.has(symbol)) {
      const buyData = holdingPeriods.get(symbol);
      if (!buyData) return;
      
      const holdingPeriod = new Date(trade.timestamp).getTime() - buyData.buy.getTime();
      const dayHeld = holdingPeriod / (1000 * 60 * 60 * 24);
      const profitability = (trade.price - trade.averageBuyPrice) / trade.averageBuyPrice;
      
      // Update profitability
      holdingPeriods.set(symbol, {
        ...buyData,
        profitability
      });
      
      // Check for loss aversion patterns
      if (profitability > 0 && dayHeld < 30) {
        // Quick profit taking
        score += 10 * (1 - dayHeld/30);
      } else if (profitability < -0.1 && dayHeld > 90) {
        // Holding onto significant losses
        score += 15 * (dayHeld/90);
      }
    }
  });
  
  return Math.min(100, Math.max(0, score));
}

function detectOverconfidence(trades: UserTrade[]): number {
  // Simplified algorithm:
  // - Look at trading frequency
  // - Look at position sizes relative to portfolio
  // - Look at concentration in specific sectors/assets
  
  let score = 0;
  
  // Check trading frequency
  const tradesByMonth = new Map<string, number>();
  
  trades.forEach(trade => {
    const month = trade.timestamp.substring(0, 7); // YYYY-MM
    tradesByMonth.set(month, (tradesByMonth.get(month) || 0) + 1);
  });
  
  // Calculate average monthly trades
  const avgMonthlyTrades = 
    Array.from(tradesByMonth.values()).reduce((sum, count) => sum + count, 0) / 
    Math.max(1, tradesByMonth.size);
  
  // Excessive trading can indicate overconfidence
  if (avgMonthlyTrades > 20) {
    score += Math.min(50, (avgMonthlyTrades - 20) * 2);
  }
  
  // Check for large position sizes
  const largePositions = trades.filter(t => 
    t.type === 'buy' && t.percentOfPortfolio && t.percentOfPortfolio > 0.15
  );
  
  score += largePositions.length * 5;
  
  // Add randomness for demo
  score += Math.random() * 15;
  
  return Math.min(100, Math.max(0, Math.floor(score)));
}

function getLossAversionEvidence(trades: UserTrade[]): any[] {
  const evidence = [];
  
  // Find instances of holding losing positions
  const losingTrades = trades.filter(t => 
    t.type === 'sell' && 
    t.price < t.averageBuyPrice &&
    t.holdingPeriodDays && 
    t.holdingPeriodDays > 90
  );
  
  if (losingTrades.length > 0) {
    evidence.push({
      type: 'long_losing_positions',
      count: losingTrades.length,
      detail: `Held ${losingTrades.length} losing positions for over 90 days`
    });
  }
  
  // Find quick profit taking
  const quickProfitTrades = trades.filter(t => 
    t.type === 'sell' && 
    t.price > t.averageBuyPrice &&
    t.holdingPeriodDays && 
    t.holdingPeriodDays < 14
  );
  
  if (quickProfitTrades.length > 0) {
    evidence.push({
      type: 'quick_profit_taking',
      count: quickProfitTrades.length,
      detail: `Took profits quickly on ${quickProfitTrades.length} positions (< 14 days)`
    });
  }
  
  return evidence;
}

function getOverconfidenceEvidence(trades: UserTrade[]): any[] {
  const evidence = [];
  
  // Check trading frequency
  const tradesByMonth = new Map<string, number>();
  
  trades.forEach(trade => {
    const month = trade.timestamp.substring(0, 7); // YYYY-MM
    tradesByMonth.set(month, (tradesByMonth.get(month) || 0) + 1);
  });
  
  const highVolumeMonths = Array.from(tradesByMonth.entries())
    .filter(([_, count]) => count > 20)
    .map(([month, count]) => ({ month, count }));
  
  if (highVolumeMonths.length > 0) {
    evidence.push({
      type: 'high_trading_frequency',
      months: highVolumeMonths.length,
      detail: `${highVolumeMonths.length} months with more than 20 trades`
    });
  }
  
  // Check for large positions
  const largePositions = trades.filter(t => 
    t.type === 'buy' && t.percentOfPortfolio && t.percentOfPortfolio > 0.15
  ).map(t => ({
    symbol: t.symbol,
    percentOfPortfolio: t.percentOfPortfolio,
    date: t.timestamp
  }));
  
  if (largePositions.length > 0) {
    evidence.push({
      type: 'large_positions',
      count: largePositions.length,
      detail: `${largePositions.length} positions exceeding 15% of portfolio value`
    });
  }
  
  return evidence;
}

/**
 * Process natural language queries about user's biases
 */
export async function processNaturalLanguageQuery(
  userId: number, 
  query: string
): Promise<NaturalLanguageQueryResponse> {
  // Get user's latest bias report and biases
  const biasReport = await storage.getLatestBiasReport(userId);
  const userBiases = await storage.getUserBiases(userId);
  
  if (!biasReport) {
    throw new Error('No bias analysis available for this user');
  }
  
  // Process the query using AI
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a behavioral finance expert. Answer questions about the user's cognitive biases based on their most recent bias analysis.
          
          Latest bias analysis summary: 
          - Overall Score: ${biasReport.overallScore}/100 (lower is better)
          - Primary Biases: ${biasReport.primaryBiases.map(b => `${b.biasType} (score: ${b.score})`).join(', ')}
          - Recommendations: ${biasReport.improvementSuggestions.join(', ')}
          
          All bias definitions are available to you. Provide specific, actionable advice.`
        },
        {
          role: "user",
          content: query
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });
    
    // Extract relevant biases from the query and response
    const biasTypes = Object.keys(biasDefinitions) as BiasType[];
    const mentionedBiases = new Set<BiasType>();
    
    // Find biases mentioned in the query
    biasTypes.forEach(biasType => {
      const biasName = biasDefinitions[biasType].name.toLowerCase();
      if (
        query.toLowerCase().includes(biasType.replace('_', ' ')) || 
        query.toLowerCase().includes(biasName)
      ) {
        mentionedBiases.add(biasType);
      }
    });
    
    // Add primary biases from user's report
    biasReport.primaryBiases.forEach(bias => {
      mentionedBiases.add(bias.biasType as BiasType);
    });
    
    // Parse the response
    const responseContent = completion.choices[0].message.content || "";
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(responseContent);
    } catch (e) {
      jsonResponse = { 
        answer: responseContent,
        suggestedActions: []
      };
    }
    
    return {
      answer: jsonResponse.answer || responseContent,
      relatedBiases: Array.from(mentionedBiases).slice(0, 3),
      suggestedActions: 
        jsonResponse.suggestedActions || 
        jsonResponse.recommendations || 
        jsonResponse.actions || 
        biasReport.improvementSuggestions.slice(0, 3),
      premium: false
    };
  } catch (error) {
    console.error('Error processing query with OpenAI:', error);
    throw new Error('Failed to process your query. Please try again later.');
  }
}