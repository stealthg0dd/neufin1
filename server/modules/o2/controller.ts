/**
 * Neufin O2 API Controller
 * Handles API endpoints for AI-driven investment recommendations
 */
import { Request, Response, Router } from "express";
import { db } from "../../db";
import { eq, desc, sql, and } from "drizzle-orm";
import { storage } from "../../storage";
import { aiRecommendations, insertAiRecommendationSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const DEFAULT_MODEL = "gpt-4o";

export const o2Router = Router();

/**
 * Get investment recommendations for a user
 */
o2Router.get('/recommendations/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const recommendations = await storage.getLatestRecommendationsForUser(userId);
    
    return res.json({ recommendations });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

/**
 * Get all investment recommendations
 */
o2Router.get('/recommendations', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const recommendations = await storage.getLatestRecommendations(limit);
    
    return res.json({ recommendations });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

/**
 * Get recommendations for a specific symbol
 */
o2Router.get('/recommendations/symbol/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    if (!symbol) {
      return res.status(400).json({ error: "Symbol is required" });
    }

    const recommendations = await storage.getSymbolRecommendations(symbol);
    
    return res.json({ recommendations });
  } catch (error) {
    console.error("Error fetching recommendations for symbol:", error);
    return res.status(500).json({ error: "Failed to fetch recommendations for symbol" });
  }
});

/**
 * Get recommendations by time horizon (short_term, mid_term, long_term)
 */
o2Router.get('/recommendations/horizon/:timeHorizon', async (req: Request, res: Response) => {
  try {
    const { timeHorizon } = req.params;
    if (!['short_term', 'mid_term', 'long_term'].includes(timeHorizon)) {
      return res.status(400).json({ error: "Invalid time horizon. Must be short_term, mid_term, or long_term" });
    }

    const recommendations = await db.select()
      .from(aiRecommendations)
      .where(eq(aiRecommendations.timeHorizon, timeHorizon))
      .orderBy(desc(aiRecommendations.createdAt))
      .limit(20);
    
    return res.json({ recommendations });
  } catch (error) {
    console.error("Error fetching recommendations by time horizon:", error);
    return res.status(500).json({ error: "Failed to fetch recommendations by time horizon" });
  }
});

/**
 * Generate a new AI investment recommendation
 */
o2Router.post('/recommendations/generate', async (req: Request, res: Response) => {
  try {
    const requestSchema = z.object({
      userId: z.number().optional(),
      symbol: z.string().min(1),
      preferences: z.object({
        riskTolerance: z.enum(['low', 'medium', 'high']).optional(),
        investmentHorizon: z.enum(['short', 'medium', 'long']).optional(),
        preferredSectors: z.array(z.string()).optional(),
      }).optional(),
    });

    const validatedData = requestSchema.parse(req.body);
    const { userId, symbol, preferences } = validatedData;

    // Get stock data for analysis
    const stockData = await fetchStockData(symbol);
    if (!stockData) {
      return res.status(404).json({ error: "Stock data not found" });
    }

    // Get sentiment data if available
    let sentimentData;
    try {
      sentimentData = await storage.getLatestSentiment(symbol);
    } catch (error) {
      console.warn(`No sentiment data available for ${symbol}`);
    }

    // Generate investment thesis and recommendation
    const analysis = await generateInvestmentRecommendation(
      symbol, 
      stockData, 
      sentimentData, 
      preferences
    );

    // Store recommendation in database
    const recommendation = await storage.createRecommendation({
      userId: userId ?? undefined,
      symbol,
      name: stockData.name || symbol,
      sector: stockData.sector,
      recommendation: analysis.recommendation,
      timeHorizon: analysis.timeHorizon,
      confidenceScore: analysis.confidenceScore,
      rationale: analysis.rationale,
      aiThesis: analysis.aiThesis,
      entryPriceLow: analysis.entryPriceLow,
      entryPriceHigh: analysis.entryPriceHigh,
      exitPriceLow: analysis.exitPriceLow,
      exitPriceHigh: analysis.exitPriceHigh,
      riskRewardRatio: analysis.riskRewardRatio,
      volatilityIndex: analysis.volatilityIndex,
      expectedReturn: analysis.expectedReturn,
      suggestedAllocation: analysis.suggestedAllocation,
      sentiment: analysis.sentiment,
      technicalSignal: analysis.technicalSignal,
      fundamentalRating: analysis.fundamentalRating,
      premium: true
    });

    return res.status(201).json({ recommendation });
  } catch (error) {
    console.error("Error generating recommendation:", error);
    return res.status(500).json({ error: "Failed to generate recommendation" });
  }
});

