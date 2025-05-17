/**
 * Mock data for Neufin Nemo module
 * Used for development and testing of stock visualization components
 */

export const stockData = {
  // Sample stock data for dashboard
  currentStocks: [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 185.92, change: 2.35, percentChange: 1.28, rsi: 64.8, macd: 0.85 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 388.47, change: 3.72, percentChange: 0.97, rsi: 72.3, macd: 1.24 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.17, change: 1.53, percentChange: 1.09, rsi: 58.2, macd: 0.46 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 153.84, change: -0.89, percentChange: -0.58, rsi: 42.7, macd: -0.32 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.42, change: -3.75, percentChange: -1.49, rsi: 38.4, macd: -1.12 }
  ],
  
  // Sample price history for charts (last 30 days of trading)
  priceHistory: {
    AAPL: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      open: 180 + Math.random() * 10,
      high: 185 + Math.random() * 10,
      low: 175 + Math.random() * 10,
      close: 180 + Math.random() * 10,
      volume: Math.floor(50000000 + Math.random() * 30000000)
    })),
    MSFT: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      open: 380 + Math.random() * 15,
      high: 390 + Math.random() * 10,
      low: 375 + Math.random() * 10,
      close: 385 + Math.random() * 10,
      volume: Math.floor(25000000 + Math.random() * 10000000)
    })),
    GOOGL: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      open: 140 + Math.random() * 5,
      high: 145 + Math.random() * 5,
      low: 138 + Math.random() * 5,
      close: 142 + Math.random() * 5,
      volume: Math.floor(15000000 + Math.random() * 8000000)
    })),
    AMZN: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      open: 150 + Math.random() * 8,
      high: 155 + Math.random() * 6,
      low: 148 + Math.random() * 6,
      close: 152 + Math.random() * 6,
      volume: Math.floor(30000000 + Math.random() * 15000000)
    })),
    TSLA: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      open: 245 + Math.random() * 15,
      high: 255 + Math.random() * 10,
      low: 240 + Math.random() * 10,
      close: 248 + Math.random() * 12,
      volume: Math.floor(80000000 + Math.random() * 40000000)
    }))
  },
  
  // Technical indicators
  indicators: {
    AAPL: {
      rsi14: 64.8,
      macd: 0.85,
      macdSignal: 0.62,
      macdHistogram: 0.23,
      ema20: 183.42,
      ema50: 180.16,
      ema200: 175.38,
      bollingerUpper: 193.25,
      bollingerMiddle: 183.42,
      bollingerLower: 173.59,
      momentum: 4.85,
      volatility: 0.018
    },
    MSFT: {
      rsi14: 72.3,
      macd: 1.24,
      macdSignal: 0.85,
      macdHistogram: 0.39,
      ema20: 384.76,
      ema50: 376.52,
      ema200: 342.18,
      bollingerUpper: 398.12,
      bollingerMiddle: 384.76,
      bollingerLower: 371.40,
      momentum: 8.65,
      volatility: 0.021
    }
  },
  
  // Stock analysis
  analysis: {
    AAPL: {
      shortTermOutlook: 'bullish',
      longTermOutlook: 'bullish',
      supportLevels: [176.50, 172.25, 168.00],
      resistanceLevels: [187.40, 192.75, 200.00],
      keyEvents: [
        { type: 'breakout', direction: 'upward', strength: 1.8, date: '2023-05-02' },
        { type: 'golden_cross', description: '50-day SMA crossed above 200-day SMA', date: '2023-04-15' }
      ],
      aiSummary: "Apple shows strong bullish momentum with rising institutional buying. The stock is trading above all major moving averages, with the 50-day EMA crossing above the 200-day EMA (golden cross) signaling potential for continued uptrend. RSI at 64.8 indicates strength without being overbought. Support has formed around $176.50 with resistance at $187.40. Watch for quarterly earnings and product announcements as potential catalysts. Technical indicators suggest holding current positions with potential to add on pullbacks to support levels."
    },
    MSFT: {
      shortTermOutlook: 'bullish',
      longTermOutlook: 'bullish',
      supportLevels: [375.00, 365.50, 352.25],
      resistanceLevels: [392.50, 400.00, 415.00],
      keyEvents: [
        { type: 'overbought', indicator: 'RSI', value: 72.3, date: '2023-05-05' }
      ],
      aiSummary: "Microsoft continues its bullish trend with strong momentum in its cloud services division. The stock is trading well above all major moving averages, showing robust institutional support. With RSI at 72.3, it's approaching overbought territory, suggesting a possible short-term consolidation or minor pullback. MACD remains positive with increasing histogram values, confirming the uptrend strength. Key support at $375 should be monitored for potential entries. The long-term outlook remains bullish based on fundamental growth in Azure and AI initiatives, but be cautious of market-wide tech sector rotation risks."
    }
  },
  
  // Stock anomalies
  anomalies: [
    { 
      symbol: 'NVDA', 
      name: 'NVIDIA Corporation',
      stock: { id: 6, symbol: 'NVDA', name: 'NVIDIA Corporation' },
      indicators: { 
        rsi14: 82.4, 
        macdHistogram: 2.85,
        bollingerMiddle: 425.40,
        bollingerUpper: 480.25,
        volatility: 0.058
      },
      anomalyScore: 8
    },
    { 
      symbol: 'META', 
      name: 'Meta Platforms Inc.',
      stock: { id: 7, symbol: 'META', name: 'Meta Platforms Inc.' },
      indicators: { 
        rsi14: 78.1, 
        macdHistogram: 1.68,
        bollingerMiddle: 315.62,
        bollingerUpper: 342.18,
        volatility: 0.042
      },
      anomalyScore: 6
    },
    { 
      symbol: 'NFLX', 
      name: 'Netflix Inc.',
      stock: { id: 8, symbol: 'NFLX', name: 'Netflix Inc.' },
      indicators: { 
        rsi14: 28.6, 
        macdHistogram: -1.42,
        bollingerMiddle: 585.30,
        bollingerLower: 532.65,
        volatility: 0.047
      },
      anomalyScore: 5
    }
  ],
  
  // Stock comparison data
  comparison: {
    stocks: ['AAPL', 'MSFT', 'GOOGL', 'AMZN'],
    metrics: {
      price: {
        AAPL: 185.92,
        MSFT: 388.47,
        GOOGL: 142.17,
        AMZN: 153.84
      },
      perChange: {
        AAPL: 1.28,
        MSFT: 0.97,
        GOOGL: 1.09,
        AMZN: -0.58
      },
      rsi: {
        AAPL: 64.8,
        MSFT: 72.3,
        GOOGL: 58.2,
        AMZN: 42.7
      },
      macd: {
        AAPL: 0.85,
        MSFT: 1.24,
        GOOGL: 0.46,
        AMZN: -0.32
      },
      volatility: {
        AAPL: 0.018,
        MSFT: 0.021,
        GOOGL: 0.023,
        AMZN: 0.032
      }
    }
  }
};