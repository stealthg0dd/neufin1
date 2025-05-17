/**
 * Type definitions for the Behavioral Bias Analyzer (BBA) module
 */

import { UserTrade, BehavioralBias, BiasAnalysisReport } from "@shared/schema";

export type BiasType = 
  | 'loss_aversion'
  | 'confirmation_bias'
  | 'overconfidence'
  | 'recency_bias'
  | 'herd_mentality'
  | 'anchoring_bias'
  | 'sunk_cost_fallacy'
  | 'hindsight_bias'
  | 'fear_of_missing_out'
  | 'status_quo_bias'
  | 'self_attribution_bias'
  | 'narrative_fallacy'
  | 'illusion_of_control'
  | 'availability_bias'
  | 'disposition_effect';

export interface BiasDefinition {
  id: BiasType;
  name: string;
  description: string;
  impact: string;
  examples: string[];
  corrections: string[];
  emoji: string;
}

export interface TradeAnalysisRequest {
  userId: number;
  symbol?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface BiasDetectionResult {
  userId: number;
  detectedBiases: {
    biasType: BiasType;
    score: number;
    impact: 'low' | 'medium' | 'high';
    evidence: any[];
    suggestion: string;
    description: string;
  }[];
  overallScore: number;
  improvementSuggestions: string[];
  comparisonAnalysis?: {
    actualPortfolio: any;
    biasFreePortfolio: any;
    differenceMetrics: any;
  };
  premium: boolean;
}

export interface NaturalLanguageQueryRequest {
  userId: number;
  query: string;
}

export interface NaturalLanguageQueryResponse {
  answer: string;
  relatedBiases: BiasType[];
  suggestedActions: string[];
  premium: boolean;
}

// Educational content type
export interface BiasEducationalContent {
  biasType: BiasType;
  title: string;
  description: string;
  examples: string[];
  avoidanceStrategies: string[];
  resources: { title: string; url: string }[];
}

// User bias profile
export interface UserBiasProfile {
  userId: number;
  overallScore: number;
  primaryBiases: {
    biasType: BiasType;
    score: number;
    trend: 'improving' | 'worsening' | 'stable';
  }[];
  historicalScores: { date: string; score: number }[];
  recommendations: string[];
  lastUpdated: string;
}