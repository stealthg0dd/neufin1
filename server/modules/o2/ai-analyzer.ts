/**
 * Neufin O2 AI Investment Analysis
 * Uses Anthropic Claude to provide advanced investment insights and recommendations
 */

import Anthropic from '@anthropic-ai/sdk';
import { RealTimeQuote } from '../market-data/realtime-service';
import { db } from '../../db';
import { aiRecommendations, stocks } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Initialize Anthropic client
// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Interface for investment analysis request
export interface InvestmentAnalysisRequest {
  symbol: string;
  timeHorizon?: 'short_term' | 'mid_term' | 'long_term';
  riskTolerance?: 'low' | 'medium' | 'high';
  investmentThesis?: boolean;
  technicalAnalysis?: boolean;
  fundamentalAnalysis?: boolean;
  marketSentiment?: boolean;
  historicalData?: any;
  currentPrice?: RealTimeQuote;
}

// Interface for investment analysis response
export interface InvestmentAnalysisResponse {
  symbol: string;
  recommendation: 'buy' | 'sell' | 'hold';
  confidenceScore: number;
  rationale: string;
  aiThesis?: string;
  entryPriceRange?: {
    low: number;
    high: number;
  };
  exitPriceRange?: {
    low: number;
    high: number;
  };
  riskRewardRatio?: number;
  volatilityIndex?: number;
  expectedReturn?: number;
  suggestedAllocation?: number;
  timeHorizon: 'short_term' | 'mid_term' | 'long_term';
  sentiment?: 'bullish' | 'neutral' | 'bearish';
  technicalSignal?: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';
  fundamentalRating?: 'strong' | 'good' | 'fair' | 'weak' | 'poor';
}

/**
 * Generate an investment analysis using Claude AI
 */
export async function generateInvestmentAnalysis(
  request: InvestmentAnalysisRequest
): Promise<InvestmentAnalysisResponse> {
  try {
    // Get stock information from the database
    const stockInfo = await db
      .select()
      .from(stocks)
      .where(eq(stocks.symbol, request.symbol))
      .limit(1);
    
    // Prepare the prompt for Claude
    const prompt = `
You are a sophisticated financial analysis AI focused on providing detailed investment recommendations based on market data.

The analysis is for the stock: ${request.symbol} ${stockInfo.length > 0 ? `(${stockInfo[0].name})` : ''}
Time Horizon: ${request.timeHorizon || 'Not specified'}
Risk Tolerance: ${request.riskTolerance || 'Not specified'}

Current Price Data:
${request.currentPrice ? 
  `Price: $${request.currentPrice.price}
Change: ${request.currentPrice.change > 0 ? '+' : ''}${request.currentPrice.change} (${request.currentPrice.changePercent > 0 ? '+' : ''}${(request.currentPrice.changePercent * 100).toFixed(2)}%)
Volume: ${request.currentPrice.volume}
High: $${request.currentPrice.high}
Low: $${request.currentPrice.low}` 
  : 'No current price data available'}

${stockInfo.length > 0 ?
  `Company Information:
Sector: ${stockInfo[0].sector || 'Not available'}
Industry: ${stockInfo[0].industry || 'Not available'}
Market Cap: ${stockInfo[0].marketCap || 'Not available'}
P/E Ratio: ${stockInfo[0].peRatio || 'Not available'}
Dividend Yield: ${stockInfo[0].dividendYield || 'Not available'}`
  : 'No company information available'}

Please provide a comprehensive investment analysis with the following:
1. A clear recommendation (buy, sell, or hold)
2. A confidence score (0-100)
3. A detailed rationale for your recommendation
4. Entry and exit price ranges
5. Risk/reward ratio, volatility assessment, and expected return
6. Investment time horizon confirmation
7. Market sentiment and technical signals assessment
8. Fundamental strength rating

Format your response as JSON with the following structure:
{
  "recommendation": "buy|sell|hold",
  "confidenceScore": number,
  "rationale": "string",
  "aiThesis": "string",
  "entryPriceRange": {
    "low": number,
    "high": number
  },
  "exitPriceRange": {
    "low": number,
    "high": number
  },
  "riskRewardRatio": number,
  "volatilityIndex": number,
  "expectedReturn": number,
  "suggestedAllocation": number,
  "timeHorizon": "short_term|mid_term|long_term",
  "sentiment": "bullish|neutral|bearish",
  "technicalSignal": "strong_buy|buy|neutral|sell|strong_sell",
  "fundamentalRating": "strong|good|fair|weak|poor"
}
`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 2000,
      system: "You are an expert financial analyst AI specializing in investment recommendations. Always provide detailed, fact-based analysis formatted as JSON.",
      messages: [{ role: 'user', content: prompt }],
    });

    // Parse the response (assuming Claude returns valid JSON)
    let analysis: InvestmentAnalysisResponse;
    try {
      // Extract JSON from Claude's response
      const responseText = message.content[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Could not extract valid JSON from the response');
      }
      
      analysis = JSON.parse(jsonMatch[0]);
      
      // Ensure all required fields are present
      if (!analysis.recommendation || !analysis.confidenceScore || !analysis.rationale || !analysis.timeHorizon) {
        throw new Error('Missing required fields in analysis response');
      }
      
      // Store the analysis in the database
      await storeAnalysisInDatabase(request.symbol, analysis);
      
      return analysis;
    } catch (error) {
      console.error('Error parsing Claude response:', error);
      throw new Error('Failed to parse AI analysis response');
    }
  } catch (error) {
    console.error('Error generating investment analysis:', error);
    throw error;
  }
}

/**
 * Store the AI-generated analysis in the database
 */
async function storeAnalysisInDatabase(symbol: string, analysis: InvestmentAnalysisResponse): Promise<void> {
  try {
    await db.insert(aiRecommendations).values({
      symbol: symbol,
      recommendation: analysis.recommendation,
      confidenceScore: analysis.confidenceScore,
      rationale: analysis.rationale,
      aiThesis: analysis.aiThesis || null,
      entryPriceLow: analysis.entryPriceRange?.low.toString() || null,
      entryPriceHigh: analysis.entryPriceRange?.high.toString() || null,
      exitPriceLow: analysis.exitPriceRange?.low.toString() || null,
      exitPriceHigh: analysis.exitPriceRange?.high.toString() || null,
      riskRewardRatio: analysis.riskRewardRatio || null,
      volatilityIndex: analysis.volatilityIndex || null,
      expectedReturn: analysis.expectedReturn || null,
      suggestedAllocation: analysis.suggestedAllocation || null,
      timeHorizon: analysis.timeHorizon,
      sentiment: analysis.sentiment || null,
      technicalSignal: analysis.technicalSignal || null,
      fundamentalRating: analysis.fundamentalRating || null,
      userTags: [],
      premium: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error storing analysis in database:', error);
  }
}