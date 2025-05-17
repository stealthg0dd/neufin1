// Sentiment data
export const sentimentData = {
  overall: {
    current: 78,
    previous: 75,
    change: 4.2,
    direction: "up",
    status: "positive"
  },
  sectors: {
    tech: {
      current: 52,
      previous: 54,
      change: 1.3,
      direction: "down",
      status: "neutral"
    },
    finance: {
      current: 36,
      previous: 39,
      change: 7.1,
      direction: "down",
      status: "negative"
    },
    healthcare: {
      current: 64,
      previous: 60,
      change: 6.7,
      direction: "up",
      status: "positive"
    },
    energy: {
      current: 48,
      previous: 52,
      change: 7.5,
      direction: "down",
      status: "neutral"
    }
  },
  trend: [
    { day: "Mon", overall: 65, tech: 55, finance: 40, healthcare: 60, energy: 50 },
    { day: "Tue", overall: 68, tech: 53, finance: 42, healthcare: 61, energy: 51 },
    { day: "Wed", overall: 72, tech: 57, finance: 38, healthcare: 63, energy: 49 },
    { day: "Thu", overall: 70, tech: 58, finance: 36, healthcare: 62, energy: 48 },
    { day: "Fri", overall: 73, tech: 55, finance: 35, healthcare: 64, energy: 47 },
    { day: "Sat", overall: 78, tech: 52, finance: 38, healthcare: 66, energy: 48 },
    { day: "Sun", overall: 76, tech: 50, finance: 36, healthcare: 65, energy: 48 }
  ]
};

// Stock data
export const stockData = {
  topPerformers: [
    { symbol: "AAPL", name: "Apple Inc.", price: 185.92, change: 2.35, percentChange: 1.28 },
    { symbol: "MSFT", name: "Microsoft Corp.", price: 388.47, change: 3.72, percentChange: 0.97 },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 142.17, change: 1.53, percentChange: 1.09 }
  ],
  marketIndices: [
    { symbol: "SPX", name: "S&P 500", value: 4,927.16, change: 25.36, percentChange: 0.52 },
    { symbol: "DJI", name: "Dow Jones", value: 38,671.69, change: 134.31, percentChange: 0.35 },
    { symbol: "COMP", name: "Nasdaq", value: 15,628.95, change: 118.58, percentChange: 0.77 }
  ]
};

// Investment recommendations
export const recommendationsData = {
  portfolioSuggestions: [
    { 
      type: "Conservative", 
      allocation: { 
        stocks: 30, 
        bonds: 50, 
        cash: 10, 
        alternatives: 10 
      },
      expectedReturn: 5.2,
      riskLevel: "Low"
    },
    { 
      type: "Moderate", 
      allocation: { 
        stocks: 60, 
        bonds: 30, 
        cash: 5, 
        alternatives: 5 
      },
      expectedReturn: 7.8,
      riskLevel: "Medium"
    },
    { 
      type: "Aggressive", 
      allocation: { 
        stocks: 80, 
        bonds: 10, 
        cash: 2, 
        alternatives: 8 
      },
      expectedReturn: 10.4,
      riskLevel: "High"
    }
  ],
  stockPicks: [
    { symbol: "NVDA", name: "NVIDIA Corp.", sentiment: 86, recommendation: "Strong Buy" },
    { symbol: "AMZN", name: "Amazon.com Inc.", sentiment: 74, recommendation: "Buy" },
    { symbol: "JPM", name: "JPMorgan Chase", sentiment: 68, recommendation: "Buy" },
    { symbol: "TSLA", name: "Tesla Inc.", sentiment: 52, recommendation: "Hold" }
  ]
};

// Behavioral bias data
export const biasData = {
  userBiases: [
    { type: "Loss Aversion", score: 72, impact: "High", suggestion: "Consider setting stop-loss orders to automate selling decisions" },
    { type: "Confirmation Bias", score: 58, impact: "Medium", suggestion: "Actively seek out opposing viewpoints before making decisions" },
    { type: "Recency Bias", score: 63, impact: "Medium", suggestion: "Review long-term historical data to counterbalance recent trends" },
    { type: "Overconfidence", score: 45, impact: "Low", suggestion: "Track confidence levels against actual outcomes to calibrate judgment" }
  ],
  tradeHistory: {
    profitableHoldTime: 42, // days
    lossHoldTime: 16, // days
    winRate: 62, // percent
    biasIndicator: "Disposition Effect" // tendency to sell winners too early and hold losers too long
  }
};
