/**
 * Financial data fetcher for Neufin Sentient
 * Retrieves market news, tweets, and other financial information
 */

import axios from 'axios';
import { marketSentiment, type InsertMarketSentiment } from '@shared/schema';
import { db } from '../../db';
import { analyzeSentiment } from './openai-client';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

// Sample news sources to scrape
const NEWS_SOURCES = [
  { name: 'Yahoo Finance', url: 'https://finance.yahoo.com' },
  { name: 'CNBC', url: 'https://www.cnbc.com' },
  { name: 'Bloomberg', url: 'https://www.bloomberg.com' },
  { name: 'Reuters', url: 'https://www.reuters.com' }
];

// List of key market symbols to track
const TRACKED_SYMBOLS = [
  'SPY',  // S&P 500 ETF
  'QQQ',  // Nasdaq ETF
  'DIA',  // Dow Jones ETF
  'AAPL', // Apple
  'MSFT', // Microsoft
  'AMZN', // Amazon
  'GOOGL', // Alphabet
  'META', // Meta Platforms
  'TSLA', // Tesla
  'NVDA'  // Nvidia
];

// Sector mapping
const SYMBOL_TO_SECTOR: Record<string, string> = {
  'AAPL': 'Technology',
  'MSFT': 'Technology',
  'AMZN': 'Consumer Discretionary',
  'GOOGL': 'Communication Services',
  'META': 'Communication Services',
  'TSLA': 'Consumer Discretionary',
  'NVDA': 'Technology',
  'SPY': 'Market Index',
  'QQQ': 'Market Index',
  'DIA': 'Market Index'
};

/**
 * Fetch latest news articles related to a specific market symbol
 * Note: In a production environment, this would use a proper financial news API
 */
export async function fetchNewsForSymbol(symbol: string): Promise<string[]> {
  // For demonstration, we're using sample financial news
  // In production, replace with actual API call
  return getSampleNews(symbol);
}

/**
 * Fetch recent tweets about a specific market symbol
 * Note: In a production environment, this would use a social media API
 */
export async function fetchTweetsForSymbol(symbol: string): Promise<string[]> {
  // For demonstration, we're using sample tweets
  // In production, replace with actual Twitter/X API call
  return getSampleTweets(symbol);
}

/**
 * Analyze and store sentiment for a specific market symbol
 */
export async function analyzeAndStoreSentimentForSymbol(symbol: string): Promise<void> {
  try {
    console.log(`Fetching data for ${symbol}...`);
    
    // Fetch news and tweets for the symbol
    const news = await fetchNewsForSymbol(symbol);
    const tweets = await fetchTweetsForSymbol(symbol);
    
    const allContent = [...news, ...tweets];
    
    // If we have content to analyze
    if (allContent.length > 0) {
      // Analyze the first piece of content (in production would analyze more)
      const sentimentResult = await analyzeSentiment(allContent[0]);
      
      // Map scores from -1,1 to 0,100 for database storage
      const normalizedScore = Math.round((sentimentResult.score + 1) * 50);
      
      // Determine status based on score
      let status = 'neutral';
      if (normalizedScore > 60) status = 'positive';
      if (normalizedScore < 40) status = 'negative';
      
      // Prepare data for storage
      const sentimentData: InsertMarketSentiment = {
        symbol,
        sentimentScore: normalizedScore,
        status,
        source: sentimentResult.source,
        details: {
          summary: sentimentResult.summary,
          confidence: sentimentResult.confidence,
          rawScore: sentimentResult.score,
          sector: SYMBOL_TO_SECTOR[symbol] || 'Other'
        }
      };
      
      // Store in database
      await db.insert(marketSentiment).values(sentimentData);
      
      console.log(`Sentiment for ${symbol} analyzed and stored. Score: ${normalizedScore}`);
    } else {
      console.log(`No content found for ${symbol}. Skipping sentiment analysis.`);
    }
  } catch (error) {
    console.error(`Error processing ${symbol}:`, error);
  }
}

/**
 * Fetch and analyze sentiment for all tracked symbols
 */