/**
 * Natural language query for investment recommendations
 */
o2Router.post('/recommendations/query', async (req: Request, res: Response) => {
  try {
    const requestSchema = z.object({
      query: z.string().min(1),
      userId: z.number().optional(),
    });

    const validatedData = requestSchema.parse(req.body);
    const { query, userId } = validatedData;

    // Process natural language query using LLM
    const processedQuery = await processNaturalLanguageQuery(query);
    
    // Fetch appropriate recommendations based on processed query
    const recommendations = await fetchRecommendationsForQuery(processedQuery, userId);
    
    return res.json({ 
      query: processedQuery,
      recommendations 
    });
  } catch (error) {
    console.error("Error processing natural language query:", error);
    return res.status(500).json({ error: "Failed to process query" });
  }
});

/**
 * Toggle between human-readable and data-driven output formats
 */
o2Router.post('/recommendations/:id/format', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid recommendation ID" });
    }

    const formatSchema = z.object({
      format: z.enum(['human_readable', 'data_driven']),
    });

    const { format } = formatSchema.parse(req.body);
    
    // Get the recommendation
    const [recommendation] = await db.select().from(aiRecommendations).where(eq(aiRecommendations.id, id));
    
    if (!recommendation) {
      return res.status(404).json({ error: "Recommendation not found" });
    }
    
    // Format the response accordingly
    if (format === 'human_readable') {
      const humanReadableContent = generateHumanReadableContent(recommendation);
      return res.json({ recommendation, humanReadableContent });
    } else {
      // Data-driven format (the default structured format)
      return res.json({ recommendation });
    }
  } catch (error) {
    console.error("Error toggling format:", error);
    return res.status(500).json({ error: "Failed to change format" });
  }
});

/**
 * Fetch stock data for analysis
 */
async function fetchStockData(symbol: string) {
  try {
    // Try to get from database first
    const stock = await db.query.stocks.findFirst({
      where: eq(sql`stocks.symbol`, symbol),
      with: {
        prices: {
          orderBy: desc(sql`prices.date`),
          limit: 30
        },
        indicators: true,
        analysis: true
      }
    });

    if (stock) {
      return stock;
    }
    
    // If not found, return null - the controller will handle the error
    return null;
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    return null;
  }
}

/**
 * Generate investment recommendation using AI
 */
