import { relations } from "drizzle-orm";
import {
  pgTable,
  integer,
  serial,
  text,
  timestamp,
  json,
  boolean,
  real,
  doublePrecision,
  date,
  jsonb,
  varchar,
  index
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Schema
export const users = pgTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  username: text("username").unique(),
  password: text("password"),
  role: text("role").default("user"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userRelations = relations(users, ({ many }) => ({
  portfolios: many(portfolios),
  sentimentAlerts: many(sentimentAlerts),
  investmentPreferences: many(investmentPreferences),
  aiRecommendations: many(aiRecommendations),
  userTrades: many(userTrades),
  behavioralBiases: many(behavioralBiases),
  biasAnalysisReports: many(biasAnalysisReports),
  plaidItems: many(plaidItems),
}));

// Portfolios Schema
export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const portfolioRelations = relations(portfolios, ({ one, many }) => ({
  user: one(users, {
    fields: [portfolios.userId],
    references: [users.id],
  }),
  holdings: many(portfolioHoldings),
}));

export const portfolioHoldings = pgTable("portfolio_holdings", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").notNull().references(() => portfolios.id),
  symbol: text("symbol").notNull(),
  shares: real("shares").notNull(),
  averagePrice: real("average_price").notNull(),
  currentPrice: real("current_price"),
  currentValue: real("current_value"),
  costBasis: real("cost_basis"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const portfolioHoldingsRelations = relations(portfolioHoldings, ({ one }) => ({
  portfolio: one(portfolios, {
    fields: [portfolioHoldings.portfolioId],
    references: [portfolios.id],
  }),
}));

// Sentiment Analysis Schema
export const marketSentiment = pgTable("market_sentiment", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  score: integer("score").notNull(), // 0-100 scale
  status: text("status").notNull(), // positive, negative, neutral
  source: text("source").notNull(), // news, social, analyst
  direction: text("direction"), // up, down, neutral
  change: real("change"), // change in sentiment score
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sentimentAlerts = pgTable("sentiment_alerts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  symbol: text("symbol").notNull(),
  threshold: integer("threshold").notNull(), // 0-100 scale
  direction: text("direction").notNull(), // above, below
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sentimentAlertsRelations = relations(sentimentAlerts, ({ one }) => ({
  user: one(users, {
    fields: [sentimentAlerts.userId],
    references: [users.id],
  }),
}));

// Investment Preferences Schema
export const investmentPreferences = pgTable("investment_preferences", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  riskTolerance: text("risk_tolerance").notNull(), // low, moderate, high
  investmentHorizon: text("investment_horizon").notNull(), // short, medium, long
  goals: json("goals").$type<string[]>(),
  preferredSectors: json("preferred_sectors").$type<string[]>(),
  excludedSectors: json("excluded_sectors").$type<string[]>(),
  preferredAssetClasses: json("preferred_asset_classes").$type<string[]>(),
  monthlyContribution: real("monthly_contribution"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const investmentPreferencesRelations = relations(investmentPreferences, ({ one }) => ({
  user: one(users, {
    fields: [investmentPreferences.userId],
    references: [users.id],
  }),
}));

// AI Recommendations Schema
export const aiRecommendations = pgTable("ai_recommendations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  symbol: text("symbol").notNull(),
  recommendation: text("recommendation").notNull(), // buy, sell, hold
  confidence: real("confidence").notNull(), // 0-1 scale
  reasoning: text("reasoning").notNull(),
  targetPrice: real("target_price"),
  timeHorizon: text("time_horizon"), // short, medium, long
  sentiment: text("sentiment"), // positive, negative, neutral
  aiModel: text("ai_model").notNull(), // which AI model generated this
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiRecommendationsRelations = relations(aiRecommendations, ({ one }) => ({
  user: one(users, {
    fields: [aiRecommendations.userId],
    references: [users.id],
  }),
}));

// User Trades Schema
export const userTrades = pgTable("user_trades", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  symbol: text("symbol").notNull(),
  action: text("action").notNull(), // buy, sell
  shares: real("shares").notNull(),
  price: real("price").notNull(),
  fees: real("fees"),
  total: real("total").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userTradesRelations = relations(userTrades, ({ one }) => ({
  user: one(users, {
    fields: [userTrades.userId],
    references: [users.id],
  }),
}));

// Behavioral Bias Schema
export const behavioralBiases = pgTable("behavioral_biases", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  biasType: text("bias_type").notNull(), // loss_aversion, recency, confirmation, etc.
  score: integer("score"), // 0-100 scale of bias intensity
  impactLevel: text("impact_level"), // low, medium, high
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const behavioralBiasesRelations = relations(behavioralBiases, ({ one }) => ({
  user: one(users, {
    fields: [behavioralBiases.userId],
    references: [users.id],
  }),
}));

export const biasAnalysisReports = pgTable("bias_analysis_reports", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  reportData: json("report_data").notNull(),
  suggestions: json("suggestions").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const biasAnalysisReportsRelations = relations(biasAnalysisReports, ({ one }) => ({
  user: one(users, {
    fields: [biasAnalysisReports.userId],
    references: [users.id],
  }),
}));

// Zod validation schemas for inserting data
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  username: true,
  password: true,
  role: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).pick({
  userId: true,
  name: true,
  description: true,
  isActive: true,
});

export const insertPortfolioHoldingSchema = createInsertSchema(portfolioHoldings).pick({
  portfolioId: true,
  symbol: true,
  shares: true,
  averagePrice: true,
  currentPrice: true,
  currentValue: true,
  costBasis: true,
});

export const insertMarketSentimentSchema = createInsertSchema(marketSentiment).pick({
  symbol: true,
  score: true,
  status: true,
  source: true,
  direction: true,
  change: true,
});

export const insertSentimentAlertSchema = createInsertSchema(sentimentAlerts).pick({
  userId: true,
  symbol: true,
  threshold: true,
  direction: true,
  isActive: true,
});

export const insertInvestmentPreferenceSchema = createInsertSchema(investmentPreferences).pick({
  userId: true,
  riskTolerance: true,
  investmentHorizon: true,
  goals: true,
  preferredSectors: true,
  excludedSectors: true,
  preferredAssetClasses: true,
  monthlyContribution: true,
});

export const insertAiRecommendationSchema = createInsertSchema(aiRecommendations, {
  confidence: z.number().min(0).max(1),
}).pick({
  userId: true,
  symbol: true,
  recommendation: true,
  confidence: true,
  reasoning: true,
  targetPrice: true,
  timeHorizon: true,
  sentiment: true,
  aiModel: true,
});

export const insertUserTradeSchema = createInsertSchema(userTrades).pick({
  userId: true,
  symbol: true,
  action: true,
  shares: true,
  price: true,
  fees: true,
  total: true,
  note: true,
});

export const insertBehavioralBiasSchema = createInsertSchema(behavioralBiases).pick({
  userId: true,
  biasType: true,
  score: true,
  impactLevel: true,
});

export const insertBiasAnalysisReportSchema = createInsertSchema(biasAnalysisReports).pick({
  userId: true,
  reportData: true,
  suggestions: true,
});

// Type definitions for database operations
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Portfolio = typeof portfolios.$inferSelect;

export type InsertPortfolioHolding = z.infer<typeof insertPortfolioHoldingSchema>;
export type PortfolioHolding = typeof portfolioHoldings.$inferSelect;

export type InsertMarketSentiment = z.infer<typeof insertMarketSentimentSchema>;
export type MarketSentiment = typeof marketSentiment.$inferSelect;

export type InsertSentimentAlert = z.infer<typeof insertSentimentAlertSchema>;
export type SentimentAlert = typeof sentimentAlerts.$inferSelect;

export type InsertInvestmentPreference = z.infer<typeof insertInvestmentPreferenceSchema>;
export type InvestmentPreference = typeof investmentPreferences.$inferSelect;

export type InsertAiRecommendation = z.infer<typeof insertAiRecommendationSchema>;
export type AiRecommendation = typeof aiRecommendations.$inferSelect;

export type InsertUserTrade = z.infer<typeof insertUserTradeSchema>;
export type UserTrade = typeof userTrades.$inferSelect;

export type InsertBehavioralBias = z.infer<typeof insertBehavioralBiasSchema>;
export type BehavioralBias = typeof behavioralBiases.$inferSelect;

export type InsertBiasAnalysisReport = z.infer<typeof insertBiasAnalysisReportSchema>;
export type BiasAnalysisReport = typeof biasAnalysisReports.$inferSelect;

// Session storage table for auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Plaid Integration Schema
export const plaidItems = pgTable("plaid_items", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  accessToken: text("access_token").notNull(),
  itemId: text("item_id").notNull().unique(),
  institutionId: text("institution_id").notNull(),
  institutionName: text("institution_name").notNull(),
  status: text("status").notNull().default("active"), // active, error, disconnected
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  consentExpiresAt: timestamp("consent_expires_at"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const plaidAccounts = pgTable("plaid_accounts", {
  id: serial("id").primaryKey(),
  plaidItemId: integer("plaid_item_id").notNull().references(() => plaidItems.id),
  accountId: text("account_id").notNull().unique(),
  name: text("name").notNull(),
  mask: text("mask"),
  officialName: text("official_name"),
  type: text("type").notNull(), // investment, credit, depository, etc.
  subtype: text("subtype"),
  status: text("status").notNull().default("active"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const plaidHoldings = pgTable("plaid_holdings", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => plaidAccounts.id),
  securityId: text("security_id").notNull(),
  symbol: text("symbol"),
  name: text("name"),
  quantity: real("quantity").notNull(),
  costBasis: doublePrecision("cost_basis"),
  currentPrice: doublePrecision("current_price"), // institutionPrice in Plaid
  currentValue: doublePrecision("current_value"), // institutionValue in Plaid
  isoCurrencyCode: text("iso_currency_code"),
  unofficialCurrencyCode: text("unofficial_currency_code"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const plaidInvestmentTransactions = pgTable("plaid_investment_transactions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => plaidAccounts.id),
  plaidTransactionId: text("plaid_transaction_id").notNull().unique(),
  securityId: text("security_id"),
  symbol: text("symbol"),
  name: text("name"),
  type: text("type").notNull(), // buy, sell, dividend, etc.
  amount: real("amount").notNull(),
  price: real("price"),
  quantity: real("quantity"),
  fees: real("fees"),
  date: date("date").notNull(),
  isoCurrencyCode: text("iso_currency_code"),
  unofficialCurrencyCode: text("unofficial_currency_code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations for Plaid tables
export const plaidItemsRelations = relations(plaidItems, ({ one, many }) => ({
  user: one(users, {
    fields: [plaidItems.userId],
    references: [users.id],
  }),
  accounts: many(plaidAccounts),
}));

export const plaidAccountsRelations = relations(plaidAccounts, ({ one, many }) => ({
  item: one(plaidItems, {
    fields: [plaidAccounts.plaidItemId],
    references: [plaidItems.id],
  }),
  holdings: many(plaidHoldings),
  transactions: many(plaidInvestmentTransactions),
}));

export const plaidHoldingsRelations = relations(plaidHoldings, ({ one }) => ({
  account: one(plaidAccounts, {
    fields: [plaidHoldings.accountId],
    references: [plaidAccounts.id],
  }),
}));

export const plaidInvestmentTransactionsRelations = relations(plaidInvestmentTransactions, ({ one }) => ({
  account: one(plaidAccounts, {
    fields: [plaidInvestmentTransactions.accountId],
    references: [plaidAccounts.id],
  }),
}));

// Insert schemas for Plaid
export const insertPlaidItemSchema = createInsertSchema(plaidItems);

export const insertPlaidAccountSchema = createInsertSchema(plaidAccounts);

export const insertPlaidHoldingSchema = createInsertSchema(plaidHoldings);

export const insertPlaidInvestmentTransactionSchema = createInsertSchema(plaidInvestmentTransactions);

// Types for Plaid
export type InsertPlaidItem = z.infer<typeof insertPlaidItemSchema>;
export type PlaidItem = typeof plaidItems.$inferSelect;

export type InsertPlaidAccount = z.infer<typeof insertPlaidAccountSchema>;
export type PlaidAccount = typeof plaidAccounts.$inferSelect;

export type InsertPlaidHolding = z.infer<typeof insertPlaidHoldingSchema>;
export type PlaidHolding = typeof plaidHoldings.$inferSelect;

export type InsertPlaidInvestmentTransaction = z.infer<typeof insertPlaidInvestmentTransactionSchema>;
export type PlaidInvestmentTransaction = typeof plaidInvestmentTransactions.$inferSelect;

// Stock Data Schema
export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").unique().notNull(),
  name: text("name").notNull(),
  exchange: text("exchange").notNull(),
  sector: text("sector"),
  industry: text("industry"),
  marketCap: real("market_cap"),
  beta: real("beta"),
  peRatio: real("pe_ratio"),
  dividendYield: real("dividend_yield"),
  fiftyTwoWeekHigh: real("fifty_two_week_high"),
  fiftyTwoWeekLow: real("fifty_two_week_low"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const stockPrices = pgTable("stock_prices", {
  id: serial("id").primaryKey(),
  stockId: integer("stock_id").notNull().references(() => stocks.id),
  date: date("date").notNull(),
  open: real("open").notNull(),
  high: real("high").notNull(),
  low: real("low").notNull(),
  close: real("close").notNull(),
  adjustedClose: real("adjusted_close").notNull(),
  volume: integer("volume").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stockIndicators = pgTable("stock_indicators", {
  id: serial("id").primaryKey(),
  stockId: integer("stock_id").notNull().references(() => stocks.id),
  date: date("date").notNull(),
  rsi: real("rsi"), // Relative Strength Index
  macd: real("macd"), // Moving Average Convergence Divergence
  sma50: real("sma_50"), // 50-day Simple Moving Average
  sma200: real("sma_200"), // 200-day Simple Moving Average
  ema12: real("ema_12"), // 12-day Exponential Moving Average
  ema26: real("ema_26"), // 26-day Exponential Moving Average
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stockAlerts = pgTable("stock_alerts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  stockId: integer("stock_id").notNull().references(() => stocks.id),
  alertType: text("alert_type").notNull(), // price, rsi, moving_average_cross, etc.
  threshold: real("threshold").notNull(),
  direction: text("direction").notNull(), // above, below
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const stockAnalysis = pgTable("stock_analysis", {
  id: serial("id").primaryKey(),
  stockId: integer("stock_id").notNull().references(() => stocks.id),
  analysisType: text("analysis_type").notNull(), // technical, fundamental, sentiment
  rating: text("rating").notNull(), // buy, sell, hold
  score: integer("score").notNull(), // 0-100 scale
  summary: text("summary").notNull(),
  details: json("details"),
  technicalFactors: json("technical_factors").$type<string[]>(),
  fundamentalFactors: json("fundamental_factors").$type<string[]>(),
  sentimentFactors: json("sentiment_factors").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Stock Relations
export const stocksRelations = relations(stocks, ({ many }) => ({
  prices: many(stockPrices),
  indicators: many(stockIndicators),
  alerts: many(stockAlerts),
  analysis: many(stockAnalysis),
}));

export const stockPricesRelations = relations(stockPrices, ({ one }) => ({
  stock: one(stocks, {
    fields: [stockPrices.stockId],
    references: [stocks.id],
  }),
}));

export const stockIndicatorsRelations = relations(stockIndicators, ({ one }) => ({
  stock: one(stocks, {
    fields: [stockIndicators.stockId],
    references: [stocks.id],
  }),
}));

export const stockAlertsRelations = relations(stockAlerts, ({ one }) => ({
  stock: one(stocks, {
    fields: [stockAlerts.stockId],
    references: [stocks.id],
  }),
  user: one(users, {
    fields: [stockAlerts.userId],
    references: [users.id],
  }),
}));

export const stockAnalysisRelations = relations(stockAnalysis, ({ one }) => ({
  stock: one(stocks, {
    fields: [stockAnalysis.stockId],
    references: [stocks.id],
  }),
}));

// Stock insert schemas
export const insertStockSchema = createInsertSchema(stocks, {
  marketCap: z.number().nullable(),
  beta: z.number().nullable(),
  peRatio: z.number().nullable(),
  dividendYield: z.number().nullable(),
  fiftyTwoWeekHigh: z.number().nullable(),
  fiftyTwoWeekLow: z.number().nullable(),
});

export const insertStockPriceSchema = createInsertSchema(stockPrices, {
  stockId: z.number(),
  date: z.date(),
});

export const insertStockIndicatorSchema = createInsertSchema(stockIndicators, {
  stockId: z.number(),
  date: z.date(),
  rsi: z.number().nullable(),
  macd: z.number().nullable(),
  sma50: z.number().nullable(),
  sma200: z.number().nullable(),
  ema12: z.number().nullable(),
  ema26: z.number().nullable(),
});

export const insertStockAlertSchema = createInsertSchema(stockAlerts, {
  userId: z.string(),
  stockId: z.number(),
  alertType: z.string(),
  threshold: z.number(),
  direction: z.string(),
  isActive: z.boolean(),
});

export const insertStockAnalysisSchema = createInsertSchema(stockAnalysis, {
  stockId: z.number(),
  analysisType: z.string(),
  rating: z.string(),
  score: z.number(),
  summary: z.string(),
});

export type InsertStock = z.infer<typeof insertStockSchema>;
export type Stock = typeof stocks.$inferSelect;

export type InsertStockPrice = z.infer<typeof insertStockPriceSchema>;
export type StockPrice = typeof stockPrices.$inferSelect;

export type InsertStockIndicator = z.infer<typeof insertStockIndicatorSchema>;
export type StockIndicator = typeof stockIndicators.$inferSelect;

export type InsertStockAlert = z.infer<typeof insertStockAlertSchema>;
export type StockAlert = typeof stockAlerts.$inferSelect;

export type InsertStockAnalysis = z.infer<typeof insertStockAnalysisSchema>;
export type StockAnalysis = typeof stockAnalysis.$inferSelect;