export async function processAllSymbols(): Promise<void> {
  for (const symbol of TRACKED_SYMBOLS) {
    await analyzeAndStoreSentimentForSymbol(symbol);
  }
  console.log("Completed sentiment analysis for all symbols");
}

/**
 * Retrieve sentiment data for a symbol within a time range
 */
export async function getSentimentData(
  symbol: string,
  timeRange: '1D' | '1W' | '1M' | 'ALL' = 'ALL',
  limit: number = 100
) {
  const now = new Date();
  let startDate: Date;
  
  switch (timeRange) {
    case '1D':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '1W':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '1M':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      // ALL - no date constraint
      return await db
        .select()
        .from(marketSentiment)
        .where(eq(marketSentiment.symbol, symbol))
        .orderBy(desc(marketSentiment.timestamp))
        .limit(limit);
  }
  
  return await db
    .select()
    .from(marketSentiment)
    .where(
      and(
        eq(marketSentiment.symbol, symbol),
        gte(marketSentiment.timestamp, startDate)
      )
    )
    .orderBy(desc(marketSentiment.timestamp))
    .limit(limit);
}

/**
 * Aggregate sentiment data by sector
 */
export async function getSentimentBySecctor(
  sector: string,
  timeRange: '1D' | '1W' | '1M' | 'ALL' = 'ALL'
) {
  // For real implementation, need to add sector field to the schema
  // This is a simplified version
  const relevantSymbols = Object.entries(SYMBOL_TO_SECTOR)
    .filter(([_, s]) => s === sector)
    .map(([symbol, _]) => symbol);
    
  const results = [];
  
  for (const symbol of relevantSymbols) {
    const data = await getSentimentData(symbol, timeRange);
    results.push(...data);
  }
  
  return results;
}

// ============ Sample data for development ============

function getSampleNews(symbol: string): string[] {
  const sampleNews: Record<string, string[]> = {
    'AAPL': [
      `Apple (${symbol}) announces record-breaking quarterly earnings, exceeding analyst expectations with revenue of $97.3 billion. The company's services division saw unprecedented growth of 17%, while iPhone sales remained strong despite supply chain challenges. CEO Tim Cook highlighted the company's focus on innovation and sustainability, announcing new carbon-neutral goals for the supply chain by 2030.`,
      `Investors remain cautious about Apple's (${symbol}) exposure to Chinese markets amid growing geopolitical tensions. While the company reported strong performance in its latest quarter, analysts point to potential disruptions in manufacturing and sales if US-China relations deteriorate further. The stock has shown increased volatility in recent trading sessions.`
    ],
    'MSFT': [
      `Microsoft (${symbol}) cloud revenue surges 28% year-over-year as more enterprises accelerate digital transformation initiatives. Azure maintains strong growth trajectory against AWS, gaining market share in key enterprise segments. CEO Satya Nadella emphasized AI integration across the product portfolio as a key driver of future growth.`,
      `Microsoft (${symbol}) faces new regulatory scrutiny over cloud pricing practices in European markets. The investigation comes amid concerns about potential anti-competitive behavior in bundling services. The company's stock dipped 2% on the news before recovering slightly in afternoon trading.`
    ],
    'AMZN': [
      `Amazon (${symbol}) beats revenue estimates but provides cautious guidance for the next quarter, citing inflationary pressures and changing consumer spending patterns. AWS continued its impressive performance with 34% growth, though slightly below the previous quarter's pace. The company announced additional layoffs in its retail division.`,
      `Amazon's (${symbol}) logistics expansion continues with the opening of 12 new fulfillment centers, positioning the company for faster delivery capabilities ahead of the holiday shopping season. The e-commerce giant has invested over $5 billion in its logistics network this year alone, creating an estimated 40,000 new jobs.`
    ],
    'GOOGL': [
      `Alphabet (${symbol}) reports advertising revenue growth of 22%, calming fears about digital ad spending slowdown. YouTube ad revenue rebounds after previous quarter's disappointment. The company's AI initiatives, including enhancements to search algorithms and new Pixel features, were highlighted as strategic priorities.`,
      `Alphabet (${symbol}) shares tumble 5% as Department of Justice antitrust lawsuit advances to trial phase. The case centers on Google's dominance in search advertising markets. Regulatory analysts suggest potential outcomes could include forced business divestitures or significant changes to the company's ad platform operations.`
    ],
    'TSLA': [
      `Tesla (${symbol}) vehicle deliveries hit new quarterly record with 305,000 units, driven by strong Model Y sales in European and Chinese markets. Production capacity continues to increase at new factories in Berlin and Texas. The company maintained its annual delivery target despite ongoing supply chain challenges.`,
      `Tesla (${symbol}) stock drops 7% after CEO Elon Musk sells $6.9 billion in shares, citing need to prepare for "forced Twitter deal outcome." Analysts expressed concern about leadership focus amid multiple ventures. The company's ambitious robotaxi timeline also faces increased skepticism from industry observers.`
    ]
  };

  // Default for any symbol not specifically defined
  const defaultNews = [
    `Market analysts remain divided on ${symbol} outlook following mixed earnings results. While revenue growth exceeded expectations, margin pressure and increased competition raise questions about future profitability. Several firms have adjusted price targets both up and down.`,
    `${symbol} announces strategic restructuring to focus on high-growth segments and improve operational efficiency. The company expects to realize annual cost savings of approximately $300 million by 2024. Executive leadership expressed confidence that these changes will drive long-term shareholder value.`
  ];

  return sampleNews[symbol] || defaultNews;
}

