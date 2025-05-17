import { 
  users, 
  portfolios, 
  portfolioHoldings, 
  marketSentiment, 
  sentimentAlerts, 
  investmentPreferences, 
  aiRecommendations, 
  behavioralBiases,
  userTrades,
  biasAnalysisReports,
  type User, 
  type InsertUser,
  type UpsertUser,
  type Portfolio, 
  type InsertPortfolio,
  type PortfolioHolding,
  type InsertPortfolioHolding,
  type MarketSentiment,
  type InsertMarketSentiment,
  type SentimentAlert,
  type InsertSentimentAlert,
  type InvestmentPreference,
  type InsertInvestmentPreference,
  type AiRecommendation,
  type InsertAiRecommendation,
  type BehavioralBias,
  type InsertBehavioralBias,
  type UserTrade,
  type InsertUserTrade,
  type BiasAnalysisReport,
  type InsertBiasAnalysisReport
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Enhanced storage interface for Neufin platform
export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Portfolio management
  getPortfoliosByUserId(userId: number): Promise<Portfolio[]>;
  getPortfolio(id: number): Promise<Portfolio | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  
  // Portfolio holdings
  getHoldingsByPortfolioId(portfolioId: number): Promise<PortfolioHolding[]>;
  createHolding(holding: InsertPortfolioHolding): Promise<PortfolioHolding>;
  
  // Market sentiment
  getLatestSentiment(symbol: string): Promise<MarketSentiment | undefined>;
  getSymbolSentimentHistory(symbol: string, limit?: number): Promise<MarketSentiment[]>;
  createSentiment(sentiment: InsertMarketSentiment): Promise<MarketSentiment>;
  
  // Sentiment alerts
  getUserAlerts(userId: number): Promise<SentimentAlert[]>;
  createAlert(alert: InsertSentimentAlert): Promise<SentimentAlert>;
  
  // Investment preferences
  getUserPreferences(userId: number): Promise<InvestmentPreference | undefined>;
  createOrUpdatePreferences(preferences: InsertInvestmentPreference): Promise<InvestmentPreference>;
  
  // AI recommendations (Neufin O2 Module)
  getLatestRecommendations(limit?: number): Promise<AiRecommendation[]>;
  getLatestRecommendationsForUser(userId: number, limit?: number): Promise<AiRecommendation[]>;
  getSymbolRecommendations(symbol: string): Promise<AiRecommendation[]>;
  getRecommendationsByTimeHorizon(timeHorizon: string, limit?: number): Promise<AiRecommendation[]>;
  createRecommendation(recommendation: InsertAiRecommendation): Promise<AiRecommendation>;
  
  // Behavioral biases (Neufin BBA Module)
  getUserBiases(userId: number): Promise<BehavioralBias[]>;
  createBias(bias: InsertBehavioralBias): Promise<BehavioralBias>;
  
  // User trades (for BBA analysis)
  getUserTrades(userId: number, limit?: number): Promise<UserTrade[]>;
  getTradesBySymbol(userId: number, symbol: string): Promise<UserTrade[]>;
  createTrade(trade: InsertUserTrade): Promise<UserTrade>;
  
  // Bias analysis reports
  getUserBiasReports(userId: number, limit?: number): Promise<BiasAnalysisReport[]>;
  getLatestBiasReport(userId: number): Promise<BiasAnalysisReport | undefined>;
  createBiasReport(report: InsertBiasAnalysisReport): Promise<BiasAnalysisReport>;
  
  // User bias score management
  updateUserBiasScore(userId: number, score: number, flags?: any[]): Promise<User>;
  getUserWithBiasFlags(userId: number): Promise<User | undefined>;
}

// Database implementation of the storage interface
export class DatabaseStorage implements IStorage {
  // User management
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  // Portfolio management
  async getPortfoliosByUserId(userId: number): Promise<Portfolio[]> {
    return await db.select().from(portfolios).where(eq(portfolios.userId, userId));
  }
  
  async getPortfolio(id: number): Promise<Portfolio | undefined> {
    const [portfolio] = await db.select().from(portfolios).where(eq(portfolios.id, id));
    return portfolio;
  }
  
  async createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio> {
    const [newPortfolio] = await db.insert(portfolios).values(portfolio).returning();
    return newPortfolio;
  }
  
  // Portfolio holdings
  async getHoldingsByPortfolioId(portfolioId: number): Promise<PortfolioHolding[]> {
    return await db.select().from(portfolioHoldings).where(eq(portfolioHoldings.portfolioId, portfolioId));
  }
  
  async createHolding(holding: InsertPortfolioHolding): Promise<PortfolioHolding> {
    const [newHolding] = await db.insert(portfolioHoldings).values(holding).returning();
    return newHolding;
  }
  
  // Market sentiment
  async getLatestSentiment(symbol: string): Promise<MarketSentiment | undefined> {
    const [sentiment] = await db
      .select()
      .from(marketSentiment)
      .where(eq(marketSentiment.symbol, symbol))
      .orderBy(desc(marketSentiment.timestamp))
      .limit(1);
    return sentiment;
  }
  
  async getSymbolSentimentHistory(symbol: string, limit: number = 30): Promise<MarketSentiment[]> {
    return await db
      .select()
      .from(marketSentiment)
      .where(eq(marketSentiment.symbol, symbol))
      .orderBy(desc(marketSentiment.timestamp))
      .limit(limit);
  }
  
  async createSentiment(sentiment: InsertMarketSentiment): Promise<MarketSentiment> {
    const [newSentiment] = await db.insert(marketSentiment).values(sentiment).returning();
    return newSentiment;
  }
  