async function generateInvestmentRecommendation(
  symbol: string, 
  stockData: any, 
  sentimentData: any,
  preferences?: { 
    riskTolerance?: 'low' | 'medium' | 'high',
    investmentHorizon?: 'short' | 'medium' | 'long',
    preferredSectors?: string[]
  }
) {
  // Create a comprehensive prompt for the AI
  const prompt = `
You are a world-class financial analyst for Neufin financial intelligence platform. 
Generate a detailed investment recommendation for ${symbol} (${stockData.name || 'N/A'}).

Here's the data about the stock:
Company name: ${stockData.name || 'N/A'}
Sector: ${stockData.sector || 'N/A'}
Current price: $${stockData.latestPrice || 'N/A'}
52-week high: $${stockData.high52Week || 'N/A'}
52-week low: $${stockData.low52Week || 'N/A'}
Market cap: $${stockData.marketCap || 'N/A'}
P/E ratio: ${stockData.peRatio || 'N/A'}
Dividend yield: ${stockData.dividendYield || 'N/A'}%
Beta: ${stockData.beta || 'N/A'}

${sentimentData ? `Recent market sentiment: ${sentimentData.status} (score: ${sentimentData.sentimentScore}/100)` : 'No sentiment data available'}

Investor preferences:
Risk tolerance: ${preferences?.riskTolerance || 'medium'}
Investment horizon: ${preferences?.investmentHorizon || 'medium'}
${preferences?.preferredSectors?.length ? `Preferred sectors: ${preferences.preferredSectors.join(', ')}` : ''}

Based on this information, provide a comprehensive investment recommendation with the following details:
1. Recommendation (buy, sell, or hold)
2. Time horizon (short_term, mid_term, or long_term)
3. Confidence score (1-100)
4. Rationale (brief explanation)
5. AI thesis (detailed investment thesis)
6. Price targets: entry price range (low-high) and exit price range (low-high)
7. Risk-reward ratio (numerical value)
8. Volatility index (1-10)
9. Expected return (percentage)
10. Suggested allocation (percentage of portfolio)
11. Market sentiment (bullish, neutral, or bearish)
12. Technical signal (strong_buy, buy, neutral, sell, or strong_sell)
13. Fundamental rating (strong, good, fair, weak, or poor)

Format your response as JSON with the following structure:
{
  "recommendation": "buy|sell|hold",
  "timeHorizon": "short_term|mid_term|long_term",
  "confidenceScore": 75,
  "rationale": "brief explanation",
  "aiThesis": "detailed investment thesis",
  "entryPriceLow": "150.00",
  "entryPriceHigh": "160.00",
  "exitPriceLow": "180.00",
  "exitPriceHigh": "200.00",
  "riskRewardRatio": 2.5,
  "volatilityIndex": 6,
  "expectedReturn": 15.5,
  "suggestedAllocation": 5,
  "sentiment": "bullish|neutral|bearish",
  "technicalSignal": "strong_buy|buy|neutral|sell|strong_sell",
  "fundamentalRating": "strong|good|fair|weak|poor"
}
`;

  try {
    // Call OpenAI to get the recommendation
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "You are a financial analyst AI assistant for the Neufin platform. Provide detailed, data-driven investment recommendations." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    // Parse and validate the response
    const recommendation = JSON.parse(response.choices[0].message.content);
    
    // Ensure all required fields are present
    const requiredFields = [
      'recommendation', 'timeHorizon', 'confidenceScore', 'rationale', 
      'aiThesis', 'riskRewardRatio', 'volatilityIndex', 'expectedReturn'
    ];
    
    for (const field of requiredFields) {
      if (!recommendation[field]) {
        throw new Error(`Missing required field in AI response: ${field}`);
      }
    }
    
    return recommendation;
  } catch (error) {
    console.error("Error generating AI recommendation:", error);
    
    // Fallback to a basic recommendation if AI fails
    return {
      recommendation: "hold",
      timeHorizon: "mid_term",
      confidenceScore: 50,
      rationale: "Generated using basic analysis due to AI processing error",
      aiThesis: "Unable to generate detailed AI thesis at this time.",
      entryPriceLow: stockData.latestPrice ? (stockData.latestPrice * 0.95).toFixed(2) : "N/A",
      entryPriceHigh: stockData.latestPrice ? (stockData.latestPrice * 1.05).toFixed(2) : "N/A",
      exitPriceLow: stockData.latestPrice ? (stockData.latestPrice * 1.10).toFixed(2) : "N/A",
      exitPriceHigh: stockData.latestPrice ? (stockData.latestPrice * 1.20).toFixed(2) : "N/A",
      riskRewardRatio: 1.5,
      volatilityIndex: 5,
      expectedReturn: 10.0,
      suggestedAllocation: 3,
      sentiment: "neutral",
      technicalSignal: "neutral",
      fundamentalRating: "fair"
    };
  }
}

/**
 * Process natural language query using AI
 */