function getSampleTweets(symbol: string): string[] {
  const sampleTweets: Record<string, string[]> = {
    'AAPL': [
      `Just got the new iPhone and I'm blown away by the camera quality! $${symbol} continues to impress. #AppleBullish`,
      `$${symbol} services revenue growth slowing down. Competition heating up in key markets. Starting to reduce my position. #investing`,
      `Apple's cash position gives them so much flexibility. They could acquire a major studio or gaming company and barely dent their balance sheet. $${symbol} remains a core holding.`
    ],
    'MSFT': [
      `Azure growth numbers look amazing this quarter. $${symbol} is crushing it in enterprise cloud. Satya deserves massive credit for this transformation. #LongMicrosoft`,
      `Concerned about $${symbol} valuation after this run-up. Trading at historical premium to earnings. Taking some profits here. #TechStocks`,
      `Microsoft Teams user metrics are incredible. Completely dominating the workplace collaboration space. $${symbol} #BuyAndHold`
    ],
    'AMZN': [
      `Amazon Prime Day numbers leaked - absolutely massive YoY growth. $${symbol} crushing e-commerce again! 🚀`,
      `$${symbol} facing major unionization push across multiple warehouses. Labor costs could significantly impact margins going forward. #AmazonBearish`,
      `Just noticed Amazon quietly raised Prime prices again. Customer acquisition cost vs lifetime value still makes this a no-brainer business decision. Bullish on $${symbol} long term.`
    ],
    'GOOGL': [
      `Used Google's new AI search features today - mind blown by the quality and relevance. $${symbol} is years ahead of competition in search intelligence.`,
      `Digital ad spending showing significant weakness in our agency's client base. Bad news for $${symbol} next quarter? #DigitalAdvertising`,
      `Regulators need to back off $${symbol} - the innovation coming from this company is incredible and benefits consumers enormously. #Overregulation`
    ],
    'TSLA': [
      `Visited Tesla store today and it was PACKED. Sales rep said they're still backlogged on Model Y orders. $${symbol} demand remains strong despite media FUD.`,
      `$${symbol} losing EV market share in Europe for third straight quarter as competition ramps up. Price cuts not driving enough volume. Concerning trend.`,
      `The new Cybertruck spotted on road tests looks INCREDIBLE. This product will be another game-changer for $${symbol}. #Tesla #Cybertruck`
    ]
  };

  // Default for any symbol not specifically defined
  const defaultTweets = [
    `$${symbol} technical analysis shows strong support at current levels. Looking like a good entry point before next earnings.`,
    `Not impressed with ${symbol}'s recent product announcements. Competition is innovating faster. $${symbol} #investing`,
    `Insider buying at $${symbol} last week. Executives putting their money where their mouth is - always a good sign! #StockMarket`
  ];

  return sampleTweets[symbol] || defaultTweets as string[];
}