  // Sentiment alerts
  async getUserAlerts(userId: number): Promise<SentimentAlert[]> {
    return await db.select().from(sentimentAlerts).where(eq(sentimentAlerts.userId, userId));
  }
  
  async createAlert(alert: InsertSentimentAlert): Promise<SentimentAlert> {
    const [newAlert] = await db.insert(sentimentAlerts).values(alert).returning();
    return newAlert;
  }
  
  // Investment preferences
  async getUserPreferences(userId: number): Promise<InvestmentPreference | undefined> {
    const [preferences] = await db
      .select()
      .from(investmentPreferences)
      .where(eq(investmentPreferences.userId, userId));
    return preferences;
  }
  
  async createOrUpdatePreferences(preferences: InsertInvestmentPreference): Promise<InvestmentPreference> {
    // Check if preferences already exist for this user
    const existing = await this.getUserPreferences(preferences.userId);
    
    if (existing) {
      // Update existing preferences
      const [updated] = await db
        .update(investmentPreferences)
        .set({
          ...preferences,
          updatedAt: new Date()
        })
        .where(eq(investmentPreferences.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new preferences
      const [newPreferences] = await db
        .insert(investmentPreferences)
        .values(preferences)
        .returning();
      return newPreferences;
    }
  }
  
  // AI recommendations (Neufin O2 Module)
  async getLatestRecommendations(limit: number = 10): Promise<AiRecommendation[]> {
    return await db
      .select()
      .from(aiRecommendations)
      .orderBy(desc(aiRecommendations.createdAt))
      .limit(limit);
  }
  
  async getLatestRecommendationsForUser(userId: number, limit: number = 10): Promise<AiRecommendation[]> {
    return await db
      .select()
      .from(aiRecommendations)
      .where(eq(aiRecommendations.userId, userId))
      .orderBy(desc(aiRecommendations.createdAt))
      .limit(limit);
  }
  
  async getSymbolRecommendations(symbol: string): Promise<AiRecommendation[]> {
    return await db
      .select()
      .from(aiRecommendations)
      .where(eq(aiRecommendations.symbol, symbol))
      .orderBy(desc(aiRecommendations.createdAt));
  }
  
  async getRecommendationsByTimeHorizon(timeHorizon: string, limit: number = 10): Promise<AiRecommendation[]> {
    return await db
      .select()
      .from(aiRecommendations)
      .where(eq(aiRecommendations.timeHorizon, timeHorizon))
      .orderBy(desc(aiRecommendations.createdAt))
      .limit(limit);
  }
  
  async createRecommendation(recommendation: InsertAiRecommendation): Promise<AiRecommendation> {
    const [newRecommendation] = await db
      .insert(aiRecommendations)
      .values(recommendation)
      .returning();
    return newRecommendation;
  }
  
  // Behavioral biases (Neufin BBA Module)
  async getUserBiases(userId: number): Promise<BehavioralBias[]> {
    return await db
      .select()
      .from(behavioralBiases)
      .where(eq(behavioralBiases.userId, userId))
      .orderBy(desc(behavioralBiases.detectionDate));
  }
  
  async createBias(bias: InsertBehavioralBias): Promise<BehavioralBias> {
    const [newBias] = await db.insert(behavioralBiases).values(bias).returning();
    return newBias;
  }
  
  // User trades methods (for BBA analysis)
  async getUserTrades(userId: number, limit: number = 50): Promise<UserTrade[]> {
    return await db
      .select()
      .from(userTrades)
      .where(eq(userTrades.userId, userId))
      .orderBy(desc(userTrades.tradeDate))
      .limit(limit);
  }
  
  async getTradesBySymbol(userId: number, symbol: string): Promise<UserTrade[]> {
    return await db
      .select()
      .from(userTrades)
      .where(and(
        eq(userTrades.userId, userId),
        eq(userTrades.symbol, symbol)
      ))
      .orderBy(desc(userTrades.tradeDate));
  }
  
  async createTrade(trade: InsertUserTrade): Promise<UserTrade> {
    const [newTrade] = await db
      .insert(userTrades)
      .values(trade)
      .returning();
    return newTrade;
  }
  
  // Bias analysis reports methods
  async getUserBiasReports(userId: number, limit: number = 10): Promise<BiasAnalysisReport[]> {
    return await db
      .select()
      .from(biasAnalysisReports)
      .where(eq(biasAnalysisReports.userId, userId))
      .orderBy(desc(biasAnalysisReports.createdAt))
      .limit(limit);
  }
  
  async getLatestBiasReport(userId: number): Promise<BiasAnalysisReport | undefined> {
    const [report] = await db
      .select()
      .from(biasAnalysisReports)
      .where(eq(biasAnalysisReports.userId, userId))
      .orderBy(desc(biasAnalysisReports.createdAt))
      .limit(1);
    return report;
  }
  
  async createBiasReport(report: InsertBiasAnalysisReport): Promise<BiasAnalysisReport> {
    const [newReport] = await db
      .insert(biasAnalysisReports)
      .values(report)
      .returning();
    return newReport;
  }
  
  // User bias score management
  async updateUserBiasScore(userId: number, score: number, flags: any[] = []): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        biasScore: score,
        biasFlags: flags.length ? JSON.stringify(flags) : undefined
      })
      .where(eq(users.id, userId.toString()))
      .returning();
    return updatedUser;
  }
  
  async getUserWithBiasFlags(userId: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId.toString()));
    return user;
  }
}

// Use the database storage implementation
export const storage = new DatabaseStorage();
