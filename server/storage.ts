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
  plaidItems,
  plaidAccounts,
  plaidHoldings,
  plaidInvestmentTransactions,
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
  type InsertBiasAnalysisReport,
  type PlaidItem,
  type InsertPlaidItem,
  type PlaidAccount,
  type InsertPlaidAccount,
  type PlaidHolding,
  type InsertPlaidHolding,
  type PlaidInvestmentTransaction,
  type InsertPlaidInvestmentTransaction
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
  
  // Plaid integration - Items
  getPlaidItemsByUserId(userId: string): Promise<PlaidItem[]>;
  getPlaidItemById(id: number): Promise<PlaidItem | undefined>;
  getPlaidItemByItemId(itemId: string): Promise<PlaidItem | undefined>;
  getPlaidItemByAccessToken(accessToken: string): Promise<PlaidItem | undefined>;
  createPlaidItem(item: InsertPlaidItem): Promise<PlaidItem>;
  updatePlaidItemStatus(id: number, status: string, errorCode?: string, errorMessage?: string): Promise<PlaidItem>;
  deletePlaidItem(id: number): Promise<void>;
  getPlaidAccessTokensByUserId(userId: string): Promise<string[]>;
  
  // Plaid integration - Accounts
  getPlaidAccountsByItemId(itemId: number): Promise<PlaidAccount[]>;
  getPlaidAccountById(id: number): Promise<PlaidAccount | undefined>;
  getPlaidAccountByAccountId(accountId: string): Promise<PlaidAccount | undefined>;
  createPlaidAccount(account: InsertPlaidAccount): Promise<PlaidAccount>;
  updatePlaidAccountStatus(id: number, status: string): Promise<PlaidAccount>;
  
  // Plaid integration - Holdings
  getPlaidHoldingsByAccountId(accountId: number): Promise<PlaidHolding[]>;
  getPlaidHoldingsBySymbol(userId: string, symbol: string): Promise<PlaidHolding[]>;
  createOrUpdatePlaidHolding(holding: InsertPlaidHolding): Promise<PlaidHolding>;
  
  // Plaid integration - Investment Transactions
  getPlaidInvestmentTransactionsByAccountId(accountId: number, limit?: number): Promise<PlaidInvestmentTransaction[]>;
  getPlaidInvestmentTransactionByPlaidId(plaidTransactionId: string): Promise<PlaidInvestmentTransaction | undefined>;
  createPlaidInvestmentTransaction(transaction: InsertPlaidInvestmentTransaction): Promise<PlaidInvestmentTransaction>;
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
  
  // Plaid integration - Items
  async getPlaidItemsByUserId(userId: string): Promise<PlaidItem[]> {
    return await db
      .select()
      .from(plaidItems)
      .where(eq(plaidItems.userId, userId))
      .orderBy(desc(plaidItems.lastUpdated));
  }
  
  async getPlaidItemById(id: number): Promise<PlaidItem | undefined> {
    const [item] = await db
      .select()
      .from(plaidItems)
      .where(eq(plaidItems.id, id));
    return item;
  }
  
  async getPlaidItemByItemId(itemId: string): Promise<PlaidItem | undefined> {
    const [item] = await db
      .select()
      .from(plaidItems)
      .where(eq(plaidItems.itemId, itemId));
    return item;
  }
  
  async getPlaidItemByAccessToken(accessToken: string): Promise<PlaidItem | undefined> {
    const [item] = await db
      .select()
      .from(plaidItems)
      .where(eq(plaidItems.accessToken, accessToken));
    return item;
  }
  
  async createPlaidItem(item: InsertPlaidItem): Promise<PlaidItem> {
    const [newItem] = await db
      .insert(plaidItems)
      .values(item)
      .returning();
    return newItem;
  }
  
  async updatePlaidItemStatus(id: number, status: string, errorCode?: string, errorMessage?: string): Promise<PlaidItem> {
    // Create a proper update object based on our schema
    const updateData: any = {
      status,
      errorCode,
      errorMessage
    };
    
    // The lastUpdated field is automatically updated by the database
    
    const [updatedItem] = await db
      .update(plaidItems)
      .set(updateData)
      .where(eq(plaidItems.id, id))
      .returning();
    return updatedItem;
  }
  
  async deletePlaidItem(id: number): Promise<void> {
    await db
      .delete(plaidItems)
      .where(eq(plaidItems.id, id));
  }
  
  async getPlaidAccessTokensByUserId(userId: string): Promise<string[]> {
    const items = await this.getPlaidItemsByUserId(userId);
    return items.map(item => item.accessToken);
  }
  
  // Plaid integration - Accounts
  async getPlaidAccountsByItemId(itemId: number): Promise<PlaidAccount[]> {
    return await db
      .select()
      .from(plaidAccounts)
      .where(eq(plaidAccounts.plaidItemId, itemId))
      .orderBy(desc(plaidAccounts.lastUpdated));
  }
  
  async getPlaidAccountById(id: number): Promise<PlaidAccount | undefined> {
    const [account] = await db
      .select()
      .from(plaidAccounts)
      .where(eq(plaidAccounts.id, id));
    return account;
  }
  
  async getPlaidAccountByAccountId(accountId: string): Promise<PlaidAccount | undefined> {
    const [account] = await db
      .select()
      .from(plaidAccounts)
      .where(eq(plaidAccounts.accountId, accountId));
    return account;
  }
  
  async createPlaidAccount(account: InsertPlaidAccount): Promise<PlaidAccount> {
    const [newAccount] = await db
      .insert(plaidAccounts)
      .values(account)
      .returning();
    return newAccount;
  }
  
  async updatePlaidAccountStatus(id: number, status: string): Promise<PlaidAccount> {
    const [updatedAccount] = await db
      .update(plaidAccounts)
      .set({
        status,
        lastUpdated: new Date()
      })
      .where(eq(plaidAccounts.id, id))
      .returning();
    return updatedAccount;
  }
  
  // Plaid integration - Holdings
  async getPlaidHoldingsByAccountId(accountId: number): Promise<PlaidHolding[]> {
    return await db
      .select()
      .from(plaidHoldings)
      .where(eq(plaidHoldings.accountId, accountId))
      .orderBy(desc(plaidHoldings.lastUpdated));
  }
  
  async getPlaidHoldingsBySymbol(userId: string, symbol: string): Promise<PlaidHolding[]> {
    // This is more complex because we need to join tables
    const items = await this.getPlaidItemsByUserId(userId);
    
    if (!items || items.length === 0) {
      return [];
    }
    
    const itemIds = items.map(item => item.id);
    
    // Get all accounts for these items
    const accounts = await db
      .select()
      .from(plaidAccounts)
      .where(
        // In clause equivalent to check if plaidItemId is in the itemIds array
        plaidAccounts.plaidItemId.in(itemIds)
      );
    
    if (!accounts || accounts.length === 0) {
      return [];
    }
    
    const accountIds = accounts.map(account => account.id);
    
    // Get all holdings for these accounts with the matching symbol
    return await db
      .select()
      .from(plaidHoldings)
      .where(
        and(
          plaidHoldings.accountId.in(accountIds),
          eq(plaidHoldings.symbol, symbol)
        )
      );
  }
  
  async createOrUpdatePlaidHolding(holding: InsertPlaidHolding): Promise<PlaidHolding> {
    // Check if holding already exists for this security_id and account_id
    const [existingHolding] = await db
      .select()
      .from(plaidHoldings)
      .where(
        and(
          eq(plaidHoldings.securityId, holding.securityId),
          eq(plaidHoldings.accountId, holding.accountId)
        )
      );
    
    if (existingHolding) {
      // Update existing holding  
      const updateData = {
        ...holding,
      };
      
      // Remove lastUpdated as it's handled by the database with defaultNow()
      delete updateData.lastUpdated;
      
      const [updatedHolding] = await db
        .update(plaidHoldings)
        .set(updateData)
        .where(eq(plaidHoldings.id, existingHolding.id))
        .returning();
      return updatedHolding;
    } else {
      // Create new holding
      const insertData = {
        ...holding
      };
      
      // Remove lastUpdated field as it's handled by the database
      delete insertData.lastUpdated;
      
      const [newHolding] = await db
        .insert(plaidHoldings)
        .values(insertData)
        .returning();
      return newHolding;
    }
  }
  
  // Plaid integration - Investment Transactions
  async getPlaidInvestmentTransactionsByAccountId(accountId: number, limit: number = 50): Promise<PlaidInvestmentTransaction[]> {
    return await db
      .select()
      .from(plaidInvestmentTransactions)
      .where(eq(plaidInvestmentTransactions.accountId, accountId))
      .orderBy(desc(plaidInvestmentTransactions.date))
      .limit(limit);
  }
  
  async getPlaidInvestmentTransactionByPlaidId(plaidTransactionId: string): Promise<PlaidInvestmentTransaction | undefined> {
    const [transaction] = await db
      .select()
      .from(plaidInvestmentTransactions)
      .where(eq(plaidInvestmentTransactions.plaidTransactionId, plaidTransactionId));
    return transaction;
  }
  
  async createPlaidInvestmentTransaction(transaction: InsertPlaidInvestmentTransaction): Promise<PlaidInvestmentTransaction> {
    const [newTransaction] = await db
      .insert(plaidInvestmentTransactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }
}

// Use the database storage implementation
export const storage = new DatabaseStorage();
