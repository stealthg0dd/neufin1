import { pgTable, text, serial, integer, boolean, timestamp, real, doublePrecision, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User management
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userRelations = relations(users, ({ many }) => ({
  portfolios: many(portfolios),
  sentimentAlerts: many(sentimentAlerts),
  investmentPreferences: many(investmentPreferences),
  behavioralBiases: many(behavioralBiases),
}));

// Portfolios
export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
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

// Portfolio Holdings
export const portfolioHoldings = pgTable("portfolio_holdings", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").notNull().references(() => portfolios.id),
  symbol: text("symbol").notNull(),
  shares: real("shares").notNull(),
  averageCost: doublePrecision("average_cost").notNull(),
  currentValue: doublePrecision("current_value"),
  purchaseDate: timestamp("purchase_date").defaultNow(),
});

export const portfolioHoldingsRelations = relations(portfolioHoldings, ({ one }) => ({
  portfolio: one(portfolios, {
    fields: [portfolioHoldings.portfolioId],
    references: [portfolios.id],
  }),
}));

// Market Sentiment
export const marketSentiment = pgTable("market_sentiment", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  sentimentScore: integer("sentiment_score").notNull(), // 0-100 score
  status: text("status").notNull(), // positive, negative, neutral
  source: text("source").notNull(), // news, social, analyst
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  details: jsonb("details"), // Additional details like keywords, sources
});

// Sentiment Alerts
export const sentimentAlerts = pgTable("sentiment_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  symbol: text("symbol").notNull(),
  threshold: integer("threshold").notNull(), // Trigger when sentiment crosses this value
  direction: text("direction").notNull(), // above, below
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sentimentAlertsRelations = relations(sentimentAlerts, ({ one }) => ({
  user: one(users, {
    fields: [sentimentAlerts.userId],
    references: [users.id],
  }),
}));

// Investment Preferences
export const investmentPreferences = pgTable("investment_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  riskTolerance: text("risk_tolerance").notNull(), // conservative, moderate, aggressive
  investmentHorizon: text("investment_horizon").notNull(), // short, medium, long
  preferredSectors: jsonb("preferred_sectors"), // Array of sectors
  excludedSectors: jsonb("excluded_sectors"), // Array of excluded sectors
  targetReturn: real("target_return"), // Target annual return percentage
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const investmentPreferencesRelations = relations(investmentPreferences, ({ one }) => ({
  user: one(users, {
    fields: [investmentPreferences.userId],
    references: [users.id],
  }),
}));

// AI Recommendations
export const aiRecommendations = pgTable("ai_recommendations", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  recommendation: text("recommendation").notNull(), // buy, sell, hold
  confidenceScore: integer("confidence_score").notNull(), // 0-100
  rationale: text("rationale"),
  targetPrice: doublePrecision("target_price"),
  timeframe: text("timeframe"), // short_term, medium_term, long_term
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Behavioral Biases
export const behavioralBiases = pgTable("behavioral_biases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  biasType: text("bias_type").notNull(), // loss_aversion, confirmation_bias, etc.
  score: integer("score").notNull(), // 0-100 score indicating strength of bias
  impact: text("impact").notNull(), // low, medium, high
  suggestion: text("suggestion"), // Corrective suggestion
  detectionDate: timestamp("detection_date").defaultNow().notNull(),
});

export const behavioralBiasesRelations = relations(behavioralBiases, ({ one }) => ({
  user: one(users, {
    fields: [behavioralBiases.userId],
    references: [users.id],
  }),
}));

// Schema definitions for Zod validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  role: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).pick({
  userId: true,
  name: true,
  description: true,
});

export const insertPortfolioHoldingSchema = createInsertSchema(portfolioHoldings).pick({
  portfolioId: true,
  symbol: true,
  shares: true,
  averageCost: true,
  currentValue: true,
  purchaseDate: true,
});

export const insertMarketSentimentSchema = createInsertSchema(marketSentiment).pick({
  symbol: true,
  sentimentScore: true,
  status: true,
  source: true,
  details: true,
});

export const insertSentimentAlertSchema = createInsertSchema(sentimentAlerts).pick({
  userId: true,
  symbol: true,
  threshold: true,
  direction: true,
  active: true,
});

export const insertInvestmentPreferenceSchema = createInsertSchema(investmentPreferences).pick({
  userId: true,
  riskTolerance: true,
  investmentHorizon: true,
  preferredSectors: true,
  excludedSectors: true,
  targetReturn: true,
});

export const insertAiRecommendationSchema = createInsertSchema(aiRecommendations).pick({
  symbol: true,
  recommendation: true,
  confidenceScore: true,
  rationale: true,
  targetPrice: true,
  timeframe: true,
});