async function processNaturalLanguageQuery(query: string) {
  const prompt = `
Parse the following natural language investment query and extract search parameters:
"${query}"

Identify the following parameters:
1. Time horizon (short_term, mid_term, long_term)
2. Sectors mentioned
3. Stock symbols mentioned
4. Risk level (low, medium, high)
5. Return expectations
6. Investment strategy mentioned

Format your response as JSON:
{
  "timeHorizon": ["short_term", "mid_term", "long_term"],
  "sectors": ["technology", "healthcare", "finance"],
  "symbols": ["AAPL", "MSFT"],
  "riskLevel": "medium",
  "returnExpectations": "high growth",
  "investmentStrategy": "value investing"
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "You are a financial query processor for Neufin platform." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error processing natural language query:", error);
    // Return a basic structure if AI processing fails
    return {
      timeHorizon: [],
      sectors: [],
      symbols: [],
      riskLevel: "medium",
      returnExpectations: "",
      investmentStrategy: ""
    };
  }
}

/**
 * Fetch recommendations based on processed natural language query
 */
async function fetchRecommendationsForQuery(
  processedQuery: any,
  userId?: number
) {
  let query = db.select().from(aiRecommendations);
  
  // Apply filters based on processed query
  if (processedQuery.timeHorizon && processedQuery.timeHorizon.length > 0) {
    // Handle multiple time horizons with OR
    const timeHorizons = processedQuery.timeHorizon.map((horizon: string) => 
      eq(aiRecommendations.timeHorizon, horizon)
    );
    // Only apply if we have valid horizons
    if (timeHorizons.length > 0) {
      query = query.where(sql`(${timeHorizons.join(' OR ')})`);
    }
  }
  
  // Apply symbols filter if present
  if (processedQuery.symbols && processedQuery.symbols.length > 0) {
    const symbols = processedQuery.symbols.map((symbol: string) => 
      eq(aiRecommendations.symbol, symbol)
    );
    if (symbols.length > 0) {
      query = query.where(sql`(${symbols.join(' OR ')})`);
    }
  }
  
  // Apply sectors filter if present
  if (processedQuery.sectors && processedQuery.sectors.length > 0) {
    const sectors = processedQuery.sectors.map((sector: string) => 
      eq(aiRecommendations.sector, sector)
    );
    if (sectors.length > 0) {
      query = query.where(sql`(${sectors.join(' OR ')})`);
    }
  }
  
  // Apply user filter if present
  if (userId) {
    query = query.where(eq(aiRecommendations.userId, userId));
  }
  
  // Order by newest first and limit results
  query = query.orderBy(desc(aiRecommendations.createdAt)).limit(20);
  
  // Execute query
  return await query;
}

/**
 * Generate human-readable content from a recommendation
 */
function generateHumanReadableContent(recommendation: any): string {
  let bulletPoints = '';
  
  if (recommendation.sentiment) {
    let sentimentEmoji = '🔄';
    if (recommendation.sentiment === 'bullish') sentimentEmoji = '🔼';
    if (recommendation.sentiment === 'bearish') sentimentEmoji = '🔽';
    bulletPoints += `• Market Sentiment: ${sentimentEmoji} ${recommendation.sentiment.toUpperCase()}\n`;
  }
  
  if (recommendation.recommendation) {
    let recEmoji = '⏹️';
    if (recommendation.recommendation === 'buy') recEmoji = '✅';
    if (recommendation.recommendation === 'sell') recEmoji = '❌';
    bulletPoints += `• Recommendation: ${recEmoji} ${recommendation.recommendation.toUpperCase()}\n`;
  }
  
  if (recommendation.timeHorizon) {
    let horizonText = 'Medium-Term (1-6 months)';
    if (recommendation.timeHorizon === 'short_term') horizonText = 'Short-Term (1 week-1 month)';
    if (recommendation.timeHorizon === 'long_term') horizonText = 'Long-Term (6+ months)';
    bulletPoints += `• Time Horizon: ${horizonText}\n`;
  }
  
  if (recommendation.confidenceScore) {
    bulletPoints += `• Confidence: ${recommendation.confidenceScore}/100\n`;
  }
  
  if (recommendation.expectedReturn) {
    bulletPoints += `• Expected Return: ${recommendation.expectedReturn}%\n`;
  }
  
  if (recommendation.suggestedAllocation) {
    bulletPoints += `• Suggested Allocation: ${recommendation.suggestedAllocation}% of portfolio\n`;
  }
  
  const entryRange = recommendation.entryPriceLow && recommendation.entryPriceHigh ? 
    `$${recommendation.entryPriceLow} - $${recommendation.entryPriceHigh}` : 'N/A';
  
  const exitRange = recommendation.exitPriceLow && recommendation.exitPriceHigh ? 
    `$${recommendation.exitPriceLow} - $${recommendation.exitPriceHigh}` : 'N/A';
  
  let output = `
# Investment Recommendation for ${recommendation.symbol} ${recommendation.name ? `(${recommendation.name})` : ''}

## Summary
${bulletPoints}

## Entry & Exit Targets
• Entry Price Range: ${entryRange}
• Exit Price Range: ${exitRange}
• Risk/Reward Ratio: ${recommendation.riskRewardRatio || 'N/A'}

## Investment Thesis
${recommendation.aiThesis || 'No detailed thesis available.'}

## Rationale
${recommendation.rationale || 'No rationale provided.'}

## Technical & Fundamental Analysis
• Technical Signal: ${recommendation.technicalSignal || 'N/A'}
• Fundamental Rating: ${recommendation.fundamentalRating || 'N/A'}
• Volatility Index: ${recommendation.volatilityIndex ? `${recommendation.volatilityIndex}/10` : 'N/A'}
`;

  return output;
}