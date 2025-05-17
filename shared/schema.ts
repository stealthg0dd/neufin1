import { pgTable, text, serial, integer, boolean, timestamp, real, doublePrecision, jsonb } from "drizzle-orm/pg-core";
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