export const insertBehavioralBiasSchema = createInsertSchema(behavioralBiases).pick({
  userId: true,
  biasType: true,
  score: true,
  impact: true,
  suggestion: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
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

export type InsertBehavioralBias = z.infer<typeof insertBehavioralBiasSchema>;
export type BehavioralBias = typeof behavioralBiases.$inferSelect;

// Neufin Nemo (Stock Intelligence) Schema

export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  sector: text("sector"),
  industry: text("industry"),
  marketCap: decimal("market_cap"),
  peRatio: decimal("pe_ratio"),
  dividendYield: decimal("dividend_yield"),
  beta: decimal("beta"),
  fiftyTwoWeekHigh: decimal("fifty_two_week_high"),
  fiftyTwoWeekLow: decimal("fifty_two_week_low"),
  averageVolume: integer("average_volume"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const stockPrices = pgTable("stock_prices", {
  id: serial("id").primaryKey(),
  stockId: integer("stock_id").references(() => stocks.id).notNull(),
  date: timestamp("date").notNull(),
  open: decimal("open").notNull(),
  high: decimal("high").notNull(),
  low: decimal("low").notNull(),
  close: decimal("close").notNull(),
  adjustedClose: decimal("adjusted_close"),
  volume: integer("volume").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const stockIndicators = pgTable("stock_indicators", {
  id: serial("id").primaryKey(),
  stockId: integer("stock_id").references(() => stocks.id).notNull(),
  date: timestamp("date").notNull(),
  rsi14: decimal("rsi_14"),
  macd: decimal("macd"),
  macdSignal: decimal("macd_signal"),
  macdHistogram: decimal("macd_histogram"),
  ema20: decimal("ema_20"),
  ema50: decimal("ema_50"),
  ema200: decimal("ema_200"),
  sma20: decimal("sma_20"),
  sma50: decimal("sma_50"),
  sma200: decimal("sma_200"),
  bollingerUpper: decimal("bollinger_upper"),
  bollingerMiddle: decimal("bollinger_middle"),
  bollingerLower: decimal("bollinger_lower"),
  momentum: decimal("momentum"),
  volatility: decimal("volatility"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const stockAlerts = pgTable("stock_alerts", {
  id: serial("id").primaryKey(),
  stockId: integer("stock_id").references(() => stocks.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  alertType: text("alert_type").notNull(), // breakout, volatility, price_target, etc.
  threshold: decimal("threshold"),
  triggered: boolean("triggered").notNull().default(false),
  message: text("message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const stockAnalysis = pgTable("stock_analysis", {
  id: serial("id").primaryKey(),
  stockId: integer("stock_id").references(() => stocks.id).notNull(),
  date: timestamp("date").notNull().defaultNow(),
  shortTermOutlook: text("short_term_outlook"), // bullish, bearish, neutral
  longTermOutlook: text("long_term_outlook"), // bullish, bearish, neutral
  supportLevels: jsonb("support_levels"), // array of price points
  resistanceLevels: jsonb("resistance_levels"), // array of price points
  keyEvents: jsonb("key_events"), // array of events
  aiSummary: text("ai_summary"), // Claude-generated summary
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const stocksRelations = relations(stocks, ({ many }) => ({
  prices: many(stockPrices),
  indicators: many(stockIndicators),
  alerts: many(stockAlerts),
  analyses: many(stockAnalysis),
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

// Schema definitions for insert operations
export const insertStockSchema = createInsertSchema(stocks, {
  symbol: z.string(),
  name: z.string(),
  sector: z.string().optional(),
  industry: z.string().optional(),
  marketCap: z.string().or(z.number()).optional().transform(val => val?.toString()),
  peRatio: z.string().or(z.number()).optional().transform(val => val?.toString()),
  dividendYield: z.string().or(z.number()).optional().transform(val => val?.toString()),
  beta: z.string().or(z.number()).optional().transform(val => val?.toString()),
  fiftyTwoWeekHigh: z.string().or(z.number()).optional().transform(val => val?.toString()),
  fiftyTwoWeekLow: z.string().or(z.number()).optional().transform(val => val?.toString()),
  averageVolume: z.number().optional(),
  metadata: z.any().optional(),
});

export const insertStockPriceSchema = createInsertSchema(stockPrices, {
  stockId: z.number(),
  date: z.date(),
  open: z.string().or(z.number()).transform(val => val.toString()),
  high: z.string().or(z.number()).transform(val => val.toString()),
  low: z.string().or(z.number()).transform(val => val.toString()),
  close: z.string().or(z.number()).transform(val => val.toString()),
  adjustedClose: z.string().or(z.number()).optional().transform(val => val?.toString()),
  volume: z.number()
});

export const insertStockIndicatorSchema = createInsertSchema(stockIndicators, {
  stockId: z.number(),
  date: z.date(),
  rsi14: z.string().or(z.number()).optional().transform(val => val?.toString()),
  macd: z.string().or(z.number()).optional().transform(val => val?.toString()),
  macdSignal: z.string().or(z.number()).optional().transform(val => val?.toString()),
  macdHistogram: z.string().or(z.number()).optional().transform(val => val?.toString()),
  ema20: z.string().or(z.number()).optional().transform(val => val?.toString()),
  ema50: z.string().or(z.number()).optional().transform(val => val?.toString()),
  ema200: z.string().or(z.number()).optional().transform(val => val?.toString()),
  sma20: z.string().or(z.number()).optional().transform(val => val?.toString()),
  sma50: z.string().or(z.number()).optional().transform(val => val?.toString()),
  sma200: z.string().or(z.number()).optional().transform(val => val?.toString()),
  bollingerUpper: z.string().or(z.number()).optional().transform(val => val?.toString()),
  bollingerMiddle: z.string().or(z.number()).optional().transform(val => val?.toString()),
  bollingerLower: z.string().or(z.number()).optional().transform(val => val?.toString()),
  momentum: z.string().or(z.number()).optional().transform(val => val?.toString()),
  volatility: z.string().or(z.number()).optional().transform(val => val?.toString())
});

export const insertStockAlertSchema = createInsertSchema(stockAlerts, {
  stockId: z.number(),
  userId: z.number(),
  alertType: z.string(),
  threshold: z.string().or(z.number()).optional().transform(val => val?.toString()),
  triggered: z.boolean().default(false),
  message: z.string().optional()
});

export const insertStockAnalysisSchema = createInsertSchema(stockAnalysis, {
  stockId: z.number(),
  date: z.date().default(() => new Date()),
  shortTermOutlook: z.string().optional(),
  longTermOutlook: z.string().optional(),
  supportLevels: z.any().optional(),
  resistanceLevels: z.any().optional(),
  keyEvents: z.any().optional(),
  aiSummary: z.string().optional()
});

// Types for database operations
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
